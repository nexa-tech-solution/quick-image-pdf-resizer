import { Link } from "@tanstack/react-router";
import { Maximize2 } from "lucide-react";

const tools = [
  { to: "/", label: "Resize Image" },
  { to: "/compress-image", label: "Compress" },
  { to: "/convert-image", label: "Convert" },
  { to: "/compress-pdf", label: "PDF Tools" },
  { to: "/pricing", label: "Pricing" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Maximize2 className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">ResizePro</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {tools.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "rounded-md px-3 py-2 text-sm font-medium text-foreground bg-secondary" }}
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
