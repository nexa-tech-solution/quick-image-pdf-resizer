/**
 * "My files": processed outputs kept in this browser's IndexedDB so users can
 * re-download or share them later. Nothing leaves the device.
 */

export type HistoryEntry = {
  id: string;
  filename: string;
  type: string;
  size: number;
  createdAt: number;
  /** Route the file was produced on, e.g. "/compress-pdf". */
  source: string;
  blob: Blob;
};

const DB_NAME = "resize-image-files";
const STORE = "files";
const MAX_ENTRIES = 60;
const MAX_TOTAL_BYTES = 300 * 1024 * 1024;
const CHANGE_EVENT = "file-history-change";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const store = request.result.createObjectStore(STORE, { keyPath: "id" });
      store.createIndex("createdAt", "createdAt");
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function done(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function onHistoryChange(listener: () => void) {
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}

/** Newest first. Returns [] when IndexedDB is unavailable (private mode, SSR). */
export async function listHistory(): Promise<HistoryEntry[]> {
  if (typeof indexedDB === "undefined") return [];
  try {
    const db = await openDb();
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).getAll();
    const entries = await new Promise<HistoryEntry[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as HistoryEntry[]);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return entries.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

export async function addToHistory(blob: Blob, filename: string) {
  if (typeof indexedDB === "undefined" || blob.size > MAX_TOTAL_BYTES) return;
  try {
    const entry: HistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      filename,
      type: blob.type || "application/octet-stream",
      size: blob.size,
      createdAt: Date.now(),
      source: window.location.pathname,
      blob,
    };

    // Evict oldest entries so we stay within count and size budgets.
    const existing = await listHistory();
    const keep: HistoryEntry[] = [];
    let total = entry.size;
    for (const item of existing) {
      if (keep.length + 1 >= MAX_ENTRIES || total + item.size > MAX_TOTAL_BYTES) break;
      keep.push(item);
      total += item.size;
    }
    const evict = existing.filter((item) => !keep.includes(item));

    const db = await openDb();
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.put(entry);
    for (const item of evict) store.delete(item.id);
    await done(tx);
    db.close();
    notify();
  } catch {
    // Quota exceeded or storage blocked: history is best-effort.
  }
}

export async function removeFromHistory(id: string) {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(id);
  await done(tx);
  db.close();
  notify();
}

export async function clearHistory() {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).clear();
  await done(tx);
  db.close();
  notify();
}
