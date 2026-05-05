import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, Lock, Unlock, RefreshCw, X } from "lucide-react";
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
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const presets = [
  { labelKey: "socialSquare", size: "1080×1080", w: 1080, h: 1080 },
  { labelKey: "storyReel", size: "1080×1920", w: 1080, h: 1920 },
  { labelKey: "youtubeThumb", size: "1280×720", w: 1280, h: 720 },
  { labelKey: "fullHd", size: "1920×1080", w: 1920, h: 1080 },
  { labelKey: "wideBanner", size: "1600×900", w: 1600, h: 900 },
  { labelKey: "profile", size: "800×800", w: 800, h: 800 },
] as const;

export function ResizeImageTool() {
  const { t } = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState<number>(1080);
  const [height, setHeight] = useState<number>(1080);
  const [lockRatio, setLockRatio] = useState(true);
  const [fit, setFit] = useState<"contain" | "cover" | "stretch">("contain");
  const [format, setFormat] = useState<ImageFormat>("jpeg");
  const [quality, setQuality] = useState(0.85);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedPreviewUrl, setProcessedPreviewUrl] = useState<string | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [originalDims, setOriginalDims] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setProcessedPreviewUrl(null);
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

  useEffect(() => {
    if (!file || !originalDims) return;

    let cancelled = false;
    setPreviewBusy(true);

    const timer = window.setTimeout(async () => {
      try {
        const { blob } = await processImage(file, {
          width,
          height,
          fit,
          format,
          quality,
          backgroundColor: fit === "contain" ? backgroundColor : undefined,
        });
        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        setProcessedPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return url;
        });
      } finally {
        if (!cancelled) setPreviewBusy(false);
      }
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [file, originalDims, width, height, fit, format, quality, backgroundColor]);

  useEffect(() => {
    return () => {
      if (processedPreviewUrl) URL.revokeObjectURL(processedPreviewUrl);
    };
  }, [processedPreviewUrl]);

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
        backgroundColor: fit === "contain" ? backgroundColor : undefined,
      });
      downloadBlob(blob, replaceExt(file.name, formatExt[format]));
    } finally {
      setBusy(false);
    }
  };

  const resetToOriginal = () => {
    if (!originalDims) return;
    setLockRatio(true);
    setWidth(originalDims.w);
    setHeight(originalDims.h);
  };

  if (!file) {
    return (
      <FileDropzone
        accept="image/jpeg,image/png,image/webp,image/avif"
        onFiles={(files) => setFile(files[0])}
        title={t.resizeTool.dropTitle}
        hint={t.resizeTool.dropHint}
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
          aria-label={t.resizeTool.remove}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex items-center justify-center rounded-xl bg-[conic-gradient(at_50%_50%,_#f5f6f8_25%,_#eceef2_25%_50%,_#f5f6f8_50%_75%,_#eceef2_75%)] [background-size:20px_20px] p-4">
          <div className="relative">
            {(processedPreviewUrl || previewUrl) && (
              <img
                src={processedPreviewUrl ?? previewUrl ?? undefined}
                alt={t.resizeTool.preview}
                className="max-h-[420px] w-auto rounded-md object-contain shadow-elevated"
              />
            )}
            {previewBusy && (
              <div className="absolute right-2 top-2 rounded-full border border-border bg-background/85 px-2 py-1 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur">
                {t.resizeTool.updating}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              {t.resizeTool.presets}
            </label>
            <div className="-mx-1 mt-2 flex gap-2 overflow-x-auto px-1 pb-1 md:grid md:grid-cols-2 md:overflow-visible md:pb-0">
              {presets.map((p) => (
                <button
                  key={p.size}
                  onClick={() => applyPreset(p.w, p.h)}
                  className={cn(
                    "min-w-[132px] rounded-lg border border-border px-3 py-2 text-left transition hover:border-primary/60 hover:bg-primary-soft md:min-w-0",
                    width === p.w && height === p.h
                      ? "border-primary bg-primary-soft text-primary"
                      : "",
                  )}
                >
                  <span className="block text-xs font-medium">
                    {t.resizeTool.presetLabels[p.labelKey]}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">
                    {p.size}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {t.resizeTool.dimensions}
              </label>
              <button
                type="button"
                onClick={() => setLockRatio((v) => !v)}
                aria-pressed={lockRatio}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  lockRatio
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground",
                )}
              >
                {lockRatio ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                {lockRatio ? t.resizeTool.lockRatio : t.resizeTool.unlockRatio}
              </button>
            </div>
            <div className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
              <NumberField label="W" value={width} onChange={onWidth} />
              <NumberField label="H" value={height} onChange={onHeight} />
              <button
                type="button"
                onClick={resetToOriginal}
                disabled={!originalDims}
                className="rounded-lg border border-border px-3 text-xs font-medium transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
              >
                1:1
              </button>
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">{t.resizeTool.lockHelp}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {t.resizeTool.fit}
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
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
                    {t.resizeTool.fitOptions[f]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {t.resizeTool.format}
              </label>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {(["jpeg", "png", "webp", "avif"] as ImageFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={cn(
                      "min-w-0 rounded-lg border border-border px-1.5 py-2 text-[11px] uppercase font-mono transition",
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
          </div>

          {fit === "contain" && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {t.resizeTool.background}
                </label>
                <span className="text-[11px] text-muted-foreground">
                  {t.resizeTool.backgroundHint}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5">
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  aria-label={t.resizeTool.backgroundColor}
                  className="h-8 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
                />
                <input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  aria-label={t.resizeTool.backgroundHexColor}
                  className="min-w-0 flex-1 bg-transparent font-mono text-sm uppercase outline-none"
                />
              </div>
            </div>
          )}

          {format !== "png" && (
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {t.resizeTool.quality}
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
              {t.resizeTool.new}
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
              {t.resizeTool.download}
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
