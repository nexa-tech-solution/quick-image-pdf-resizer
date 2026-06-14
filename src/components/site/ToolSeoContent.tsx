import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/i18n";
import {
  seoCopy,
  seoRouteRegistry,
  toolRouteBySeoKey,
  toolSeoUiCopy,
  type ToolSeoKey,
} from "@/lib/seo";

const relatedTools: Record<ToolSeoKey, ToolSeoKey[]> = {
  resize: ["compress", "convert", "imageToPdf"],
  compress: ["resize", "convert", "imageToPdf"],
  convert: ["resize", "compress", "pdfToImage"],
  removeBackground: ["compress", "convert", "resize"],
  imageToPdf: ["mergeSplitPdf", "resize", "pdfToImage"],
  pdfToImage: ["mergeSplitPdf", "imageToPdf", "convert"],
  mergeSplitPdf: ["imageToPdf", "pdfToImage", "convert"],
};

export function ToolSeoContent({ tool }: { tool: ToolSeoKey }) {
  const { locale } = useLocale();
  const copy = seoCopy[locale][tool];
  const ui = toolSeoUiCopy[locale];

  return (
    <section className="mt-12 border-t border-border pt-10">
      <div className="max-w-3xl">
        <h2 className="font-display text-2xl font-bold tracking-tight">{copy.title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{copy.intro}</p>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h3 className="font-display text-lg font-semibold">{copy.howTitle}</h3>
          <ol className="mt-4 space-y-3 text-sm text-muted-foreground">
            {copy.how.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="font-mono text-primary">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold">{copy.bestTitle}</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {copy.best.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-10">
        <h3 className="font-display text-lg font-semibold">{copy.faqTitle}</h3>
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {copy.faqs.map((faq) => (
            <div key={faq.q}>
              <h4 className="text-sm font-semibold">{faq.q}</h4>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h3 className="font-display text-lg font-semibold">{ui.relatedTools}</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          {relatedTools[tool].map((item) => (
            <Link
              key={item}
              to={seoRouteRegistry[toolRouteBySeoKey[item]].path}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition hover:border-primary/60 hover:text-primary"
            >
              {ui.labels[item]}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
