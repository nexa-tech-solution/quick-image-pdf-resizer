import { useRef } from "react";
import { Camera } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Opens the rear camera directly on phones (`capture="environment"`).
 * On desktop the browser falls back to a normal file picker.
 */
export function CameraCaptureButton({
  onCapture,
  className,
  facing = "environment",
  label,
}: {
  onCapture: (files: File[]) => void;
  className?: string;
  /** "user" opens the front camera (selfies). */
  facing?: "environment" | "user";
  label?: string;
}) {
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-surface text-sm font-semibold text-foreground transition hover:bg-secondary active:scale-[0.99]",
          className,
        )}
      >
        <Camera className="h-5 w-5 text-primary" />
        {label ?? t.header.takePhoto}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture={facing}
        className="hidden"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) onCapture(files);
          event.currentTarget.value = "";
        }}
      />
    </>
  );
}
