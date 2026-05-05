import { useState } from "react";
import { Download, Loader2, X, GripVertical } from "lucide-react";
import { PDFDocument, PageSizes } from "pdf-lib";
import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/site/ToolPage";
import { FileDropzone } from "@/components/site/FileDropzone";
import { downloadBlob, loadImage } from "@/lib/image";
import { getBrowserLocale, getTranslationSet, useLocale } from "@/lib/i18n";

export const Route = createFileRoute("/image-to-pdf")({
  head: () => {
    const page = getTranslationSet(getBrowserLocale()).routes.imageToPdf;

    return {
      meta: [
        { title: page.title },
        { name: "description", content: page.description },
        { property: "og:title", content: page.ogTitle },
        { property: "og:description", content: page.ogDescription },
      ],
      links: [{ rel: "canonical", href: "/image-to-pdf" }],
    };
  },
  component: ImageToPdf,
});

type Size = "A4" | "Letter" | "Fit";
type Orientation = "portrait" | "landscape";
type Margin = "none" | "small" | "medium";

const marginSize: Record<Margin, number> = {
  none: 0,
  small: 12,
  medium: 24,
};

async function embedImage(pdf: PDFDocument, file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (file.type === "image/png") return pdf.embedPng(bytes);
  if (file.type === "image/jpeg") return pdf.embedJpg(bytes);

  const img = await loadImage(file);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error("Image conversion failed"))),
      "image/jpeg",
      0.92,
    );
  });
  return pdf.embedJpg(new Uint8Array(await blob.arrayBuffer()));
}

function orientPageDims(pageDims: [number, number], orientation: Orientation): [number, number] {
  const [w, h] = pageDims;
  if (orientation === "landscape" && h > w) return [h, w];
  if (orientation === "portrait" && w > h) return [h, w];
  return pageDims;
}

function ImageToPdf() {
  const { t } = useLocale();
  const page = t.routes.imageToPdf;
  const [files, setFiles] = useState<File[]>([]);
  const [size, setSize] = useState<Size>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState<Margin>("medium");
  const [busy, setBusy] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const remove = (i: number) => setFiles((arr) => arr.filter((_, idx) => idx !== i));

  const moveFile = (from: number, to: number) => {
    if (from === to) return;
    setFiles((arr) => {
      const next = [...arr];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const onGenerate = async () => {
    if (files.length === 0) return;
    setBusy(true);
    try {
      const pdf = await PDFDocument.create();
      for (const f of files) {
        const img = await embedImage(pdf, f);
        const pageDims: [number, number] =
          size === "A4"
            ? orientPageDims(PageSizes.A4, orientation)
            : size === "Letter"
              ? orientPageDims(PageSizes.Letter, orientation)
              : [img.width, img.height];
        const page = pdf.addPage(pageDims);
        const pw = page.getWidth();
        const ph = page.getHeight();
        if (size === "Fit") {
          page.drawImage(img, { x: 0, y: 0, width: pw, height: ph });
        } else {
          const pageMargin = marginSize[margin];
          const maxW = pw - pageMargin * 2;
          const maxH = ph - pageMargin * 2;
          const r = Math.min(maxW / img.width, maxH / img.height);
          const w = img.width * r;
          const h = img.height * r;
          page.drawImage(img, {
            x: (pw - w) / 2,
            y: (ph - h) / 2,
            width: w,
            height: h,
          });
        }
      }
      const out = await pdf.save();
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), "images.pdf");
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      <FileDropzone
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onFiles={(f) => setFiles((prev) => [...prev, ...f])}
        title={files.length === 0 ? page.dropTitleEmpty : page.dropTitleFilled}
        hint={page.hint}
      />

      {files.length > 0 && (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
          <div className="space-y-2 rounded-2xl border border-border bg-surface-elevated p-3">
            {files.map((f, i) => (
              <div
                key={`${f.name}-${f.lastModified}-${i}`}
                draggable
                onDragStart={(event) => {
                  setDragIndex(i);
                  event.dataTransfer.effectAllowed = "move";
                  event.dataTransfer.setData("text/plain", String(i));
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  const from = Number(event.dataTransfer.getData("text/plain"));
                  if (Number.isInteger(from)) moveFile(from, i);
                  setDragIndex(null);
                }}
                onDragEnd={() => setDragIndex(null)}
                className={`flex cursor-grab items-center gap-3 rounded-lg border bg-background p-2 transition active:cursor-grabbing ${
                  dragIndex === i
                    ? "border-primary bg-primary-soft opacity-70"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
                <img
                  src={URL.createObjectURL(f)}
                  alt={f.name}
                  className="h-12 w-12 rounded object-cover"
                />
                <div className="flex-1 truncate text-sm">{f.name}</div>
                <button
                  onClick={() => remove(i)}
                  draggable={false}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-5 rounded-2xl border border-border bg-surface-elevated p-5">
            <div>
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {page.pageSize}
              </label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["A4", "Letter", "Fit"] as Size[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`rounded-lg border px-2 py-2 text-xs font-mono uppercase transition ${
                      size === s
                        ? "border-primary bg-primary-soft text-primary"
                        : "border-border hover:border-primary/60"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            {size !== "Fit" && (
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Orientation
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["portrait", "landscape"] as Orientation[]).map((item) => (
                    <button
                      key={item}
                      onClick={() => setOrientation(item)}
                      className={`rounded-lg border px-2 py-2 text-xs font-mono uppercase transition ${
                        orientation === item
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border hover:border-primary/60"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {size !== "Fit" && (
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Margin
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(["none", "small", "medium"] as Margin[]).map((item) => (
                    <button
                      key={item}
                      onClick={() => setMargin(item)}
                      className={`rounded-lg border px-2 py-2 text-xs font-mono uppercase transition ${
                        margin === item
                          ? "border-primary bg-primary-soft text-primary"
                          : "border-border hover:border-primary/60"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button
              onClick={onGenerate}
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {page.buildButton}
            </button>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
