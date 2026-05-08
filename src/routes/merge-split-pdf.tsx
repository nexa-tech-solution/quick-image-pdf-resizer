import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Download, FileStack, GripVertical, Loader2, X } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { FileDropzone } from "@/components/site/FileDropzone";
import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { ToolPage } from "@/components/site/ToolPage";
import { ToolSeoContent } from "@/components/site/ToolSeoContent";
import { downloadBlob, formatBytes } from "@/lib/image";
import { getBrowserLocale, getTranslationSet, useLocale } from "@/lib/i18n";
import {
  buildPdfFromPages,
  formatPdfPageLabel,
  loadPdfWithThumbnails,
  organizedPdfFilename,
} from "@/lib/pdf";
import { createRouteHead } from "@/lib/seo";
import { pdfAccept, revokeUrl } from "@/lib/tool-files";

type PdfStatus = "reading" | "ready" | "error";

export type PdfSourceItem = {
  id: string;
  file: File;
  bytes?: Uint8Array;
  pageCount?: number;
  status: PdfStatus;
  error?: string;
};

export type PdfPageItem = {
  id: string;
  sourceId: string;
  fileName: string;
  pageIndex: number;
  thumbnailUrl?: string;
  status: PdfStatus;
};

export const Route = createFileRoute("/merge-split-pdf")({
  head: () => {
    const locale = getBrowserLocale();
    const t = getTranslationSet(locale);

    return createRouteHead({
      t,
      locale,
      routeKey: "mergeSplitPdf",
    });
  },
  component: MergeSplitPdf,
});

function MergeSplitPdf() {
  const { t } = useLocale();
  const page = t.routes.mergeSplitPdf;
  const [sources, setSources] = useState<PdfSourceItem[]>([]);
  const [pages, setPages] = useState<PdfPageItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const pagesRef = useRef<PdfPageItem[]>([]);
  const loadVersionRef = useRef(0);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);

  useEffect(() => () => cleanupPages(pagesRef.current), []);

  const reading = sources.some((source) => source.status === "reading");
  const readySources = sources.filter((source) => source.status === "ready");
  const totalBytes = sources.reduce((sum, source) => sum + source.file.size, 0);
  const totalSourcePages = readySources.reduce((sum, source) => sum + (source.pageCount ?? 0), 0);

  const addFiles = async (files: File[]) => {
    setExportError(null);
    const loadVersion = loadVersionRef.current;

    for (const file of files) {
      if (loadVersion !== loadVersionRef.current) break;

      const sourceId = `${file.name}-${file.size}-${file.lastModified}-${makeId()}`;
      const source: PdfSourceItem = {
        id: sourceId,
        file,
        status: "reading",
      };

      setSources((current) => [...current, source]);

      try {
        const result = await loadPdfWithThumbnails(file);
        if (loadVersion !== loadVersionRef.current) continue;

        const nextPages = result.thumbnails.map((thumbnail, index): PdfPageItem => {
          const thumbnailUrl = URL.createObjectURL(thumbnail);
          return {
            id: `${sourceId}-page-${index}`,
            sourceId,
            fileName: file.name,
            pageIndex: index,
            thumbnailUrl,
            status: "ready",
          };
        });

        setSources((current) =>
          current.map((candidate) =>
            candidate.id === sourceId
              ? {
                  ...candidate,
                  bytes: result.bytes,
                  pageCount: result.pageCount,
                  status: "ready",
                }
              : candidate,
          ),
        );
        setPages((current) => [...current, ...nextPages]);
      } catch {
        if (loadVersion !== loadVersionRef.current) continue;

        setSources((current) =>
          current.map((candidate) =>
            candidate.id === sourceId
              ? { ...candidate, status: "error", error: page.pdfError }
              : candidate,
          ),
        );
      }
    }
  };

  const removePage = (id: string) => {
    setPages((current) => {
      const target = current.find((item) => item.id === id);
      revokeUrl(target?.thumbnailUrl);
      return current.filter((item) => item.id !== id);
    });
  };

  const removeAll = () => {
    loadVersionRef.current += 1;
    cleanupPages(pagesRef.current);
    setSources([]);
    setPages([]);
    setExportError(null);
    setBusy(false);
  };

  const movePage = (from: number, to: number) => {
    if (from === to) return;
    setPages((current) => {
      if (to < 0 || to >= current.length) return current;
      const next = [...current];
      const [item] = next.splice(from, 1);
      if (!item) return current;
      next.splice(to, 0, item);
      return next;
    });
  };

  const exportPdf = async () => {
    if (pages.length === 0 || reading) return;

    const sourceMap = new Map(
      sources
        .filter((source): source is PdfSourceItem & { bytes: Uint8Array } => Boolean(source.bytes))
        .map((source) => [source.id, source]),
    );

    setBusy(true);
    setExportError(null);

    try {
      const output = await buildPdfFromPages(
        pages.map((item) => {
          const source = sourceMap.get(item.sourceId);
          if (!source) throw new Error("Missing PDF source");
          return { bytes: source.bytes, pageIndex: item.pageIndex };
        }),
      );
      const filename =
        readySources.length === 1 ? organizedPdfFilename(readySources[0]?.file.name) : "merged.pdf";
      downloadBlob(new Blob([output as BlobPart], { type: "application/pdf" }), filename);
    } catch {
      setExportError(page.exportError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      <SeoJsonLd routeKey="mergeSplitPdf" tool="mergeSplitPdf" />
      <FileDropzone
        accept={pdfAccept}
        multiple
        onFiles={addFiles}
        title={sources.length === 0 ? page.dropTitleEmpty : page.dropTitleFilled}
        hint={page.hint}
        disabled={reading}
      />

      {sources.length > 0 && (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-surface-elevated p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">{page.organizer}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {readySources.length} {page.files} · {totalSourcePages} {page.pages} ·{" "}
                    {formatBytes(totalBytes)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeAll}
                  className="text-xs font-medium text-muted-foreground hover:text-destructive"
                >
                  {page.removeAll}
                </button>
              </div>

              {sources.some((source) => source.status === "error") && (
                <div className="mt-4 space-y-2">
                  {sources
                    .filter((source) => source.status === "error")
                    .map((source) => (
                      <div
                        key={source.id}
                        className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                      >
                        <span className="font-medium">{source.file.name}: </span>
                        {source.error ?? page.pdfError}
                      </div>
                    ))}
                </div>
              )}

              {reading && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {page.readingPdf}
                </div>
              )}
            </div>

            {pages.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {pages.map((item, index) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(event) => {
                      setDragIndex(index);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", String(index));
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      const from = Number(event.dataTransfer.getData("text/plain"));
                      if (Number.isInteger(from)) movePage(from, index);
                      setDragIndex(null);
                    }}
                    onDragEnd={() => setDragIndex(null)}
                    className={`overflow-hidden rounded-xl border bg-surface-elevated transition ${
                      dragIndex === index
                        ? "border-primary bg-primary-soft opacity-70"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="aspect-[3/4] bg-background">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={formatPdfPageLabel(item.fileName, item.pageIndex)}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <FileStack className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="border-t border-border p-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{item.fileName}</div>
                          <div className="mt-0.5 text-xs text-muted-foreground">
                            {page.page} {item.pageIndex + 1}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePage(item.id)}
                          aria-label={page.removePage}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => movePage(index, index - 1)}
                          disabled={index === 0}
                          draggable={false}
                          aria-label={page.moveUp}
                          className="inline-flex items-center justify-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs font-medium hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                          {page.up}
                        </button>
                        <button
                          type="button"
                          onClick={() => movePage(index, index + 1)}
                          disabled={index === pages.length - 1}
                          draggable={false}
                          aria-label={page.moveDown}
                          className="inline-flex items-center justify-center gap-1 rounded-md border border-border px-2 py-1.5 text-xs font-medium hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                          {page.down}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              !reading && (
                <div className="rounded-2xl border border-border bg-surface-elevated p-8 text-center text-sm text-muted-foreground">
                  {page.noPages}
                </div>
              )
            )}
          </div>

          <div className="h-fit space-y-4 rounded-2xl border border-border bg-surface-elevated p-5">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {page.output}
              </div>
              <div className="mt-2 font-display text-3xl font-bold text-primary">
                {pages.length}
              </div>
              <div className="text-sm text-muted-foreground">{page.selectedPages}</div>
            </div>

            {exportError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {exportError}
              </div>
            )}

            <button
              type="button"
              onClick={exportPdf}
              disabled={busy || reading || pages.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {page.exportButton}
            </button>
            <p className="text-xs text-muted-foreground">{page.exportHint}</p>
          </div>
        </div>
      )}
      <ToolSeoContent tool="mergeSplitPdf" />
    </ToolPage>
  );
}

function cleanupPages(pages: PdfPageItem[]) {
  pages.forEach((page) => revokeUrl(page.thumbnailUrl));
}

function makeId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}
