import { formatExt, replaceExt, type ImageFormat } from "@/lib/image";

export const MAX_TOOL_FILE_SIZE = 250 * 1024 * 1024;

export type ProcessingStatus = "idle" | "reading" | "processing" | "ready" | "error";

export type OutputFormat = ImageFormat | "pdf" | "jpg";

export interface ToolFileItem {
  id: string;
  file: File;
  previewUrl?: string;
  status: ProcessingStatus;
  error?: string;
  outputBlob?: Blob;
  outputUrl?: string;
  outputFilename?: string;
  dimensions?: { width: number; height: number };
  sizes?: { original: number; output?: number };
}

export const imageAccept = "image/jpeg,image/png,image/webp,image/avif";

export const pdfAccept = "application/pdf";

export const supportedImageTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function createToolFileItem(file: File, status: ProcessingStatus = "idle"): ToolFileItem {
  return {
    id: `${file.name}-${file.size}-${file.lastModified}-${makeId()}`,
    file,
    previewUrl: URL.createObjectURL(file),
    status,
    sizes: { original: file.size },
  };
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

export function revokeUrl(url?: string) {
  if (url) URL.revokeObjectURL(url);
}

export function cleanupToolFileItem(item: ToolFileItem) {
  revokeUrl(item.previewUrl);
  revokeUrl(item.outputUrl);
}

export function cleanupToolFileItems(items: ToolFileItem[]) {
  items.forEach(cleanupToolFileItem);
}

export function createOutputUrl(blob: Blob, previousUrl?: string) {
  revokeUrl(previousUrl);
  return URL.createObjectURL(blob);
}

export function formatOutputExt(format: ImageFormat | "pdf" | "jpeg" | "jpg") {
  if (format === "pdf") return "pdf";
  if (format === "jpg" || format === "jpeg") return "jpg";
  return formatExt[format];
}

export function outputFilename(name: string, format: ImageFormat | "pdf" | "jpeg" | "jpg") {
  return replaceExt(name, formatOutputExt(format));
}

export function savingPercent(original: number, output?: number) {
  if (!output || original <= 0) return null;
  return Math.round((1 - output / original) * 100);
}

export function isSameImageFormat(file: File, format: ImageFormat) {
  const input = file.type === "image/jpeg" ? "jpeg" : file.type.replace("image/", "");
  return input === format;
}

export async function canEncodeImageFormat(format: ImageFormat) {
  if (format === "jpeg" || format === "png") return true;

  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, `image/${format}`, 0.8);
  });

  return blob?.type === `image/${format}`;
}

export function describeFileValidation(
  file: File,
  accept: string,
  maxSizeBytes = MAX_TOOL_FILE_SIZE,
): string | null {
  if (file.size > maxSizeBytes) return "File is larger than the 250 MB limit.";

  const accepted = accept
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  if (accepted.length === 0) return null;

  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  const ok = accepted.some((item) => {
    if (item.endsWith("/*")) return type.startsWith(item.slice(0, -1));
    if (item.startsWith(".")) return name.endsWith(item);
    return type === item;
  });

  return ok ? null : "This file type is not supported by this tool.";
}
