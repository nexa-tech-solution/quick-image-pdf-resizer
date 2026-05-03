import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/site/ToolPage";
import { FileDropzone } from "@/components/site/FileDropzone";
import { downloadBlob, formatExt, processImage, replaceExt, type ImageFormat } from "@/lib/image";

export const Route = createFileRoute("/convert-image")({
  head: () => ({
    meta: [
      { title: "Convert Image — JPG ⇄ PNG ⇄ WebP ⇄ AVIF | Resize Image" },
      {
        name: "description",
        content:
          "Convert images between JPG, PNG, WebP and AVIF in your browser. No upload, no signup, instant download.",
      },
      { property: "og:title", content: "Convert Image | Resize Image" },
      { property: "og:description", content: "Switch image formats with one click." },
    ],
  }),
  component: ConvertImage,
});

function ConvertImage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImageFormat>("webp");
  const [busy, setBusy] = useState(false);

  const onConvert = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const { blob } = await processImage(file, { format, quality: 0.92 });
      downloadBlob(blob, replaceExt(file.name, formatExt[format]));
    } finally {
      setBusy(false);
    }
  };

  return (
    <ToolPage
      eyebrow="Image"
      title="Convert image format"
      description="Move between JPG, PNG and WebP without leaving your browser."
    >
      {!file ? (
        <FileDropzone
          accept="image/jpeg,image/png,image/webp,image/avif"
          onFiles={(f) => setFile(f[0])}
          title="Drop an image to convert"
        />
      ) : (
        <div className="rounded-2xl border border-border bg-surface-elevated p-6">
          <div className="truncate font-medium">{file.name}</div>
          <div className="mt-6">
            <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Convert to
            </label>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(["jpeg", "png", "webp", "avif"] as ImageFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`rounded-lg border px-3 py-3 text-sm font-mono uppercase transition ${
                    format === f
                      ? "border-primary bg-primary-soft text-primary"
                      : "border-border hover:border-primary/60"
                  }`}
                >
                  {f === "jpeg" ? "JPG" : f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setFile(null)}
              className="flex-1 rounded-lg border border-border px-3 py-2.5 text-sm hover:bg-secondary"
            >
              New
            </button>
            <button
              onClick={onConvert}
              disabled={busy}
              className="flex flex-[2] items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Convert & Download
            </button>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
