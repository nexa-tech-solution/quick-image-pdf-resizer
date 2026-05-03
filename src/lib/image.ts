export type ImageFormat = "jpeg" | "png" | "webp";

export const formatMime: Record<ImageFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export const formatExt: Record<ImageFormat, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
};

export interface ProcessOptions {
  width?: number;
  height?: number;
  fit?: "contain" | "cover" | "stretch";
  format: ImageFormat;
  quality: number; // 0..1
}

export async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("Failed to load image"));
      img.src = url;
    });
    return img;
  } finally {
    // Defer revoke to allow drawing
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }
}

export async function processImage(
  file: File,
  opts: ProcessOptions,
): Promise<{ blob: Blob; width: number; height: number }> {
  const img = await loadImage(file);
  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;

  let outW = opts.width ?? srcW;
  let outH = opts.height ?? srcH;

  if (opts.width && !opts.height) outH = Math.round((srcH / srcW) * opts.width);
  if (opts.height && !opts.width) outW = Math.round((srcW / srcH) * opts.height);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (opts.format === "jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outW, outH);
  }

  const fit = opts.fit ?? "contain";
  if (fit === "stretch") {
    ctx.drawImage(img, 0, 0, outW, outH);
  } else {
    const srcRatio = srcW / srcH;
    const dstRatio = outW / outH;
    let dw: number, dh: number;
    if (fit === "contain") {
      if (srcRatio > dstRatio) {
        dw = outW;
        dh = outW / srcRatio;
      } else {
        dh = outH;
        dw = outH * srcRatio;
      }
      const dx = (outW - dw) / 2;
      const dy = (outH - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
    } else {
      // cover
      let sx = 0, sy = 0, sw = srcW, sh = srcH;
      if (srcRatio > dstRatio) {
        sw = srcH * dstRatio;
        sx = (srcW - sw) / 2;
      } else {
        sh = srcW / dstRatio;
        sy = (srcH - sh) / 2;
      }
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
    }
  }

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Encode failed"))),
      formatMime[opts.format],
      opts.quality,
    );
  });
  return { blob, width: outW, height: outH };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function replaceExt(name: string, ext: string): string {
  return name.replace(/\.[^.]+$/, "") + "." + ext;
}
