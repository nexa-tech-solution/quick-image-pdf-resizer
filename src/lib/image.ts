export type ImageFormat = "jpeg" | "png" | "webp" | "avif";

export const formatMime: Record<ImageFormat, string> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export const formatExt: Record<ImageFormat, string> = {
  jpeg: "jpg",
  png: "png",
  webp: "webp",
  avif: "avif",
};

export interface ProcessOptions {
  width?: number;
  height?: number;
  fit?: "contain" | "cover" | "stretch";
  format: ImageFormat;
  quality: number; // 0..1
  backgroundColor?: string;
}

export async function loadImage(file: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    try {
      return await loadImageFromUrl(url);
    } catch (error) {
      if (typeof createImageBitmap !== "function") {
        throw error;
      }

      const bitmap = await createImageBitmap(file);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas is not available");
        ctx.drawImage(bitmap, 0, 0);

        const fallbackBlob = await encodeCanvas(canvas, "image/png", 1);
        const fallbackUrl = URL.createObjectURL(fallbackBlob);
        try {
          return await loadImageFromUrl(fallbackUrl);
        } finally {
          setTimeout(() => URL.revokeObjectURL(fallbackUrl), 5000);
        }
      } finally {
        bitmap.close();
      }
    }
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

  if (!Number.isFinite(outW) || !Number.isFinite(outH) || outW < 1 || outH < 1) {
    throw new Error("Invalid output dimensions");
  }

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not available");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (opts.backgroundColor || opts.format === "jpeg") {
    ctx.fillStyle = opts.backgroundColor ?? "#ffffff";
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
      let sx = 0;
      let sy = 0;
      let sw = srcW;
      let sh = srcH;
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

  const blob = await encodeCanvas(canvas, formatMime[opts.format], opts.quality);
  return { blob, width: outW, height: outH };
}

async function encodeCanvas(
  canvas: HTMLCanvasElement,
  mime: string,
  quality: number,
): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((value) => resolve(value), mime, quality);
  });

  if (blob && blob.size > 0) {
    return blob;
  }

  const dataUrl = canvas.toDataURL(mime, quality);
  const fallback = await dataUrlToBlob(dataUrl);
  if (fallback.size === 0) {
    throw new Error(`Could not encode ${mime.toUpperCase()} output`);
  }
  return fallback;
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  return response.blob();
}

async function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.decoding = "async";
  img.src = url;

  if (typeof img.decode === "function") {
    await img.decode();
    return img;
  }

  await new Promise<void>((res, rej) => {
    img.onload = () => res();
    img.onerror = () => rej(new Error("Failed to load image"));
  });
  return img;
}

export function downloadBlob(blob: Blob, filename: string) {
  void (async () => {
    const file = new File([blob], filename, {
      type: blob.type || "application/octet-stream",
    });

    const saveViaPicker = async () => {
      if (typeof window === "undefined" || !("showSaveFilePicker" in window)) return false;

      try {
        const picker = window.showSaveFilePicker;
        if (typeof picker !== "function") return false;

        const handle = await picker.call(window, {
          suggestedName: filename,
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        return true;
      } catch {
        return false;
      }
    };

    const saveViaShare = async () => {
      if (typeof navigator === "undefined" || !("share" in navigator)) return false;

      try {
        const share = navigator.share;
        const canShare = navigator.canShare;
        if (typeof share !== "function" || typeof canShare !== "function") return false;
        if (!canShare.call(navigator, { files: [file] })) return false;

        await share.call(navigator, {
          files: [file],
          title: filename,
          text: filename,
        });
        return true;
      } catch {
        return false;
      }
    };

    if (await saveViaPicker()) return;
    if (await saveViaShare()) return;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  })();
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function replaceExt(name: string, ext: string): string {
  return name.replace(/\.[^.]+$/, "") + "." + ext;
}
