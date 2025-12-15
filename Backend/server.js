const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => res.json({ ok: true }));

// POST /sign-pdf
// Expects JSON { pdfId, signature (base64 or dataURL of PNG), fields }
// fields: [{ type: 'signature', page: 1, normalized: { xRatio,yRatio,widthRatio,heightRatio } }, ...]
// Prototype: load sample PDF and burn-in signature images for 'signature' fields.
const { PDFDocument } = require('pdf-lib');

app.post('/sign-pdf', async (req, res) => {
  try {
    const { pdfId, signature, fields } = req.body || {};
    console.log('Received /sign-pdf — pdfId:', pdfId, 'fields:', Array.isArray(fields) ? fields.length : 0);

    if (!signature) {
      return res.status(400).json({ error: 'missing signature image (base64 or data URL)' });
    }

    // Path to the sample.pdf in the frontend public assets (prototype)
    const samplePdfPath = path.resolve(__dirname, '../Frontend/frontend/public/sample.pdf');
    let existingPdfBytes;
    try {
      existingPdfBytes = await fs.promises.readFile(samplePdfPath);
    } catch (readErr) {
      // If no sample PDF exists in the frontend public folder, create a tiny placeholder PDF on-the-fly
      console.warn('sample.pdf not found at', samplePdfPath, '- creating placeholder PDF');
      const placeholderDoc = await PDFDocument.create();
      const page = placeholderDoc.addPage([595.28, 841.89]); // A4 in points
      page.drawText('Sample A4 PDF (placeholder)', { x: 50, y: 800, size: 12 });
      existingPdfBytes = await placeholderDoc.save();
    }

    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    // Normalize signature base64 (strip data URL prefix if present)
    const dataUrlPrefix = /^data:image\/(png|jpeg|jpg);base64,/;
    let sigBase64 = signature;
    if (dataUrlPrefix.test(signature)) {
      sigBase64 = signature.replace(dataUrlPrefix, '');
    }
    const sigBytes = Buffer.from(sigBase64, 'base64');

    // embed as PNG (pdf-lib supports PNG/JPEG)
    let sigImage;
    try {
      sigImage = await pdfDoc.embedPng(sigBytes);
    } catch (e) {
      // try JPEG if PNG embedding failed
      sigImage = await pdfDoc.embedJpg(sigBytes);
    }

    // Helper: convert normalized -> pdf points for a given page size
    function pdfPointsFromNormalized(normalized, pdfW, pdfH) {
      const x = normalized.xRatio * pdfW;
      const w = normalized.widthRatio * pdfW;
      const h = normalized.heightRatio * pdfH;
      const y = (1 - normalized.yRatio - normalized.heightRatio) * pdfH; // flip Y
      return { x, y, w, h };
    }

    if (Array.isArray(fields)) {
      for (const field of fields) {
        if (!field || field.type !== 'signature') continue; // only handle signature fields for prototype
        const pageIndex = Math.max(0, (field.page || 1) - 1);
        if (pageIndex >= pdfDoc.getPageCount()) continue;
        const page = pdfDoc.getPage(pageIndex);
        const { width: pdfW, height: pdfH } = page.getSize();
        const { x, y, w, h } = pdfPointsFromNormalized(field.normalized, pdfW, pdfH);

        // scale image to fit while preserving aspect ratio
        const imgW = sigImage.width;
        const imgH = sigImage.height;
        const scale = Math.min(w / imgW, h / imgH);
        const drawW = imgW * scale;
        const drawH = imgH * scale;
        const drawX = x + (w - drawW) / 2;
        const drawY = y + (h - drawH) / 2;

        page.drawImage(sigImage, { x: drawX, y: drawY, width: drawW, height: drawH });
      }
    }

    const modifiedPdfBytes = await pdfDoc.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.send(Buffer.from(modifiedPdfBytes));
  } catch (err) {
    console.error('Error in /sign-pdf:', err);
    res.status(500).json({ error: 'failed to sign pdf', message: err.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`BoloSign backend prototype listening on ${port}`));
