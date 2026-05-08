import { PDFDocument } from "pdf-lib";

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
    if (copiedPage) output.addPage(copiedPage);
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
