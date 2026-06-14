import { useEffect, useMemo, useState } from "react";
import { Crop, Download, Loader2, Lock, Maximize2, Move, RefreshCw, Unlock, X } from "lucide-react";
import { FileDropzone } from "./FileDropzone";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  downloadBlob,
  formatBytes,
  formatExt,
  loadImage,
  processImage,
  replaceExt,
  type ImageFormat,
} from "@/lib/image";
import { toolEnhancementCopy, useLocale } from "@/lib/i18n";
import {
  canEncodeImageFormat,
  imageAccept,
  savingPercent,
  supportedImageTypes,
} from "@/lib/tool-files";
import { cn } from "@/lib/utils";

const presets = [
  { group: "social", labelKey: "socialSquare", size: "1080×1080", w: 1080, h: 1080 },
  { group: "social", labelKey: "storyReel", size: "1080×1920", w: 1080, h: 1920 },
  { group: "social", labelKey: "profile", size: "800×800", w: 800, h: 800 },
  { group: "video", labelKey: "youtubeThumb", size: "1280×720", w: 1280, h: 720 },
  { group: "video", labelKey: "fullHd", size: "1920×1080", w: 1920, h: 1080 },
  { group: "web", labelKey: "wideBanner", size: "1600×900", w: 1600, h: 900 },
] as const;

const fitIcons = {
  contain: Maximize2,
  cover: Crop,
  stretch: Move,
} as const;

export function ResizeImageTool() {
  const { locale, t } = useLocale();
  const copy = toolEnhancementCopy[locale];
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
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [originalDims, setOriginalDims] = useState<{ w: number; h: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setProcessedPreviewUrl(null);
      setOutputSize(null);
      setOriginalDims(null);
      setError(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    loadImage(file)
      .then((img) => {
        setOriginalDims({ w: img.naturalWidth, h: img.naturalHeight });
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
      })
      .catch(() => setError(copy.shared.processingError));
    return () => URL.revokeObjectURL(url);
  }, [copy.shared.processingError, file]);

  useEffect(() => {
    if (!file || !originalDims || width < 1 || height < 1 || width > 10000 || height > 10000) {
      return;
    }

    let cancelled = false;
    setPreviewBusy(true);
    setError(null);

    const timer = window.setTimeout(async () => {
      try {
        const supported = await canEncodeImageFormat(format);
        if (!supported) throw new Error("Unsupported output format");
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
        setOutputSize(blob.size);
        setProcessedPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return url;
        });
      } catch (err) {
        if (cancelled) return;
        setOutputSize(null);
        setError(
          err instanceof Error && err.message.includes("Unsupported")
            ? copy.shared.unsupportedOutput
            : copy.shared.processingError,
        );
      } finally {
        if (!cancelled) setPreviewBusy(false);
      }
    }, 120);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    backgroundColor,
    copy.shared.processingError,
    copy.shared.unsupportedOutput,
    file,
    fit,
    format,
    height,
    originalDims,
    quality,
    width,
  ]);

  useEffect(() => {
    return () => {
      if (processedPreviewUrl) URL.revokeObjectURL(processedPreviewUrl);
    };
  }, [processedPreviewUrl]);

  const ratio = useMemo(() => (originalDims ? originalDims.w / originalDims.h : 1), [originalDims]);
  const validDimensions = width >= 1 && height >= 1 && width <= 10000 && height <= 10000;
  const outputDelta = file && outputSize ? savingPercent(file.size, outputSize) : null;
  const presetGroups = [
    { id: "social", label: copy.resize.social },
    { id: "video", label: copy.resize.video },
    { id: "web", label: copy.resize.web },
  ] as const;

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
    if (!file || !validDimensions) return;
    setBusy(true);
    setError(null);
    try {
      const supported = await canEncodeImageFormat(format);
      if (!supported) throw new Error("Unsupported output format");
      const { blob } = await processImage(file, {
        width,
        height,
        fit,
        format,
        quality,
        backgroundColor: fit === "contain" ? backgroundColor : undefined,
      });
      downloadBlob(blob, replaceExt(file.name, formatExt[format]));
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("Unsupported")
          ? copy.shared.unsupportedOutput
          : copy.shared.processingError,
      );
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
        accept={imageAccept}
        validateFile={(item) =>
          supportedImageTypes.has(item.type) ? null : copy.shared.unsupportedImageFormat
        }
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
          {error && <div className="mt-2 text-xs text-destructive">{error}</div>}
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
        <div className="min-w-0 overflow-hidden rounded-xl bg-[conic-gradient(at_50%_50%,_#f5f6f8_25%,_#eceef2_25%_50%,_#f5f6f8_50%_75%,_#eceef2_75%)] [background-size:20px_20px] p-4">
          <div className="relative flex h-[32vh] min-h-[220px] min-w-0 items-center justify-center sm:h-auto">
            {(processedPreviewUrl || previewUrl) && (
              <img
                src={processedPreviewUrl ?? previewUrl ?? undefined}
                alt={t.resizeTool.preview}
                className="h-full max-h-[420px] max-w-full rounded-md object-contain shadow-elevated sm:h-auto"
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
            <div className="mt-2 space-y-3">
              {presetGroups.map((group) => (
                <div key={group.id}>
                  <div className="mb-1 text-[11px] font-medium text-muted-foreground">
                    {group.label}
                  </div>
                  <div className="grid grid-cols-2 gap-2 pb-1 md:grid-cols-2 md:pb-0">
                    {presets
                      .filter((p) => p.group === group.id)
                      .map((p) => (
                        <button
                          key={p.size}
                          onClick={() => applyPreset(p.w, p.h)}
                          className={cn(
                            "w-full rounded-lg border border-border px-3 py-2 text-left transition hover:border-primary/60 hover:bg-primary-soft",
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
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {t.resizeTool.dimensions}
              </label>
              <button
                type="button"
                onClick={() => setLockRatio((v) => !v)}
                aria-pressed={lockRatio}
                className={cn(
                  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                  lockRatio
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-foreground",
                )}
              >
                {lockRatio ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                {lockRatio ? t.resizeTool.lockRatio : t.resizeTool.unlockRatio}
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
              <NumberField label="W" value={width} onChange={onWidth} />
              <NumberField label="H" value={height} onChange={onHeight} />
              <button
                type="button"
                onClick={resetToOriginal}
                disabled={!originalDims}
                className="col-span-2 rounded-lg border border-border px-3 py-2 text-xs font-medium transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-1 sm:py-0"
              >
                1:1
              </button>
            </div>
            <p
              className={cn(
                "mt-2 text-[11px]",
                validDimensions ? "text-muted-foreground" : "text-destructive",
              )}
            >
              {validDimensions ? t.resizeTool.lockHelp : copy.shared.invalidDimensions}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {t.resizeTool.fit}
              </label>
              <TooltipProvider>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {(["contain", "cover", "stretch"] as const).map((f) => {
                    const Icon = fitIcons[f];
                    const tip =
                      f === "contain"
                        ? copy.resize.containTip
                        : f === "cover"
                          ? copy.resize.coverTip
                          : copy.resize.stretchTip;

                    return (
                      <Tooltip key={f}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setFit(f)}
                            className={cn(
                              "flex min-h-10 items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-2 text-xs capitalize transition",
                              fit === f
                                ? "border-primary bg-primary-soft text-primary"
                                : "hover:border-primary/60",
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            <span>{t.resizeTool.fitOptions[f]}</span>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>{tip}</TooltipContent>
                      </Tooltip>
                    );
                  })}
                </div>
              </TooltipProvider>
            </div>
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {t.resizeTool.format}
              </label>
              <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
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
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {t.resizeTool.background}
                </label>
                <span className="text-[11px] text-muted-foreground sm:text-right">
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

          <div className="grid gap-3 rounded-lg border border-border bg-background px-3 py-2 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {copy.shared.output}
              </div>
              <div className="mt-1 font-mono text-sm font-medium">
                {width}×{height} · {formatExt[format].toUpperCase()}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {outputSize ? formatBytes(outputSize) : copy.resize.outputEstimate}
              </div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                {copy.shared.sizeChange}
              </div>
              <div
                className={cn(
                  "mt-1 font-mono text-sm font-medium",
                  outputDelta === null
                    ? "text-muted-foreground"
                    : outputDelta >= 0
                      ? "text-success"
                      : "text-amber-600",
                )}
              >
                {outputDelta === null
                  ? "..."
                  : `${outputDelta > 0 ? "-" : "+"}${Math.abs(outputDelta)}%`}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                {outputDelta !== null && outputDelta < 0
                  ? copy.shared.outputLarger
                  : `${copy.shared.original}: ${formatBytes(file.size)}`}
              </div>
            </div>
          </div>

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
              disabled={busy || !validDimensions || Boolean(error)}
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
        onChange={(e) => onChange(Math.min(10000, Math.max(1, Number(e.target.value) || 0)))}
        className="w-full bg-transparent py-2 pr-3 text-sm outline-none"
      />
    </div>
  );
}
