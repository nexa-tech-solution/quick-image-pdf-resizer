import { PDFDocument, rgb, type PDFFont } from "pdf-lib";

/* ------------------------------------------------------------------ */
/* pdf.js loader (shared)                                              */
/* ------------------------------------------------------------------ */

// Minimal structural types for the parts of pdf.js we use.
type TextItem = {
  str: string;
  transform: number[];
  width: number;
  height: number;
  hasEOL?: boolean;
};
type PdfJsPage = {
  getViewport: (o: { scale: number }) => { width: number; height: number };
  getTextContent: () => Promise<{ items: (TextItem | { type: string })[] }>;
  getOperatorList: () => Promise<{ fnArray: number[]; argsArray: unknown[][] }>;
  objs: {
    get: (name: string, cb?: (data: unknown) => void) => unknown;
    has?: (n: string) => boolean;
  };
  commonObjs: { get: (name: string, cb?: (data: unknown) => void) => unknown };
  cleanup?: () => void;
};
type PdfJsDocument = {
  numPages: number;
  getPage: (n: number) => Promise<PdfJsPage>;
  destroy: () => Promise<void> | void;
};

export class PdfPasswordError extends Error {
  constructor() {
    super("PDF is password protected");
    this.name = "PdfPasswordError";
  }
}

async function loadPdfJs() {
  const pdfjs = await import("pdfjs-dist");
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  return pdfjs;
}

async function openPdf(file: Blob): Promise<{ doc: PdfJsDocument; OPS: Record<string, number> }> {
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  try {
    const doc = (await pdfjs.getDocument({ data }).promise) as unknown as PdfJsDocument;
    return { doc, OPS: pdfjs.OPS as unknown as Record<string, number> };
  } catch (err) {
    if (err && typeof err === "object" && (err as { name?: string }).name === "PasswordException") {
      throw new PdfPasswordError();
    }
    throw err;
  }
}

export function baseName(name: string) {
  return name.replace(/\.[^.]+$/, "") || "document";
}

/* ------------------------------------------------------------------ */
/* Text → PDF                                                          */
/* ------------------------------------------------------------------ */

export type PageSizeId = "a4" | "letter" | "a5";
export const pageSizes: Record<PageSizeId, { label: string; size: [number, number] }> = {
  a4: { label: "A4", size: [595.28, 841.89] },
  letter: { label: "Letter", size: [612, 792] },
  a5: { label: "A5", size: [419.53, 595.28] },
};

let fontBytesPromise: Promise<ArrayBuffer> | null = null;
/** Noto Sans (OFL) — full Latin incl. every Vietnamese precomposed glyph. Loaded on demand, subset on embed. */
function loadUnicodeFont() {
  fontBytesPromise ??= (async () => {
    const url = (await import("@/assets/fonts/NotoSans-Regular.ttf?url")).default;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Could not load font");
    return res.arrayBuffer();
  })();
  return fontBytesPromise;
}

/** Break one paragraph into lines that fit `maxWidth`, splitting very long words by character. */
function wrapParagraph(text: string, font: PDFFont, size: number, maxWidth: number) {
  if (text === "") return [""];
  const width = (s: string) => font.widthOfTextAtSize(s, size);
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/(\s+)/)) {
    if (word === "") continue;
    const candidate = line + word;
    if (width(candidate) <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line.trim() !== "") lines.push(line.trimEnd());
    line = /^\s+$/.test(word) ? "" : word;
    // Word itself longer than a line → hard split.
    while (width(line) > maxWidth) {
      let cut = line.length - 1;
      while (cut > 1 && width(line.slice(0, cut)) > maxWidth) cut--;
      lines.push(line.slice(0, cut));
      line = line.slice(cut);
    }
  }
  lines.push(line.trimEnd());
  return lines;
}

export async function textToPdf(
  text: string,
  opts: { pageSize: PageSizeId; fontSize: number; margin: number; title?: string },
) {
  const fontkit = (await import("@pdf-lib/fontkit")).default;
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(await loadUnicodeFont(), { subset: true });
  if (opts.title) pdf.setTitle(opts.title);

  const [pw, ph] = pageSizes[opts.pageSize].size;
  const { fontSize, margin } = opts;
  const lineHeight = fontSize * 1.4;
  const maxWidth = pw - margin * 2;

  // Normalise newlines and tabs; drop characters the font cannot encode.
  const normalized = text.replace(/\r\n?/g, "\n").replace(/\t/g, "    ").normalize("NFC");
  const supported = new Set(font.getCharacterSet());
  const safe = Array.from(normalized)
    .map((ch) => (ch === "\n" || supported.has(ch.codePointAt(0) ?? 0) ? ch : "?"))
    .join("");

  let page = pdf.addPage([pw, ph]);
  let y = ph - margin - fontSize;
  for (const para of safe.split("\n")) {
    for (const line of wrapParagraph(para, font, fontSize, maxWidth)) {
      if (y < margin) {
        page = pdf.addPage([pw, ph]);
        y = ph - margin - fontSize;
      }
      if (line)
        page.drawText(line, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
      y -= lineHeight;
    }
  }

  const bytes = await pdf.save();
  return {
    blob: new Blob([bytes as BlobPart], { type: "application/pdf" }),
    pageCount: pdf.getPageCount(),
  };
}

/* ------------------------------------------------------------------ */
/* Extract embedded images                                             */
/* ------------------------------------------------------------------ */

type PdfJsImage = {
  width: number;
  height: number;
  data?: Uint8ClampedArray | Uint8Array;
  kind?: number; // 1 = GRAYSCALE_1BPP, 2 = RGB_24BPP, 3 = RGBA_32BPP
  bitmap?: ImageBitmap;
};

export type ExtractedImage = {
  blob: Blob;
  url: string;
  width: number;
  height: number;
  page: number;
  filename: string;
};

function getObj(store: PdfJsPage["objs"], name: string) {
  return new Promise<unknown>((resolve) => {
    try {
      store.get(name, resolve);
    } catch {
      resolve(null);
    }
    // Objects missing from the store never resolve — time out instead of hanging.
    setTimeout(() => resolve(null), 4000);
  });
}

function imageToCanvas(img: PdfJsImage) {
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  if (img.bitmap) {
    ctx.drawImage(img.bitmap, 0, 0);
    return canvas;
  }
  if (!img.data) return null;

  const out = ctx.createImageData(img.width, img.height);
  const px = img.width * img.height;
  const src = img.data;
  if (img.kind === 3) {
    out.data.set(src.subarray(0, px * 4));
  } else if (img.kind === 2) {
    for (let i = 0, j = 0; i < px; i++, j += 3) {
      out.data[i * 4] = src[j];
      out.data[i * 4 + 1] = src[j + 1];
      out.data[i * 4 + 2] = src[j + 2];
      out.data[i * 4 + 3] = 255;
    }
  } else if (img.kind === 1) {
    const rowBytes = (img.width + 7) >> 3;
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const bit = (src[y * rowBytes + (x >> 3)] >> (7 - (x & 7))) & 1;
        const v = bit ? 255 : 0;
        const o = (y * img.width + x) * 4;
        out.data[o] = out.data[o + 1] = out.data[o + 2] = v;
        out.data[o + 3] = 255;
      }
    }
  } else {
    return null;
  }
  ctx.putImageData(out, 0, 0);
  return canvas;
}

export async function extractPdfImages(
  file: File,
  opts: { minSize: number },
  onProgress?: (current: number, total: number) => void,
): Promise<ExtractedImage[]> {
  const { doc, OPS } = await openPdf(file);
  const results: ExtractedImage[] = [];
  const seen = new Set<string>();
  const stem = baseName(file.name);

  try {
    for (let p = 1; p <= doc.numPages; p++) {
      onProgress?.(p, doc.numPages);
      const page = await doc.getPage(p);
      const ops = await page.getOperatorList();

      for (let i = 0; i < ops.fnArray.length; i++) {
        const fn = ops.fnArray[i];
        let img: PdfJsImage | null = null;
        if (fn === OPS.paintImageXObject || fn === OPS.paintImageXObjectRepeat) {
          const name = ops.argsArray[i][0] as string;
          if (seen.has(name)) continue;
          seen.add(name);
          const store = name.startsWith("g_") ? page.commonObjs : page.objs;
          img = (await getObj(store, name)) as PdfJsImage | null;
        } else if (fn === OPS.paintInlineImageXObject) {
          img = ops.argsArray[i][0] as PdfJsImage;
        }
        if (!img || img.width < opts.minSize || img.height < opts.minSize) continue;

        const canvas = imageToCanvas(img);
        if (!canvas) continue;
        const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
        canvas.width = canvas.height = 0;
        if (!blob) continue;
        const n = results.length + 1;
        results.push({
          blob,
          url: URL.createObjectURL(blob),
          width: img.width,
          height: img.height,
          page: p,
          filename: `${stem}-p${p}-${String(n).padStart(3, "0")}.png`,
        });
      }
      page.cleanup?.();
    }
  } finally {
    await doc.destroy();
  }
  return results;
}

/* ------------------------------------------------------------------ */
/* PDF → Word (text only)                                              */
/* ------------------------------------------------------------------ */

export type DocParagraph = { text: string; size: number; page: number };

type Line = { y: number; x: number; size: number; text: string };

/** Group pdf.js text items into lines, then lines into paragraphs by vertical gap. */
function pageToParagraphs(items: TextItem[], page: number): DocParagraph[] {
  const lines: Line[] = [];
  const sorted = items
    .filter((it) => it.str !== undefined)
    .map((it) => ({
      ...it,
      x: it.transform[4],
      y: it.transform[5],
      size: Math.abs(it.transform[3]) || it.height || 10,
    }))
    .sort((a, b) => b.y - a.y || a.x - b.x);

  for (const it of sorted) {
    const last = lines[lines.length - 1];
    if (last && Math.abs(last.y - it.y) < Math.max(2, it.size * 0.4)) {
      const needsSpace = last.text && !last.text.endsWith(" ") && it.str && !it.str.startsWith(" ");
      last.text += (needsSpace && it.x - last.x > 0 ? " " : "") + it.str;
      last.x = it.x + it.width;
      last.size = Math.max(last.size, it.size);
    } else if (it.str.trim() !== "") {
      lines.push({ y: it.y, x: it.x + it.width, size: it.size, text: it.str });
    }
  }

  const paragraphs: DocParagraph[] = [];
  let current: { lines: Line[] } | null = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prev = lines[i - 1];
    const gap = prev ? prev.y - line.y : 0;
    const sizeChanged = prev && Math.abs(prev.size - line.size) > 1.5;
    const newPara = !current || !prev || gap > line.size * 1.8 || sizeChanged;
    if (newPara) {
      current = { lines: [] };
      paragraphs.push({ text: "", size: line.size, page });
    }
    current!.lines.push(line);
    const para = paragraphs[paragraphs.length - 1];
    const clean = line.text.replace(/\s+/g, " ").trim();
    // Join hyphenated line breaks; otherwise join with a space.
    if (!para.text) para.text = clean;
    else if (para.text.endsWith("-")) para.text = para.text.slice(0, -1) + clean;
    else para.text += " " + clean;
  }
  return paragraphs.filter((p) => p.text.trim() !== "");
}

export async function extractPdfParagraphs(
  file: File,
  onProgress?: (current: number, total: number) => void,
) {
  const { doc } = await openPdf(file);
  const paragraphs: DocParagraph[] = [];
  try {
    for (let p = 1; p <= doc.numPages; p++) {
      onProgress?.(p, doc.numPages);
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      paragraphs.push(
        ...pageToParagraphs(
          content.items.filter((i): i is TextItem => "str" in i),
          p,
        ),
      );
      page.cleanup?.();
    }
    return { paragraphs, pageCount: doc.numPages };
  } finally {
    await doc.destroy();
  }
}

export async function paragraphsToDocx(paragraphs: DocParagraph[], title: string) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import("docx");

  // Most common size = body text; noticeably bigger = heading.
  const counts = new Map<number, number>();
  for (const p of paragraphs) {
    const k = Math.round(p.size);
    counts.set(k, (counts.get(k) ?? 0) + p.text.length);
  }
  const body = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 11;

  const children = paragraphs.map((p, i) => {
    const prev = paragraphs[i - 1];
    const pageBreakBefore = !!prev && prev.page !== p.page;
    const ratio = p.size / body;
    const heading =
      p.text.length < 120 && ratio >= 1.6
        ? HeadingLevel.HEADING_1
        : p.text.length < 120 && ratio >= 1.25
          ? HeadingLevel.HEADING_2
          : undefined;
    return new Paragraph({
      heading,
      pageBreakBefore,
      spacing: { after: 120 },
      children: [
        new TextRun({ text: p.text, size: Math.round(Math.min(Math.max(p.size, 8), 40) * 2) }),
      ],
    });
  });

  const doc = new Document({ title, sections: [{ children }] });
  return Packer.toBlob(doc);
}
