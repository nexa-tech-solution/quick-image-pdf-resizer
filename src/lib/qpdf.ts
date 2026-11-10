/**
 * Thin wrapper around qpdf compiled to WebAssembly (loaded on demand, ~1–2 MB).
 * A fresh module instance is created per call: Emscripten's `callMain` is not
 * designed to be re-entered after `main` exits.
 */

type EmFS = {
  writeFile: (path: string, data: Uint8Array) => void;
  readFile: (path: string) => Uint8Array;
};
type QpdfModule = { callMain: (args: string[]) => number; FS: EmFS };

async function runQpdf(input: Uint8Array, args: (inPath: string, outPath: string) => string[]) {
  const [{ default: createModule }, { default: wasmUrl }] = await Promise.all([
    import("@neslinesli93/qpdf-wasm"),
    import("@neslinesli93/qpdf-wasm/dist/qpdf.wasm?url"),
  ]);
  const stderr: string[] = [];
  const factory = createModule as unknown as (opts: Record<string, unknown>) => Promise<QpdfModule>;
  const qpdf = await factory({
    locateFile: () => wasmUrl,
    noInitialRun: true,
    print: () => {},
    printErr: (line: string) => stderr.push(line),
  });

  qpdf.FS.writeFile("/in.pdf", input);
  let code: number;
  try {
    code = qpdf.callMain(args("/in.pdf", "/out.pdf"));
  } catch (err) {
    // Emscripten throws ExitStatus when main calls exit().
    const status = (err as { status?: number })?.status;
    if (typeof status !== "number") throw err;
    code = status;
  }

  let output: Uint8Array | null = null;
  try {
    output = qpdf.FS.readFile("/out.pdf");
  } catch {
    output = null;
  }
  return { code, output, stderr: stderr.join("\n") };
}

/**
 * "user" = needs a password to open, "ownerOnly" = encrypted but opens freely
 * (permission restrictions only), "none" = not encrypted.
 * (qpdf's --requires-password is unreliable in this wasm build, so use pdf.js + pdf-lib.)
 */
export async function pdfPasswordState(bytes: Uint8Array): Promise<"none" | "user" | "ownerOnly"> {
  const pdfjs = await import("pdfjs-dist");
  const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  try {
    const doc = await pdfjs.getDocument({ data: new Uint8Array(bytes) }).promise;
    await doc.destroy();
  } catch (err) {
    if ((err as { name?: string })?.name === "PasswordException") return "user";
    throw err;
  }
  const { PDFDocument } = await import("pdf-lib");
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  return doc.isEncrypted ? "ownerOnly" : "none";
}

export async function encryptPdf(
  bytes: Uint8Array,
  password: string,
  opts: { restrict: boolean },
): Promise<Blob> {
  // Random owner password so restrictions can't be lifted with the user password.
  const owner = opts.restrict
    ? Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("")
    : password;
  const restrictions = opts.restrict ? ["--print=none", "--extract=n", "--modify=none"] : [];
  const { code, output, stderr } = await runQpdf(bytes, (i, o) => [
    "--encrypt",
    password,
    owner,
    "256",
    ...restrictions,
    "--",
    i,
    o,
  ]);
  if ((code !== 0 && code !== 3) || !output) throw new Error(stderr || `qpdf exited with ${code}`);
  return new Blob([output as BlobPart], { type: "application/pdf" });
}

export class WrongPasswordError extends Error {}

export async function decryptPdf(bytes: Uint8Array, password: string): Promise<Blob> {
  const { code, output, stderr } = await runQpdf(bytes, (i, o) => [
    `--password=${password}`,
    "--decrypt",
    i,
    o,
  ]);
  // qpdf writes "invalid password" straight to the console, so treat any failure as a bad password;
  // callers only call this after pdfPasswordState() confirmed the file is encrypted.
  if ((code !== 0 && code !== 3) || !output)
    throw new WrongPasswordError(stderr || `qpdf exited with ${code}`);
  return new Blob([output as BlobPart], { type: "application/pdf" });
}
