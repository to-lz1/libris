import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function createTitlePage(title: string): Promise<PDFDocument> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);

  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const maxWidth = pageWidth - 80;

  let fontSize = 36;
  while (fontSize > 14) {
    if (font.widthOfTextAtSize(title, fontSize) <= maxWidth) break;
    fontSize -= 2;
  }

  const textWidth = font.widthOfTextAtSize(title, fontSize);
  const textHeight = font.heightAtSize(fontSize);

  page.drawText(title, {
    x: (pageWidth - textWidth) / 2,
    y: (pageHeight - textHeight) / 2,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });

  return doc;
}
