import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  FileArchive,
  FileImage,
  FileStack,
  FileText,
  FolderOpen,
  ImageIcon,
  LayoutGrid,
  Layers,
  Scissors,
  Type,
  Images,
  FileType,
  Lock,
  LockOpen,
  ScanLine,
  Eye,
  type LucideIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { TranslationSet } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type HeaderKey = keyof TranslationSet["header"];
type Tool = { to: string; key: HeaderKey; icon: LucideIcon };

const allTools: Tool[] = [
  { to: "/", key: "resizeImage", icon: ImageIcon },
  { to: "/compress-image", key: "compress", icon: Layers },
  { to: "/convert-image", key: "convert", icon: FileImage },
  { to: "/remove-background", key: "removeBackground", icon: Scissors },
  { to: "/image-to-pdf", key: "imageToPdf", icon: FileText },
  { to: "/pdf-to-image", key: "pdfToImage", icon: FileImage },
  { to: "/compress-pdf", key: "compressPdf", icon: FileArchive },
  { to: "/merge-split-pdf", key: "mergeSplitPdf", icon: FileStack },
  { to: "/view", key: "viewFile", icon: Eye },
  { to: "/scan-document", key: "scanDocument", icon: ScanLine },
  { to: "/text-to-pdf", key: "textToPdf", icon: Type },
  { to: "/pdf-to-word", key: "pdfToWord", icon: FileType },
  { to: "/extract-pdf-images", key: "extractPdfImages", icon: Images },
  { to: "/protect-pdf", key: "protectPdf", icon: Lock },
  { to: "/unlock-pdf", key: "unlockPdf", icon: LockOpen },
];

// Bottom tabs: three most-used tools + "My files"; everything else lives in the sheet.
const primaryTools: Tool[] = [
  ...allTools.slice(0, 3),
  { to: "/files", key: "filesTab", icon: FolderOpen },
];

/** Bottom tab bar shown only on small screens — thumb-reachable navigation between tools. */
export function MobileTabBar() {
  const { t } = useLocale();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const inPrimary = primaryTools.some((tool) => tool.to === pathname);
  const inMore = !inPrimary && allTools.some((tool) => tool.to === pathname);

  return (
    <>
      <nav
        aria-label={t.toolsGrid.toolset}
        className="fixed bottom-0 left-[var(--app-inset)] right-[var(--app-inset)] z-40 border-t border-border/70 bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md"
      >
        <ul className="mx-auto grid max-w-md grid-cols-5">
          {primaryTools.map(({ to, key, icon: Icon }) => {
            const active = pathname === to;
            return (
              <li key={to}>
                <Link
                  to={to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors",
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                      active && "bg-primary-soft",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="w-full truncate text-center">{t.header[key]}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-haspopup="dialog"
              className={cn(
                "flex h-16 w-full flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors",
                inMore ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                  inMore && "bg-primary-soft",
                )}
              >
                <LayoutGrid className="h-5 w-5" />
              </span>
              <span className="w-full truncate text-center">{t.toolsGrid.toolset}</span>
            </button>
          </li>
        </ul>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="left-[var(--app-inset)] right-[var(--app-inset)] rounded-t-3xl px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-border" aria-hidden="true" />
          <SheetHeader className="text-left">
            <SheetTitle className="font-display text-lg tracking-tight">
              {t.toolsGrid.title}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {allTools.map(({ to, key, icon: Icon }) => {
              const active = pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex min-h-24 flex-col items-center justify-center gap-2 rounded-2xl border p-3 text-center text-xs font-medium transition-colors",
                    active
                      ? "border-primary/40 bg-primary-soft text-foreground"
                      : "border-border bg-surface text-foreground hover:border-primary/40",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary-soft text-primary",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="line-clamp-2 leading-tight">{t.header[key]}</span>
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
