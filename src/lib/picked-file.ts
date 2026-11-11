/**
 * Normalise a file the user just picked, before any tool touches it.
 *
 * Why (Android WebView especially):
 * - Gallery picks are lazy `content://` handles; reading them later can fail once the
 *   temporary grant lapses → copy the bytes into memory right away.
 * - `file.type` is often empty or wrong, and names can lack an extension → sniff magic bytes.
 * - Samsung/Pixel cameras save HEIC by default; Chrome/WebView can't decode HEIC (Safari can)
 *   → convert to JPEG only when this browser can't display it.
 */

export class PickedFileReadError extends Error {
  constructor(name: string) {
    super(`Could not read "${name}". Try picking it again, or save a copy to your device first.`);
    this.name = "PickedFileReadError";
  }
}

type Sniffed = { type: string; ext: string } | null;

function ascii(bytes: Uint8Array, start: number, len: number) {
  return String.fromCharCode(...bytes.subarray(start, start + len));
}

export function sniffType(bytes: Uint8Array): Sniffed {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return { type: "image/jpeg", ext: "jpg" };
  if (bytes[0] === 0x89 && ascii(bytes, 1, 3) === "PNG") return { type: "image/png", ext: "png" };
  if (ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WEBP")
    return { type: "image/webp", ext: "webp" };
  if (ascii(bytes, 0, 3) === "GIF") return { type: "image/gif", ext: "gif" };
  if (ascii(bytes, 0, 5) === "%PDF-") return { type: "application/pdf", ext: "pdf" };
  if (ascii(bytes, 4, 4) === "ftyp") {
    const brand = ascii(bytes, 8, 4);
    if (brand === "avif" || brand === "avis") return { type: "image/avif", ext: "avif" };
    if (["heic", "heix", "hevc", "hevx", "heim", "heis", "mif1", "msf1"].includes(brand))
      return { type: "image/heic", ext: "heic" };
  }
  return null;
}

let heicNative: Promise<boolean> | null = null;
/** Can this browser decode HEIC itself? (Safari yes; Chrome/Android WebView no.) */
function canDecodeHeic(sample: Blob) {
  heicNative ??= (async () => {
    if (typeof createImageBitmap !== "function") return false;
    try {
      const bmp = await createImageBitmap(sample);
      bmp.close();
      return true;
    } catch {
      return false;
    }
  })();
  return heicNative;
}

function withExt(name: string, ext: string) {
  const base = name.replace(/\.[^./]+$/, "") || "image";
  return `${base}.${ext}`;
}

export async function normalizePickedFile(file: File): Promise<File> {
  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch {
    throw new PickedFileReadError(file.name);
  }
  if (bytes.length === 0) throw new PickedFileReadError(file.name);

  const sniffed = sniffType(bytes);
  const type = sniffed?.type ?? file.type ?? "";
  let name = file.name || "file";
  if (
    sniffed &&
    !name.toLowerCase().endsWith(`.${sniffed.ext}`) &&
    !(sniffed.ext === "jpg" && /\.jpe?g$/i.test(name))
  )
    name = withExt(name, sniffed.ext);

  const inMemory = new File([bytes as BlobPart], name, {
    type,
    lastModified: file.lastModified,
  });

  if (type === "image/heic" && !(await canDecodeHeic(inMemory))) {
    try {
      const heic2any = (await import("heic2any")).default;
      const out = await heic2any({ blob: inMemory, toType: "image/jpeg", quality: 0.92 });
      const jpeg = Array.isArray(out) ? out[0] : out;
      return new File([jpeg], withExt(name, "jpg"), {
        type: "image/jpeg",
        lastModified: file.lastModified,
      });
    } catch {
      // Leave as HEIC; the tools' own HEIC fallback will try again.
    }
  }
  return inMemory;
}

/** Normalise many; files that can't be read are reported, the rest continue. */
export async function normalizePickedFiles(files: File[]) {
  const ok: File[] = [];
  const errors: string[] = [];
  for (const f of files) {
    try {
      ok.push(await normalizePickedFile(f));
    } catch (e) {
      errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  return { files: ok, errors };
}
