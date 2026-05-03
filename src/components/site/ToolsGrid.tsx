import { Link } from "@tanstack/react-router";
import { ImageIcon, Layers, FileImage, FileText, FileSearch } from "lucide-react";

const items = [
  {
    to: "/",
    title: "Resize Image",
    desc: "JPG, PNG, WebP — exact dimensions or presets like 1080×1080.",
    icon: ImageIcon,
  },
  {
    to: "/compress-image",
    title: "Compress Image",
    desc: "Shrink file size with adjustable quality. Side-by-side preview.",
    icon: Layers,
  },
  {
    to: "/convert-image",
    title: "Convert Format",
    desc: "Swap between JPG, PNG and WebP in one click.",
    icon: FileImage,
  },
  {
    to: "/image-to-pdf",
    title: "Image → PDF",
    desc: "Combine images into a single PDF. Choose A4 or Letter.",
    icon: FileText,
  },
  {
    to: "/pdf-to-image",
    title: "PDF → Image",
    desc: "Export every page of a PDF as a high-resolution image.",
    icon: FileSearch,
  },
] as const;

export function ToolsGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-primary">Toolset</div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Every tool you need
          </h2>
        </div>
        <p className="hidden max-w-sm text-sm text-muted-foreground sm:block">
          Five focused tools instead of one bloated editor. Pick a job, get it done.
        </p>
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
              Open →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
