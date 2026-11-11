/**
 * ID / passport / visa photo maker.
 *
 * 1. segmentPortrait(): AI portrait matting (MODNet, Apache-2.0) runs on the
 *    device via transformers.js — the photo is never uploaded. The model
 *    (~25 MB) is downloaded once and cached by the browser.
 * 2. analyzeSubject(): finds the top of the head, the chin (narrowest neck row
 *    above the shoulders) and the face centre from the alpha mask.
 * 3. autoFit(): scales/positions the cut-out so head size and top margin match
 *    the chosen spec; the user can then fine-tune by dragging and zooming.
 * 4. renderPhoto() / renderPrintSheet(): 300 DPI exports.
 */

export const PHOTO_DPI = 300;

export type IdPhotoSpec = {
  id: string;
  /** Physical size in millimetres. */
  widthMm: number;
  heightMm: number;
  /** Crown-to-chin height as a fraction of photo height. */
  head: number;
  /** Gap above the crown as a fraction of photo height. */
  top: number;
  /** Label shown on the chip, e.g. "3×4 cm". */
  size: string;
};

export const ID_PHOTO_SPECS: IdPhotoSpec[] = [
  { id: "3x4", widthMm: 30, heightMm: 40, head: 0.62, top: 0.1, size: "3×4 cm" },
  { id: "4x6", widthMm: 40, heightMm: 60, head: 0.55, top: 0.11, size: "4×6 cm" },
  { id: "35x45", widthMm: 35, heightMm: 45, head: 0.75, top: 0.07, size: "35×45 mm" },
  { id: "2x2in", widthMm: 50.8, heightMm: 50.8, head: 0.6, top: 0.11, size: "2×2 inch" },
  { id: "5x7", widthMm: 50, heightMm: 70, head: 0.52, top: 0.1, size: "5×7 cm" },
];

export const ID_PHOTO_BACKGROUNDS = [
  { id: "white", color: "#FFFFFF" },
  { id: "blue", color: "#3F8EF2" },
  { id: "lightBlue", color: "#CFE3FA" },
  { id: "gray", color: "#E6E6E6" },
  { id: "red", color: "#D3262E" },
] as const;

export const mmToPx = (mm: number, dpi = PHOTO_DPI) => Math.round((mm / 25.4) * dpi);

export function specPixels(spec: IdPhotoSpec, dpi = PHOTO_DPI) {
  return { width: mmToPx(spec.widthMm, dpi), height: mmToPx(spec.heightMm, dpi) };
}

/* ------------------------------------------------------------------ */
/* AI portrait segmentation                                            */
/* ------------------------------------------------------------------ */

type Segmenter = {
  run: (file: Blob) => Promise<HTMLCanvasElement>;
};

let segmenterPromise: Promise<Segmenter> | null = null;

function loadSegmenter(): Promise<Segmenter> {
  segmenterPromise ??= (async () => {
    const { AutoModel, AutoProcessor, RawImage } = await import("@huggingface/transformers");
    const model = await AutoModel.from_pretrained("Xenova/modnet", { dtype: "fp32" });
    const processor = await AutoProcessor.from_pretrained("Xenova/modnet");

    return {
      async run(file: Blob) {
        const url = URL.createObjectURL(file);
        try {
          const image = await RawImage.fromURL(url);
          const { pixel_values } = await processor(image);
          const { output } = await model({ input: pixel_values });
          const mask = await RawImage.fromTensor(output[0].mul(255).to("uint8")).resize(
            image.width,
            image.height,
          );

          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas is not available");
          const img = await createImageBitmap(file, { imageOrientation: "from-image" });
          ctx.drawImage(img, 0, 0, image.width, image.height);
          img.close();
          const pixels = ctx.getImageData(0, 0, image.width, image.height);
          const alpha = mask.data;
          for (let i = 0; i < alpha.length; i += 1) pixels.data[i * 4 + 3] = alpha[i]!;
          ctx.putImageData(pixels, 0, 0);
          return canvas;
        } finally {
          URL.revokeObjectURL(url);
        }
      },
    };
  })().catch((err) => {
    segmenterPromise = null; // allow retry (e.g. offline on first use)
    throw err;
  });
  return segmenterPromise;
}

/** Cuts the person out of the photo (transparent background). */
export async function segmentPortrait(file: Blob): Promise<HTMLCanvasElement> {
  // Large camera photos are slow to segment; 1600px is plenty for 300 DPI ID photos.
  const source = await downscale(file, 1600);
  const segmenter = await loadSegmenter();
  return segmenter.run(source);
}

async function downscale(file: Blob, maxSide: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.type === "image/png") {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/png"),
  );
}

/* ------------------------------------------------------------------ */
/* Head detection from the mask                                        */
/* ------------------------------------------------------------------ */

export type Subject = { top: number; chin: number; centerX: number };

/** Returns null when no person is found. */
export function analyzeSubject(cutout: HTMLCanvasElement): Subject | null {
  const { width: w, height: h } = cutout;
  const data = cutout.getContext("2d")!.getImageData(0, 0, w, h).data;
  const left = new Int32Array(h).fill(-1);
  const right = new Int32Array(h).fill(-1);

  for (let y = 0; y < h; y += 1) {
    const row = y * w * 4;
    for (let x = 0; x < w; x += 1) {
      if (data[row + x * 4 + 3]! > 128) {
        if (left[y] < 0) left[y] = x;
        right[y] = x;
      }
    }
  }
  const width = (y: number) => (left[y] < 0 ? 0 : right[y] - left[y] + 1);

  // Crown: first row with a meaningful amount of person (ignore stray hairs).
  let top = -1;
  for (let y = 0; y < h; y += 1) {
    if (width(y) > w * 0.04) {
      top = y;
      break;
    }
  }
  if (top < 0) return null;
  const span = h - top;
  if (span < h * 0.15) return null;

  // Smoothed row widths (hair strands make single rows noisy).
  const smooth = new Float32Array(h);
  for (let y = 0; y < h; y += 1) {
    let acc = 0;
    let n = 0;
    for (let k = Math.max(0, y - 3); k <= Math.min(h - 1, y + 3); k += 1) {
      acc += width(k);
      n += 1;
    }
    smooth[y] = acc / n;
  }

  // Neck: the narrowest row that is clearly narrower than the widest part of the
  // head above it (so a hair bun on top doesn't count) and, when visible, has
  // the shoulders widening below it. The chin sits just above the neck.
  const from = Math.round(top + span * 0.25);
  const to = Math.min(h - 1, Math.round(top + span * 0.85));
  const below = Math.round(span * 0.1);
  let prefMax = 0;
  for (let y = top; y < from; y += 1) prefMax = Math.max(prefMax, smooth[y]!);
  let neck = -1;
  let bestRatio = 0.75;
  for (let y = from; y <= to; y += 1) {
    prefMax = Math.max(prefMax, smooth[y]!);
    const ratio = smooth[y]! / Math.max(1, prefMax);
    const shouldersBelow = y + below >= h || smooth[y + below]! > smooth[y]! * 1.1;
    if (ratio < bestRatio && shouldersBelow) {
      bestRatio = ratio;
      neck = y;
    }
  }
  let headWidth = 0;
  for (let y = top; y <= Math.min(h - 1, top + span * 0.5); y += 1) {
    headWidth = Math.max(headWidth, smooth[y]!);
  }
  // No clear neck (e.g. head-only crop): a head is about 1.35× as tall as wide.
  const chin =
    neck > 0
      ? Math.min(h - 1, neck + (neck - top) * 0.06)
      : Math.min(h - 1, top + headWidth * 1.35);

  let sum = 0;
  let n = 0;
  for (let y = top; y <= chin; y += 1) {
    if (left[y] >= 0) {
      sum += (left[y] + right[y]) / 2;
      n += 1;
    }
  }
  return { top, chin, centerX: n ? sum / n : w / 2 };
}

/* ------------------------------------------------------------------ */
/* Placement + rendering                                               */
/* ------------------------------------------------------------------ */

/** Cut-out drawn at (x, y) with `scale` output-pixels per source pixel. */
export type Placement = { scale: number; x: number; y: number };

export function autoFit(subject: Subject, spec: IdPhotoSpec, dpi = PHOTO_DPI): Placement {
  const { width, height } = specPixels(spec, dpi);
  const scale = (spec.head * height) / Math.max(1, subject.chin - subject.top);
  return {
    scale,
    x: width / 2 - subject.centerX * scale,
    y: spec.top * height - subject.top * scale,
  };
}

/** Same placement at a different DPI (preview vs export). */
export function rescalePlacement(p: Placement, fromDpi: number, toDpi: number): Placement {
  const k = toDpi / fromDpi;
  return { scale: p.scale * k, x: p.x * k, y: p.y * k };
}

export function renderPhoto(
  cutout: HTMLCanvasElement,
  spec: IdPhotoSpec,
  placement: Placement,
  background: string,
  dpi = PHOTO_DPI,
): HTMLCanvasElement {
  const { width, height } = specPixels(spec, dpi);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    cutout,
    placement.x,
    placement.y,
    cutout.width * placement.scale,
    cutout.height * placement.scale,
  );
  return canvas;
}

/** 10×15 cm (4×6 inch) print sheet with as many copies as fit, plus cut guides. */
export function renderPrintSheet(photo: HTMLCanvasElement, dpi = PHOTO_DPI) {
  const margin = mmToPx(3, dpi);
  const gap = mmToPx(2, dpi);
  const fit = (sheetW: number, sheetH: number) => {
    const cols = Math.max(0, Math.floor((sheetW - 2 * margin + gap) / (photo.width + gap)));
    const rows = Math.max(0, Math.floor((sheetH - 2 * margin + gap) / (photo.height + gap)));
    return { sheetW, sheetH, cols, rows, count: cols * rows };
  };
  const portrait = fit(mmToPx(101.6, dpi), mmToPx(152.4, dpi));
  const landscape = fit(portrait.sheetH, portrait.sheetW);
  const best = landscape.count > portrait.count ? landscape : portrait;

  const canvas = document.createElement("canvas");
  canvas.width = best.sheetW;
  canvas.height = best.sheetH;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const gridW = best.cols * photo.width + (best.cols - 1) * gap;
  const gridH = best.rows * photo.height + (best.rows - 1) * gap;
  const ox = Math.round((canvas.width - gridW) / 2);
  const oy = Math.round((canvas.height - gridH) / 2);
  ctx.strokeStyle = "#C8C8C8";
  ctx.lineWidth = 1;
  for (let r = 0; r < best.rows; r += 1) {
    for (let c = 0; c < best.cols; c += 1) {
      const x = ox + c * (photo.width + gap);
      const y = oy + r * (photo.height + gap);
      ctx.drawImage(photo, x, y);
      ctx.strokeRect(x - 0.5, y - 0.5, photo.width + 1, photo.height + 1);
    }
  }
  return { canvas, count: best.count };
}

export function canvasToJpeg(canvas: HTMLCanvasElement, quality = 0.95): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode image"))),
      "image/jpeg",
      quality,
    ),
  );
}
