import { useEffect, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/site/ToolPage";
import { FileDropzone } from "@/components/site/FileDropzone";
import {
  downloadBlob,
  formatBytes,
  formatExt,
  processImage,
  replaceExt,
  type ImageFormat,
} from "@/lib/image";

export const Route = createFileRoute("/compress-image")({
  head: () => ({
    meta: [
      { title: "Compress Image — JPG, PNG, WebP | ResizePro" },
      {
        name: "description",
        content:
          "Compress JPG, PNG and WebP images in your browser. Adjust quality with live preview and download instantly.",
      },
      { property: "og:title", content: "Compress Image | ResizePro" },
      { property: "og:description", content: "Reduce image size without losing quality." },
    ],
  }),
  component: CompressImage,
});

function CompressImage() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [format, setFormat] = useState<ImageFormat>("jpeg");
  const [preview, setPreview] = useState<{ blob: Blob; url: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setBusy(true);
    const t = setTimeout(async () => {
      try {
        const { blob } = await processImage(file, { format, quality });
        if (cancelled) return;
        setPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev.url);
          return { blob, url: URL.createObjectURL(blob) };
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

  return (
    <ToolPage
      eyebrow="Image"
      title="Compress images"
      description="Slide to find the sweet spot between size and quality. Everything happens locally."
    >
      {!file ? (
        <FileDropzone
          accept="image/jpeg,image/png,image/webp"
          onFiles={(f) => setFile(f[0])}
          title="Drop an image to compress"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-[1fr_280px]">
          <div className="rounded-2xl border border-border bg-surface-elevated p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="mb-2 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Original · {formatBytes(file.size)}
                </div>
                <img
                  src={URL.createObjectURL(file)}
                  alt="Original"
                  className="aspect-square w-full rounded-lg object-cover"
                />
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  <span>
                    Compressed
                    {preview && ` · ${formatBytes(preview.blob.size)}`}
                  </span>
                  {busy && <Loader2 className="h-3 w-3 animate-spin" />}
                </div>
                {preview && (
                  <img
                    src={preview.url}
                    alt="Compressed"
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                )}
              </div>
            </div>
            {preview && (
              <div className="mt-4 rounded-lg bg-success/10 px-3 py-2 text-xs text-success-foreground">
                <span className="font-mono text-success">
                  -{Math.max(0, Math.round((1 - preview.blob.size / file.size) * 100))}%
                </span>
                <span className="ml-2 text-muted-foreground">smaller than original</span>
              </div>
            )}
          </div>

          <div className="space-y-5 rounded-2xl border border-border bg-surface-elevated p-5">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Format
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["jpeg", "webp", "png"] as ImageFormat[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`rounded-lg border px-2 py-2 text-xs font-mono uppercase transition ${
                      format === f
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border hover:border-primary/60"
                    }`}
                  >
                    {f === "jpeg" ? "JPG" : f}
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
                className="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-secondary"
              >
                New
              </button>
              <button
                disabled={!preview}
                onClick={() =>
                  preview && downloadBlob(preview.blob, replaceExt(file.name, formatExt[format]))
                }
                className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
