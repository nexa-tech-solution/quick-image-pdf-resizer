import { useEffect, useMemo, useRef, useState } from "react";
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
  cleanupToolFileItem,
  cleanupToolFileItems,
  createToolFileItem,
  imageAccept,
  revokeUrl,
  savingPercent,
  supportedImageTypes,
  type ToolFileItem,
} from "@/lib/tool-files";
import { makeZipBlob } from "@/lib/zip";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const presets = [
  { group: "store", labelKey: "appIcon", size: "1024×1024", w: 1024, h: 1024 },
  { group: "store", labelKey: "featureGraphic", size: "1024×500", w: 1024, h: 500 },
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

type ResizeImageToolProps = {
  onHasFilesChange?: (hasFiles: boolean) => void;
};

export function ResizeImageTool({ onHasFilesChange }: ResizeImageToolProps = {}) {
  const { locale, t } = useLocale();
  const copy = toolEnhancementCopy[locale];
  const [items, setItems] = useState<ToolFileItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(1080);
  const [height, setHeight] = useState<number>(1080);
  const [lockRatio, setLockRatio] = useState(true);
  const [fit, setFit] = useState<"contain" | "cover" | "stretch">("contain");
  const [format, setFormat] = useState<ImageFormat>("jpeg");
  const [quality, setQuality] = useState(0.85);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [busy, setBusy] = useState(false);
  const [zipping, setZipping] = useState(false);
  const itemsRef = useRef<ToolFileItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    onHasFilesChange?.(items.length > 0);
  }, [items.length, onHasFilesChange]);

  useEffect(() => () => cleanupToolFileItems(itemsRef.current), []);

  const fileKey = useMemo(
    () => items.map((item) => `${item.id}:${item.file.lastModified}`).join("|"),
    [items],
  );
  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;
  const ratio = useMemo(
    () =>
      selected?.sourceDimensions
        ? selected.sourceDimensions.width / selected.sourceDimensions.height
        : 1,
    [selected],
  );
  const validDimensions = width >= 1 && height >= 1 && width <= 10000 && height <= 10000;
  const totalOriginal = items.reduce((sum, item) => sum + item.file.size, 0);
  const totalOutput = items.reduce((sum, item) => sum + (item.outputBlob?.size ?? 0), 0);
  const readyCount = items.filter((item) => item.status === "ready").length;
  const errorCount = items.filter((item) => item.status === "error").length;
  const downloadableItems = useMemo(
    () =>
      items.filter((item): item is ToolFileItem & { outputBlob: Blob; outputFilename: string } =>
        Boolean(item.outputBlob && item.outputFilename),
      ),
    [items],
  );

  useEffect(() => {
    if (items.length === 0) {
      setBusy(false);
      return;
    }

    if (!validDimensions) {
      setBusy(false);
      return;
    }

    let cancelled = false;

    async function processAll() {
      setBusy(true);
      const supported = await canEncodeImageFormat(format);
      if (!supported) {
        setItems((current) =>
          current.map((item) => ({
            ...item,
            status: "error",
            error: copy.shared.unsupportedOutput,
          })),
        );
        setBusy(false);
        return;
      }

      for (const item of itemsRef.current) {
        if (cancelled) break;

        setItems((current) =>
          current.map((candidate) => {
            if (candidate.id !== item.id) return candidate;
            revokeUrl(candidate.outputUrl);
            return {
              ...candidate,
              status: "processing",
              error: undefined,
              outputBlob: undefined,
              outputUrl: undefined,
              outputFilename: undefined,
              dimensions: undefined,
              sourceDimensions: undefined,
              sizes: { original: candidate.file.size },
            };
          }),
        );

        try {
          const {
            blob,
            width: outW,
            height: outH,
            sourceWidth,
            sourceHeight,
          } = await processImage(item.file, {
            width,
            height,
            fit,
            format,
            quality,
            backgroundColor: fit === "contain" ? backgroundColor : undefined,
          });
          if (cancelled) break;
          if (!itemsRef.current.some((candidate) => candidate.id === item.id)) continue;

          const outputUrl = URL.createObjectURL(blob);
          setItems((current) =>
            current.map((candidate) =>
              candidate.id === item.id
                ? {
                    ...candidate,
                    status: "ready",
                    outputBlob: blob,
                    outputUrl,
                    outputFilename: replaceExt(candidate.file.name, formatExt[format]),
                    dimensions: { width: outW, height: outH },
                    sourceDimensions: { width: sourceWidth, height: sourceHeight },
                    sizes: { original: candidate.file.size, output: blob.size },
                  }
                : candidate,
            ),
          );
        } catch (err) {
          setItems((current) =>
            current.map((candidate) =>
              candidate.id === item.id
                ? {
                    ...candidate,
                    status: "error",
                    error:
                      err instanceof Error && err.message.includes("Unsupported")
                        ? copy.shared.unsupportedOutput
                        : copy.shared.processingError,
                  }
                : candidate,
            ),
          );
        }
      }

      if (!cancelled) setBusy(false);
    }

    processAll();

    return () => {
      cancelled = true;
    };
  }, [
    backgroundColor,
    copy.shared.processingError,
    copy.shared.unsupportedOutput,
    fileKey,
    fit,
    format,
    height,
    items.length,
    quality,
    validDimensions,
    width,
  ]);

  useEffect(() => {
    if (items.length === 0) {
      setSelectedId(null);
      return;
    }

    if (!selectedId || !items.some((item) => item.id === selectedId)) {
      setSelectedId(items[0]?.id ?? null);
    }
  }, [items, selectedId]);

  const addFiles = async (files: File[]) => {
    if (files.length === 0) return;

    if (itemsRef.current.length === 0) {
      try {
        const img = await loadImage(files[0]);
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
      } catch {
        // Keep the current dimensions if the first file cannot be decoded yet.
      }
    }

    const next = files.map((file) => createToolFileItem(file, "idle"));
    setItems((current) => [...current, ...next]);
    setSelectedId((current) => current ?? next[0]?.id ?? null);
  };

  const removeItem = (id: string) => {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target) cleanupToolFileItem(target);
      return current.filter((item) => item.id !== id);
    });
    if (selectedId === id) {
      setSelectedId(itemsRef.current.find((item) => item.id !== id)?.id ?? null);
    }
  };

  const removeAll = () => {
    cleanupToolFileItems(itemsRef.current);
    setItems([]);
    setSelectedId(null);
    setBusy(false);
  };

  const resetToOriginal = () => {
    if (!selected?.sourceDimensions) return;
    setLockRatio(true);
    setWidth(selected.sourceDimensions.width);
    setHeight(selected.sourceDimensions.height);
  };

  const onWidth = (value: number) => {
    setWidth(value);
    if (lockRatio && selected?.sourceDimensions) {
      setHeight(Math.round(value / ratio));
    }
  };

  const onHeight = (value: number) => {
    setHeight(value);
    if (lockRatio && selected?.sourceDimensions) {
      setWidth(Math.round(value * ratio));
    }
  };

  const applyPreset = (w: number, h: number) => {
    setLockRatio(false);
    setWidth(w);
    setHeight(h);
  };

  const downloadZip = async () => {
    if (downloadableItems.length === 0 || zipping) return;

    setZipping(true);
    try {
      const nameCounts = new Map<string, number>();
      const zipEntries = downloadableItems.map((item) => {
        const currentCount = nameCounts.get(item.outputFilename) ?? 0;
        nameCounts.set(item.outputFilename, currentCount + 1);

        if (currentCount === 0) {
          return { name: item.outputFilename, blob: item.outputBlob };
        }

        const dotIndex = item.outputFilename.lastIndexOf(".");
        const baseName =
          dotIndex >= 0 ? item.outputFilename.slice(0, dotIndex) : item.outputFilename;
        const extension = dotIndex >= 0 ? item.outputFilename.slice(dotIndex) : "";

        return {
          name: `${baseName} (${currentCount})${extension}`,
          blob: item.outputBlob,
        };
      });

      const zipBlob = await makeZipBlob(zipEntries);

      downloadBlob(zipBlob, "resized-images.zip");
    } finally {
      setZipping(false);
    }
  };

  const canDownload = downloadableItems.length > 0;

  const downloadAll = () => {
    downloadableItems.forEach((item, index) => {
      window.setTimeout(() => {
        downloadBlob(item.outputBlob, item.outputFilename);
      }, index * 200);
    });
  };

  const presetGroups = [
    { id: "store", label: copy.resize.store },
    { id: "social", label: copy.resize.social },
    { id: "video", label: copy.resize.video },
    { id: "web", label: copy.resize.web },
  ] as const;

  if (items.length === 0) {
    return (
      <FileDropzone
        accept={imageAccept}
        multiple
        validateFile={(item) =>
          supportedImageTypes.has(item.type) ? null : copy.shared.unsupportedImageFormat
        }
        onFiles={addFiles}
        title={t.resizeTool.dropTitle}
        hint={t.resizeTool.dropHint}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-sm">
          <span className="font-semibold">
            {items.length} {copy.imageToPdf.files}
          </span>
          <span className="text-muted-foreground">
            {" "}
            · {formatBytes(totalOriginal)}
            {totalOutput > 0 && <> → {formatBytes(totalOutput)}</>}
          </span>
          {errorCount > 0 && (
            <span className="text-destructive">
              {" "}
              · {copy.shared.error}: {errorCount}
            </span>
          )}
        </div>
        <button
          onClick={removeAll}
          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
        >
          {copy.shared.removeAll}
        </button>
      </div>

      <div className="space-y-4">
        <FileDropzone
          accept={imageAccept}
          multiple
          validateFile={(item) =>
            supportedImageTypes.has(item.type) ? null : copy.shared.unsupportedImageFormat
          }
          onFiles={addFiles}
          title={copy.batch.addMore}
          compact
          hint={t.resizeTool.dropHint}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-4">
            {selected && (
              <div className="grid grid-cols-2 gap-3">
                <PreviewPanel
                  label={`${copy.shared.original} · ${formatBytes(selected.file.size)}`}
                  url={selected.previewUrl}
                  unavailableText={t.resizeTool.previewUnavailable}
                  footer={
                    selected.sourceDimensions
                      ? `${selected.sourceDimensions.width} × ${selected.sourceDimensions.height}`
                      : selected.file.name
                  }
                />
                <PreviewPanel
                  label={`${copy.shared.output}${
                    selected.outputBlob ? ` · ${formatBytes(selected.outputBlob.size)}` : ""
                  }`}
                  url={selected.outputUrl}
                  unavailableText={t.resizeTool.previewUnavailable}
                  loading={selected.status === "processing" || busy}
                  footer={
                    selected.status === "ready"
                      ? `${selected.dimensions?.width} × ${selected.dimensions?.height} · ${formatExt[format].toUpperCase()}`
                      : selected.status === "error"
                        ? (selected.error ?? copy.shared.error)
                        : copy.resize.outputEstimate
                  }
                />
              </div>
            )}

            {selected &&
              (savingPercent(selected.file.size, selected.outputBlob?.size) ?? 0) < 0 && (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {copy.batch.outputLargerHint}
                </p>
              )}

            {/* With one file the preview already shows everything; list only for batches. */}
            <div className={items.length > 1 ? "space-y-2" : "hidden"}>
              {items.map((item) => {
                const delta = savingPercent(item.file.size, item.outputBlob?.size);

                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedId(item.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedId(item.id);
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-2xl p-2 text-left transition ${
                      selected?.id === item.id
                        ? "bg-primary-soft/60"
                        : "bg-surface hover:bg-secondary"
                    }`}
                  >
                    <img
                      src={item.outputUrl ?? item.previewUrl}
                      alt=""
                      className="h-12 w-12 shrink-0 rounded-xl bg-background object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{item.file.name}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        {item.status === "processing" ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : null}
                        <span className="truncate">
                          {item.error ??
                            `${formatBytes(item.file.size)}${
                              item.outputBlob ? ` → ${formatBytes(item.outputBlob.size)}` : ""
                            }`}
                        </span>
                        {delta !== null && (
                          <span
                            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                              delta >= 0
                                ? "bg-success/15 text-success"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {delta > 0 ? "-" : "+"}
                            {Math.abs(delta)}%
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={!item.outputBlob}
                      aria-label={t.resizeTool.download}
                      onClick={(event) => {
                        event.stopPropagation();
                        if (item.outputBlob && item.outputFilename) {
                          downloadBlob(item.outputBlob, item.outputFilename);
                        }
                      }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background text-primary shadow-soft transition disabled:opacity-40"
                    >
                      <Download className="h-[18px] w-[18px]" />
                    </button>
                    <button
                      type="button"
                      aria-label={copy.shared.removeAll}
                      onClick={(event) => {
                        event.stopPropagation();
                        removeItem(item.id);
                      }}
                      className="flex h-10 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="min-w-0 rounded-2xl bg-surface px-1">
            <Accordion type="multiple" defaultValue={["presets", "dimensions"]} className="">
              <AccordionItem value="presets" className="border-b border-border/70 last:border-b-0">
                <AccordionTrigger className="px-3 py-3.5 text-sm font-semibold text-foreground no-underline hover:no-underline">
                  {t.resizeTool.presets}
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3.5 pt-0">
                  <div className="space-y-3">
                    {presetGroups.map((group) => (
                      <div key={group.id}>
                        <div className="mb-1.5 text-xs text-muted-foreground">{group.label}</div>
                        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                          {presets
                            .filter((p) => p.group === group.id)
                            .map((p) => (
                              <button
                                key={p.size}
                                onClick={() => applyPreset(p.w, p.h)}
                                className={cn(
                                  "shrink-0 rounded-full px-3.5 py-2 text-left transition",
                                  width === p.w && height === p.h
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background text-foreground shadow-soft hover:bg-primary-soft",
                                )}
                              >
                                <span className="whitespace-nowrap text-xs font-medium">
                                  {t.resizeTool.presetLabels[p.labelKey]}
                                  <span className="ml-1.5 opacity-60">{p.size}</span>
                                </span>
                              </button>
                            ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem
                value="dimensions"
                className="border-b border-border/70 last:border-b-0"
              >
                <AccordionTrigger className="px-3 py-3.5 text-sm font-semibold text-foreground no-underline hover:no-underline">
                  {t.resizeTool.dimensions}
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3.5 pt-0">
                  <div className="flex items-center justify-between gap-3">
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
                      {lockRatio ? (
                        <Lock className="h-3.5 w-3.5" />
                      ) : (
                        <Unlock className="h-3.5 w-3.5" />
                      )}
                      {lockRatio ? t.resizeTool.lockRatio : t.resizeTool.unlockRatio}
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                    <NumberField label="W" value={width} onChange={onWidth} />
                    <NumberField label="H" value={height} onChange={onHeight} />
                    <button
                      type="button"
                      onClick={resetToOriginal}
                      disabled={!selected?.sourceDimensions}
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
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="fit" className="border-b border-border/70 last:border-b-0">
                <AccordionTrigger className="px-3 py-3.5 text-sm font-semibold text-foreground no-underline hover:no-underline">
                  {t.resizeTool.fit}
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3.5 pt-0">
                  <TooltipProvider>
                    <div className="-mx-2.5 grid grid-flow-col auto-cols-[calc((100%-0.5rem)/3)] snap-x snap-mandatory gap-2 overflow-x-auto px-2.5 pb-1 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-3 sm:flex sm:auto-cols-auto sm:px-3">
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
                                  "flex min-h-10 w-28 shrink-0 snap-start items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-2 text-xs capitalize transition",
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
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="format" className="border-b border-border/70 last:border-b-0">
                <AccordionTrigger className="px-3 py-3.5 text-sm font-semibold text-foreground no-underline hover:no-underline">
                  {t.resizeTool.format}
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3.5 pt-0">
                  <div className="-mx-2.5 grid grid-flow-col auto-cols-[calc((100%-0.5rem)/2)] snap-x snap-mandatory gap-2 overflow-x-auto px-2.5 pb-1 pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-3 sm:flex sm:auto-cols-auto sm:px-3">
                    {(["jpeg", "png", "webp", "avif"] as ImageFormat[]).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFormat(f)}
                        className={cn(
                          "min-w-0 snap-start rounded-lg border border-border px-1.5 py-2 text-[11px] uppercase font-mono transition",
                          format === f
                            ? "border-primary bg-primary-soft text-primary"
                            : "hover:border-primary/60",
                        )}
                      >
                        {f === "jpeg" ? "JPG" : f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {fit === "contain" && (
                <AccordionItem
                  value="background"
                  className="border-b border-border/70 last:border-b-0"
                >
                  <AccordionTrigger className="px-3 py-3.5 text-sm font-semibold text-foreground no-underline hover:no-underline">
                    {t.resizeTool.background}
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3.5 pt-0">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
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
                  </AccordionContent>
                </AccordionItem>
              )}

              {format !== "png" && (
                <AccordionItem
                  value="quality"
                  className="border-b border-border/70 last:border-b-0"
                >
                  <AccordionTrigger className="px-3 py-3.5 text-sm font-semibold text-foreground no-underline hover:no-underline">
                    <span className="flex items-center gap-2">
                      {t.resizeTool.quality}
                      <span className="text-xs font-mono normal-case tracking-normal">
                        {Math.round(quality * 100)}
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-3.5 pt-0">
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={Math.round(quality * 100)}
                      onChange={(e) => setQuality(Number(e.target.value) / 100)}
                      className="mt-1 w-full accent-[var(--color-primary)]"
                    />
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>

            <div className="mt-4 space-y-3">
              <div className="mobile-cta flex gap-2">
                <button
                  onClick={removeAll}
                  aria-label={copy.shared.removeAll}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-secondary"
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
                {items.length > 1 && (
                  <button
                    onClick={downloadAll}
                    disabled={busy || zipping || !canDownload}
                    className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-border px-3 text-sm font-medium transition hover:bg-secondary disabled:opacity-50"
                  >
                    <Download className="h-4 w-4" />
                    {copy.shared.downloadAll}
                  </button>
                )}
                <button
                  onClick={items.length > 1 ? downloadZip : downloadAll}
                  disabled={busy || zipping || !canDownload}
                  className="flex h-12 min-w-0 flex-[1.3] items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50"
                >
                  {zipping || busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {items.length > 1 ? copy.shared.downloadZip : t.resizeTool.download}
                </button>
              </div>
            </div>
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
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
      <span className="font-mono text-[11px] uppercase text-muted-foreground">{label}</span>
      <input
        type="number"
        value={value}
        min={1}
        max={10000}
        onChange={(e) => onChange(Number(e.target.value) || 1)}
        className="w-full bg-transparent font-mono text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </label>
  );
}

function PreviewPanel({
  label,
  url,
  unavailableText,
  footer,
  loading = false,
}: {
  label: string;
  url?: string;
  unavailableText: string;
  footer: string;
  loading?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
        <span>{label}</span>
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
      </div>
      {url && !failed ? (
        <img
          src={url}
          alt={label}
          className="aspect-[4/3] w-full rounded-2xl bg-surface object-contain"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-surface p-3 text-center text-xs text-muted-foreground">
          {failed ? unavailableText : footer}
        </div>
      )}
      <div className="mt-1.5 truncate text-[11px] text-muted-foreground">{footer}</div>
    </div>
  );
}
