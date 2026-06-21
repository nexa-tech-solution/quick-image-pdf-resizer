import { Link, createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Zap, Download, Sparkles } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { ResizeImageTool } from "@/components/site/ResizeImageTool";
import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { ToolSeoContent } from "@/components/site/ToolSeoContent";
import { ToolsGrid } from "@/components/site/ToolsGrid";
import { getBrowserLocale, getTranslationSet, useLocale } from "@/lib/i18n";
import { createRouteHead } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => {
    const locale = getBrowserLocale();
    const t = getTranslationSet(locale);

    return createRouteHead({
      t,
      locale,
      routeKey: "home",
    });
  },
  component: Home,
});

function Home() {
  return (
    <PageShell>
      <SeoJsonLd routeKey="home" includeHomeSchemas />
      <Hero />
      <Features />
      <ResizeSeoSection />
      <SeoBoost />
      <ToolsGrid />
      <CTA />
    </PageShell>
  );
}

function Hero() {
  const { t } = useLocale();

  return (
    <section className="relative overflow-hidden border-b border-border bg-[var(--gradient-hero)]">
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1fr_minmax(0,700px)] md:gap-10 md:py-24 lg:px-8">
        <div className="flex flex-col justify-center">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-surface-elevated px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            {t.home.badge}
          </div>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {t.home.titlePrefix}
            <br />
            <span className="text-primary">{t.home.titleAccent}</span> {t.home.titleSuffix}
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
            {t.home.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/compress-image"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground shadow-soft transition hover:opacity-90"
            >
              {t.home.startResizing}
              <Sparkles className="h-4 w-4" />
            </Link>
            <a
              href="#tools-grid"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-elevated px-5 py-3 text-sm font-medium transition hover:border-primary/40"
            >
              {t.home.browseAllTools}
            </a>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-6">
            {[
              ["7", t.home.tools],
              ["0", t.home.uploads],
              ["∞", t.home.filesPerDay],
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

function ResizeSeoSection() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto max-w-4xl px-4 pb-12 sm:px-6 lg:px-8">
        <ToolSeoContent tool="resize" />
      </div>
    </section>
  );
}

function Features() {
  const { t } = useLocale();
  const items = [
    {
      icon: ShieldCheck,
      title: t.home.featurePrivateTitle,
      desc: t.home.featurePrivateDesc,
    },
    {
      icon: Zap,
      title: t.home.featureInstantTitle,
      desc: t.home.featureInstantDesc,
    },
    {
      icon: Download,
      title: t.home.featureAnyFormatTitle,
      desc: t.home.featureAnyFormatDesc,
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

function SeoBoost() {
  const { t } = useLocale();
  const seo = t.home.seoBoost;

  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-widest text-primary">
            {seo.eyebrow}
          </div>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {seo.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{seo.intro}</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {seo.cards.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-surface-elevated p-5"
            >
              <h3 className="font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-border bg-surface-elevated p-5">
            <h3 className="font-display text-lg font-semibold">{seo.howItWorksTitle}</h3>
            <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
              {seo.howItWorksSteps.map((step, index) => (
                <li key={step}>
                  {index + 1}. {step}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl border border-border bg-surface-elevated p-5">
            <h3 className="font-display text-lg font-semibold">{seo.searchesTitle}</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              {seo.searches.map((term) => (
                <li key={term}>• {term}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-border bg-surface-elevated p-5">
          <h3 className="font-display text-lg font-semibold">{seo.faqTitle}</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {seo.faqs.map((faq) => (
              <div key={faq.q}>
                <div className="font-medium">{faq.q}</div>
                <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  const { t } = useLocale();

  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {t.home.ctaTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t.home.ctaDesc}</p>
        <a
          href="#tools-grid"
          className="mt-8 inline-flex items-center gap-2 rounded-lg bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-90"
        >
          {t.home.browseAllTools}
        </a>
      </div>
    </section>
  );
}
