import { useCallback, useRef, useState, type DragEvent } from "react";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  accept: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  title?: string;
  hint?: string;
  className?: string;
}

export function FileDropzone({
  accept,
  multiple = false,
  onFiles,
  title = "Drop files here",
  hint = "or click to browse",
  className,
}: FileDropzoneProps) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (list: FileList | null) => {
    if (!list || list.length === 0) return;
    onFiles(Array.from(list));
  };

  const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDrag(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={onDrop}
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-surface-elevated px-6 py-14 text-center transition",
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
      <div className="mt-1 text-sm text-muted-foreground">{hint}</div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
