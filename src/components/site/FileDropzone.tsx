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
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-surface-elevated px-6 py-14 text-center transition focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        disabled && "cursor-not-allowed opacity-60",
        drag
          ? "border-primary bg-primary-soft"
          : "border-border hover:border-primary/60 hover:bg-primary-soft/40",
        className,
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition",
          drag ? "bg-primary text-primary-foreground" : "bg-primary-soft text-primary",
        )}
      >
        <Upload className="h-6 w-6" />
      </div>
      <div className="font-display text-lg font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{acceptedLabels ?? hint}</div>
      {shownError && (
        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
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
