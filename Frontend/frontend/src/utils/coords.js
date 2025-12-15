// coords.js
// Convert between normalized ratios and CSS pixels and PDF points (72 DPI).
export function cssFromNormalized(normalized, renderedPageDims) {
  // normalized: { xRatio, yRatio, widthRatio, heightRatio }
  const { width, height } = renderedPageDims;
  return {
    left: normalized.xRatio * width,
    top: normalized.yRatio * height,
    width: normalized.widthRatio * width,
    height: normalized.heightRatio * height,
  };
}

export function normalizedFromCss(cssBox, renderedPageDims) {
  const { width, height } = renderedPageDims;
  return {
    xRatio: cssBox.left / width,
    yRatio: cssBox.top / height,
    widthRatio: cssBox.width / width,
    heightRatio: cssBox.height / height,
  };
}

// Convert normalized -> PDF points (pdfWidth/pdfHeight are in points)
export function pdfPointsFromNormalized(normalized, pdfPageDims) {
  const { width: pdfW, height: pdfH } = pdfPageDims; // points
  const x = normalized.xRatio * pdfW;
  // PDF origin bottom-left -> flip Y and account for height of the box
  const y = (1 - normalized.yRatio - normalized.heightRatio) * pdfH;
  const w = normalized.widthRatio * pdfW;
  const h = normalized.heightRatio * pdfH;
  return { x, y, w, h };
}
