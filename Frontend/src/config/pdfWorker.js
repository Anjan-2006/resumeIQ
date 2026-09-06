import { pdfjs } from 'react-pdf';

// Configure local high-performance PDF worker bundled with Vite (no external CDN network lag)
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default pdfjs;
