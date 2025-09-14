
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// When using a CDN, the workerSrc property needs to be set to the URL of the worker script.
// The `import * as pdfjsWorker from '...';` approach is for bundler environments like Webpack/Vite,
// where the import returns a URL string. In this sandboxed environment with an import map,
// we must provide the full, explicit URL to the worker script.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://aistudiocdn.com/pdfjs-dist@^5.4.149/build/pdf.worker.mjs`;


export async function extractTextFromPDF(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  const numPages = pdf.numPages;
  let fullText = '';

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}
