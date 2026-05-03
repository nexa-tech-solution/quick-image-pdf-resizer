import { Check, Sparkles } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";
import { useLocale } from "@/lib/i18n";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Free first, premium later | Resize Image" },
      {
        name: "description",
        content:
          "Resize Image is free forever with files up to 250 MB. Premium plans are coming later.",
      },
      { property: "og:title", content: "Pricing | Resize Image" },
      { property: "og:description", content: "Simple plans. Cancel anytime." },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const { t } = useLocale();
  const page = t.routes.pricing;
  const plans = [
    {
      ...page.free,
      price: "$0",
      highlight: false,
    },
    {
      ...page.pro,
      price: "$4.99",
      highlight: true,
    },
    {
      ...page.lifetime,
      price: "$29",
      highlight: false,
    },
  ];

  return (
    <PageShell>
      <section className="border-b border-border bg-[var(--gradient-hero)]">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="font-mono text-xs uppercase tracking-widest text-primary">
            {page.eyebrow}
          </div>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {page.titleText}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{page.intro}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                p.highlight
                  ? "border-primary bg-surface-elevated shadow-elevated"
                  : "border-border bg-surface-elevated"
              } ${p.name === "Pro" || p.name === "Lifetime" ? "select-none blur-sm" : ""}`}
            >
              {p.highlight && (
                <div className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  <Sparkles className="h-3 w-3" />
                  {page.popular}
                </div>
              )}
              <div className="font-display text-sm uppercase tracking-wider text-muted-foreground">
                {p.name}
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <div className="font-display text-4xl font-bold">{p.price}</div>
                <div className="text-sm text-muted-foreground">{p.cadence}</div>
              </div>
              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-7 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  p.highlight
                    ? "bg-primary text-primary-foreground hover:opacity-90"
                    : "border border-border hover:bg-secondary"
                }`}
              >
                {p.cta}
              </button>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
