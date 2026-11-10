import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Camera,
  Check,
  FileDown,
  ImagePlus,
  Maximize,
  Pencil,
  RotateCw,
  Trash2,
  Wand2,
} from "lucide-react";
import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { ToolPage } from "@/components/site/ToolPage";
import { Notice, ProgressBox, Segmented } from "@/components/site/ToolBits";
import { ShareButton } from "@/components/site/ShareButton";
import { getBrowserLocale, getTranslationSet } from "@/lib/i18n";
import { downloadBlob } from "@/lib/image";
import {
  applyScanFilter,
  canvasToBlob,
  detectDocumentQuad,
  fullQuad,
  loadScanSource,
  rotateCanvas,
  scansToPdf,
  warpQuad,
  type Quad,
  type ScanFilter,
} from "@/lib/scan";
import { createRouteHead } from "@/lib/seo";
import { useV3Copy } from "@/lib/tools-v3";
import { makeZipBlob } from "@/lib/zip";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/scan-document")({
  head: () => {
    const locale = getBrowserLocale();
    return createRouteHead({ t: getTranslationSet(locale), locale, routeKey: "scanDocument" });
  },
  component: ScanDocumentPage,
});

type ScanPage = {
  id: string;
  source: HTMLCanvasElement;
  sourceUrl: string;
  autoQuad: Quad;
  quad: Quad;
  rotation: number;
  /** Warped + rotated, before filter — cached so filter changes are cheap. */
  flat?: HTMLCanvasElement;
  output?: Blob;
  outputUrl?: string;
};

let idSeq = 0;

function ScanDocumentPage() {
  const c = useV3Copy();
  const page = c.scanDocument;
  const cameraRef = useRef<HTMLInputElement>(null);
  const pickRef = useRef<HTMLInputElement>(null);
  const [pages, setPages] = useState<ScanPage[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [filter, setFilter] = useState<ScanFilter>("enhance");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdf, setPdf] = useState<{ blob: Blob; filename: string } | null>(null);
  const pagesRef = useRef(pages);
  pagesRef.current = pages;

  // Revoke object URLs on unmount.
  useEffect(
    () => () =>
      pagesRef.current.forEach((p) => {
        URL.revokeObjectURL(p.sourceUrl);
        if (p.outputUrl) URL.revokeObjectURL(p.outputUrl);
      }),
    [],
  );

  async function render(p: ScanPage, f: ScanFilter, rewarp: boolean): Promise<ScanPage> {
    const flat = rewarp || !p.flat ? rotateCanvas(warpQuad(p.source, p.quad), p.rotation) : p.flat;
    const output = await canvasToBlob(
      applyScanFilter(flat, f),
      "image/jpeg",
      f === "bw" ? 0.8 : 0.88,
    );
    if (p.outputUrl) URL.revokeObjectURL(p.outputUrl);
    return { ...p, flat, output, outputUrl: URL.createObjectURL(output) };
  }

  async function addFiles(files: File[]) {
    setError(null);
    setPdf(null);
    setBusy(page.detecting);
    try {
      let lastId: string | null = null;
      for (const file of files) {
        const source = await loadScanSource(file);
        const autoQuad = detectDocumentQuad(source);
        const sourceBlob = await canvasToBlob(source, "image/jpeg", 0.85);
        const id = `scan-${++idSeq}`;
        const p: ScanPage = {
          id,
          source,
          sourceUrl: URL.createObjectURL(sourceBlob),
          autoQuad,
          quad: autoQuad,
          rotation: 0,
        };
        const rendered = await render(p, filter, true);
        setPages((prev) => [...prev, rendered]);
        lastId = id;
      }
      // Single photo → open the corner editor straight away.
      if (files.length === 1 && lastId) setEditing(lastId);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function updatePage(id: string, patch: Partial<ScanPage>, rewarp = true) {
    setPdf(null);
    const current = pagesRef.current.find((p) => p.id === id);
    if (!current) return;
    const next = await render({ ...current, ...patch }, filter, rewarp);
    setPages((prev) => prev.map((p) => (p.id === id ? next : p)));
  }

  async function changeFilter(f: ScanFilter) {
    setFilter(f);
    setPdf(null);
    setBusy(c.common.working);
    const next = await Promise.all(pagesRef.current.map((p) => render(p, f, false)));
    setPages(next);
    setBusy(null);
  }

  function removePage(id: string) {
    setPdf(null);
    setPages((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) {
        URL.revokeObjectURL(target.sourceUrl);
        if (target.outputUrl) URL.revokeObjectURL(target.outputUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
  }

  async function savePdf() {
    setBusy(c.common.working);
    try {
      const blob = await scansToPdf(pages.map((p) => p.output!).filter(Boolean));
      const stamp = new Date().toISOString().slice(0, 16).replace(/[-:T]/g, "");
      const next = { blob, filename: `scan-${stamp}.pdf` };
      setPdf(next);
      downloadBlob(next.blob, next.filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function saveJpg() {
    const outputs = pages.filter((p) => p.output);
    if (outputs.length === 1) {
      downloadBlob(outputs[0].output!, "scan.jpg");
      return;
    }
    const zip = await makeZipBlob(
      outputs.map((p, i) => ({
        name: `scan-${String(i + 1).padStart(2, "0")}.jpg`,
        blob: p.output!,
      })),
    );
    downloadBlob(zip, "scan.zip");
  }

  const editPage = pages.find((p) => p.id === editing);

  const inputs = (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.currentTarget.value = "";
          if (files.length) void addFiles(files);
        }}
      />
      <input
        ref={pickRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          e.currentTarget.value = "";
          if (files.length) void addFiles(files);
        }}
      />
    </>
  );

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      <SeoJsonLd routeKey="scanDocument" />
      {inputs}

      {editPage ? (
        <CornerEditor
          key={editPage.id}
          page={editPage}
          labels={page}
          onDone={async (quad) => {
            setBusy(c.common.working);
            await updatePage(editPage.id, { quad });
            setBusy(null);
            setEditing(null);
          }}
        />
      ) : pages.length === 0 ? (
        <div
          className="space-y-3"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const files = Array.from(e.dataTransfer.files).filter((f) =>
              f.type.startsWith("image/"),
            );
            if (files.length) void addFiles(files);
          }}
        >
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex h-40 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary-soft/40 text-primary transition hover:bg-primary-soft"
          >
            <Camera className="h-10 w-10" />
            <span className="text-base font-semibold">{page.takePhoto}</span>
          </button>
          <button
            type="button"
            onClick={() => pickRef.current?.click()}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-surface text-sm font-semibold transition hover:bg-secondary"
          >
            <ImagePlus className="h-5 w-5 text-primary" />
            {page.choosePhoto}
          </button>
          <p className="hidden text-center text-xs text-muted-foreground sm:block">
            {page.dropHint}
          </p>
          {busy && <ProgressBox label={busy} />}
          {error && <Notice>{error}</Notice>}
        </div>
      ) : (
        <div className="space-y-4">
          <section className="rounded-2xl bg-surface p-3">
            <Segmented
              label={page.filter}
              value={filter}
              onChange={(f) => void changeFilter(f)}
              options={[
                { id: "original", label: page.filterOriginal },
                { id: "enhance", label: page.filterEnhance },
                { id: "gray", label: page.filterGray },
                { id: "bw", label: page.filterBw },
              ]}
            />
          </section>

          {busy && <ProgressBox label={busy} />}
          {error && <Notice>{error}</Notice>}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {pages.map((p, i) => (
              <figure key={p.id} className="overflow-hidden rounded-xl bg-surface">
                <div className="relative flex aspect-[3/4] items-center justify-center bg-secondary p-2">
                  {p.outputUrl && (
                    <img
                      src={p.outputUrl}
                      alt=""
                      className="max-h-full max-w-full rounded object-contain shadow-soft"
                    />
                  )}
                  <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[11px] font-bold">
                    {i + 1}
                  </span>
                </div>
                <figcaption className="flex justify-between gap-1 p-1.5">
                  <IconBtn label={page.edit} onClick={() => setEditing(p.id)}>
                    <Pencil className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn
                    label={page.rotate}
                    onClick={() => void updatePage(p.id, { rotation: (p.rotation + 1) % 4 })}
                  >
                    <RotateCw className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label={page.remove} onClick={() => removePage(p.id)} danger>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </figcaption>
              </figure>
            ))}
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <Camera className="h-7 w-7" />
              {page.addPage}
            </button>
          </div>

          <div className="mobile-cta flex gap-2">
            <button
              type="button"
              aria-label={page.choosePhoto}
              onClick={() => pickRef.current?.click()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-secondary"
            >
              <ImagePlus className="h-5 w-5" />
            </button>
            <ShareButton disabled={!pdf} getFiles={() => (pdf ? [pdf] : [])} />
            <button
              type="button"
              disabled={!!busy}
              onClick={() => void saveJpg()}
              className="flex h-12 shrink-0 items-center justify-center rounded-xl border border-border px-3 text-sm font-semibold transition hover:bg-secondary disabled:opacity-50"
            >
              {page.saveJpg}
            </button>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => void savePdf()}
              className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50"
            >
              <FileDown className="h-4 w-4" />
              {page.savePdf} ({pages.length})
            </button>
          </div>
        </div>
      )}
    </ToolPage>
  );
}

function IconBtn({
  label,
  onClick,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "flex h-8 flex-1 items-center justify-center rounded-lg bg-background shadow-soft transition hover:bg-primary-soft",
        danger ? "text-destructive" : "text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/** Image with 4 draggable corner handles. Coordinates are in source-image pixels via the SVG viewBox. */
function CornerEditor({
  page,
  labels,
  onDone,
}: {
  page: ScanPage;
  labels: ReturnType<typeof useV3Copy>["scanDocument"];
  onDone: (quad: Quad) => void | Promise<void>;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [quad, setQuad] = useState<Quad>(page.quad);
  const [drag, setDrag] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const w = page.source.width;
  const h = page.source.height;
  const r = Math.max(w, h) / 32;

  function toImage(e: PointerEvent) {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: Math.max(0, Math.min(w, p.x)), y: Math.max(0, Math.min(h, p.y)) };
  }

  return (
    <div className="space-y-3">
      <p className="text-center text-xs text-muted-foreground">{labels.adjustHint}</p>
      <div className="relative mx-auto w-fit max-w-full overflow-hidden rounded-xl bg-black">
        <img
          src={page.sourceUrl}
          alt=""
          className="block max-h-[62vh] w-auto max-w-full select-none"
          draggable={false}
        />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full touch-none"
          onPointerMove={(e) => {
            if (drag === null) return;
            const p = toImage(e);
            setQuad((q) => q.map((pt, i) => (i === drag ? p : pt)) as Quad);
          }}
          onPointerUp={() => setDrag(null)}
          onPointerCancel={() => setDrag(null)}
        >
          <path
            d={`M0 0H${w}V${h}H0Z M${quad.map((p) => `${p.x} ${p.y}`).join(" L")}Z`}
            fill="rgba(0,0,0,0.45)"
            fillRule="evenodd"
          />
          <polygon
            points={quad.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="var(--primary, #e11d48)"
            strokeWidth={r / 6}
          />
          {quad.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={r}
              fill="rgba(255,255,255,0.35)"
              stroke="#fff"
              strokeWidth={r / 5}
              className="cursor-grab"
              onPointerDown={(e) => {
                e.currentTarget.ownerSVGElement?.setPointerCapture(e.pointerId);
                setDrag(i);
              }}
            />
          ))}
        </svg>
      </div>

      <div className="mobile-cta flex gap-2">
        <button
          type="button"
          onClick={() => setQuad(page.autoQuad)}
          className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border text-sm font-semibold transition hover:bg-secondary"
        >
          <Wand2 className="h-4 w-4 text-primary" />
          {labels.autoDetect}
        </button>
        <button
          type="button"
          onClick={() => setQuad(fullQuad(w, h))}
          className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border text-sm font-semibold transition hover:bg-secondary"
        >
          <Maximize className="h-4 w-4 text-primary" />
          {labels.fullImage}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={async () => {
            setSaving(true);
            await onDone(quad);
          }}
          className="flex h-12 flex-[1.4] items-center justify-center gap-1.5 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          {labels.done}
        </button>
      </div>
    </div>
  );
}
