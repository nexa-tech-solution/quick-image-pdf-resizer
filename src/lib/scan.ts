/**
 * Lightweight document scanner — no OpenCV.
 * - detectDocumentQuad: finds the paper as the largest bright blob on a downscaled copy.
 * - warpQuad: perspective-corrects the chosen quad into a flat rectangle (bilinear).
 * - applyScanFilter: enhance / grayscale / adaptive black & white.
 */

export type Point = { x: number; y: number };
/** Corners in image pixels, order: top-left, top-right, bottom-right, bottom-left. */
export type Quad = [Point, Point, Point, Point];
export type ScanFilter = "original" | "enhance" | "gray" | "bw";

const MAX_SOURCE = 2400; // cap working resolution for memory on phones

export async function loadScanSource(file: Blob): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  } as ImageBitmapOptions);
  const scale = Math.min(1, MAX_SOURCE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas;
}

export function fullQuad(w: number, h: number): Quad {
  return [
    { x: 0, y: 0 },
    { x: w, y: 0 },
    { x: w, y: h },
    { x: 0, y: h },
  ];
}

function insetQuad(w: number, h: number, f = 0.06): Quad {
  const dx = w * f;
  const dy = h * f;
  return [
    { x: dx, y: dy },
    { x: w - dx, y: dy },
    { x: w - dx, y: h - dy },
    { x: dx, y: h - dy },
  ];
}

export function detectDocumentQuad(source: HTMLCanvasElement): Quad {
  const W = 320;
  const scale = W / Math.max(source.width, source.height);
  const w = Math.max(8, Math.round(source.width * scale));
  const h = Math.max(8, Math.round(source.height * scale));
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.filter = "blur(2px)";
  ctx.drawImage(source, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  // Luminance minus saturation: paper is bright and low-chroma.
  const n = w * h;
  const score = new Float32Array(n);
  const hist = new Uint32Array(256);
  for (let i = 0; i < n; i++) {
    const r = data[i * 4],
      g = data[i * 4 + 1],
      b = data[i * 4 + 2];
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    const v = Math.max(0, Math.min(255, 0.299 * r + 0.587 * g + 0.114 * b - (max - min) * 0.5));
    score[i] = v;
    hist[v | 0]++;
  }

  // Otsu threshold.
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * hist[t];
  let sumB = 0,
    wB = 0,
    best = 0,
    threshold = 128;
  for (let t = 0; t < 256; t++) {
    wB += hist[t];
    if (!wB) continue;
    const wF = n - wB;
    if (!wF) break;
    sumB += t * hist[t];
    const mB = sumB / wB,
      mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) ** 2;
    if (between > best) {
      best = between;
      threshold = t;
    }
  }

  // Largest 4-connected bright component.
  const label = new Int32Array(n).fill(-1);
  const stack = new Int32Array(n);
  let bestLabel = -1,
    bestSize = 0,
    current = 0;
  for (let i = 0; i < n; i++) {
    if (label[i] !== -1 || score[i] <= threshold) continue;
    let top = 0,
      size = 0;
    stack[top++] = i;
    label[i] = current;
    while (top) {
      const p = stack[--top];
      size++;
      const x = p % w,
        y = (p / w) | 0;
      const neighbours = [
        x > 0 ? p - 1 : -1,
        x < w - 1 ? p + 1 : -1,
        y > 0 ? p - w : -1,
        y < h - 1 ? p + w : -1,
      ];
      for (const q of neighbours) {
        if (q >= 0 && label[q] === -1 && score[q] > threshold) {
          label[q] = current;
          stack[top++] = q;
        }
      }
    }
    if (size > bestSize) {
      bestSize = size;
      bestLabel = current;
    }
    current++;
  }

  const fallback = insetQuad(source.width, source.height);
  if (bestLabel < 0 || bestSize < n * 0.12 || bestSize > n * 0.97) return fallback;

  // Extreme points of the blob give the corners.
  let tl = { v: Infinity, p: { x: 0, y: 0 } };
  let br = { v: -Infinity, p: { x: 0, y: 0 } };
  let tr = { v: -Infinity, p: { x: 0, y: 0 } };
  let bl = { v: -Infinity, p: { x: 0, y: 0 } };
  for (let i = 0; i < n; i++) {
    if (label[i] !== bestLabel) continue;
    const x = i % w,
      y = (i / w) | 0;
    if (x + y < tl.v) tl = { v: x + y, p: { x, y } };
    if (x + y > br.v) br = { v: x + y, p: { x, y } };
    if (x - y > tr.v) tr = { v: x - y, p: { x, y } };
    if (y - x > bl.v) bl = { v: y - x, p: { x, y } };
  }
  const up = (p: Point): Point => ({ x: p.x / scale, y: p.y / scale });
  const quad: Quad = [up(tl.p), up(tr.p), up(br.p), up(bl.p)];

  // Reject degenerate shapes (e.g. a thin strip).
  const area = Math.abs(polygonArea(quad));
  if (area < source.width * source.height * 0.1) return fallback;
  return quad;
}

function polygonArea(q: Quad) {
  let a = 0;
  for (let i = 0; i < 4; i++) {
    const p = q[i],
      r = q[(i + 1) % 4];
    a += p.x * r.y - r.x * p.y;
  }
  return a / 2;
}

const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/** Solve the 3×3 homography mapping unit-rect corners (dst) → quad corners (src). */
function homography(dst: Quad, src: Quad) {
  // 8 equations, 8 unknowns (h33 = 1). Gaussian elimination.
  const A: number[][] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = dst[i];
    const { x: u, y: v } = src[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  }
  for (let col = 0; col < 8; col++) {
    let pivot = col;
    for (let r = col + 1; r < 8; r++) if (Math.abs(A[r][col]) > Math.abs(A[pivot][col])) pivot = r;
    [A[col], A[pivot]] = [A[pivot], A[col]];
    for (let r = 0; r < 8; r++) {
      if (r === col) continue;
      const f = A[r][col] / A[col][col];
      for (let k = col; k < 9; k++) A[r][k] -= f * A[col][k];
    }
  }
  const h = A.map((row, i) => row[8] / row[i]);
  return [...h, 1];
}

/** Perspective-correct `quad` from `source` into a new canvas. */
export function warpQuad(source: HTMLCanvasElement, quad: Quad): HTMLCanvasElement {
  const outW = Math.max(16, Math.round((dist(quad[0], quad[1]) + dist(quad[3], quad[2])) / 2));
  const outH = Math.max(16, Math.round((dist(quad[0], quad[3]) + dist(quad[1], quad[2])) / 2));
  const dst: Quad = fullQuad(outW, outH);
  const H = homography(dst, quad);

  const sw = source.width,
    sh = source.height;
  const src = source
    .getContext("2d", { willReadFrequently: true })!
    .getImageData(0, 0, sw, sh).data;
  const out = document.createElement("canvas");
  out.width = outW;
  out.height = outH;
  const octx = out.getContext("2d")!;
  const img = octx.createImageData(outW, outH);
  const o = img.data;

  for (let y = 0; y < outH; y++) {
    for (let x = 0; x < outW; x++) {
      const d = H[6] * x + H[7] * y + H[8];
      const u = (H[0] * x + H[1] * y + H[2]) / d;
      const v = (H[3] * x + H[4] * y + H[5]) / d;
      const x0 = Math.max(0, Math.min(sw - 1, Math.floor(u)));
      const y0 = Math.max(0, Math.min(sh - 1, Math.floor(v)));
      const x1 = Math.min(sw - 1, x0 + 1),
        y1 = Math.min(sh - 1, y0 + 1);
      const fx = Math.min(1, Math.max(0, u - x0)),
        fy = Math.min(1, Math.max(0, v - y0));
      const i00 = (y0 * sw + x0) * 4,
        i10 = (y0 * sw + x1) * 4,
        i01 = (y1 * sw + x0) * 4,
        i11 = (y1 * sw + x1) * 4;
      const oi = (y * outW + x) * 4;
      for (let c = 0; c < 3; c++) {
        const top = src[i00 + c] * (1 - fx) + src[i10 + c] * fx;
        const bot = src[i01 + c] * (1 - fx) + src[i11 + c] * fx;
        o[oi + c] = top * (1 - fy) + bot * fy;
      }
      o[oi + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  return out;
}

export function rotateCanvas(source: HTMLCanvasElement, quarterTurns: number) {
  const turns = ((quarterTurns % 4) + 4) % 4;
  if (turns === 0) return source;
  const out = document.createElement("canvas");
  const swap = turns % 2 === 1;
  out.width = swap ? source.height : source.width;
  out.height = swap ? source.width : source.height;
  const ctx = out.getContext("2d")!;
  ctx.translate(out.width / 2, out.height / 2);
  ctx.rotate((turns * Math.PI) / 2);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);
  return out;
}

export function applyScanFilter(source: HTMLCanvasElement, filter: ScanFilter): HTMLCanvasElement {
  if (filter === "original") return source;
  const w = source.width,
    h = source.height;
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(source, 0, 0);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const n = w * h;

  const gray = new Uint8ClampedArray(n);
  for (let i = 0; i < n; i++)
    gray[i] = 0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2];

  if (filter === "gray" || filter === "enhance") {
    // Contrast stretch between the 2nd and 98th percentile.
    const hist = new Uint32Array(256);
    for (let i = 0; i < n; i++) hist[gray[i]]++;
    let lo = 0,
      hi = 255,
      acc = 0;
    for (let t = 0; t < 256; t++)
      if ((acc += hist[t]) >= n * 0.02) {
        lo = t;
        break;
      }
    acc = 0;
    for (let t = 255; t >= 0; t--)
      if ((acc += hist[t]) >= n * 0.02) {
        hi = t;
        break;
      }
    const range = Math.max(1, hi - lo);
    for (let i = 0; i < n; i++) {
      if (filter === "gray") {
        const v = ((gray[i] - lo) * 255) / range;
        d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v;
      } else {
        for (let c = 0; c < 3; c++) d[i * 4 + c] = ((d[i * 4 + c] - lo) * 255) / range;
      }
    }
  } else {
    // Adaptive mean threshold via an integral image (Bradley–Roth).
    const integral = new Float64Array((w + 1) * (h + 1));
    for (let y = 1; y <= h; y++) {
      let row = 0;
      for (let x = 1; x <= w; x++) {
        row += gray[(y - 1) * w + (x - 1)];
        integral[y * (w + 1) + x] = integral[(y - 1) * (w + 1) + x] + row;
      }
    }
    const s = Math.max(8, Math.round(Math.max(w, h) / 24));
    const T = 0.12;
    for (let y = 0; y < h; y++) {
      const y0 = Math.max(0, y - s),
        y1 = Math.min(h, y + s + 1);
      for (let x = 0; x < w; x++) {
        const x0 = Math.max(0, x - s),
          x1 = Math.min(w, x + s + 1);
        const count = (x1 - x0) * (y1 - y0);
        const total =
          integral[y1 * (w + 1) + x1] -
          integral[y0 * (w + 1) + x1] -
          integral[y1 * (w + 1) + x0] +
          integral[y0 * (w + 1) + x0];
        const v = gray[y * w + x] * count < total * (1 - T) ? 0 : 255;
        const i = (y * w + x) * 4;
        d[i] = d[i + 1] = d[i + 2] = v;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
  return out;
}

export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/jpeg", quality = 0.88) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not encode image"))),
      type,
      quality,
    ),
  );
}

/** Each page is fitted to A4 portrait/landscape (whichever matches the image). */
export async function scansToPdf(pages: Blob[]) {
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  for (const blob of pages) {
    const img = await pdf.embedJpg(await blob.arrayBuffer());
    const landscape = img.width > img.height;
    const [pw, ph] = landscape ? [841.89, 595.28] : [595.28, 841.89];
    const fit = Math.min(pw / img.width, ph / img.height);
    const w = img.width * fit,
      h = img.height * fit;
    const page = pdf.addPage([pw, ph]);
    page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
  }
  const bytes = await pdf.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}
