import { useEffect, useState } from "react";
import { onNativeFile, takeNativeFile } from "@/lib/native-open";
import { createFileRoute } from "@tanstack/react-router";
import { FolderOpen } from "lucide-react";
import { FileDropzone } from "@/components/site/FileDropzone";
import { FileViewer, viewerAccept } from "@/components/site/FileViewer";
import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { ShareButton } from "@/components/site/ShareButton";
import { FileCard } from "@/components/site/ToolBits";
import { ToolPage } from "@/components/site/ToolPage";
import { getBrowserLocale, getTranslationSet } from "@/lib/i18n";
import { createRouteHead } from "@/lib/seo";
import { useV3Copy } from "@/lib/tools-v3";

export const Route = createFileRoute("/view")({
  head: () => {
    const locale = getBrowserLocale();
    return createRouteHead({ t: getTranslationSet(locale), locale, routeKey: "viewFile" });
  },
  component: ViewFilePage,
});

function ViewFilePage() {
  const c = useV3Copy();
  const page = c.viewFile;
  const [file, setFile] = useState<File | null>(null);

  // File opened from the OS ("Open with…" in the native app).
  useEffect(() => {
    const pending = takeNativeFile();
    if (pending) setFile(pending);
    return onNativeFile(setFile);
  }, []);

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      <SeoJsonLd routeKey="viewFile" />
      {!file ? (
        <FileDropzone
          accept={viewerAccept}
          onFiles={([next]) => next && setFile(next)}
          title={page.dropTitle}
          hint={page.dropHint}
        />
      ) : (
        <div className="fade-in space-y-3 pb-24">
          <FileCard name={file.name} size={file.size} />
          <FileViewer
            key={`${file.name}-${file.lastModified}`}
            blob={file}
            name={file.name}
            type={file.type}
          />
          <div className="mobile-cta flex gap-2">
            <ShareButton getFiles={() => [{ blob: file, filename: file.name }]} />
            <button
              type="button"
              onClick={() => setFile(null)}
              className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90"
            >
              <FolderOpen className="h-4 w-4" />
              {page.openAnother}
            </button>
          </div>
        </div>
      )}
    </ToolPage>
  );
}
