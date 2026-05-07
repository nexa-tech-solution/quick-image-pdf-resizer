import { getTranslationSet, useLocale } from "@/lib/i18n";
import {
  breadcrumbSchema,
  faqSchema,
  howToSchema,
  seoCopy,
  webApplicationSchema,
  websiteSchema,
  type SeoRouteKey,
  type ToolSeoKey,
} from "@/lib/seo";

export function SeoJsonLd({
  routeKey,
  tool,
  includeHomeSchemas = false,
}: {
  routeKey: SeoRouteKey;
  tool?: ToolSeoKey;
  includeHomeSchemas?: boolean;
}) {
  const { locale } = useLocale();
  const t = getTranslationSet(locale);
  const schemas: unknown[] = [];

  if (includeHomeSchemas) {
    schemas.push(
      websiteSchema(t),
      webApplicationSchema(t, "home"),
      faqSchema(t.home.seoBoost.faqs),
    );
  } else if (tool) {
    const seo = seoCopy[locale][tool];
    schemas.push(
      webApplicationSchema(t, routeKey),
      howToSchema({
        name: seo.howTitle,
        description: seo.intro,
        steps: seo.how,
      }),
      faqSchema(seo.faqs),
      breadcrumbSchema(t, routeKey),
    );
  } else if (routeKey !== "home") {
    schemas.push(breadcrumbSchema(t, routeKey));
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={`${routeKey}-${index}`}
          id={`json-ld-${routeKey}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
