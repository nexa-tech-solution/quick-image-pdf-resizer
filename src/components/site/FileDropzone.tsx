import { useCallback, useRef, useState, type DragEvent } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { MAX_TOOL_FILE_SIZE, describeFileValidation } from "@/lib/tool-files";

interface FileDropzoneProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  title?: string;
  hint?: string;
  maxSizeBytes?: number;
  acceptedLabels?: string;
  validateFile?: (file: File) => string | null;
  error?: string | null;
  onError?: (message: string | null) => void;
  disabled?: boolean;
  className?: string;
  /** Single-row variant for "add more files" once a batch exists. */
  compact?: boolean;
}

export function FileDropzone({
  accept,
  multiple = false,
  onFiles,
  title = "Drop files here",
  hint = "or click to browse",
  maxSizeBytes = MAX_TOOL_FILE_SIZE,
  acceptedLabels,
  validateFile,
  error,
  onError,
  disabled = false,
  className,
  compact = false,
}: FileDropzoneProps) {
  const [drag, setDrag] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shownError = error ?? internalError;

  const setError = useCallback(
    (message: string | null) => {
      setInternalError(message);
      onError?.(message);
    },
    [onError],
  );

  const handleFiles = useCallback(
    (list: FileList | null) => {
      if (disabled || !list || list.length === 0) return;

      const selected = Array.from(list);
      const valid: File[] = [];

      for (const file of selected) {
        const message = validateFile?.(file) ?? describeFileValidation(file, accept, maxSizeBytes);
        if (message) {
          setError(`${file.name}: ${message}`);
          if (!multiple) return;
          continue;
        }
        valid.push(file);
        if (!multiple) break;
      }

      if (valid.length === 0) return;
      setError(null);
      onFiles(valid);
    },
    [accept, disabled, maxSizeBytes, multiple, onFiles, setError, validateFile],
  );

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDrag(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) inputRef.current?.click();
      }}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      className={cn(
        "group relative flex cursor-pointer rounded-2xl border-2 border-dashed bg-surface-elevated transition active:scale-[0.99] active:bg-primary-soft/40 focus:outline-none focus-visible:ring-2 focus:ring-ring focus:ring-offset-2",
        compact
          ? "flex-row flex-wrap items-center gap-3 px-4 py-3 text-left"
          : "flex-col items-center justify-center px-5 py-10 text-center sm:px-6 sm:py-14",
        disabled && "cursor-not-allowed opacity-60",
        drag
          ? "border-primary bg-primary-soft"
          : "border-border hover:border-primary/60 hover:bg-primary-soft/40",
        className,
      )}
    >
      <div
        className={cn(
          compact
            ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition"
            : "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition",
          drag ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary",
        )}
      >
        <Upload className="h-6 w-6" />
      </div>
      <div className={cn("min-w-0", compact && "flex-1")}>
        <div className={cn("font-display font-semibold", compact ? "text-sm" : "text-lg")}>
          {title}
        </div>
        <div className={cn("text-muted-foreground", compact ? "truncate text-xs" : "mt-1 text-sm")}>
          {acceptedLabels ?? hint}
        </div>
      </div>
      {shownError && (
        <div className="mt-3 w-full rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {shownError}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        disabled={disabled}
        onChange={(e) => {
          handleFiles(e.target.files);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}
