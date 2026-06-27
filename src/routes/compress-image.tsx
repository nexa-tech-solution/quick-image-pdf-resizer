import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, X } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/site/ToolPage";
import { FileDropzone } from "@/components/site/FileDropzone";
import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { ToolSeoContent } from "@/components/site/ToolSeoContent";
import { getBrowserLocale, getTranslationSet, toolEnhancementCopy, useLocale } from "@/lib/i18n";
import {
  downloadBlob,
  formatBytes,
  formatExt,
  processImage,
  replaceExt,
  type ImageFormat,
} from "@/lib/image";
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
import { createRouteHead } from "@/lib/seo";

const qualityPresets = [
  { labelKey: "high", value: 0.85 },
  { labelKey: "balanced", value: 0.7 },
  { labelKey: "smallest", value: 0.45 },
] as const;

export const Route = createFileRoute("/compress-image")({
  head: () => {
    const locale = getBrowserLocale();
    const t = getTranslationSet(locale);

    return createRouteHead({
      t,
      locale,
      routeKey: "compressImage",
    });
  },
  component: CompressImage,
});

function CompressImage() {
  const { locale, t } = useLocale();
  const copy = toolEnhancementCopy[locale];
  const page = t.routes.compressImage;
  const [items, setItems] = useState<ToolFileItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [format, setFormat] = useState<ImageFormat>("jpeg");
  const [busy, setBusy] = useState(false);
  const itemsRef = useRef<ToolFileItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => () => cleanupToolFileItems(itemsRef.current), []);

  const fileKey = useMemo(
    () => items.map((item) => `${item.id}:${item.file.lastModified}`).join("|"),
    [items],
  );
  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null;

  useEffect(() => {
    if (items.length === 0) return;

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
              sizes: { original: candidate.file.size },
            };
          }),
        );

        try {
          const { blob, width, height } = await processImage(item.file, { format, quality });
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
                    dimensions: { width, height },
                    sizes: { original: candidate.file.size, output: blob.size },
                  }
                : candidate,
            ),
          );
        } catch {
          setItems((current) =>
            current.map((candidate) =>
              candidate.id === item.id
                ? { ...candidate, status: "error", error: copy.shared.processingError }
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
    copy.shared.processingError,
    copy.shared.unsupportedOutput,
    fileKey,
    format,
    items.length,
    quality,
  ]);

  const addFiles = (files: File[]) => {
    const next = files.map((file) => createToolFileItem(file, "idle"));
    setItems((current) => [...current, ...next]);
    setSelectedId((current) => current ?? next[0]?.id ?? null);
  };

  const removeItem = (id: string) => {
    setItems((current) => {
      const target = current.find((item) => item.id === id);
      if (target) cleanupToolFileItem(target);
      const next = current.filter((item) => item.id !== id);
      if (selectedId === id) setSelectedId(next[0]?.id ?? null);
      return next;
    });
  };

  const removeAll = () => {
    cleanupToolFileItems(itemsRef.current);
    setItems([]);
    setSelectedId(null);
    setBusy(false);
  };

  const totalOriginal = items.reduce((sum, item) => sum + item.file.size, 0);
  const totalOutput = items.reduce((sum, item) => sum + (item.outputBlob?.size ?? 0), 0);

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      <SeoJsonLd routeKey="compressImage" tool="compress" />
      {items.length === 0 ? (
        <FileDropzone
          accept={imageAccept}
          multiple
          validateFile={(file) =>
            supportedImageTypes.has(file.type) ? null : copy.shared.unsupportedImageFormat
          }
          onFiles={addFiles}
          title={page.dropTitle}
          hint="JPG, PNG, WebP or AVIF - up to 250 MB"
        />
      ) : (
        <div className="space-y-6">
          <FileDropzone
            accept={imageAccept}
            multiple
            validateFile={(file) =>
              supportedImageTypes.has(file.type) ? null : copy.shared.unsupportedImageFormat
            }
            onFiles={addFiles}
            title={copy.batch.addMore}
            hint="JPG, PNG, WebP or AVIF - up to 250 MB"
            className="py-6"
          />

          <div className="grid gap-6 md:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-surface-elevated p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-sm text-muted-foreground">
                    {copy.shared.selected}:{" "}
                    <span className="font-mono text-foreground">{items.length}</span> ·{" "}
                    {copy.shared.total}:{" "}
                    <span className="font-mono text-foreground">{formatBytes(totalOriginal)}</span>
                    {totalOutput > 0 && (
                      <>
                        {" "}
                        →{" "}
                        <span className="font-mono text-foreground">
                          {formatBytes(totalOutput)}
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={removeAll}
                    className="text-xs font-medium text-muted-foreground hover:text-destructive"
                  >
                    {copy.shared.removeAll}
                  </button>
                </div>

                {selected && (
                  <div className="grid grid-cols-2 gap-3">
                    <PreviewPanel
                      label={`${page.original} · ${formatBytes(selected.file.size)}`}
                      url={selected.previewUrl}
                      unavailableText={t.resizeTool.previewUnavailable}
                      footer={
                        selected.dimensions
                          ? `${selected.dimensions.width} × ${selected.dimensions.height}`
                          : copy.batch.dimensionsPending
                      }
                    />
                    <PreviewPanel
                      label={`${page.compressed}${
                        selected.outputBlob ? ` · ${formatBytes(selected.outputBlob.size)}` : ""
                      }`}
                      url={selected.outputUrl}
                      unavailableText={t.resizeTool.previewUnavailable}
                      loading={selected.status === "processing"}
                      footer={
                        selected.status === "ready"
                          ? `${selected.dimensions?.width} × ${selected.dimensions?.height}`
                          : selected.status === "error"
                            ? (selected.error ?? copy.shared.error)
                            : page.waitingOutput
                      }
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {items.map((item) => {
                  const delta = savingPercent(item.file.size, item.outputBlob?.size);
                  const larger = delta !== null && delta < 0;

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
                      className={`grid w-full gap-3 rounded-xl border bg-surface-elevated p-3 text-left transition md:grid-cols-[1fr_auto_auto_auto] md:items-center ${
                        selected?.id === item.id
                          ? "border-primary bg-primary-soft/40"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{item.file.name}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {formatBytes(item.file.size)}
                          {item.outputBlob && ` → ${formatBytes(item.outputBlob.size)}`}
                        </div>
                        {larger && (
                          <div className="mt-1 text-xs text-amber-700">
                            {copy.batch.outputLargerHint}
                          </div>
                        )}
                        {item.error && (
                          <div className="mt-1 text-xs text-destructive">{item.error}</div>
                        )}
                      </div>
                      <div className="text-xs font-mono text-muted-foreground">
                        {item.status === "processing"
                          ? copy.batch.processing
                          : item.status === "ready"
                            ? copy.shared.ready
                            : item.status === "error"
                              ? copy.shared.error
                              : "Idle"}
                      </div>
                      <div
                        className={`text-xs font-mono ${
                          delta === null
                            ? "text-muted-foreground"
                            : delta >= 0
                              ? "text-success"
                              : "text-amber-700"
                        }`}
                      >
                        {delta === null ? "..." : `${delta > 0 ? "-" : "+"}${Math.abs(delta)}%`}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={!item.outputBlob}
                          onClick={(event) => {
                            event.stopPropagation();
                            if (item.outputBlob && item.outputFilename) {
                              downloadBlob(item.outputBlob, item.outputFilename);
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {page.downloadButton}
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            removeItem(item.id);
                          }}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-5 rounded-2xl border border-border bg-surface-elevated p-5">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {page.format}
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-2">
                  {(["jpeg", "webp", "avif", "png"] as ImageFormat[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setFormat(item)}
                      className={`rounded-lg border px-2 py-2 text-xs font-mono uppercase transition ${
                        format === item
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border hover:border-primary/60"
                      }`}
                    >
                      {item === "jpeg" ? "JPG" : item.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              {format !== "png" && (
                <div>
                  <div className="mb-3 grid grid-cols-3 gap-2">
                    {qualityPresets.map((preset) => (
                      <button
                        key={preset.labelKey}
                        type="button"
                        onClick={() => setQuality(preset.value)}
                        className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                          Math.abs(quality - preset.value) < 0.01
                            ? "border-primary bg-primary-soft text-primary"
                            : "border-border hover:border-primary/60"
                        }`}
                      >
                        {page.qualityPresets[preset.labelKey]}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      {page.quality}
                    </label>
                    <span className="text-xs font-mono">{Math.round(quality * 100)}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={Math.round(quality * 100)}
                    onChange={(e) => setQuality(Number(e.target.value) / 100)}
                    aria-label={page.quality}
                    className="mt-2 w-full accent-[var(--color-primary)]"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">{page.lowerQualityHint}</p>
                </div>
              )}
              {format === "png" && (
                <div className="rounded-lg border border-amber-300/70 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  {page.pngHint}
                </div>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  items
                    .filter((item) => item.outputBlob && item.outputFilename)
                    .forEach((item, index) => {
                      window.setTimeout(() => {
                        if (item.outputBlob && item.outputFilename) {
                          downloadBlob(item.outputBlob, item.outputFilename);
                        }
                      }, index * 200);
                    })
                }
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {copy.shared.downloadAll}
              </button>
            </div>
          </div>
        </div>
      )}
      <ToolSeoContent tool="compress" />
    </ToolPage>
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
      <div className="mb-2 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
      </div>
      {url && !failed ? (
        <img
          src={url}
          alt={label}
          className="aspect-square w-full rounded-lg object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex aspect-square items-center justify-center rounded-lg border border-border bg-background text-xs text-muted-foreground">
          {failed ? unavailableText : footer}
        </div>
      )}
      <div className="mt-2 text-xs text-muted-foreground">{footer}</div>
    </div>
  );
}
