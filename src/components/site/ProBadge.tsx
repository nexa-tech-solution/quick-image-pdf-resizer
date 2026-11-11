import { Crown } from "lucide-react";
import { useNativeApp } from "@/hooks/use-native-app";
import { PRO_TOOL_PATHS } from "@/lib/pro";

/**
 * Small crown on Pro-only tools, shown to free users inside the mobile app.
 * Place inside a `relative` element (e.g. the tool's icon circle).
 */
export function ProBadge({ path }: { path: string }) {
  const { isNative, isPro } = useNativeApp();
  if (!isNative || isPro || !PRO_TOOL_PATHS.has(path)) return null;
  return (
    <span
      aria-label="Pro"
      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#F43F5E] to-[#DC2626] text-white shadow ring-2 ring-background"
    >
      <Crown className="h-3 w-3" />
    </span>
  );
}
