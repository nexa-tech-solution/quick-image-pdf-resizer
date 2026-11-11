/**
 * Free vs Pro gating for the mobile app.
 *
 * Limits only apply inside the mobile app (window.NativeApp.isNative) for users
 * without Pro. The plain website has no way to buy, so it stays fully free.
 * Pro status comes live from the native bridge (RevenueCat entitlement).
 */

export const FREE_LIMITS = {
  /** Resize / Compress / Convert: files per batch. */
  batchFiles: 3,
  /** Image → PDF: images per PDF. */
  imagesToPdf: 5,
  /** Merge & Split: source PDFs. */
  mergePdfs: 2,
  /** Scan document: pages per scan. */
  scanPages: 3,
  /** Remove background: images per day. */
  bgRemovalsPerDay: 3,
  /** Resize: largest width/height a free user can type in. */
  maxDimension: 2048,
} as const;

/** Successful-download counts at which free users see a friendly nudge. */
const MILESTONES = [3, 10, 25, 50];

/** Single Pro-only options inside otherwise free tools. */
export type ProFeature = "pdf-strong" | "hd-size";

/** Pro-only tools; free users get one trial use of each. */
export type ProTool =
  | "pdf-to-word"
  | "protect-pdf"
  | "unlock-pdf"
  | "extract-pdf-images"
  | "id-photo";
export const PRO_TOOLS: ProTool[] = [
  "pdf-to-word",
  "protect-pdf",
  "unlock-pdf",
  "extract-pdf-images",
  "id-photo",
];
/** Route paths of Pro-only tools, for the 👑 badge in tool lists. */
export const PRO_TOOL_PATHS = new Set(PRO_TOOLS.map((t) => `/${t}`));

export type UpgradeReason =
  | { kind: "batch"; selected: number; limit: number }
  | { kind: "pages"; limit: number }
  | { kind: "locked"; tool: ProTool }
  | { kind: "daily"; limit: number }
  | { kind: "feature"; feature: ProFeature }
  | { kind: "milestone"; count: number }
  | { kind: "general" };

type NativeApp = {
  isNative?: boolean;
  isPro?: boolean;
  showPaywall?: (source?: string) => void;
};
const nativeApp = (): NativeApp | undefined =>
  typeof window === "undefined"
    ? undefined
    : (window as unknown as { NativeApp?: NativeApp }).NativeApp;

/** True when limits apply: inside the app and not Pro. */
export function isGated(): boolean {
  const app = nativeApp();
  return !!app?.isNative && !app.isPro;
}

/**
 * Opens the RevenueCat paywall. `source` (e.g. "header", "sheet:batch") is
 * saved on the customer in RevenueCat so you can see which entry point sells.
 */
export function openPaywall(source = "unknown") {
  nativeApp()?.showPaywall?.(source);
}

/** Paywall source tag for an upgrade reason. */
export function reasonSource(reason: UpgradeReason): string {
  if (reason.kind === "locked") return `sheet:locked:${reason.tool}`;
  if (reason.kind === "feature") return `sheet:feature:${reason.feature}`;
  return `sheet:${reason.kind}`;
}

export const UPGRADE_EVENT = "pro-upgrade-request";

/** Opens the upgrade sheet (rendered once by <UpgradeSheet />). */
export function requestUpgrade(reason: UpgradeReason) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<UpgradeReason>(UPGRADE_EVENT, { detail: reason }));
}

/**
 * Caps a batch for free users: returns the files that fit and shows the
 * upgrade sheet when some were left out.
 */
export function limitFiles<T>(
  currentCount: number,
  incoming: T[],
  limit: number,
  kind: "batch" | "pages" = "batch",
): T[] {
  if (!isGated() || currentCount + incoming.length <= limit) return incoming;
  const room = Math.max(0, limit - currentCount);
  requestUpgrade(
    kind === "pages"
      ? { kind: "pages", limit }
      : { kind: "batch", selected: currentCount + incoming.length, limit },
  );
  return incoming.slice(0, room);
}

function storageGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function storageSet(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the limit simply isn't remembered.
  }
}

/**
 * Pro-only tool: lets a free user try it once, then shows the upgrade sheet.
 * Returns true when the user may continue.
 */
export function consumeProToolTrial(tool: ProTool): boolean {
  if (!isGated()) return true;
  const key = `pro-trial-used:${tool}`;
  if (storageGet(key)) {
    requestUpgrade({ kind: "locked", tool });
    return false;
  }
  storageSet(key, "1");
  return true;
}

/** True if a free user still has their one trial of a Pro tool. */
export function hasProToolTrial(tool: ProTool): boolean {
  return !isGated() || !storageGet(`pro-trial-used:${tool}`);
}

/** Daily quota (e.g. background removals). Returns true and counts one use if allowed. */
export function takeDailyQuota(name: string, limit: number): boolean {
  if (!isGated()) return true;
  // Local date, so the quota resets at the user's midnight (not UTC).
  const d = new Date();
  const today = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  const key = `pro-quota:${name}:${today}`;
  const used = Number(storageGet(key) ?? 0);
  if (used >= limit) {
    requestUpgrade({ kind: "daily", limit });
    return false;
  }
  storageSet(key, String(used + 1));
  return true;
}

/**
 * Pro-only option inside a free tool. Returns true when allowed; otherwise
 * shows the upgrade sheet and returns false.
 */
export function requireProFeature(feature: ProFeature): boolean {
  if (!isGated()) return true;
  requestUpgrade({ kind: "feature", feature });
  return false;
}

/**
 * Call after a successful export. At a few milestones (3rd, 10th... file)
 * free users get a friendly nudge, at most once per app session.
 */
export function noteSuccessfulExport() {
  if (!isGated()) return;
  const count = Number(storageGet("pro-exports") ?? 0) + 1;
  storageSet("pro-exports", String(count));
  if (!MILESTONES.includes(count)) return;
  try {
    if (sessionStorage.getItem("pro-nudged")) return;
    sessionStorage.setItem("pro-nudged", "1");
  } catch {
    // ignore
  }
  // Let the save/share UI finish first.
  window.setTimeout(() => requestUpgrade({ kind: "milestone", count }), 1200);
}
