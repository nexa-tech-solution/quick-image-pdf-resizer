import { createFileRoute } from "@tanstack/react-router";
import { ToolPage } from "@/components/site/ToolPage";
import { RemoveBackgroundTool } from "@/components/site/RemoveBackgroundTool";
import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { ToolSeoContent } from "@/components/site/ToolSeoContent";
import { getBrowserLocale, getTranslationSet, useLocale } from "@/lib/i18n";
import { createRouteHead } from "@/lib/seo";

export const Route = createFileRoute("/remove-background")({
  head: () => {
    const locale = getBrowserLocale();
    const t = getTranslationSet(locale);

    return createRouteHead({
      t,
      locale,
      routeKey: "removeBackground",
    });
  },
  component: RemoveBackgroundPage,
});

function RemoveBackgroundPage() {
  const { t } = useLocale();
  const page = t.routes.removeBackground;

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      <SeoJsonLd routeKey="removeBackground" tool="removeBackground" />
      <RemoveBackgroundTool />
      <ToolSeoContent tool="removeBackground" />
    </ToolPage>
  );
}
