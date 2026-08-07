const textEncoder = new TextEncoder();

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;

  for (let i = 0; i < bytes.length; i += 1) {
    crc ^= bytes[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function writeU16(value: number) {
  const bytes = new Uint8Array(2);
  new DataView(bytes.buffer).setUint16(0, value, true);
  return bytes;
}

function writeU32(value: number) {
  const bytes = new Uint8Array(4);
  new DataView(bytes.buffer).setUint32(0, value, true);
  return bytes;
}

function normalizeZipName(name: string) {
  const normalized = name.replaceAll("\\", "/").replace(/^\/+/, "");
  return normalized || "file";
}

function concatBytes(parts: Uint8Array[]) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;

  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }

  return out;
}

type ZipEntry = {
  name: string;
  blob: Blob;
};

type ZipCentralDirEntry = {
  nameBytes: Uint8Array;
  crc: number;
  size: number;
  offset: number;
};

/**
 * Create a simple ZIP archive with stored entries.
 * Images are already compressed, so we keep the implementation dependency-free.
 */
export async function makeZipBlob(entries: ZipEntry[]) {
  if (entries.length === 0) {
    throw new Error("Cannot create an empty ZIP archive");
  }

  const chunks: Uint8Array[] = [];
  const centralDirectory: ZipCentralDirEntry[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = textEncoder.encode(normalizeZipName(entry.name));
    const data = new Uint8Array(await entry.blob.arrayBuffer());
    const crc = crc32(data);
    const size = data.length;

    centralDirectory.push({ nameBytes, crc, size, offset });

    const localHeader = concatBytes([
      writeU32(0x04034b50),
      writeU16(20),
      writeU16(0x0800),
      writeU16(0),
      writeU16(0),
      writeU16(0),
      writeU32(crc),
      writeU32(size),
      writeU32(size),
      writeU16(nameBytes.length),
      writeU16(0),
      nameBytes,
      data,
    ]);

    chunks.push(localHeader);
    offset += localHeader.length;
  }

  const centralDirectoryOffset = offset;
  let centralDirectorySize = 0;

  for (const entry of centralDirectory) {
    const record = concatBytes([
      writeU32(0x02014b50),
      writeU16(20),
      writeU16(20),
      writeU16(0x0800),
      writeU16(0),
      writeU16(0),
      writeU16(0),
      writeU32(entry.crc),
      writeU32(entry.size),
      writeU32(entry.size),
      writeU16(entry.nameBytes.length),
      writeU16(0),
      writeU16(0),
      writeU16(0),
      writeU16(0),
      writeU32(0),
      writeU32(entry.offset),
      entry.nameBytes,
    ]);

    chunks.push(record);
    centralDirectorySize += record.length;
  }

  const endRecord = concatBytes([
    writeU32(0x06054b50),
    writeU16(0),
    writeU16(0),
    writeU16(entries.length),
    writeU16(entries.length),
    writeU32(centralDirectorySize),
    writeU32(centralDirectoryOffset),
    writeU16(0),
  ]);

  chunks.push(endRecord);

  return new Blob(chunks as BlobPart[], { type: "application/zip" });
}
