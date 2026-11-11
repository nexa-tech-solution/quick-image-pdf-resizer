import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer, RefreshCw, Wand2 } from "lucide-react";
import { CameraCaptureButton } from "@/components/site/CameraCaptureButton";
import { FileDropzone } from "@/components/site/FileDropzone";
import { ShareButton } from "@/components/site/ShareButton";
import { ToolPage } from "@/components/site/ToolPage";
import { Notice, ProgressBox } from "@/components/site/ToolBits";
import { getBrowserLocale } from "@/lib/i18n";
import { downloadBlob } from "@/lib/image";
import {
  analyzeSubject,
  autoFit,
  canvasToJpeg,
  ID_PHOTO_BACKGROUNDS,
  ID_PHOTO_SPECS,
  renderPhoto,
  renderPrintSheet,
  segmentPortrait,
  type IdPhotoSpec,
  type Placement,
  type Subject,
} from "@/lib/id-photo";
import { getIdPhotoCopy, useIdPhotoCopy } from "@/lib/id-photo-copy";
import { consumeProToolTrial } from "@/lib/pro";
import { imageAccept } from "@/lib/tool-files";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/id-photo")({
  head: () => {
    const c = getIdPhotoCopy(getBrowserLocale());
    return {
      meta: [
        { title: `${c.seoTitle} | Resize Image` },
        { name: "description", content: c.description },
        { property: "og:title", content: c.seoTitle },
        { property: "og:description", content: c.description },
      ],
    };
  },
  component: IdPhotoPage,
});

type Stage = "pick" | "processing" | "edit";

function IdPhotoPage() {
  const c = useIdPhotoCopy();
  const [stage, setStage] = useState<Stage>("pick");
  const [error, setError] = useState<string | null>(null);
  const [cutout, setCutout] = useState<HTMLCanvasElement | null>(null);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [spec, setSpec] = useState<IdPhotoSpec>(ID_PHOTO_SPECS[0]!);
  const [bg, setBg] = useState<string>(ID_PHOTO_BACKGROUNDS[0].color);
  const [base, setBase] = useState<Placement | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [sourceName, setSourceName] = useState("photo");

  const reset = () => {
    setStage("pick");
    setError(null);
    setCutout(null);
    setSubject(null);
    setPlacement(null);
    setBase(null);
    setUnlocked(false);
  };

  const fit = useCallback((s: Subject | null, sp: IdPhotoSpec, cut: HTMLCanvasElement | null) => {
    if (!cut) return;
    const p = s
      ? autoFit(s, sp)
      : autoFit({ top: 0, chin: cut.height * 0.6, centerX: cut.width / 2 }, sp);
    setBase(p);
    setPlacement(p);
    setZoom(1);
  }, []);

  async function onFiles(files: File[]) {
    const file = files[0];
    if (!file) return;
    setSourceName(file.name.replace(/\.[^.]+$/, "") || "photo");
    setError(null);
    setStage("processing");
    try {
      const cut = await segmentPortrait(file);
      const s = analyzeSubject(cut);
      if (!s) {
        setError(c.noPerson);
        setStage("pick");
        return;
      }
      setCutout(cut);
      setSubject(s);
      fit(s, spec, cut);
      setStage("edit");
    } catch (err) {
      console.warn("ID photo segmentation failed", err);
      setError(c.error);
      setStage("pick");
    }
  }

  // Re-fit when the size changes.
  useEffect(() => {
    if (stage === "edit") fit(subject, spec, cutout);
  }, [spec]); // eslint-disable-line react-hooks/exhaustive-deps

  const onZoom = (z: number) => {
    if (!base || !placement) return;
    const { width, height } = previewSize(spec);
    const cx = width / 2;
    const cy = height / 2;
    const nextScale = base.scale * z;
    const k = nextScale / placement.scale;
    setPlacement({
      scale: nextScale,
      x: cx - (cx - placement.x) * k,
      y: cy - (cy - placement.y) * k,
    });
    setZoom(z);
  };

  async function save(kind: "photo" | "sheet") {
    if (!cutout || !placement) return;
    if (!unlocked) {
      if (!consumeProToolTrial("id-photo")) return;
      setUnlocked(true);
    }
    setBusy(true);
    try {
      const photo = renderPhoto(cutout, spec, placement, bg);
      if (kind === "photo") {
        downloadBlob(await canvasToJpeg(photo), `${sourceName}-id-${spec.id}.jpg`);
      } else {
        const { canvas } = renderPrintSheet(photo);
        downloadBlob(await canvasToJpeg(canvas), `${sourceName}-id-${spec.id}-print-10x15.jpg`);
      }
    } finally {
      setBusy(false);
    }
  }

  const sheetCount = useMemo(() => {
    if (!cutout || !placement) return 0;
    return renderPrintSheet(renderPhoto(cutout, spec, placement, bg, 30), 30).count;
  }, [cutout, spec, placement, bg]);

  return (
    <ToolPage eyebrow={c.title} title={c.title} description={c.intro}>
      {stage === "pick" && (
        <div className="space-y-3">
          {error && <Notice>{error}</Notice>}
          <FileDropzone
            accept={imageAccept}
            onFiles={onFiles}
            title={c.dropTitle}
            hint={c.dropHint}
            acceptedLabels={c.dropHint}
          />
          <CameraCaptureButton facing="user" label={c.selfie} onCapture={onFiles} />
          <Notice tone="info">{c.tips}</Notice>
        </div>
      )}

      {stage === "processing" && (
        <div className="space-y-2">
          <ProgressBox label={c.processing} />
          <Notice tone="info">{c.firstTime}</Notice>
        </div>
      )}

      {stage === "edit" && cutout && placement && (
        <div className="space-y-4">
          <PhotoEditor
            cutout={cutout}
            spec={spec}
            placement={placement}
            background={bg}
            crownLabel={c.crown}
            chinLabel={c.chin}
            onMove={(dx, dy) => setPlacement((p) => (p ? { ...p, x: p.x + dx, y: p.y + dy } : p))}
          />
          <p className="text-center text-xs text-muted-foreground">{c.adjustHint}</p>

          <section className="space-y-4 rounded-2xl bg-surface p-3">
            <div>
              <div className="mb-1.5 px-0.5 text-xs font-semibold text-muted-foreground">
                {c.size}
              </div>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {ID_PHOTO_SPECS.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSpec(s)}
                    className={cn(
                      "shrink-0 rounded-xl px-3 py-2 text-left transition",
                      s.id === spec.id
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "bg-background shadow-soft hover:bg-primary-soft",
                    )}
                  >
                    <div className="text-sm font-semibold">{s.size}</div>
                    <div
                      className={cn(
                        "text-[11px]",
                        s.id === spec.id ? "text-primary-foreground/85" : "text-muted-foreground",
                      )}
                    >
                      {c.specTags[s.id]}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 px-0.5 text-xs font-semibold text-muted-foreground">
                {c.background}
              </div>
              <div className="flex gap-3">
                {ID_PHOTO_BACKGROUNDS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    aria-label={c.bgNames[b.id]}
                    aria-pressed={bg === b.color}
                    onClick={() => setBg(b.color)}
                    className={cn(
                      "h-9 w-9 rounded-full border border-border shadow-soft transition",
                      bg === b.color && "ring-2 ring-primary ring-offset-2 ring-offset-surface",
                    )}
                    style={{ backgroundColor: b.color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between px-0.5">
                <span className="text-xs font-semibold text-muted-foreground">{c.zoom}</span>
                <button
                  type="button"
                  onClick={() => fit(subject, spec, cutout)}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-primary transition hover:bg-primary-soft"
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  {c.autoAlign}
                </button>
              </div>
              <input
                type="range"
                min={0.6}
                max={1.6}
                step={0.01}
                value={zoom}
                onChange={(e) => onZoom(Number(e.target.value))}
                className="w-full accent-[var(--color-primary)]"
                aria-label={c.zoom}
              />
            </div>
          </section>

          <div className="mobile-cta flex gap-2">
            <button
              type="button"
              aria-label={c.newPhoto}
              onClick={reset}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-secondary"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <ShareButton
              getFiles={async () => {
                if (!unlocked) {
                  if (!consumeProToolTrial("id-photo")) return [];
                  setUnlocked(true);
                }
                const photo = renderPhoto(cutout, spec, placement, bg);
                return [
                  { blob: await canvasToJpeg(photo), filename: `${sourceName}-id-${spec.id}.jpg` },
                ];
              }}
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => save("sheet")}
              className="flex h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-2 text-xs font-semibold transition hover:bg-secondary disabled:opacity-50"
            >
              <Printer className="h-4 w-4 shrink-0" />
              <span className="truncate">{c.saveSheet(sheetCount)}</span>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => save("photo")}
              className="flex h-12 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary px-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50"
            >
              <Download className="h-4 w-4 shrink-0" />
              <span className="truncate">{c.savePhoto}</span>
            </button>
          </div>
        </div>
      )}
    </ToolPage>
  );
}

/** Export-resolution size of the spec (preview is the same canvas scaled by CSS). */
function previewSize(spec: IdPhotoSpec) {
  return {
    width: Math.round((spec.widthMm / 25.4) * 300),
    height: Math.round((spec.heightMm / 25.4) * 300),
  };
}

function PhotoEditor({
  cutout,
  spec,
  placement,
  background,
  crownLabel,
  chinLabel,
  onMove,
}: {
  cutout: HTMLCanvasElement;
  spec: IdPhotoSpec;
  placement: Placement;
  background: string;
  crownLabel: string;
  chinLabel: string;
  onMove: (dx: number, dy: number) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const target = ref.current;
    if (!target) return;
    const photo = renderPhoto(cutout, spec, placement, background);
    target.width = photo.width;
    target.height = photo.height;
    target.getContext("2d")!.drawImage(photo, 0, 0);
  }, [cutout, spec, placement, background]);

  const crownPct = spec.top * 100;
  const chinPct = (spec.top + spec.head) * 100;

  return (
    <div className="mx-auto w-full max-w-[260px]">
      <div
        className="relative overflow-hidden rounded-lg shadow-soft ring-1 ring-border"
        style={{ aspectRatio: `${spec.widthMm} / ${spec.heightMm}` }}
      >
        <canvas
          ref={ref}
          className="absolute inset-0 h-full w-full touch-none cursor-grab active:cursor-grabbing"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            drag.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const k = e.currentTarget.width / rect.width;
            onMove((e.clientX - drag.current.x) * k, (e.clientY - drag.current.y) * k);
            drag.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
        />
        <Guide pct={crownPct} label={crownLabel} />
        <Guide pct={chinPct} label={chinLabel} />
        <div className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-primary/40" />
      </div>
    </div>
  );
}

function Guide({ pct, label }: { pct: number; label: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-x-0 border-t-2 border-dashed border-primary/80"
      style={{ top: `${pct}%` }}
    >
      <span className="absolute right-1 -translate-y-full rounded bg-primary/85 px-1 text-[9px] font-semibold leading-4 text-white">
        {label}
      </span>
    </div>
  );
}
