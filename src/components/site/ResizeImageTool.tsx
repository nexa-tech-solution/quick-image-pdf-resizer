import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, RefreshCw, X } from "lucide-react";
import { FileDropzone } from "./FileDropzone";
import {
  downloadBlob,
  formatBytes,
  formatExt,
  loadImage,
  processImage,
  replaceExt,
  type ImageFormat,
} from "@/lib/image";
import { cn } from "@/lib/utils";

const presets = [
  { label: "1080×1080", w: 1080, h: 1080 },
  { label: "1920×1080", w: 1920, h: 1080 },
  { label: "1280×720", w: 1280, h: 720 },
  { label: "800×600", w: 800, h: 600 },
] as const;

export function ResizeImageTool() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState<number>(1080);
  const [height, setHeight] = useState<number>(1080);
  const [lockRatio, setLockRatio] = useState(true);
  const [fit, setFit] = useState<"contain" | "cover" | "stretch">("contain");
  const [format, setFormat] = useState<ImageFormat>("jpeg");
  const [quality, setQuality] = useState(0.85);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setOriginalDims(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    loadImage(file).then((img) => {
      setOriginalDims({ w: img.naturalWidth, h: img.naturalHeight });
      setWidth(img.naturalWidth);
      setHeight(img.naturalHeight);
    });
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const ratio = useMemo(() => (originalDims ? originalDims.w / originalDims.h : 1), [originalDims]);

  const onWidth = (v: number) => {
    setWidth(v);
    if (lockRatio && originalDims) setHeight(Math.round(v / ratio));
  };
  const onHeight = (v: number) => {
    setHeight(v);
    if (lockRatio && originalDims) setWidth(Math.round(v * ratio));
  };

  const applyPreset = (w: number, h: number) => {
    setLockRatio(false);
    setWidth(w);
    setHeight(h);
  };

  const onDownload = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const { blob } = await processImage(file, {
        width,
        height,
        fit,
        format,
        quality,
      });
      downloadBlob(blob, replaceExt(file.name, formatExt[format]));
    } finally {
      setBusy(false);
    }
  };

  if (!file) {
    return (
      <FileDropzone
        accept="image/jpeg,image/png,image/webp,image/avif"
        onFiles={(files) => setFile(files[0])}
        title="Drop an image to resize"
        hint="JPG, PNG, WebP or AVIF — up to 250 MB"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated shadow-soft">
      <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <div className="min-w-0">
          <div className="truncate font-medium">{file.name}</div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {originalDims ? `${originalDims.w}×${originalDims.h} · ` : ""}
            {formatBytes(file.size)}
          </div>
        </div>
        <button
          onClick={() => setFile(null)}
          className="rounded-md p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
          aria-label="Remove"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-6 p-5 md:grid-cols-[1fr_280px]">
        <div className="flex items-center justify-center rounded-xl bg-[conic-gradient(at_50%_50%,_#f5f6f8_25%,_#eceef2_25%_50%,_#f5f6f8_50%_75%,_#eceef2_75%)] [background-size:20px_20px] p-4">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-[420px] w-auto rounded-md object-contain shadow-elevated"
            />
          )}
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Presets
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p.w, p.h)}
                  className={cn(
                    "rounded-lg border border-border px-3 py-2 text-xs font-mono transition hover:border-primary/60 hover:bg-primary-soft",
                    width === p.w && height === p.h
                      ? "border-primary bg-primary-soft text-primary"
                      : "",
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Dimensions
              </label>
              <button
                onClick={() => setLockRatio((v) => !v)}
                className={cn(
                  "text-xs font-mono",
                  lockRatio ? "text-primary" : "text-muted-foreground",
                )}
              >
                {lockRatio ? "🔒 Lock ratio" : "🔓 Free"}
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <NumberField label="W" value={width} onChange={onWidth} />
              <NumberField label="H" value={height} onChange={onHeight} />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Fit
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["contain", "cover", "stretch"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFit(f)}
                  className={cn(
                    "rounded-lg border border-border px-2 py-2 text-xs capitalize transition",
                    fit === f
                      ? "border-primary bg-primary-soft text-primary"
                      : "hover:border-primary/60",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Format
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["jpeg", "png", "webp", "avif"] as ImageFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={cn(
                    "rounded-lg border border-border px-2 py-2 text-xs uppercase font-mono transition",
                    format === f
                      ? "border-primary bg-primary-soft text-primary"
                      : "hover:border-primary/60",
                  )}
                >
                  {f === "jpeg" ? "JPG" : f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {format !== "png" && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Quality
                </label>
                <span className="text-xs font-mono">{Math.round(quality * 100)}</span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                value={Math.round(quality * 100)}
                onChange={(e) => setQuality(Number(e.target.value) / 100)}
                className="mt-2 w-full accent-[var(--color-primary)]"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setFile(null)}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm transition hover:bg-secondary"
            >
              <RefreshCw className="h-4 w-4" />
              New
            </button>
            <button
              onClick={onDownload}
              disabled={busy}
              className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-background focus-within:border-primary">
      <span className="px-3 text-xs font-mono text-muted-foreground">{label}</span>
      <input
        type="number"
        min={1}
        max={10000}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 0))}
        className="w-full bg-transparent py-2 pr-3 text-sm outline-none"
      />
    </div>
  );
}
