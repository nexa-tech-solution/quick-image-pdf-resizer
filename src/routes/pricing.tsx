import { Check, Sparkles } from "lucide-react";
import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/PageShell";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Free first, premium later | ResizePro" },
      {
        name: "description",
        content:
          "ResizePro is free forever with files up to 250 MB. Premium plans are coming later.",
      },
      { property: "og:title", content: "Pricing | ResizePro" },
      { property: "og:description", content: "Simple plans. Cancel anytime." },
    ],
  }),
  component: Pricing,
});

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    features: ["All image & PDF tools", "Files up to 250 MB", "10 files per day", "Ads supported"],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$4.99",
    cadence: "per month",
    features: [
      "Everything in Free",
      "Files up to 250 MB",
      "Unlimited daily files",
      "Batch processing",
      "Zero ads",
      "Priority queue",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    name: "Lifetime",
    price: "$29",
    cadence: "one-time",
    features: ["All Pro features", "Forever — no subscription", "Future tools included"],
    cta: "Buy lifetime",
    highlight: false,
  },
];

function Pricing() {
  return (
    <PageShell>
      <section className="border-b border-border bg-[var(--gradient-hero)]">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="font-mono text-xs uppercase tracking-widest text-primary">Pricing</div>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Free to use. Premium later.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Honest pricing. No tracking. Free files up to 250 MB.
          </p>
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
                  Most popular
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
