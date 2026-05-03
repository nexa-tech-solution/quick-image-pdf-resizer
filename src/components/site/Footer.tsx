import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="font-display text-base font-bold">ResizePro</div>
          <p className="mt-2 text-sm text-muted-foreground">
            Browser-based image & PDF tools. Private by design — files never leave your device.
          </p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Image
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/" className="hover:text-primary">Resize Image</Link></li>
            <li><Link to="/compress-image" className="hover:text-primary">Compress Image</Link></li>
            <li><Link to="/convert-image" className="hover:text-primary">Convert Format</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            PDF
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/compress-pdf" className="hover:text-primary">Compress PDF</Link></li>
            <li><Link to="/image-to-pdf" className="hover:text-primary">Image to PDF</Link></li>
            <li><Link to="/pdf-to-image" className="hover:text-primary">PDF to Image</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Company
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/pricing" className="hover:text-primary">Pricing</Link></li>
            <li><Link to="/about" className="hover:text-primary">About</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ResizePro. All rights reserved.
      </div>
    </footer>
  );
}
