import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, rgb } from 'pdf-lib';

// Cache font bytes for the session (fetch only once)
let fontBytesCache: ArrayBuffer | null = null;

async function loadJapaneseFont(): Promise<ArrayBuffer> {
  if (!fontBytesCache) {
    const res = await fetch('/fonts/BIZUDGothic-Regular.ttf');
    if (!res.ok) throw new Error(`Failed to load font: ${res.statusText}`);
    fontBytesCache = await res.arrayBuffer();
  }
  return fontBytesCache;
}

export async function createTitlePage(title: string): Promise<PDFDocument> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const fontBytes = await loadJapaneseFont();
  const font = await doc.embedFont(fontBytes);

  const page = doc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const maxWidth = width - 160;

  let fontSize = 36;
  while (fontSize > 14) {
    if (font.widthOfTextAtSize(title, fontSize) <= maxWidth) break;
    fontSize -= 2;
  }

  const textWidth = font.widthOfTextAtSize(title, fontSize);
  const textHeight = font.heightAtSize(fontSize);

  page.drawText(title, {
    x: (width - textWidth) / 2,
    y: (height - textHeight) / 2,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });

  return doc;
}
