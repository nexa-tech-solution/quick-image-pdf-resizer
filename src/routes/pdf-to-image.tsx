import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/site/ToolPage";
import { FileDropzone } from "@/components/site/FileDropzone";
import { downloadBlob } from "@/lib/image";
import { getBrowserLocale, getTranslationSet, useLocale } from "@/lib/i18n";

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
  const [busy, setBusy] = useState(false);
  const [pages, setPages] = useState<{ url: string; blob: Blob }[]>([]);

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
      const out: { url: string; blob: Blob }[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
        out.push({ url: URL.createObjectURL(blob), blob });
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
                    <span className="font-mono">page-{i + 1}.png</span>
                    <button
                      onClick={() => downloadBlob(p.blob, `page-${i + 1}.png`)}
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
