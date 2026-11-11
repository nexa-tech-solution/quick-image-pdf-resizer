import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { canShareFiles, shareFiles } from "@/lib/share";
import { cn } from "@/lib/utils";

type ShareItem = { blob: Blob; filename: string };

/**
 * Square icon button that opens the OS share sheet. Renders nothing where the
 * Web Share API can't share files (most desktop browsers).
 */
export function ShareButton({
  getFiles,
  disabled,
  className,
}: {
  getFiles: () => ShareItem[] | Promise<ShareItem[]>;
  disabled?: boolean;
  className?: string;
}) {
  const { t } = useLocale();
  const [supported, setSupported] = useState(false);

  // Detect after mount so SSR and first client render match.
  useEffect(() => setSupported(canShareFiles()), []);

  if (!supported) return null;

  return (
    <button
      type="button"
      aria-label={t.header.share}
      disabled={disabled}
      onClick={() => void (async () => shareFiles(await getFiles()))()}
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-foreground transition hover:bg-secondary disabled:opacity-50",
        className,
      )}
    >
      <Share2 className="h-5 w-5" />
    </button>
  );
}
