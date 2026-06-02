import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pdfToPng } from 'pdf-to-png-converter';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const docsDir = path.join(rootDir, 'docs');
const pdfPath = path.join(docsDir, 'sample-invoice.pdf');
const pngPath = path.join(docsDir, 'sample-invoice.png');

/** Write the sample PDF and a PNG preview into `docs/` for README reference. */
export async function writeDocsSample(pdf: Buffer): Promise<void> {
  await mkdir(docsDir, { recursive: true });
  await writeFile(pdfPath, pdf);

  const pages = await pdfToPng(pdf, {
    pagesToProcess: [1],
    viewportScale: 150 / 72,
    returnPageContent: true,
  });

  const page = pages[0];
  if (!page?.content) {
    throw new Error('Failed to render docs/sample-invoice.png from the generated PDF.');
  }

  await writeFile(pngPath, page.content);
}

export { docsDir, pdfPath, pngPath };
