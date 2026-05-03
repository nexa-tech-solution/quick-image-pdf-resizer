import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/site/ToolPage";
import { FileDropzone } from "@/components/site/FileDropzone";
import { downloadBlob, formatBytes } from "@/lib/image";

export const Route = createFileRoute("/compress-pdf")({
  head: () => ({
    meta: [
      { title: "Compress PDF — Reduce PDF file size | ResizePro" },
      {
        name: "description",
        content:
          "Shrink PDF size in your browser. Strip metadata and re-save object streams with no upload.",
      },
      { property: "og:title", content: "Compress PDF | ResizePro" },
      { property: "og:description", content: "Lighter PDFs without leaving your device." },
    ],
  }),
  component: CompressPdf,
});

function CompressPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; size: number } | null>(null);

  const onCompress = async () => {
    if (!file) return;
    setBusy(true);
    setResult(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const pdf = await PDFDocument.load(bytes, { updateMetadata: false });
      pdf.setTitle("");
      pdf.setAuthor("");
      pdf.setSubject("");
      pdf.setKeywords([]);
      pdf.setProducer("");
      pdf.setCreator("");
      const out = await pdf.save({ useObjectStreams: true });
      const blob = new Blob([out as BlobPart], { type: "application/pdf" });
      setResult({ blob, size: blob.size });
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage
      eyebrow="PDF"
      title="Compress PDF"
      description="Re-saves your PDF with optimized object streams and clears metadata. Fully offline."
    >
      {!file ? (
        <FileDropzone
          accept="application/pdf"
          onFiles={(f) => {
            setFile(f[0]);
            setResult(null);
          }}
          title="Drop a PDF to compress"
          hint="PDF only"
        />
      ) : (
        <div className="rounded-2xl border border-border bg-surface-elevated p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="truncate font-medium">{file.name}</div>
              <div className="text-xs text-muted-foreground">
                Original · {formatBytes(file.size)}
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setResult(null);
              }}
              className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-secondary"
            >
              New
            </button>
          </div>

          {result && (
            <div className="mt-4 rounded-lg border border-border bg-background p-4">
              <div className="text-sm">
                Compressed · <span className="font-mono">{formatBytes(result.size)}</span>{" "}
                <span className="ml-2 text-success font-mono">
                  -{Math.max(0, Math.round((1 - result.size / file.size) * 100))}%
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <button
              onClick={onCompress}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-secondary disabled:opacity-60"
            >
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Compress
            </button>
            <button
              onClick={() =>
                result && downloadBlob(result.blob, file.name.replace(/\.pdf$/i, ".min.pdf"))
              }
              disabled={!result}
              className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Tip: PDFs that are mostly scanned images compress most when you re-export them via{" "}
            <a className="text-primary underline" href="/pdf-to-image">PDF → Image</a> and back via{" "}
            <a className="text-primary underline" href="/image-to-pdf">Image → PDF</a>.
          </p>
        </div>
      )}
    </ToolPage>
  );
}
