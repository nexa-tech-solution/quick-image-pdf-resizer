import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileUp, FileText } from "lucide-react";
import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { ToolPage } from "@/components/site/ToolPage";
import { ActionBar, Notice, Segmented } from "@/components/site/ToolBits";
import { getBrowserLocale, getTranslationSet } from "@/lib/i18n";
import { downloadBlob } from "@/lib/image";
import { baseName, pageSizes, textToPdf, type PageSizeId } from "@/lib/pdf-tools";
import { createRouteHead } from "@/lib/seo";
import { useV3Copy } from "@/lib/tools-v3";

export const Route = createFileRoute("/text-to-pdf")({
  head: () => {
    const locale = getBrowserLocale();
    return createRouteHead({ t: getTranslationSet(locale), locale, routeKey: "textToPdf" });
  },
  component: TextToPdfPage,
});

const margins = { small: 36, normal: 56, large: 80 } as const;
type MarginId = keyof typeof margins;

function TextToPdfPage() {
  const c = useV3Copy();
  const page = c.textToPdf;
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [name, setName] = useState("document");
  const [pageSize, setPageSize] = useState<PageSizeId>("a4");
  const [fontSize, setFontSize] = useState(12);
  const [margin, setMargin] = useState<MarginId>("normal");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; filename: string; pageCount: number } | null>(
    null,
  );

  // Any edit invalidates the previous PDF.
  const touch = () => setResult(null);

  async function openTxt(file: File) {
    setText(await file.text());
    setName(baseName(file.name));
    touch();
  }

  async function create() {
    if (!text.trim()) {
      setError(page.emptyError);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const filename = `${(name.trim() || "document").replace(/[\\/:*?"<>|]/g, "_")}.pdf`;
      const { blob, pageCount } = await textToPdf(text, {
        pageSize,
        fontSize,
        margin: margins[margin],
        title: name,
      });
      const next = { blob, filename, pageCount };
      setResult(next);
      downloadBlob(blob, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      <SeoJsonLd routeKey="textToPdf" />
      <div className="space-y-4">
        <div className="rounded-2xl bg-surface p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="px-0.5 text-xs text-muted-foreground">
              {text.length.toLocaleString()} {page.chars}
            </span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-8 items-center gap-1.5 rounded-lg bg-background px-3 text-xs font-semibold shadow-soft hover:bg-primary-soft"
            >
              <FileUp className="h-4 w-4 text-primary" />
              {page.openTxt}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".txt,.md,.csv,text/plain"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void openTxt(f);
                e.currentTarget.value = "";
              }}
            />
          </div>
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              touch();
            }}
            placeholder={page.placeholder}
            rows={12}
            className="w-full resize-y rounded-xl border border-border bg-background p-3 text-sm leading-6 outline-none focus:border-primary"
          />
        </div>

        <section className="space-y-3 rounded-2xl bg-surface p-3">
          <label className="block">
            <span className="mb-1.5 block px-0.5 text-xs font-semibold text-muted-foreground">
              {page.filename}
            </span>
            <div className="flex items-center rounded-lg border border-border bg-background pr-3">
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  touch();
                }}
                className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
              />
              <span className="text-sm text-muted-foreground">.pdf</span>
            </div>
          </label>
          <Segmented
            label={page.pageSize}
            value={pageSize}
            onChange={(v) => {
              setPageSize(v);
              touch();
            }}
            options={(Object.keys(pageSizes) as PageSizeId[]).map((id) => ({
              id,
              label: pageSizes[id].label,
            }))}
          />
          <Segmented
            label={page.fontSize}
            value={fontSize}
            onChange={(v) => {
              setFontSize(v);
              touch();
            }}
            options={[10, 12, 14, 16, 20].map((id) => ({ id, label: String(id) }))}
          />
          <Segmented
            label={page.margin}
            value={margin}
            onChange={(v) => {
              setMargin(v);
              touch();
            }}
            options={[
              { id: "small", label: page.marginSmall },
              { id: "normal", label: page.marginNormal },
              { id: "large", label: page.marginLarge },
            ]}
          />
        </section>

        {error && <Notice>{error}</Notice>}
        {result && (
          <Notice tone="ok">
            {result.filename} · {result.pageCount} {c.common.pages}
          </Notice>
        )}

        <ActionBar
          onReset={() => {
            setText("");
            setResult(null);
            setError(null);
          }}
          resetLabel={c.common.newButton}
          result={result}
          busy={busy}
          primaryLabel={result ? c.common.downloadButton : page.createButton}
          primaryIcon={result ? undefined : <FileText className="h-4 w-4" />}
          primaryDisabled={busy || !text.trim()}
          onPrimary={
            result ? () => downloadBlob(result.blob, result.filename) : () => void create()
          }
        />
      </div>
    </ToolPage>
  );
}
