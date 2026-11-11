import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileText, Loader2, RefreshCw, Crown } from "lucide-react";
import { FileDropzone } from "@/components/site/FileDropzone";
import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { ShareButton } from "@/components/site/ShareButton";
import { ToolPage } from "@/components/site/ToolPage";
import { ToolSeoContent } from "@/components/site/ToolSeoContent";
import { getBrowserLocale, getTranslationSet, useLocale } from "@/lib/i18n";
import { downloadBlob, formatBytes } from "@/lib/image";
import { compressPdf, compressedPdfFilename, type PdfCompressionLevel } from "@/lib/pdf";
import { createRouteHead } from "@/lib/seo";
import { pdfAccept } from "@/lib/tool-files";
import { cn } from "@/lib/utils";
import { requireProFeature } from "@/lib/pro";
import { useNativeApp } from "@/hooks/use-native-app";

export const Route = createFileRoute("/compress-pdf")({
  head: () => {
    const locale = getBrowserLocale();
    const t = getTranslationSet(locale);
    return createRouteHead({ t, locale, routeKey: "compressPdf" });
  },
  component: CompressPdfPage,
});

type Result = { blob: Blob; filename: string; pageCount: number };

function CompressPdfPage() {
  const { t } = useLocale();
  const page = t.routes.compressPdf;
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<PdfCompressionLevel>("medium");
  const nativeApp = useNativeApp();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Re-run whenever the file or level changes so the size updates live.
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setBusy(true);
    setError(null);
    setResult(null);

    compressPdf(file, level, (current, total) => {
      if (!cancelled) setProgress({ current, total });
    })
      .then(({ blob, pageCount }) => {
        if (!cancelled) setResult({ blob, pageCount, filename: compressedPdfFilename(file.name) });
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
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
  }, [file, level]);

  const levels: { id: PdfCompressionLevel; label: string; desc: string }[] = [
    { id: "low", label: page.levelLow, desc: page.levelLowDesc },
    { id: "medium", label: page.levelMedium, desc: page.levelMediumDesc },
    { id: "high", label: page.levelHigh, desc: page.levelHighDesc },
  ];

  const saved = file && result ? Math.round((1 - result.blob.size / file.size) * 100) : null;

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      <SeoJsonLd routeKey="compressPdf" tool="compressPdf" />

      {!file ? (
        <FileDropzone
          accept={pdfAccept}
          onFiles={([next]) => next && setFile(next)}
          title={page.dropTitle}
          hint={page.hint}
        />
      ) : (
        <div className="fade-in space-y-4">
          {/* File + before/after sizes */}
          <div className="flex items-center gap-3 rounded-2xl bg-surface p-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <FileText className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{file.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {formatBytes(file.size)}
                {result && (
                  <>
                    {" → "}
                    <span className="font-semibold text-foreground">
                      {formatBytes(result.blob.size)}
                    </span>
                    {" · "}
                    {result.pageCount} {page.pages}
                  </>
                )}
              </div>
            </div>
            {saved !== null && (
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold",
                  saved > 0 ? "bg-success/15 text-success" : "bg-amber-100 text-amber-700",
                )}
              >
                {saved > 0 ? `-${saved}%` : `+${Math.abs(saved)}%`}
              </span>
            )}
          </div>

          {/* Progress */}
          {busy && (
            <div className="rounded-2xl bg-surface p-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                {page.compressing}
                {progress && ` ${progress.current}/${progress.total}`}
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: progress ? `${(progress.current / progress.total) * 100}%` : "5%",
                  }}
                />
              </div>
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {saved !== null && saved <= 0 && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
              {page.largerHint}
            </p>
          )}

          {/* Level picker */}
          <section className="rounded-2xl bg-surface p-3">
            <h2 className="mb-2.5 px-0.5 text-sm font-semibold">{page.levelLabel}</h2>
            <div className="grid grid-cols-3 gap-2">
              {levels.map((item) => {
                const active = item.id === level;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      if (item.id === "high" && !requireProFeature("pdf-strong")) return;
                      setLevel(item.id);
                    }}
                    className={cn(
                      "rounded-xl px-2 py-3 text-center transition disabled:opacity-60",
                      active
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "bg-background shadow-soft hover:bg-primary-soft",
                    )}
                  >
                    <div className="flex items-center justify-center gap-1 text-sm font-semibold">
                      {item.label}
                      {item.id === "high" && nativeApp.isNative && !nativeApp.isPro && (
                        <Crown className="h-3.5 w-3.5" aria-label="Pro" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "mt-0.5 text-[11px]",
                        active ? "text-primary-foreground/85" : "text-muted-foreground",
                      )}
                    >
                      {item.desc}
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 px-0.5 text-[11px] leading-snug text-muted-foreground">
              {page.textHint}
            </p>
          </section>

          <div className="mobile-cta flex gap-2">
            <button
              type="button"
              aria-label={page.newButton}
              onClick={() => setFile(null)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-secondary"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <ShareButton
              disabled={!result}
              getFiles={() => (result ? [{ blob: result.blob, filename: result.filename }] : [])}
            />
            <button
              type="button"
              disabled={!result || busy}
              onClick={() => result && downloadBlob(result.blob, result.filename)}
              className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50"
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
      )}

      <ToolSeoContent tool="compressPdf" />
    </ToolPage>
  );
}
