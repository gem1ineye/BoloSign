BoloSign backend (prototype)
=================================

This folder contains a minimal prototype backend used by the frontend demo. It provides a single endpoint used by the frontend:

- POST /sign-pdf — accepts JSON payload { pdfId, signature (base64), fields } and returns a PDF (binary). The prototype returns the sample PDF from `Frontend/frontend/public/sample.pdf` as-is.

Run locally:

```bash
cd Backend
npm install
npm start
```

Server listens on port 4000 by default. CORS is enabled to allow the frontend dev server to call the endpoint.

Note: This is a development stub only. Replace with a real signing/burn-in implementation when available.
