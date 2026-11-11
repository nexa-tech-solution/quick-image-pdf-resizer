import { useEffect, useRef, useState, type ReactNode } from "react";
import { FileQuestion, Minus, Plus } from "lucide-react";
import { Notice } from "@/components/site/ToolBits";
import { SmoothImage } from "@/components/site/SmoothImage";
import { useLightbox } from "@/components/site/Lightbox";
import { useV3Copy } from "@/lib/tools-v3";
import { cn } from "@/lib/utils";

export type ViewerKind = "image" | "pdf" | "docx" | "text" | "unsupported";

export const viewerAccept =
  "application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*,.txt,.md,.csv,.json,text/plain";

export function detectViewerKind(name: string, type: string): ViewerKind {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (
    type.startsWith("image/") ||
    ["jpg", "jpeg", "png", "webp", "gif", "avif", "bmp", "svg"].includes(ext)
  )
    return "image";
  if (type === "application/pdf" || ext === "pdf") return "pdf";
  if (ext === "docx" || type.includes("wordprocessingml")) return "docx";
  if (type.startsWith("text/") || ["txt", "md", "csv", "json", "log"].includes(ext)) return "text";
  return "unsupported";
}

/** Renders a file inline: image (tap → full screen), PDF pages, DOCX, or plain text. */
export function FileViewer({ blob, name, type }: { blob: Blob; name: string; type?: string }) {
  const kind = detectViewerKind(name, type ?? blob.type);
  const c = useV3Copy().viewer;

  if (kind === "image") return <ImageView blob={blob} name={name} />;
  if (kind === "pdf") return <PdfView blob={blob} name={name} />;
  if (kind === "docx") return <DocxView blob={blob} />;
  if (kind === "text") return <TextView blob={blob} />;
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface p-8 text-center text-sm text-muted-foreground">
      <FileQuestion className="h-10 w-10" />
      {c.unsupported}
    </div>
  );
}

function useObjectUrl(blob: Blob) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    const u = URL.createObjectURL(blob);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [blob]);
  return url;
}

function ImageView({ blob, name }: { blob: Blob; name: string }) {
  const url = useObjectUrl(blob);
  return (
    <SmoothImage
      src={url}
      alt={name}
      zoomable
      zoomName={name}
      className="h-[60vh] w-full rounded-2xl bg-[repeating-conic-gradient(#f1f1f1_0%_25%,#fff_0%_50%)] bg-[length:16px_16px]"
    />
  );
}

/* ------------------------------ PDF ------------------------------ */

type PdfDoc = {
  numPages: number;
  getPage: (n: number) => Promise<PdfPage>;
  destroy: () => void;
};
type PdfPage = {
  getViewport: (o: { scale: number }) => { width: number; height: number };
  render: (o: {
    canvasContext: CanvasRenderingContext2D;
    viewport: unknown;
    canvas?: HTMLCanvasElement;
  }) => {
    promise: Promise<void>;
    cancel: () => void;
  };
};

function PdfView({ blob, name }: { blob: Blob; name: string }) {
  const c = useV3Copy();
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [ratio, setRatio] = useState(1.414);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const lightbox = useLightbox();

  useEffect(() => {
    let cancelled = false;
    let loaded: PdfDoc | null = null;
    setDoc(null);
    setError(null);
    (async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = (
        await import("pdfjs-dist/build/pdf.worker.min.mjs?url")
      ).default;
      const d = (await pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()) })
        .promise) as unknown as PdfDoc;
      loaded = d;
      const first = (await d.getPage(1)).getViewport({ scale: 1 });
      if (cancelled) return d.destroy();
      setRatio(first.height / first.width);
      setDoc(d);
    })().catch((err: unknown) => {
      if (cancelled) return;
      setError(
        (err as { name?: string })?.name === "PasswordException"
          ? c.common.encryptedError
          : c.common.pdfError,
      );
    });
    return () => {
      cancelled = true;
      loaded?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blob]);

  async function openPage(n: number) {
    if (!doc) return;
    const page = await doc.getPage(n);
    const blobOut = await renderPage(page, 2.5);
    const url = URL.createObjectURL(blobOut);
    lightbox.open([{ src: url, name: `${name} · ${n}/${doc.numPages}`, blob: blobOut }]);
  }

  if (error) return <Notice>{error}</Notice>;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between rounded-2xl bg-surface px-3 py-2 text-xs text-muted-foreground">
        <span>{doc ? `${doc.numPages} ${c.common.pages}` : c.common.working}</span>
        <div className="flex items-center gap-1">
          <ZoomBtn
            label="−"
            onClick={() => setZoom((z) => Math.max(1, +(z - 0.5).toFixed(1)))}
            disabled={zoom <= 1}
          >
            <Minus className="h-4 w-4" />
          </ZoomBtn>
          <span className="w-12 text-center font-semibold tabular-nums text-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <ZoomBtn
            label="+"
            onClick={() => setZoom((z) => Math.min(3, z + 0.5))}
            disabled={zoom >= 3}
          >
            <Plus className="h-4 w-4" />
          </ZoomBtn>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-secondary p-2">
        <div className="space-y-2" style={{ width: `${zoom * 100}%` }}>
          {doc
            ? Array.from({ length: doc.numPages }, (_, i) => (
                <PdfPageCanvas
                  key={i}
                  doc={doc}
                  pageNumber={i + 1}
                  ratio={ratio}
                  zoom={zoom}
                  onOpen={() => void openPage(i + 1)}
                />
              ))
            : [0, 1].map((i) => (
                <div
                  key={i}
                  className="skeleton w-full rounded-lg"
                  style={{ aspectRatio: `1 / ${ratio}` }}
                />
              ))}
        </div>
      </div>
      {lightbox.node}
    </div>
  );
}

function ZoomBtn({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-foreground shadow-soft disabled:opacity-40"
    >
      {children}
    </button>
  );
}

async function renderPage(page: PdfPage, scale: number) {
  const vp = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(vp.width);
  canvas.height = Math.ceil(vp.height);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
  return new Promise<Blob>((r, j) =>
    canvas.toBlob((b) => (b ? r(b) : j(new Error("render"))), "image/png"),
  );
}

/** Renders a page only when scrolled near the viewport; re-renders sharper when zoom changes. */
function PdfPageCanvas({
  doc,
  pageNumber,
  ratio,
  zoom,
  onOpen,
}: {
  doc: PdfDoc;
  pageNumber: number;
  ratio: number;
  zoom: number;
  onOpen: () => void;
}) {
  const boxRef = useRef<HTMLButtonElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [rendered, setRendered] = useState(false);
  const [pageRatio, setPageRatio] = useState(ratio);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setVisible(true), {
      rootMargin: "600px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let task: { cancel: () => void } | null = null;
    let cancelled = false;
    (async () => {
      const page = await doc.getPage(pageNumber);
      if (cancelled) return;
      const base = page.getViewport({ scale: 1 });
      setPageRatio(base.height / base.width);
      const cssWidth = boxRef.current?.clientWidth ?? 360;
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const scale = Math.min((cssWidth * dpr) / base.width, 4);
      const vp = page.getViewport({ scale });
      const off = document.createElement("canvas");
      off.width = Math.ceil(vp.width);
      off.height = Math.ceil(vp.height);
      const ctx = off.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, off.width, off.height);
      const r = page.render({ canvasContext: ctx, viewport: vp, canvas: off });
      task = r;
      await r.promise;
      if (cancelled || !canvasRef.current) return;
      // Swap in one go so the old (blurrier) render stays until the new one is ready.
      const target = canvasRef.current;
      target.width = off.width;
      target.height = off.height;
      target.getContext("2d")!.drawImage(off, 0, 0);
      setRendered(true);
    })().catch(() => {});
    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [doc, pageNumber, visible, zoom]);

  return (
    <button
      ref={boxRef}
      type="button"
      onClick={onOpen}
      className="relative block w-full overflow-hidden rounded-lg bg-white shadow-soft"
      style={{ aspectRatio: `1 / ${pageRatio}` }}
    >
      {!rendered && <div className="skeleton absolute inset-0" />}
      <canvas
        ref={canvasRef}
        className={cn(
          "h-full w-full transition-opacity duration-300",
          rendered ? "opacity-100" : "opacity-0",
        )}
      />
      <span className="absolute bottom-1.5 right-1.5 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white">
        {pageNumber}
      </span>
    </button>
  );
}

/* ------------------------------ DOCX ------------------------------ */

function DocxView({ blob }: { blob: Blob }) {
  const c = useV3Copy();
  const outerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [fit, setFit] = useState(1);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    (async () => {
      const { renderAsync } = await import("docx-preview");
      if (!bodyRef.current) return;
      bodyRef.current.innerHTML = "";
      await renderAsync(blob, bodyRef.current, undefined, {
        className: "docx",
        inWrapper: true,
        breakPages: true,
        ignoreLastRenderedPageBreak: true,
        experimental: true,
        useBase64URL: true,
      });
      if (cancelled) return;
      // Scale the fixed-width (≈816px) pages down to the phone width.
      const page = bodyRef.current.querySelector("section.docx") as HTMLElement | null;
      const avail = outerRef.current?.clientWidth ?? 360;
      if (page) setFit(Math.min(1, (avail - 8) / page.offsetWidth));
      setState("ready");
    })().catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, [blob]);

  if (state === "error") return <Notice>{c.viewer.docxError}</Notice>;

  return (
    <div ref={outerRef} className="relative overflow-x-auto rounded-2xl bg-secondary">
      {state === "loading" && (
        <div className="space-y-2 p-4">
          {["w-1/2", "w-full", "w-11/12", "w-full", "w-3/4", "w-full", "w-2/3"].map((w, i) => (
            <div key={i} className={`skeleton h-3 rounded ${w}`} />
          ))}
        </div>
      )}
      <div
        ref={bodyRef}
        className={cn(
          "docx-host transition-opacity duration-300 [&_.docx-wrapper]:!bg-transparent [&_.docx-wrapper]:!p-1 [&_section.docx]:!mb-2 [&_section.docx]:shadow-soft",
          state === "ready" ? "opacity-100" : "h-0 overflow-hidden opacity-0",
        )}
        style={{ zoom: fit }}
      />
    </div>
  );
}

/* ------------------------------ Text ------------------------------ */

function TextView({ blob }: { blob: Blob }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    // Cap very large files so the page stays responsive.
    void blob
      .slice(0, 2_000_000)
      .text()
      .then((t) => !cancelled && setText(t));
    return () => {
      cancelled = true;
    };
  }, [blob]);
  if (text === null) return <div className="skeleton h-64 rounded-2xl" />;
  return (
    <pre className="fade-in max-h-[70vh] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-surface p-4 font-mono text-[13px] leading-6">
      {text}
    </pre>
  );
}
