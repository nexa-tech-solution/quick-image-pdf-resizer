import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { FileDropzone } from "@/components/site/FileDropzone";
import { ToolPage } from "@/components/site/ToolPage";
import { ActionBar, FileCard, Notice, ProgressBox } from "@/components/site/ToolBits";
import { getBrowserLocale, getTranslationSet } from "@/lib/i18n";
import {
  baseName,
  extractPdfParagraphs,
  paragraphsToDocx,
  PdfPasswordError,
  type DocParagraph,
} from "@/lib/pdf-tools";
import { createRouteHead } from "@/lib/seo";
import { pdfAccept } from "@/lib/tool-files";
import { useV3Copy } from "@/lib/tools-v3";

export const Route = createFileRoute("/pdf-to-word")({
  head: () => {
    const locale = getBrowserLocale();
    return createRouteHead({ t: getTranslationSet(locale), locale, routeKey: "pdfToWord" });
  },
  component: PdfToWordPage,
});

type Result = { blob: Blob; filename: string; paragraphs: DocParagraph[]; pageCount: number };

function PdfToWordPage() {
  const c = useV3Copy();
  const page = c.pdfToWord;
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setBusy(true);
    setError(null);
    setEmpty(false);
    setResult(null);

    (async () => {
      const { paragraphs, pageCount } = await extractPdfParagraphs(file, (current, total) => {
        if (!cancelled) setProgress({ current, total });
      });
      if (cancelled) return;
      if (paragraphs.length === 0) {
        setEmpty(true);
        return;
      }
      const title = baseName(file.name);
      const blob = await paragraphsToDocx(paragraphs, title);
      if (!cancelled) setResult({ blob, filename: `${title}.docx`, paragraphs, pageCount });
    })()
      .catch((err: unknown) => {
        if (!cancelled)
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      <SeoJsonLd routeKey="pdfToWord" />
      {!file ? (
        <div className="space-y-3">
          <FileDropzone
            accept={pdfAccept}
            onFiles={([next]) => next && setFile(next)}
            title={c.common.dropPdf}
            hint={c.common.pdfHint}
          />
          <Notice tone="info">{page.limits}</Notice>
        </div>
      ) : (
        <div className="space-y-4">
          <FileCard
            name={file.name}
            size={file.size}
            extra={
              result
                ? ` · ${result.pageCount} ${c.common.pages} · ${result.paragraphs.length} ${page.paragraphs}`
                : null
            }
          />
          {busy && <ProgressBox label={page.converting} progress={progress} />}
          {error && <Notice>{error}</Notice>}
          {empty && <Notice tone="warn">{page.noText}</Notice>}

          {result && (
            <section className="rounded-2xl bg-surface p-3">
              <h2 className="mb-2 px-0.5 text-sm font-semibold">{page.preview}</h2>
              <div className="max-h-80 space-y-2 overflow-y-auto rounded-xl bg-background p-3 text-sm leading-6 shadow-soft">
                {result.paragraphs.slice(0, 40).map((p, i) => (
                  <p key={i} className="break-words">
                    {p.text}
                  </p>
                ))}
                {result.paragraphs.length > 40 && <p className="text-muted-foreground">…</p>}
              </div>
              <p className="mt-2 px-0.5 text-[11px] leading-snug text-muted-foreground">
                {page.limits}
              </p>
            </section>
          )}

          <ActionBar
            onReset={() => setFile(null)}
            resetLabel={c.common.newButton}
            result={result}
            busy={busy}
            primaryLabel={c.common.downloadButton}
          />
        </div>
      )}
    </ToolPage>
  );
}
