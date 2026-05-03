import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { useLocale } from "@/lib/i18n";

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
  const { t } = useLocale();
  const page = t.routes.about;

  return (
    <PageShell>
      <section className="border-b border-border bg-[var(--gradient-hero)]">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="font-mono text-xs uppercase tracking-widest text-primary">
            {page.eyebrow}
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {page.titleText}
          </h1>
          <p className="mt-5 text-lg text-muted-foreground">{page.intro}</p>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="prose prose-neutral max-w-none">
          <h2 className="font-display text-2xl font-semibold">{page.insideTitle}</h2>
          <p className="text-muted-foreground">{page.insideDesc}</p>
          <h2 className="mt-8 font-display text-2xl font-semibold">{page.roadmapTitle}</h2>
          <ul className="mt-3 space-y-2 text-muted-foreground">
            {page.roadmapItems.map((item) => (
              <li key={item}>· {item}</li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
