import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Zap, Download, Sparkles } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { ResizeImageTool } from "@/components/site/ResizeImageTool";
import { ToolsGrid } from "@/components/site/ToolsGrid";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResizePro — Free Image Resizer, Compressor & Converter" },
      {
        name: "description",
        content:
          "Resize, compress and convert JPG, PNG and WebP images right in your browser. No upload, no signup. 100% free.",
      },
      { property: "og:title", content: "ResizePro — Image & PDF Resizer" },
      {
        property: "og:description",
        content: "Resize images and PDFs in seconds. Browser-based and private.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <PageShell>
      <Hero />
      <Features />
      <ToolsGrid />
      <CTA />
    </PageShell>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border bg-[var(--gradient-hero)]">
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_minmax(0,700px)] md:gap-10 md:py-24 lg:px-8">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            100% browser-based
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Resize, compress &<br />
            <span className="text-primary">convert</span> in seconds.
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
            Six focused tools for images and PDFs. No uploads, no accounts — files are processed
            locally in your browser.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#tool"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90"
            >
              Start resizing
              <Sparkles className="h-4 w-4" />
            </a>
            <a
              href="#tools"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-5 py-3 text-sm font-medium transition hover:border-primary/40"
            >
              Browse all tools
            </a>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
            {[
              ["6", "Tools"],
              ["0", "Uploads"],
              ["∞", "Files / day*"],
            ].map(([n, l]) => (
              <div key={l}>
                <dt className="font-display text-2xl font-bold text-primary">{n}</dt>
                <dd className="text-xs uppercase tracking-wider text-muted-foreground">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div id="tool" className="md:pt-2">
          <ResizeImageTool />
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Private by design",
      desc: "Files never leave your device. Everything runs in your browser.",
    },
    {
      icon: Zap,
      title: "Instant results",
      desc: "No round-trip to a server. Resize and download in milliseconds.",
    },
    {
      icon: Download,
      title: "Any format",
      desc: "JPG, PNG, WebP and PDF. Convert and compress with one click.",
    },
  ];
  return (
    <section id="tools" className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:grid-cols-3 sm:px-6 lg:px-8">
        {items.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-2xl border border-border bg-surface-elevated p-5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display font-semibold">{title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Go unlimited with Pro
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Batch processing, larger files, and zero ads. Cancel anytime.
        </p>
        <a
          href="/pricing"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
        >
          View pricing
        </a>
      </div>
    </section>
  );
}
