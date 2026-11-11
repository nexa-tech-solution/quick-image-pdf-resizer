/**
 * Files handed over by the native app ("Open with…" / "Share to").
 * Native injects `window.__openNativeFile({ name, type, base64 })`, or sets
 * `window.__pendingNativeFile` if this page hasn't registered the handler yet.
 */

type NativeFilePayload = { name: string; type: string; base64: string };

declare global {
  interface Window {
    __openNativeFile?: (f: NativeFilePayload) => void;
    __pendingNativeFile?: NativeFilePayload;
  }
}

let current: File | null = null;
const listeners = new Set<(f: File) => void>();

function toFile({ name, type, base64 }: NativeFilePayload) {
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], name, { type: type || "application/octet-stream" });
}

/** Take the file waiting to be shown (once). */
export function takeNativeFile() {
  const f = current;
  current = null;
  return f;
}

export function onNativeFile(listener: (f: File) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Install the global handler; `onArrive` is called so the app can navigate to the viewer. */
export function installNativeOpenHandler(onArrive: () => void) {
  const receive = (payload: NativeFilePayload) => {
    try {
      current = toFile(payload);
    } catch {
      return;
    }
    if (listeners.size) {
      const f = takeNativeFile()!;
      listeners.forEach((l) => l(f));
    }
    onArrive();
  };
  window.__openNativeFile = receive;
  if (window.__pendingNativeFile) {
    const pending = window.__pendingNativeFile;
    window.__pendingNativeFile = undefined;
    receive(pending);
  }
  return () => {
    if (window.__openNativeFile === receive) window.__openNativeFile = undefined;
  };
}
