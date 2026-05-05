import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/site/ToolPage";
import { FileDropzone } from "@/components/site/FileDropzone";
import { getBrowserLocale, getTranslationSet, useLocale } from "@/lib/i18n";
import {
  downloadBlob,
  formatBytes,
  formatExt,
  loadImage,
  processImage,
  replaceExt,
  type ImageFormat,
} from "@/lib/image";

const qualityPresets = [
  { label: "High", value: 0.85 },
  { label: "Balanced", value: 0.7 },
  { label: "Smallest", value: 0.45 },
] as const;

export const Route = createFileRoute("/compress-image")({
  head: () => {
    const page = getTranslationSet(getBrowserLocale()).routes.compressImage;

    return {
      meta: [
        { title: page.title },
        { name: "description", content: page.description },
        { property: "og:title", content: page.ogTitle },
        { property: "og:description", content: page.ogDescription },
      ],
      links: [{ rel: "canonical", href: "/compress-image" }],
    };
  },
  component: CompressImage,
});

function CompressImage() {
  const { t } = useLocale();
  const page = t.routes.compressImage;
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [format, setFormat] = useState<ImageFormat>("jpeg");
  const [original, setOriginal] = useState<{ url: string; width: number; height: number } | null>(
    null,
  );
  const [preview, setPreview] = useState<{
    blob: Blob;
    url: string;
    width: number;
    height: number;
  } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) {
      setOriginal(null);
      setPreview(null);
      setBusy(false);
      return;
    }

    let cancelled = false;
    const url = URL.createObjectURL(file);
    setOriginal(null);
    setPreview(null);

    loadImage(file)
      .then((img) => {
        if (cancelled) return;
        setOriginal({ url, width: img.naturalWidth, height: img.naturalHeight });
      })
      .catch(() => {
        if (cancelled) return;
        URL.revokeObjectURL(url);
      });

    return () => {
      cancelled = true;
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const { blob, width, height } = await processImage(file, { format, quality });
        if (cancelled) return;
        setPreview({
          blob,
          url: URL.createObjectURL(blob),
          width,
          height,
        });
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [file, quality, format]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview.url);
    };
  }, [preview]);

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      {!file ? (
        <FileDropzone
          accept="image/jpeg,image/png,image/webp,image/avif"
          onFiles={(f) => setFile(f[0])}
          title={page.dropTitle}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          <div className="rounded-2xl border border-border bg-surface-elevated p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {page.original} · {formatBytes(file.size)}
                </div>
                {original ? (
                  <img
                    src={original.url}
                    alt={page.original}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center rounded-lg border border-border bg-background text-xs text-muted-foreground">
                    {page.loadingPreview}
                  </div>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  {original ? `${original.width} × ${original.height}` : page.readingDimensions}
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <span>
                    {page.compressed}
                    {preview && ` · ${formatBytes(preview.blob.size)}`}
                  </span>
                  {busy && <Loader2 className="h-3 w-3 animate-spin" />}
                </div>
                {preview && (
                  <img
                    src={preview.url}
                    alt={page.compressed}
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  {preview ? `${preview.width} × ${preview.height}` : page.waitingOutput}
                </div>
              </div>
            </div>
            {preview && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {page.sizeChange}
                  </div>
                  <div className="mt-1 font-mono text-sm font-medium">
                    {preview.blob.size <= file.size ? (
                      <span className="text-success">
                        -{Math.max(0, Math.round((1 - preview.blob.size / file.size) * 100))}%
                      </span>
                    ) : (
                      <span className="text-amber-600">
                        +{Math.max(0, Math.round((preview.blob.size / file.size - 1) * 100))}%
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatBytes(Math.abs(file.size - preview.blob.size))}{" "}
                    {preview.blob.size <= file.size ? page.smaller : page.larger}{" "}
                    {page.original.toLowerCase()}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-background px-3 py-2">
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                    {page.output}
                  </div>
                  <div className="mt-1 font-mono text-sm font-medium">
                    {preview.width} × {preview.height} · {formatExt[format].toUpperCase()}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {formatBytes(preview.blob.size)} {page.readyToDownload}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-5 rounded-2xl border border-border bg-surface-elevated p-5">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {page.format}
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(["jpeg", "webp", "avif", "png"] as ImageFormat[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFormat(f)}
                    className={`rounded-lg border px-2 py-2 text-xs font-mono uppercase transition ${
                      format === f
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border hover:border-primary/60"
                    }`}
                  >
                    {f === "jpeg" ? "JPG" : f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            {format !== "png" && (
              <div>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  {qualityPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setQuality(preset.value)}
                      className={`rounded-lg border px-2 py-2 text-xs font-medium transition ${
                        Math.abs(quality - preset.value) < 0.01
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border hover:border-primary/60"
                      }`}
                    >
                      {preset.label}
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
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFile(null)}
                className="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-secondary"
              >
                {page.newButton}
              </button>
              <button
                type="button"
                disabled={!preview}
                onClick={() =>
                  preview && downloadBlob(preview.blob, replaceExt(file.name, formatExt[format]))
                }
                className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {page.downloadButton}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
