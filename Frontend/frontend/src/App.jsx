import React, { useState, useRef } from "react";
import axios from "axios";

export default function App() {
  const [fields, setFields] = useState([
    {
      type: "signature",
      normalized: {
        xRatio: 0.1,
        yRatio: 0.2,
        widthRatio: 0.3,
        heightRatio: 0.1,
      },
      page: 1,
    },
  ]);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fileInputRef = useRef();
  const samplePdf = "/sample.pdf";

  function handleSignatureUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSignatureDataUrl(reader.result);
      setMessage("✅ Signature uploaded!");
    };
    reader.readAsDataURL(file);
  }

  async function signPdf() {
    if (!signatureDataUrl) {
      alert("Please upload a signature PNG first");
      return;
    }

    setLoading(true);
    setMessage("🔄 Signing PDF...");

    try {
      const payload = {
        pdfId: "sample-a4",
        signature: signatureDataUrl,
        fields,
      };

      const res = await axios.post(
        "https://bolosign-gqh7.onrender.com",
        payload,
        {
          responseType: "arraybuffer",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "signed.pdf";
      a.click();
      setMessage("✅ PDF signed and downloaded!");
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif", maxWidth: 1200 }}>
      <h1>🔐 Signature Injection Engine</h1>
      <p style={{ color: "#666" }}>Drag signature fields on the PDF, upload a signature, and burn it in.</p>

      {message && (
        <div
          style={{
            padding: 12,
            marginBottom: 20,
            background: message.includes("❌") ? "#fee" : "#efe",
            border: `1px solid ${message.includes("❌") ? "#fcc" : "#cfc"}`,
            borderRadius: 4,
            color: message.includes("❌") ? "#c00" : "#060",
          }}
        >
          {message}
        </div>
      )}

      <div style={{ display: "flex", gap: 30 }}>
        {/* Left: PDF Viewer Area */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              border: "2px solid #ddd",
              padding: 10,
              borderRadius: 4,
              background: "#fafafa",
              textAlign: "center",
              minHeight: 600,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={samplePdf}
              alt="sample PDF"
              style={{ maxWidth: "100%", maxHeight: 500, borderRadius: 4 }}
              onError={() => setMessage("❌ Could not load PDF image")}
            />
            <p style={{ marginTop: 20, color: "#999", fontSize: 12 }}>
              PDF Preview (drag signature fields on the actual UI)
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div style={{ width: 320 }}>
          <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 4, background: "#f9f9f9" }}>
            <h3 style={{ marginTop: 0 }}>📋 Controls</h3>

            {/* Add Field Button */}
            <button
              onClick={() =>
                setFields([
                  ...fields,
                  {
                    type: "signature",
                    normalized: { xRatio: 0.1, yRatio: 0.3, widthRatio: 0.25, heightRatio: 0.08 },
                    page: 1,
                  },
                ])
              }
              style={{
                width: "100%",
                padding: 10,
                marginBottom: 12,
                background: "#007bff",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ➕ Add Signature Field ({fields.length})
            </button>

            {/* Signature Upload */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontWeight: "bold", marginBottom: 6 }}>� Upload Signature</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleSignatureUpload}
                style={{ width: "100%", padding: 6 }}
              />
              {signatureDataUrl && (
                <img
                  src={signatureDataUrl}
                  alt="signature preview"
                  style={{ width: "100%", marginTop: 10, border: "1px solid #ddd", borderRadius: 4 }}
                />
              )}
            </div>

            {/* Burn-in Button */}
            <button
              onClick={signPdf}
              disabled={loading}
              style={{
                width: "100%",
                padding: 12,
                background: loading ? "#ccc" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: 4,
                cursor: loading ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              {loading ? "⏳ Signing..." : "🔒 Burn-in & Download"}
            </button>

            <hr style={{ margin: "16px 0" }} />

            {/* Field Info */}
            <div style={{ fontSize: 12, color: "#666" }}>
              <p>
                <strong>Fields:</strong> {fields.length}
              </p>
              <p>
                <strong>Signature:</strong> {signatureDataUrl ? "✅ Uploaded" : "❌ Not uploaded"}
              </p>
              <p style={{ marginTop: 12, fontSize: 11, fontStyle: "italic" }}>
                Tip: Each field stores normalized coordinates (0-1 ratios) so they stay anchored across screen sizes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
