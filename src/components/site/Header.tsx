import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import faviconUrl from "@/assets/favicon.svg?url";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { localeMeta, supportedLocales, useLocale } from "@/lib/i18n";

const tools = [
  { to: "/", key: "resizeImage" },
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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img src={faviconUrl} alt={t.header.resizeImage} className="h-8 w-8 shrink-0" />
          <span className="truncate font-display text-lg font-bold tracking-tight">
            {t.header.resizeImage}
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {tools.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{
                className: "rounded-md px-3 py-2 text-sm font-medium text-foreground bg-secondary",
              }}
              activeOptions={{ exact: true }}
            >
              {t.header[item.key]}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
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
            className="hidden rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 md:inline-flex"
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
                className="md:hidden"
                aria-label={t.toolsGrid.toolset}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(22rem,calc(100vw-2rem))] p-0">
              <SheetHeader className="border-b border-border px-5 py-4 text-left">
                <SheetTitle className="font-display">{t.toolsGrid.title}</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-3 py-4">
                {tools.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                    activeProps={{
                      className:
                        "rounded-lg px-3 py-3 text-sm font-medium text-foreground bg-secondary",
                    }}
                    activeOptions={{ exact: true }}
                  >
                    {t.header[item.key]}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
