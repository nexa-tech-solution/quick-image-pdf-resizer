import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/site/ToolPage";
import { FileDropzone } from "@/components/site/FileDropzone";
import { downloadBlob, formatExt, processImage, replaceExt, type ImageFormat } from "@/lib/image";
import { getBrowserLocale, getTranslationSet, useLocale } from "@/lib/i18n";

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
  const { t } = useLocale();
  const page = t.routes.convertImage;
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImageFormat>("webp");
  const [quality, setQuality] = useState(0.92);
  const [busy, setBusy] = useState(false);

  const onConvert = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const { blob } = await processImage(file, { format, quality });
      downloadBlob(blob, replaceExt(file.name, formatExt[format]));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      {!file ? (
        <FileDropzone
          accept="image/jpeg,image/png,image/webp,image/avif"
          onFiles={(f) => setFile(f[0])}
          title={page.dropTitle}
        />
      ) : (
        <div className="rounded-2xl border border-border bg-surface-elevated p-6">
          <div className="truncate font-medium">{file.name}</div>
          <div className="mt-1 text-sm text-muted-foreground">
            {page.outputLabel}{" "}
            <span className="font-mono uppercase text-foreground">
              {format === "jpeg" ? "JPG" : formatExt[format]}
            </span>{" "}
            {page.outputAs}{" "}
            <span className="font-mono text-foreground">
              {replaceExt(file.name, formatExt[format])}
            </span>
          </div>
          <div className="mt-6">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              {page.convertTo}
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["jpeg", "png", "webp", "avif"] as ImageFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded-lg border px-3 py-3 text-sm font-mono uppercase transition ${
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
            <div className="mt-6">
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
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setFile(null)}
              className="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-secondary"
            >
              {page.newButton}
            </button>
            <button
              onClick={onConvert}
              disabled={busy}
              className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {page.convertButton}
            </button>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
