import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/site/ToolPage";
import { FileDropzone } from "@/components/site/FileDropzone";
import { downloadBlob } from "@/lib/image";
import { getBrowserLocale, getTranslationSet, useLocale } from "@/lib/i18n";

type OutputFormat = "png" | "jpeg";

export const Route = createFileRoute("/pdf-to-image")({
  head: () => {
    const page = getTranslationSet(getBrowserLocale()).routes.pdfToImage;

    return {
      meta: [
        { title: page.title },
        { name: "description", content: page.description },
        { property: "og:title", content: page.ogTitle },
        { property: "og:description", content: page.ogDescription },
      ],
      links: [{ rel: "canonical", href: "/pdf-to-image" }],
    };
  },
  component: PdfToImage,
});

function PdfToImage() {
  const { t } = useLocale();
  const page = t.routes.pdfToImage;
  const [file, setFile] = useState<File | null>(null);
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState<OutputFormat>("png");
  const [quality, setQuality] = useState(0.9);
  const [busy, setBusy] = useState(false);
  const [pages, setPages] = useState<{ url: string; blob: Blob; filename: string }[]>([]);

  const onRender = async () => {
    if (!file) return;
    setBusy(true);
    setPages([]);
    try {
      const pdfjs = await import("pdfjs-dist");
      // Use the bundled module worker for browser environments
      const workerSrc = (await import("pdfjs-dist/build/pdf.worker.min.mjs?url")).default;
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

      const buf = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buf }).promise;
      const out: { url: string; blob: Blob; filename: string }[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        if (format === "jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const blob: Blob = await new Promise((res) =>
          canvas.toBlob((b) => res(b!), `image/${format}`, quality),
        );
        const ext = format === "jpeg" ? "jpg" : "png";
        out.push({ url: URL.createObjectURL(blob), blob, filename: `page-${i}.${ext}` });
      }
      setPages(out);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      {!file ? (
        <FileDropzone
          accept="application/pdf"
          onFiles={(f) => setFile(f[0])}
          title={page.dropTitle}
        />
      ) : (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface-elevated p-5">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="truncate font-medium">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {page.scaleLabel} <span className="font-mono">{scale}×</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((s) => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    className={`rounded-md border px-3 py-1.5 text-xs font-mono ${
                      scale === s
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border hover:border-primary/60"
                    }`}
                  >
                    {s}×
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Format
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["png", "jpeg"] as OutputFormat[]).map((item) => (
                    <button
                      key={item}
                      onClick={() => setFormat(item)}
                      className={`rounded-md border px-3 py-2 text-xs font-mono uppercase ${
                        format === item
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border hover:border-primary/60"
                      }`}
                    >
                      {item === "jpeg" ? "JPG" : "PNG"}
                    </button>
                  ))}
                </div>
              </div>
              {format === "jpeg" && (
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      JPG Quality
                    </label>
                    <span className="text-xs font-mono">{Math.round(quality * 100)}</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={Math.round(quality * 100)}
                    onChange={(e) => setQuality(Number(e.target.value) / 100)}
                    aria-label="JPG quality"
                    className="mt-2 w-full accent-[var(--color-primary)]"
                  />
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setFile(null);
                  setPages([]);
                }}
                className="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-secondary"
              >
                {page.newButton}
              </button>
              <button
                onClick={onRender}
                disabled={busy}
                className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {page.renderButton}
              </button>
            </div>
          </div>

          {pages.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pages.map((p, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border border-border bg-surface-elevated"
                >
                  <img
                    src={p.url}
                    alt={`Page ${i + 1}`}
                    className="aspect-[3/4] w-full object-cover"
                  />
                  <div className="flex items-center justify-between border-t border-border px-3 py-2 text-xs">
                    <span className="font-mono">{p.filename}</span>
                    <button
                      onClick={() => downloadBlob(p.blob, p.filename)}
                      className="inline-flex items-center gap-1 text-primary hover:opacity-80"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {page.saveButton}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ToolPage>
  );
}
