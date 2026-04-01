import { PDFDocument } from 'pdf-lib';
import { deriveTitle } from './filename.ts';
import { createTitlePage } from './titlePage.ts';

export interface ProcessingProgress {
  current: number;
  total: number;
  filename: string;
}

export async function mergePDFs(
  files: File[],
  onProgress: (p: ProcessingProgress) => void,
): Promise<Uint8Array<ArrayBuffer>> {
  const mergedDoc = await PDFDocument.create();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    onProgress({ current: i + 1, total: files.length, filename: file.name });

    const arrayBuffer = await file.arrayBuffer();
    const srcDoc = await PDFDocument.load(arrayBuffer);

    const titleDoc = await createTitlePage(deriveTitle(file.name));
    const [titlePage] = await mergedDoc.copyPages(titleDoc, [0]);
    mergedDoc.addPage(titlePage);

    const srcPageCount = srcDoc.getPageCount();
    const srcIndices = Array.from({ length: srcPageCount }, (_, j) => j);
    const copiedPages = await mergedDoc.copyPages(srcDoc, srcIndices);
    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }

    const totalPages = 1 + srcPageCount;
    if (totalPages % 2 !== 0) {
      const blankDoc = await PDFDocument.create();
      blankDoc.addPage([595.28, 841.89]);
      const [blankPage] = await mergedDoc.copyPages(blankDoc, [0]);
      mergedDoc.addPage(blankPage);
    }
  }

  const bytes = await mergedDoc.save();
  return new Uint8Array(bytes);
}
