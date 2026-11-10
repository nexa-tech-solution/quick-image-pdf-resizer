import { Link } from "@tanstack/react-router";
import {
  ImageIcon,
  Layers,
  FileImage,
  FileText,
  FileSearch,
  FileStack,
  Scissors,
  Type,
  Images,
  FileType,
  Lock,
  LockOpen,
  ScanLine,
} from "lucide-react";
import { useLocale } from "@/lib/i18n";
import { useV3Copy } from "@/lib/tools-v3";

export function ToolsGrid() {
  const { t } = useLocale();
  const v3 = useV3Copy();
  const items = [
    {
      to: "/",
      title: t.toolsGrid.resizeImage.title,
      desc: t.toolsGrid.resizeImage.desc,
      icon: ImageIcon,
    },
    {
      to: "/compress-image",
      title: t.toolsGrid.compressImage.title,
      desc: t.toolsGrid.compressImage.desc,
      icon: Layers,
    },
    {
      to: "/convert-image",
      title: t.toolsGrid.convertFormat.title,
      desc: t.toolsGrid.convertFormat.desc,
      icon: FileImage,
    },
    {
      to: "/remove-background",
      title: t.header.removeBackground,
      desc: "Remove image backgrounds locally in your browser.",
      icon: Scissors,
    },
    {
      to: "/image-to-pdf",
      title: t.toolsGrid.imageToPdf.title,
      desc: t.toolsGrid.imageToPdf.desc,
      icon: FileText,
    },
    {
      to: "/pdf-to-image",
      title: t.toolsGrid.pdfToImage.title,
      desc: t.toolsGrid.pdfToImage.desc,
      icon: FileSearch,
    },
    {
      to: "/merge-split-pdf",
      title: t.toolsGrid.mergeSplitPdf.title,
      desc: t.toolsGrid.mergeSplitPdf.desc,
      icon: FileStack,
    },
    {
      to: "/scan-document",
      title: t.header.scanDocument,
      desc: v3.scanDocument.intro,
      icon: ScanLine,
    },
    { to: "/text-to-pdf", title: t.header.textToPdf, desc: v3.textToPdf.intro, icon: Type },
    { to: "/pdf-to-word", title: t.header.pdfToWord, desc: v3.pdfToWord.intro, icon: FileType },
    {
      to: "/extract-pdf-images",
      title: t.header.extractPdfImages,
      desc: v3.extractPdfImages.intro,
      icon: Images,
    },
    { to: "/protect-pdf", title: t.header.protectPdf, desc: v3.protectPdf.intro, icon: Lock },
    { to: "/unlock-pdf", title: t.header.unlockPdf, desc: v3.unlockPdf.intro, icon: LockOpen },
  ] as const;

  return (
    <section id="tools-grid" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-primary">
            {t.toolsGrid.toolset}
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {t.toolsGrid.title}
          </h2>
        </div>
        <p className="hidden max-w-sm text-sm text-muted-foreground sm:block">{t.toolsGrid.desc}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(({ to, title, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface-elevated p-6 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-elevated"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-5 w-5" />
            </div>
            <div className="font-display text-base font-semibold">{title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            <div className="mt-4 text-xs font-mono uppercase tracking-wider text-primary opacity-0 transition group-hover:opacity-100">
              {t.toolsGrid.open} →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
