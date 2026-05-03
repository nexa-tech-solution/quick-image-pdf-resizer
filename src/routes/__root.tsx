import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Analytics } from "@vercel/analytics/react";
import appCss from "../styles.css?url";
import faviconUrl from "@/assets/favicon.svg?url";
import { LocaleProvider, getBrowserLocale, getTranslationSet, useLocale } from "@/lib/i18n";

function NotFoundComponent() {
  const { t } = useLocale();
  const page = t.routes.notFound;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">{page.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{page.description}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            {page.button}
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => {
    const locale = getBrowserLocale();
    const t = getTranslationSet(locale);
    const title = `Resize Image — ${t.home.titlePrefix} ${t.home.titleAccent} ${t.home.titleSuffix}`;

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title },
        { name: "description", content: t.home.description },
        { name: "author", content: "Resize Image" },
        { name: "robots", content: "index,follow" },
        { name: "theme-color", content: "#111827" },
        { property: "og:title", content: title },
        { property: "og:description", content: t.home.description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [
        { rel: "canonical", href: "/" },
        { rel: "stylesheet", href: appCss },
        { rel: "icon", type: "image/svg+xml", href: faviconUrl },
        { rel: "shortcut icon", href: faviconUrl },
        { rel: "apple-touch-icon", href: faviconUrl },
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;600;700&family=Work+Sans:wght@400;500;600&display=swap",
        },
      ],
      scripts: [
        {
          tag: "script",
          attrs: {
            async: true,
            src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3012411444875177",
            crossOrigin: "anonymous",
          },
        },
      ],
    };
  },
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <HtmlDocument>{children}</HtmlDocument>
    </LocaleProvider>
  );
}

function HtmlDocument({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();

  return (
    <html lang={locale}>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
        <Analytics />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
