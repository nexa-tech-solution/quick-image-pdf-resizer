import { useEffect, useMemo, useState } from "react";
import { Download, Loader2, RefreshCw, Scissors, X } from "lucide-react";
import { FileDropzone } from "./FileDropzone";
import { Button } from "@/components/ui/button";
import { downloadBlob, formatBytes, formatExt, loadImage, replaceExt } from "@/lib/image";
import {
  backgroundOutputFormats,
  encodeBackgroundRemovalOutput,
  removeBackground,
} from "@/lib/background-removal";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { canEncodeImageFormat, imageAccept, supportedImageTypes } from "@/lib/tool-files";

function PreviewPanel({
  label,
  sublabel,
  url,
  loading,
}: {
  label: string;
  sublabel: string;
  url: string | null;
  loading?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface-elevated">
      <div className="border-b border-border px-4 py-3">
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{sublabel}</div>
      </div>
      <div className="flex min-h-[280px] items-center justify-center bg-[conic-gradient(at_50%_50%,_#f5f6f8_25%,_#eceef2_25%_50%,_#f5f6f8_50%_75%,_#eceef2_75%)] [background-size:20px_20px] p-4">
        <div className="relative flex min-h-[220px] min-w-0 items-center justify-center">
          {url ? (
            <img
              src={url}
              alt={label}
              className="max-h-[420px] max-w-full rounded-xl object-contain shadow-elevated"
            />
          ) : (
            <div className="text-sm text-muted-foreground">Waiting for output</div>
          )}
          {loading ? (
            <div className="absolute right-2 top-2 rounded-full border border-border bg-background/85 px-2 py-1 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur">
              Processing
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type RemovedBackgroundImage = Awaited<ReturnType<typeof removeBackground>>;

export function RemoveBackgroundTool() {
  const { t } = useLocale();
  const page = t.routes.removeBackground;
  const [file, setFile] = useState<File | null>(null);
  const [originalDims, setOriginalDims] = useState<{ w: number; h: number } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [removedImage, setRemovedImage] = useState<RemovedBackgroundImage | null>(null);
  const [processedPreviewUrl, setProcessedPreviewUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [outputFormat, setOutputFormat] = useState<(typeof backgroundOutputFormats)[number]>("png");
  const [status, setStatus] = useState<"idle" | "loading" | "encoding" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      setOriginalDims(null);
      setRemovedImage(null);
      setProcessedBlob(null);
      setProcessedPreviewUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return null;
      });
      setError(null);
      setStatus("idle");
      return;
    }

    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setRemovedImage(null);
    setProcessedBlob(null);
    setProcessedPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setError(null);
    setStatus("loading");

    loadImage(file)
      .then((img) => {
        setOriginalDims({ w: img.naturalWidth, h: img.naturalHeight });
      })
      .catch(() => {
        setError("Could not read image dimensions.");
        setStatus("error");
      });

    let cancelled = false;

    (async () => {
      try {
        const output = await removeBackground(file);
        if (cancelled) return;
        setRemovedImage(output);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Could not remove the background.");
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
      URL.revokeObjectURL(preview);
    };
  }, [file]);

  useEffect(() => {
    if (!removedImage) return;

    let cancelled = false;
    setStatus("encoding");
    setError(null);

    (async () => {
      try {
        const supported = await canEncodeImageFormat(outputFormat);
        if (!supported) throw new Error("Your browser cannot export this format.");
        const blob = await encodeBackgroundRemovalOutput(removedImage, outputFormat);
        if (cancelled) return;
        setProcessedBlob(blob);
        setProcessedPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return URL.createObjectURL(blob);
        });
        setStatus("ready");
      } catch (err) {
        if (cancelled) return;
        setProcessedBlob(null);
        setProcessedPreviewUrl((current) => {
          if (current) URL.revokeObjectURL(current);
          return null;
        });
        setError(err instanceof Error ? err.message : "Could not encode the output.");
        setStatus("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [outputFormat, removedImage]);

  useEffect(() => {
    return () => {
      if (processedPreviewUrl) URL.revokeObjectURL(processedPreviewUrl);
    };
  }, [processedPreviewUrl]);

  const downloadName = useMemo(() => {
    if (!file) return "background-removed.png";
    return replaceExt(file.name, formatExt[outputFormat]);
  }, [file, outputFormat]);

  const busy = status === "loading" || status === "encoding";

  const onDownload = () => {
    if (!processedBlob || !file) return;
    downloadBlob(processedBlob, downloadName);
  };

  return !file ? (
    <FileDropzone
      accept={imageAccept}
      validateFile={(item) => (supportedImageTypes.has(item.type) ? null : page.hint)}
      onFiles={(files) => setFile(files[0])}
      title={page.dropTitle}
      hint={page.hint}
      className="py-12 sm:py-16"
    />
  ) : (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-6">
        <div className="rounded-2xl border border-border bg-surface px-4 py-3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate font-medium">{file.name}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {originalDims ? `${originalDims.w}×${originalDims.h} · ` : ""}
                {formatBytes(file.size)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setFile(null)}
              className="rounded-md p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label={page.removeImage}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {error ? <div className="mt-2 text-xs text-destructive">{error}</div> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <PreviewPanel label={page.original} sublabel={page.originalSub} url={previewUrl} />
          <PreviewPanel
            label={page.result}
            sublabel={
              processedBlob
                ? `${formatBytes(processedBlob.size)} · ${outputFormat.toUpperCase()}`
                : page.transparentOutput
            }
            url={processedPreviewUrl}
            loading={busy}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl border border-border bg-surface px-4 py-4">
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            {page.outputFormat}
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {backgroundOutputFormats.map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => setOutputFormat(format)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-mono uppercase transition",
                  outputFormat === format
                    ? "border-primary bg-primary-soft text-primary"
                    : "border-border hover:border-primary/60 hover:bg-secondary",
                )}
              >
                {format.toUpperCase()}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">{page.transparencyHint}</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface px-4 py-4">
          <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            {page.status}
          </div>
          <div className="mt-2 text-sm font-medium">
            {status === "loading"
              ? page.statusLoading
              : status === "encoding"
                ? page.statusEncoding
                : status === "ready"
                  ? page.statusReady
                  : page.statusIdle}
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{page.bestResults}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="outline" onClick={() => setFile(null)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {page.newButton}
          </Button>
          <Button
            type="button"
            onClick={onDownload}
            disabled={!processedBlob || busy || Boolean(error)}
          >
            {busy ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {page.downloadButton}
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-primary-soft px-4 py-4 text-sm text-primary">
          <div className="flex items-center gap-2 font-medium">
            <Scissors className="h-4 w-4" />
            {page.privacyTitle}
          </div>
          <p className="mt-2 text-sm leading-6">{page.privacyDesc}</p>
        </div>
      </div>
    </div>
  );
}
