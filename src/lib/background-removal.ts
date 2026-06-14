import { loadImage, formatMime, type ImageFormat } from "@/lib/image";

export type BackgroundOutputFormat = Extract<ImageFormat, "png" | "webp" | "avif">;

export const backgroundOutputFormats: BackgroundOutputFormat[] = ["png", "webp", "avif"];

type RemovedImage = {
  width: number;
  height: number;
  toBlob(type?: string, quality?: number): Promise<Blob>;
};

type Sample = { r: number; g: number; b: number; a: number };

function colorDistance(a: Sample, b: Sample) {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0 || 1)));
  return t * t * (3 - 2 * t);
}

function averageSamples(samples: Sample[]) {
  if (samples.length === 0) return { r: 255, g: 255, b: 255, a: 255 };
  return samples.reduce(
    (acc, sample) => ({
      r: acc.r + sample.r / samples.length,
      g: acc.g + sample.g / samples.length,
      b: acc.b + sample.b / samples.length,
      a: acc.a + sample.a / samples.length,
    }),
    { r: 0, g: 0, b: 0, a: 0 },
  );
}

function sampleBorderPixels(data: Uint8ClampedArray, width: number, height: number) {
  const samples: Sample[] = [];
  const step = Math.max(1, Math.floor(Math.min(width, height) / 80));
  const edge = Math.max(2, Math.floor(Math.min(width, height) * 0.02));

  const pushPixel = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    if (data[i + 3] < 10) return;
    samples.push({ r: data[i]!, g: data[i + 1]!, b: data[i + 2]!, a: data[i + 3]! });
  };

  for (let x = 0; x < width; x += step) {
    for (let y = 0; y < edge; y += 1) {
      pushPixel(x, y);
      pushPixel(x, height - 1 - y);
    }
  }

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < edge; x += 1) {
      pushPixel(x, y);
      pushPixel(width - 1 - x, y);
    }
  }

  return samples;
}

function getBackgroundThreshold(samples: Sample[], average: Sample) {
  if (samples.length === 0) return 30;

  const distances = samples.map((sample) => colorDistance(sample, average));
  const avgDistance = distances.reduce((sum, value) => sum + value, 0) / distances.length;
  const variance =
    distances.reduce((sum, value) => sum + (value - avgDistance) ** 2, 0) / distances.length;
  const spread = Math.sqrt(variance);

  return Math.max(22, Math.min(60, avgDistance + spread * 1.5 + 8));
}

function floodFillBackground(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  threshold: number,
  average: Sample,
) {
  const pixelCount = width * height;
  const candidate = new Uint8Array(pixelCount);
  const visited = new Uint8Array(pixelCount);
  const queue = new Uint32Array(pixelCount);
  let head = 0;
  let tail = 0;

  for (let i = 0; i < pixelCount; i += 1) {
    const offset = i * 4;
    const pixel = {
      r: data[offset]!,
      g: data[offset + 1]!,
      b: data[offset + 2]!,
      a: data[offset + 3]!,
    };
    if (pixel.a < 10) {
      candidate[i] = 1;
      continue;
    }
    if (colorDistance(pixel, average) <= threshold) {
      candidate[i] = 1;
    }
  }

  const push = (index: number) => {
    if (!candidate[index] || visited[index]) return;
    visited[index] = 1;
    queue[tail++] = index;
  };

  for (let x = 0; x < width; x += 1) {
    push(x);
    push((height - 1) * width + x);
  }

  for (let y = 0; y < height; y += 1) {
    push(y * width);
    push(y * width + (width - 1));
  }

  while (head < tail) {
    const index = queue[head++];
    const x = index % width;
    const y = Math.floor(index / width);

    if (x > 0) push(index - 1);
    if (x < width - 1) push(index + 1);
    if (y > 0) push(index - width);
    if (y < height - 1) push(index + width);
  }

  return visited;
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob || blob.size === 0) {
          reject(new Error("Could not encode output"));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

export async function removeBackground(file: Blob): Promise<RemovedImage> {
  const image = await loadImage(file);
  const canvas = createCanvas(image.naturalWidth, image.naturalHeight);
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not create a canvas for image processing.");
  }

  ctx.drawImage(image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  const samples = sampleBorderPixels(data, canvas.width, canvas.height);
  const average = averageSamples(samples);
  const threshold = getBackgroundThreshold(samples, average);
  const background = floodFillBackground(data, canvas.width, canvas.height, threshold, average);
  const feather = Math.max(10, threshold * 0.45);

  for (let i = 0; i < canvas.width * canvas.height; i += 1) {
    const offset = i * 4;
    const pixel = {
      r: data[offset]!,
      g: data[offset + 1]!,
      b: data[offset + 2]!,
      a: data[offset + 3]!,
    };
    const distance = colorDistance(pixel, average);

    if (background[i]) {
      data[offset + 3] = 0;
      continue;
    }

    if (distance < threshold + feather) {
      const alpha = smoothstep(threshold, threshold + feather, distance);
      data[offset + 3] = Math.round(pixel.a * alpha);
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return {
    width: canvas.width,
    height: canvas.height,
    async toBlob(type = formatMime.png, quality?: number) {
      return canvasToBlob(canvas, type, quality);
    },
  };
}

export async function encodeBackgroundRemovalOutput(
  image: RemovedImage,
  format: BackgroundOutputFormat,
) {
  const blob = await image.toBlob(formatMime[format], 1);

  if (!blob || blob.size === 0) {
    throw new Error("Could not encode output");
  }

  return blob;
}
