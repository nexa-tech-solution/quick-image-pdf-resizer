import { useState } from "react";
import { Download, Loader2, X, GripVertical } from "lucide-react";
import { PDFDocument, PageSizes } from "pdf-lib";
import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/site/ToolPage";
import { FileDropzone } from "@/components/site/FileDropzone";
import { downloadBlob } from "@/lib/image";

export const Route = createFileRoute("/image-to-pdf")({
  head: () => ({
    meta: [
      { title: "Image to PDF — Convert JPG/PNG to PDF | Resize Image" },
      {
        name: "description",
        content:
          "Combine JPG and PNG images into a single PDF. Choose A4 or Letter, fit images, download instantly.",
      },
      { property: "og:title", content: "Image to PDF | Resize Image" },
      { property: "og:description", content: "Turn images into a clean PDF in your browser." },
    ],
  }),
  component: ImageToPdf,
});

type Size = "A4" | "Letter" | "Fit";

function ImageToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [size, setSize] = useState<Size>("A4");
  const [busy, setBusy] = useState(false);

  const remove = (i: number) => setFiles((arr) => arr.filter((_, idx) => idx !== i));

  const onGenerate = async () => {
    if (files.length === 0) return;
    setBusy(true);
    try {
      const pdf = await PDFDocument.create();
      for (const f of files) {
        const bytes = new Uint8Array(await f.arrayBuffer());
        const isPng = f.type === "image/png";
        const img = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
        const pageDims: [number, number] =
          size === "A4"
            ? PageSizes.A4
            : size === "Letter"
              ? PageSizes.Letter
              : [img.width, img.height];
        const page = pdf.addPage(pageDims);
        const pw = page.getWidth();
        const ph = page.getHeight();
        if (size === "Fit") {
          page.drawImage(img, { x: 0, y: 0, width: pw, height: ph });
        } else {
          const margin = 24;
          const maxW = pw - margin * 2;
          const maxH = ph - margin * 2;
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
    <ToolPage
      eyebrow="PDF"
      title="Image → PDF"
      description="Drop images, pick a page size, and get a single PDF. JPG and PNG supported."
    >
      <FileDropzone
        accept="image/jpeg,image/png"
        multiple
        onFiles={(f) => setFiles((prev) => [...prev, ...f])}
        title={files.length === 0 ? "Drop images to combine" : "Add more images"}
        hint="JPG or PNG"
      />

      {files.length > 0 && (
        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_280px]">
          <div className="space-y-2 rounded-2xl border border-border bg-surface-elevated p-3">
            {files.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-lg border border-border bg-background p-2"
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
                Page size
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
              Build PDF
            </button>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
