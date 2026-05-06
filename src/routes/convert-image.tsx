import { useEffect, useMemo, useRef, useState } from "react";
import { Download, Loader2, X } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/site/ToolPage";
import { FileDropzone } from "@/components/site/FileDropzone";
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
  isSameImageFormat,
  revokeUrl,
  savingPercent,
  supportedImageTypes,
  type ToolFileItem,
} from "@/lib/tool-files";

export const Route = createFileRoute("/convert-image")({
  head: () => {
    const page = getTranslationSet(getBrowserLocale()).routes.convertImage;

    return {
      meta: [
        { title: page.title },
        { name: "description", content: page.description },
        { property: "og:title", content: page.ogTitle },
        { property: "og:description", content: page.ogDescription },
      ],
      links: [{ rel: "canonical", href: "/convert-image" }],
    };
  },
  component: ConvertImage,
});

function ConvertImage() {
  const { locale, t } = useLocale();
  const copy = toolEnhancementCopy[locale];
  const page = t.routes.convertImage;
  const [items, setItems] = useState<ToolFileItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [format, setFormat] = useState<ImageFormat>("webp");
  const [quality, setQuality] = useState(0.92);
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

  const downloadReady = () => {
    items
      .filter((item) => item.outputBlob && item.outputFilename)
      .forEach((item, index) => {
        window.setTimeout(() => {
          if (item.outputBlob && item.outputFilename) {
            downloadBlob(item.outputBlob, item.outputFilename);
          }
        }, index * 200);
      });
  };

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      {items.length === 0 ? (
        <FileDropzone
          accept={imageAccept}
          multiple
          validateFile={(file) =>
            supportedImageTypes.has(file.type) ? null : "This image format is not supported."
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
              supportedImageTypes.has(file.type) ? null : "This image format is not supported."
            }
            onFiles={addFiles}
            title={copy.batch.addMore}
            hint="JPG, PNG, WebP or AVIF - up to 250 MB"
            className="py-6"
          />

          <div className="grid gap-6 md:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              {selected && (
                <div className="grid gap-3 rounded-2xl border border-border bg-surface-elevated p-4 sm:grid-cols-2">
                  <PreviewPanel
                    label={`${copy.shared.original} · ${formatBytes(selected.file.size)}`}
                    url={selected.previewUrl}
                    footer={selected.file.name}
                  />
                  <PreviewPanel
                    label={`${copy.shared.output}${
                      selected.outputBlob ? ` · ${formatBytes(selected.outputBlob.size)}` : ""
                    }`}
                    url={selected.outputUrl}
                    loading={selected.status === "processing"}
                    footer={
                      selected.status === "ready"
                        ? `${selected.dimensions?.width} × ${selected.dimensions?.height} · ${formatExt[
                            format
                          ].toUpperCase()}`
                        : selected.status === "error"
                          ? (selected.error ?? copy.shared.error)
                          : page.outputLabel
                    }
                  />
                </div>
              )}

              <div className="space-y-2">
                {items.map((item) => {
                  const delta = savingPercent(item.file.size, item.outputBlob?.size);
                  const sameFormat = isSameImageFormat(item.file, format);

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
                        {sameFormat && (
                          <div className="mt-1 text-xs text-amber-700">
                            {copy.batch.reencodeWarning}
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
                          {page.convertButton}
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
                  {page.convertTo}
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["jpeg", "png", "webp", "avif"] as ImageFormat[]).map((item) => (
                    <button
                      key={item}
                      onClick={() => setFormat(item)}
                      className={`rounded-lg border px-3 py-3 text-sm font-mono uppercase transition ${
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
                    aria-label={page.outputQuality}
                    className="mt-2 w-full accent-[var(--color-primary)]"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">{page.qualityHint}</p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={removeAll}
                  className="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-secondary"
                >
                  {page.newButton}
                </button>
                <button
                  onClick={downloadReady}
                  disabled={busy || items.every((item) => !item.outputBlob)}
                  className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {copy.shared.downloadAll}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ToolPage>
  );
}

function PreviewPanel({
  label,
  url,
  footer,
  loading = false,
}: {
  label: string;
  url?: string;
  footer: string;
  loading?: boolean;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        {loading && <Loader2 className="h-3 w-3 animate-spin" />}
      </div>
      {url ? (
        <img src={url} alt={label} className="aspect-square w-full rounded-lg object-cover" />
      ) : (
        <div className="flex aspect-square items-center justify-center rounded-lg border border-border bg-background text-xs text-muted-foreground">
          {footer}
        </div>
      )}
      <div className="mt-2 text-xs text-muted-foreground">{footer}</div>
    </div>
  );
}
