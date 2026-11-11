import { useEffect } from "react";
import { createPortal } from "react-dom";
import { Download, X } from "lucide-react";
import { FileViewer } from "@/components/site/FileViewer";
import { downloadBlob } from "@/lib/image";
import { useUiCopy } from "@/lib/ui-copy";

/** Full-screen sheet that shows any supported file (PDF, DOCX, text, image). */
export function FileViewerOverlay({
  blob,
  name,
  type,
  onClose,
}: {
  blob: Blob;
  name: string;
  type?: string;
  onClose: () => void;
}) {
  const ui = useUiCopy();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[90] flex flex-col bg-background animate-in fade-in slide-in-from-bottom-6 duration-300"
    >
      <div
        className="flex items-center gap-2 border-b border-border px-3 pb-2"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)" }}
      >
        <button
          type="button"
          aria-label={ui.close}
          onClick={onClose}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface hover:bg-secondary"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 truncate text-sm font-semibold">{name}</div>
        <button
          type="button"
          aria-label={ui.download}
          onClick={() => downloadBlob(blob, name, { saveToHistory: false })}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface text-primary hover:bg-secondary"
        >
          <Download className="h-5 w-5" />
        </button>
      </div>
      <div
        className="min-h-0 flex-1 overflow-y-auto p-3"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)" }}
      >
        <FileViewer blob={blob} name={name} type={type} />
      </div>
    </div>,
    document.body,
  );
}
