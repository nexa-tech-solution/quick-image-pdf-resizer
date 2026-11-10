/** Recently opened tool routes, newest first. Per-browser convenience only. */
const KEY = "recent-tools";
const MAX = 4;

export function getRecentTools(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function recordRecentTool(path: string) {
  try {
    const next = [path, ...getRecentTools().filter((p) => p !== path)].slice(0, MAX);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage blocked (private mode): skip silently.
  }
}
