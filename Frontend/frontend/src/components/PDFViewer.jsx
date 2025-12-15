// PDFViewer.jsx (simplified)
import React, { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import { cssFromNormalized, normalizedFromCss } from "../utils/coords";
import "react-resizable/css/styles.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export default function PDFViewer({ fileUrl, fields, setFields }) {
  const [numPages, setNumPages] = useState(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 }); // rendered px
  const [error, setError] = useState(null);
  const pageRef = useRef();

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    console.log("✅ PDF loaded successfully:", fileUrl);
    setError(null);
  }

  function onDocumentLoadError(err) {
    console.error("❌ Failed to load PDF:", fileUrl, err);
    setError(`Failed to load PDF: ${err.message}`);
  }

  // get rendered page size after render
  function onPageRenderSuccess(page) {
    const viewport = page.getViewport({ scale: 1 });
    // we need the rendered size in DOM so get bounding box
    setTimeout(() => {
      if (pageRef.current) {
        const rect = pageRef.current.getBoundingClientRect();
        setPageSize({ width: rect.width, height: rect.height });
      }
    }, 10);
  }

  // Render page 1 only for prototype (A4)
  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 900 }}>
      {error && (
        <div style={{ padding: 12, background: "#fee", border: "1px solid #fcc", borderRadius: 4, color: "#c00", marginBottom: 12 }}>
          {error}
        </div>
      )}
      <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess} onLoadError={onDocumentLoadError}>
        <div style={{ position: "relative" }}>
          <Page
            pageNumber={1}
            width={800}
            inputRef={pageRef}
            onRenderSuccess={onPageRenderSuccess}
          />
          {/* Overlay */}
          <div style={{ position: "absolute", left: 0, top: 0 }}>
            {fields.map((f, idx) => {
              const css = cssFromNormalized(f.normalized, pageSize);
              return (
                <Draggable
                  key={idx}
                  bounds="parent"
                  onStop={(e, data) => {
                    const newCss = {
                      left: data.x,
                      top: data.y,
                      width: css.width,
                      height: css.height,
                    };
                    const norm = normalizedFromCss(newCss, pageSize);
                    const newFields = [...fields];
                    newFields[idx].normalized = norm;
                    setFields(newFields);
                  }}
                  position={{ x: css.left || 0, y: css.top || 0 }}
                >
                  <div style={{ position: "absolute", cursor: "move" }}>
                    <ResizableBox
                      width={css.width || 100}
                      height={css.height || 50}
                      minConstraints={[30, 20]}
                      onResizeStop={(e, data) => {
                        const newCss = {
                          left: css.left,
                          top: css.top,
                          width: data.size.width,
                          height: data.size.height,
                        };
                        const norm = normalizedFromCss(newCss, pageSize);
                        const newFields = [...fields];
                        newFields[idx].normalized = norm;
                        setFields(newFields);
                      }}
                    >
                      <div
                        style={{
                          border: "2px dashed #007bff",
                          width: "100%",
                          height: "100%",
                          background: "rgba(0,123,255,0.03)",
                        }}
                      >
                        {f.type}
                      </div>
                    </ResizableBox>
                  </div>
                </Draggable>
              );
            })}
          </div>
        </div>
      </Document>
    </div>
  );
}
