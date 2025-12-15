import React, { useState } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import { cssFromNormalized, normalizedFromCss } from "../utils/coords";
import "react-resizable/css/styles.css";

// Simple placeholder PDF viewer using an <img> tag instead of react-pdf
// This avoids the complexity of pdfjs worker loading
export default function SimplePDFViewer({ fileUrl, fields, setFields }) {
  const [pageSize, setPageSize] = useState({ width: 800, height: 1100 }); // A4 approx in pixels

  return (
    <div style={{ position: "relative", width: "100%", maxWidth: 900 }}>
      {/* PDF rendered as image - for prototype, shows the PDF file */}
      <div
        style={{
          position: "relative",
          width: pageSize.width,
          height: pageSize.height,
          background: "#f5f5f5",
          border: "1px solid #ccc",
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        {/* Show PDF as image (browsers can display PDF in <img>) */}
        <img
          src={fileUrl}
          alt="PDF page"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          onLoad={(e) => {
            const rect = e.target.parentElement.getBoundingClientRect();
            setPageSize({ width: rect.width, height: rect.height });
          }}
        />

        {/* Overlay draggable/resizable fields */}
        <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}>
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
                        background: "rgba(0,123,255,0.08)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        color: "#007bff",
                        fontWeight: "bold",
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
    </div>
  );
}
