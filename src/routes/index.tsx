import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Zap, Download, Sparkles } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { ResizeImageTool } from "@/components/site/ResizeImageTool";
import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { ToolSeoContent } from "@/components/site/ToolSeoContent";
import { ToolsGrid } from "@/components/site/ToolsGrid";
import { AppHomeDashboard } from "@/components/site/AppHomeDashboard";
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
  const [hasFiles, setHasFiles] = useState(false);

  return (
    <PageShell>
      <SeoJsonLd routeKey="home" includeHomeSchemas />
      <Hero hasFiles={hasFiles} onHasFilesChange={setHasFiles} />
      {/* Secondary/SEO content is desktop-only; mobile shows just the tool. */}
      <div className="hidden md:block">
        <Features />
        <ResizeSeoSection />
        <SeoBoost />
        <ToolsGrid />
        <CTA />
      </div>
    </PageShell>
  );
}

function Hero({
  hasFiles,
  onHasFilesChange,
}: {
  hasFiles: boolean;
  onHasFilesChange: (hasFiles: boolean) => void;
}) {
  const { t } = useLocale();
  const hideIntro = hasFiles;

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,white,transparent_70%)]">
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>
      <div
        className={`mx-auto grid max-w-7xl px-4 py-5 sm:px-6 sm:py-16 lg:px-8 ${
          hideIntro
            ? "gap-5 sm:gap-8 md:grid-cols-1 md:py-14"
            : "gap-5 sm:gap-12 md:grid-cols-[1fr_minmax(0,700px)] md:gap-10 md:py-24"
        }`}
      >
        {!hideIntro && (
          <div>
            {/* Keep a real H1 for SEO; the app UI leads with the dashboard. */}
            <h1 className="sr-only">
              {t.home.titlePrefix} {t.home.titleAccent} {t.home.titleSuffix}
            </h1>
            <AppHomeDashboard />
            <h2 className="mt-6 text-base font-bold">{t.toolsGrid.resizeImage.title}</h2>
          </div>
        )}
        <div id="tool" className="scroll-mt-20">
          <ResizeImageTool onHasFilesChange={onHasFilesChange} />
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
      <div className="mx-auto grid max-w-7xl gap-3 px-4 py-8 sm:gap-6 sm:py-14 sm:grid-cols-3 sm:px-6 lg:px-8">
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
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-16 lg:px-8">
        <div className="max-w-3xl">
          <div className="font-mono text-xs uppercase tracking-widest text-primary">
            {seo.eyebrow}
          </div>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-4xl">
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
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-4xl">
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
