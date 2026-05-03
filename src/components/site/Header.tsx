import { Link } from "@tanstack/react-router";
import faviconUrl from "@/assets/favicon.svg?url";

const tools = [
  { to: "/", label: "Resize Image" },
  { to: "/compress-image", label: "Compress" },
  { to: "/convert-image", label: "Convert" },
  { to: "/image-to-pdf", label: "Image → PDF" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={faviconUrl} alt="Resize Image" className="h-8 w-8 shrink-0" />
          <span className="font-display text-lg font-bold tracking-tight">Resize Image</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {tools.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{
                className: "rounded-md px-3 py-2 text-sm font-medium text-foreground bg-secondary",
              }}
              activeOptions={{ exact: true }}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/pricing"
          className="hidden rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90 sm:inline-flex"
        >
          Get Pro
        </Link>
      </div>
    </header>
  );
}
