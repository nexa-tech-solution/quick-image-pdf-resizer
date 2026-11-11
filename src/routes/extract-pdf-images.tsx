import { SmoothImage } from "@/components/site/SmoothImage";
import { useLightbox } from "@/components/site/Lightbox";
import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Images } from "lucide-react";
import { FileDropzone } from "@/components/site/FileDropzone";
import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { ToolPage } from "@/components/site/ToolPage";
import { ActionBar, FileCard, Notice, ProgressBox } from "@/components/site/ToolBits";
import { getBrowserLocale, getTranslationSet } from "@/lib/i18n";
import { downloadBlob } from "@/lib/image";
import { baseName, extractPdfImages, PdfPasswordError, type ExtractedImage } from "@/lib/pdf-tools";
import { createRouteHead } from "@/lib/seo";
import { pdfAccept } from "@/lib/tool-files";
import { useV3Copy } from "@/lib/tools-v3";
import { makeZipBlob } from "@/lib/zip";

export const Route = createFileRoute("/extract-pdf-images")({
  head: () => {
    const locale = getBrowserLocale();
    return createRouteHead({ t: getTranslationSet(locale), locale, routeKey: "extractPdfImages" });
  },
  component: ExtractPdfImagesPage,
});

function ExtractPdfImagesPage() {
  const c = useV3Copy();
  const lightbox = useLightbox();
  const page = c.extractPdfImages;
  const [file, setFile] = useState<File | null>(null);
  const [skipSmall, setSkipSmall] = useState(true);
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zip, setZip] = useState<{ blob: Blob; filename: string } | null>(null);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    let produced: ExtractedImage[] = [];
    setBusy(true);
    setError(null);
    setImages([]);
    setZip(null);

    extractPdfImages(file, { minSize: skipSmall ? 48 : 1 }, (current, total) => {
      if (!cancelled) setProgress({ current, total });
    })
      .then(async (found) => {
        produced = found;
        if (cancelled) return;
        setImages(found);
        if (found.length > 1) {
          const blob = await makeZipBlob(
            found.map((img) => ({ name: img.filename, blob: img.blob })),
          );
          if (!cancelled) setZip({ blob, filename: `${baseName(file.name)}-images.zip` });
        } else if (found.length === 1) {
          setZip({ blob: found[0].blob, filename: found[0].filename });
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof PdfPasswordError ? c.common.encryptedError : c.common.pdfError);
      })
      .finally(() => {
        if (!cancelled) {
          setBusy(false);
          setProgress(null);
        }
      });

    return () => {
      cancelled = true;
      produced.forEach((img) => URL.revokeObjectURL(img.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, skipSmall]);

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      <SeoJsonLd routeKey="extractPdfImages" />
      {!file ? (
        <FileDropzone
          accept={pdfAccept}
          onFiles={([next]) => next && setFile(next)}
          title={c.common.dropPdf}
          hint={c.common.pdfHint}
        />
      ) : (
        <div className="fade-in space-y-4">
          <FileCard
            name={file.name}
            size={file.size}
            extra={!busy && !error ? ` · ${images.length} ${page.found}` : null}
          />

          <label className="flex items-center gap-2 rounded-2xl bg-surface p-3 text-sm">
            <input
              type="checkbox"
              checked={skipSmall}
              disabled={busy}
              onChange={(e) => setSkipSmall(e.target.checked)}
              className="h-4 w-4 accent-[var(--primary)]"
            />
            {page.minSize}
          </label>

          {busy && <ProgressBox label={page.scanning} progress={progress} />}
          {busy && images.length === 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="skeleton aspect-square rounded-xl" />
              ))}
            </div>
          )}
          {error && <Notice>{error}</Notice>}
          {!busy && !error && images.length === 0 && <Notice tone="warn">{page.none}</Notice>}

          {images.length > 0 && (
            <div className="rise-stagger grid grid-cols-2 gap-2 sm:grid-cols-3">
              {images.map((img, i) => (
                <figure key={img.url} className="overflow-hidden rounded-xl bg-surface">
                  <button
                    type="button"
                    className="block w-full"
                    onClick={() =>
                      lightbox.open(
                        images.map((x) => ({ src: x.url, name: x.filename, blob: x.blob })),
                        i,
                      )
                    }
                  >
                    <SmoothImage
                      src={img.url}
                      className="aspect-square bg-[repeating-conic-gradient(#f1f1f1_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]"
                    />
                  </button>
                  <figcaption className="flex items-center gap-1 p-2">
                    <span className="min-w-0 flex-1 truncate text-[11px] text-muted-foreground">
                      {page.page} {img.page} · {img.width}×{img.height}
                    </span>
                    <button
                      type="button"
                      aria-label={c.common.downloadButton}
                      onClick={() => downloadBlob(img.blob, img.filename)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-background text-primary shadow-soft"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          <ActionBar
            onReset={() => setFile(null)}
            resetLabel={c.common.newButton}
            result={zip}
            busy={busy}
            primaryLabel={images.length > 1 ? c.common.downloadAll : c.common.downloadButton}
            primaryIcon={<Images className="h-4 w-4" />}
          />
        </div>
      )}
      {lightbox.node}
    </ToolPage>
  );
}
