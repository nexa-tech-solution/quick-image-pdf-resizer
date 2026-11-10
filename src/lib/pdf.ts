import { PDFDocument, degrees } from "pdf-lib";

type PdfJsPage = {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: {
    canvasContext: CanvasRenderingContext2D;
    viewport: unknown;
    canvas?: HTMLCanvasElement;
  }) => { promise: Promise<void> };
  cleanup?: () => void;
};

type PdfJsDocument = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
  destroy: () => Promise<void> | void;
};

export type PdfPageReference = {
  bytes: Uint8Array;
  pageIndex: number;
  /** Extra clockwise rotation in degrees (0/90/180/270) applied on export. */
  rotation?: number;
};

export async function loadPdfWithThumbnails(file: File, scale = 0.22) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await openPdfDocument(bytes);
  const thumbnails: Blob[] = [];

  try {
    for (let index = 0; index < doc.numPages; index++) {
      const page = await doc.getPage(index + 1);
      thumbnails.push(await renderPdfPageThumbnail(page, scale));
      page.cleanup?.();
    }

    return {
      bytes,
      pageCount: doc.numPages,
      thumbnails,
    };
  } finally {
    await doc.destroy();
  }
}

export async function buildPdfFromPages(pages: PdfPageReference[]) {
  const output = await PDFDocument.create();
  const sourceDocs = new Map<Uint8Array, PDFDocument>();

  for (const page of pages) {
    let sourceDoc = sourceDocs.get(page.bytes);
    if (!sourceDoc) {
      sourceDoc = await PDFDocument.load(page.bytes);
      sourceDocs.set(page.bytes, sourceDoc);
    }

    const [copiedPage] = await output.copyPages(sourceDoc, [page.pageIndex]);
    if (copiedPage) {
      if (page.rotation) {
        const current = copiedPage.getRotation().angle;
        copiedPage.setRotation(degrees((current + page.rotation) % 360));
      }
      output.addPage(copiedPage);
    }
  }

  return output.save();
}

export function formatPdfPageLabel(filename: string, pageIndex: number) {
  return `${filename} · page ${pageIndex + 1}`;
}

export function organizedPdfFilename(filename?: string) {
  if (!filename) return "organized.pdf";
  return `${filename.replace(/\.[^.]+$/, "")}-organized.pdf`;
}

async function openPdfDocument(bytes: Uint8Array): Promise<PdfJsDocument> {
  const pdfjs = await import("pdfjs-dist");
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

  return pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise as Promise<PdfJsDocument>;
}

async function renderPdfPageThumbnail(page: PdfJsPage, scale: number) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Could not render PDF thumbnail"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.78,
    );
  });
}

export type PdfCompressionLevel = "low" | "medium" | "high";

/** Render scale (relative to 72dpi points) and JPEG quality per level. */
const compressionSettings: Record<PdfCompressionLevel, { scale: number; quality: number }> = {
  low: { scale: 2, quality: 0.82 },
  medium: { scale: 1.5, quality: 0.62 },
  high: { scale: 1.1, quality: 0.42 },
};

/**
 * Compress a PDF by re-rendering each page to a JPEG and rebuilding the document.
 * Works for scans/photo-heavy PDFs; text becomes part of the image (not selectable).
 */
export async function compressPdf(
  file: File,
  level: PdfCompressionLevel,
  onProgress?: (current: number, total: number) => void,
) {
  const { scale, quality } = compressionSettings[level];
  const bytes = new Uint8Array(await file.arrayBuffer());
  const doc = await openPdfDocument(bytes);
  const output = await PDFDocument.create();

  try {
    for (let index = 0; index < doc.numPages; index++) {
      onProgress?.(index + 1, doc.numPages);
      const page = await doc.getPage(index + 1);
      const base = page.getViewport({ scale: 1 });
      const jpeg = await renderPdfPageToJpeg(page, scale, quality);
      page.cleanup?.();

      const image = await output.embedJpg(await jpeg.arrayBuffer());
      const pdfPage = output.addPage([base.width, base.height]);
      pdfPage.drawImage(image, { x: 0, y: 0, width: base.width, height: base.height });
    }
  } finally {
    await doc.destroy();
  }

  const saved = await output.save({ useObjectStreams: true });
  return {
    blob: new Blob([saved as BlobPart], { type: "application/pdf" }),
    pageCount: output.getPageCount(),
  };
}

export function compressedPdfFilename(filename: string) {
  return `${filename.replace(/\.[^.]+$/, "")}-compressed.pdf`;
}

async function renderPdfPageToJpeg(page: PdfJsPage, scale: number, quality: number) {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport, canvas }).promise;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not render PDF page"))),
      "image/jpeg",
      quality,
    );
  });
  canvas.width = 0;
  canvas.height = 0;
  return blob;
}
