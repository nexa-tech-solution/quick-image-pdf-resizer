/**
 * Native share sheet (Zalo, Messenger, Mail…) via the Web Share API.
 * Only available on supporting browsers, mostly mobile Safari/Chrome.
 */
export function canShareFiles(): boolean {
  if (typeof navigator === "undefined" || typeof navigator.canShare !== "function") return false;
  try {
    const probe = new File([new Blob(["x"])], "probe.txt", { type: "text/plain" });
    return navigator.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

/** Returns true if shared, false if unsupported or the user cancelled. */
export async function shareFiles(files: { blob: Blob; filename: string }[]): Promise<boolean> {
  if (!canShareFiles() || files.length === 0) return false;

  const payload = files.map(
    ({ blob, filename }) =>
      new File([blob], filename, { type: blob.type || "application/octet-stream" }),
  );
  if (!navigator.canShare({ files: payload })) return false;

  try {
    await navigator.share({ files: payload });
    return true;
  } catch {
    // AbortError when the user dismisses the sheet — not an error worth surfacing.
    return false;
  }
}
