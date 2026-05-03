import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Resize Image" },
      {
        name: "description",
        content:
          "Resize Image builds fast, private, browser-based image and PDF tools. No uploads, no tracking.",
      },
      { property: "og:title", content: "About | Resize Image" },
      { property: "og:description", content: "Why we built Resize Image." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PageShell>
      <section className="border-b border-border bg-[var(--gradient-hero)]">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="font-mono text-xs uppercase tracking-widest text-primary">About</div>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Tools that respect your files.
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">
            Most online resizers send your files to a server you don't know. Resize Image doesn't.
            Every operation runs locally in your browser using modern Web APIs — Canvas,
            WebAssembly, and pdf-lib. Nothing leaves your device.
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-neutral max-w-none">
          <h2 className="font-display text-2xl font-semibold">What's inside</h2>
          <p className="text-muted-foreground">
            Resize Image grew into a focused toolkit for images and PDFs. No bloat, no editor, no
            signup.
          </p>
          <h2 className="mt-8 font-display text-2xl font-semibold">Roadmap</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            <li>· Mobile apps for iOS and Android</li>
            <li>· Batch processing for Pro users</li>
            <li>· Merge & split PDF</li>
            <li>· OCR for scanned documents</li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
