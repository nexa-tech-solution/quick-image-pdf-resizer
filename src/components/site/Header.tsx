import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Menu } from "lucide-react";
import faviconUrl from "@/assets/favicon.svg?url";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { localeMeta, supportedLocales, useLocale } from "@/lib/i18n";

const tools = [
  { to: "/", key: "resizeImage" },
  { to: "/remove-background", key: "removeBackground" },
  { to: "/compress-image", key: "compress" },
  { to: "/convert-image", key: "convert" },
  { to: "/image-to-pdf", key: "imageToPdf" },
  { to: "/pdf-to-image", key: "pdfToImage" },
  { to: "/merge-split-pdf", key: "mergeSplitPdf" },
  { to: "/pricing", key: "pricing" },
] as const;

export function Header() {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-2">
          <img src={faviconUrl} alt={t.header.resizeImage} className="h-8 w-8 shrink-0" />
          <span className="truncate font-display text-lg font-bold tracking-tight">
            {t.header.resizeImage}
          </span>
        </Link>
        <nav
          className={[
            "order-3 flex w-full min-w-0 items-center gap-1 overflow-x-auto whitespace-nowrap",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "md:order-none md:flex-1 md:justify-center lg:justify-start",
          ].join(" ")}
        >
          {tools.map((item) => (
            <div key={"to" in item ? item.to : item.href} className="shrink-0">
              {"to" in item ? (
                <Link
                  to={item.to}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground lg:px-4"
                  activeProps={{
                    className:
                      "rounded-md bg-secondary px-3 py-2 text-sm font-medium text-foreground lg:px-4",
                  }}
                  activeOptions={{ exact: true }}
                >
                  {t.header[item.key]}
                </Link>
              ) : (
                <a
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground lg:px-4"
                >
                  {t.header[item.key]}
                </a>
              )}
            </div>
          ))}
        </nav>
        <div className="order-2 ml-auto flex shrink-0 items-center gap-2 md:order-none md:ml-0">
          <div ref={menuRef} className="relative">
            <label className="sr-only" htmlFor="locale-button">
              {t.header.language}
            </label>
            <button
              id="locale-button"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background text-lg transition hover:border-primary/60 focus:border-primary focus:outline-none"
              title={`${t.header.language}: ${localeMeta[locale].country}`}
            >
              <span aria-hidden="true">{localeMeta[locale].flag}</span>
              <span className="sr-only">
                {t.header.language}: {localeMeta[locale].country}
              </span>
            </button>
            {open ? (
              <div
                role="listbox"
                aria-label={t.header.language}
                className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-background shadow-lg"
              >
                {supportedLocales.map((item) => {
                  const active = item === locale;

                  return (
                    <button
                      key={item}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        setLocale(item);
                        setOpen(false);
                      }}
                      className={[
                        "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition hover:bg-secondary",
                        active
                          ? "bg-secondary font-medium text-foreground"
                          : "text-muted-foreground",
                      ].join(" ")}
                    >
                      <span aria-hidden="true" className="text-base">
                        {localeMeta[item].flag}
                      </span>
                      <span>{localeMeta[item].country}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
          <Link
            to="/pricing"
            className="hidden shrink-0 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 md:inline-flex"
          >
            {t.header.getPro}
          </Link>
          <Sheet
            open={mobileMenuOpen}
            onOpenChange={(value) => {
              setMobileMenuOpen(value);
              if (value) setOpen(false);
            }}
          >
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="md:hidden shrink-0"
                aria-label={t.toolsGrid.toolset}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(20rem,calc(100vw-1rem))] p-0">
              <div className="flex h-full flex-col">
                <SheetHeader className="border-b border-border px-3 py-3 text-left">
                  <SheetTitle className="mt-2 font-display text-lg tracking-tight">
                    {t.toolsGrid.title}
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex-1 space-y-1.5 overflow-y-auto px-2 py-2">
                  {tools.map((item) => {
                    const label = t.header[item.key];

                    return (
                      <div key={"to" in item ? item.to : item.href}>
                        {"to" in item ? (
                          <Link
                            to={item.to}
                            onClick={() => setMobileMenuOpen(false)}
                            className="group flex items-center justify-between rounded-lg border border-border/60 bg-surface px-3 py-2 text-left transition hover:border-primary/40 hover:bg-primary-soft/40"
                            activeProps={{
                              className:
                                "group flex items-center justify-between rounded-lg border border-primary/30 bg-primary-soft px-3 py-2 text-left",
                            }}
                            activeOptions={{ exact: true }}
                          >
                            <span className="min-w-0 truncate text-sm font-medium leading-5 text-foreground">
                              {label}
                            </span>
                            <ArrowRight className="ml-3 h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                          </Link>
                        ) : (
                          <a
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="group flex items-center justify-between rounded-lg border border-border/60 bg-surface px-3 py-2 text-left transition hover:border-primary/40 hover:bg-primary-soft/40"
                          >
                            <span className="min-w-0 truncate text-sm font-medium leading-5 text-foreground">
                              {label}
                            </span>
                            <ArrowRight className="ml-3 h-3.5 w-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </nav>

                <div className="border-t border-border bg-background px-2 py-2">
                  <Link
                    to="/pricing"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-lg bg-foreground px-3 py-2.5 text-sm font-medium text-background transition hover:opacity-90"
                  >
                    {t.header.getPro}
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
