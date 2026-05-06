import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Download, GripVertical, Loader2, X } from "lucide-react";
import { PDFDocument, PageSizes } from "pdf-lib";
import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/site/ToolPage";
import { FileDropzone } from "@/components/site/FileDropzone";
import { downloadBlob, formatBytes, loadImage, replaceExt } from "@/lib/image";
import { getBrowserLocale, getTranslationSet, toolEnhancementCopy, useLocale } from "@/lib/i18n";
import {
  cleanupToolFileItem,
  cleanupToolFileItems,
  createToolFileItem,
  imageAccept,
  supportedImageTypes,
  type ToolFileItem,
} from "@/lib/tool-files";

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
  const { locale, t } = useLocale();
  const copy = toolEnhancementCopy[locale];
  const page = t.routes.imageToPdf;
  const [items, setItems] = useState<ToolFileItem[]>([]);
  const [size, setSize] = useState<Size>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState<Margin>("medium");
  const [busy, setBusy] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const itemsRef = useRef<ToolFileItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => () => cleanupToolFileItems(itemsRef.current), []);

  const files = items.map((item) => item.file);
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  const remove = (i: number) =>
    setItems((arr) => {
      const target = arr[i];
      if (target) cleanupToolFileItem(target);
      return arr.filter((_, idx) => idx !== i);
    });

  const removeAll = () => {
    cleanupToolFileItems(itemsRef.current);
    setItems([]);
    setBusy(false);
  };

  const moveFile = (from: number, to: number) => {
    if (from === to) return;
    setItems((arr) => {
      if (to < 0 || to >= arr.length) return arr;
      const next = [...arr];
      const [item] = next.splice(from, 1);
      if (!item) return arr;
      next.splice(to, 0, item);
      return next;
    });
  };

  const onGenerate = async () => {
    if (items.length === 0) return;
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
      const filename =
        files.length === 1 ? replaceExt(files[0]?.name ?? "image", "pdf") : "images.pdf";
      downloadBlob(new Blob([out as BlobPart], { type: "application/pdf" }), filename);
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      <FileDropzone
        accept={imageAccept}
        multiple
        validateFile={(file) =>
          supportedImageTypes.has(file.type) ? null : "This image format is not supported."
        }
        onFiles={(f) => setItems((prev) => [...prev, ...f.map((file) => createToolFileItem(file))])}
        title={files.length === 0 ? page.dropTitleEmpty : page.dropTitleFilled}
        hint={page.hint}
      />

      {files.length > 0 && (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
          <div className="space-y-2 rounded-2xl border border-border bg-surface-elevated p-3">
            <div className="flex items-center justify-between gap-3 px-1 pb-2 text-sm text-muted-foreground">
              <div>
                {files.length} {copy.imageToPdf.files} · {formatBytes(totalSize)}
              </div>
              <button
                type="button"
                onClick={removeAll}
                className="text-xs font-medium hover:text-destructive"
              >
                {copy.shared.removeAll}
              </button>
            </div>
            {items.map((item, i) => (
              <div
                key={item.id}
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
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="h-12 w-12 rounded object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm">{item.file.name}</div>
                  <div className="text-xs text-muted-foreground">{formatBytes(item.file.size)}</div>
                </div>
                <button
                  type="button"
                  onClick={() => moveFile(i, i - 1)}
                  disabled={i === 0}
                  draggable={false}
                  aria-label={copy.imageToPdf.moveUp}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveFile(i, i + 1)}
                  disabled={i === items.length - 1}
                  draggable={false}
                  aria-label={copy.imageToPdf.moveDown}
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
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
                  {page.orientation}
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
                      {page.orientationOptions[item]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {size !== "Fit" && (
              <div>
                <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  {page.margin}
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
                      {page.marginOptions[item]}
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
