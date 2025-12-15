## Quick orientation

This repo contains a React/Vite frontend prototype for a signature injection UI (drag/resizable boxes over a PDF) and a placeholder `Backend/` folder. There is no server implementation checked in here; the frontend expects a signing endpoint at `http://localhost:4000/sign-pdf`.

Key frontend paths
- `Frontend/frontend/package.json` — Vite scripts: `dev`, `build`, `preview`, `lint`.
- `Frontend/frontend/src/App.jsx` — top-level demo app. Contains `fields` shape and POST to `/sign-pdf`.
- `Frontend/frontend/src/components/PDFViewer.jsx` — PDF renderer, overlay UI, uses `react-pdf`, `react-draggable`, `react-resizable`.
- `Frontend/frontend/src/utils/coords.js` — canonical conversions between normalized ratios, CSS pixels and PDF points (important for burn-in logic).

What an agent should know (high-value rules)
- Coordinate model: UI stores boxes as normalized ratios { xRatio, yRatio, widthRatio, heightRatio } relative to rendered page size. Use `cssFromNormalized()` and `normalizedFromCss()` when mapping to DOM, and `pdfPointsFromNormalized()` when creating PDF annotations (note Y flip).
- Single-page prototype: `PDFViewer.jsx` renders page 1 only (A4 prototype). Expect work to be constrained to page 1 unless you update `Page` rendering.
- Backend contract (frontend expectations): POST JSON { pdfId, signature (base64), fields } to `http://localhost:4000/sign-pdf` and expect an ArrayBuffer PDF response. The frontend code in `App.jsx` sets axios responseType 'arraybuffer' and triggers a download.
- PDF worker is loaded via CDN (`pdfjs.GlobalWorkerOptions.workerSrc` in `PDFViewer.jsx`) — avoid changing to a different worker unless updating bundler config.

Developer workflows
- Run frontend dev server:

  cd Frontend/frontend
  npm install
  npm run dev

- Build & preview:

  npm run build
  npm run preview

- Linting: `npm run lint` runs ESLint using the repo's local config (`eslint.config.js` in frontend root).

Conventions and useful patterns to follow when editing
- When changing positioning or sizing logic, update `coords.js` first and then the UI in `PDFViewer.jsx`. The `pdfPointsFromNormalized` function encodes an important Y-axis flip for PDF coordinate space — verify with a visual smoke-test.
- When adding fields, mirror the shape used in `App.jsx` (see default `fields` example) so the backend receives normalized positions.
- Search terms to use when investigating behavior: `cssFromNormalized`, `pdfPointsFromNormalized`, `sign-pdf`, `fields`, `sample.pdf`.

Integration and missing pieces to watch for
- There is an empty `Backend/` folder in the repo. The frontend assumes a signing service on port 4000; tests or CI may stub this. Before implementing server-side changes, confirm whether the real backend lives in another repo or will be added here.
- The sample PDF is served from the frontend public assets (`Frontend/frontend/public/sample.pdf`) — if you change filenames, update the `samplePdf` path in `App.jsx`.

Quick examples (from repo)
- Adding a signature field in `App.jsx`:

  setFields([...fields, { type: 'signature', normalized: { xRatio:0.1, yRatio:0.1, widthRatio:0.2, heightRatio:0.08 }, page:1 }])

- Converting UI box to PDF points (use `pdfPointsFromNormalized` in `coords.js`) before calling a PDF library for burn-in.

What I couldn't discover automatically
- Backend implementation details (language, framework, and CLI to run it) — `Backend/` is empty. Confirm where the signing service lives and its run instructions.

If anything here is wrong or missing, reply with the specific area (backend location, additional scripts, or CI details) and I will iterate.
