import { Link } from "@tanstack/react-router";
import { useLocale } from "@/lib/i18n";

export function Footer() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-border/60 bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="font-display text-base font-bold">{t.footer.brand}</div>
          <p className="mt-2 text-sm text-muted-foreground">{t.footer.blurb}</p>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.footer.image}
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-primary">
                {t.footer.resizeImage}
              </Link>
            </li>
            <li>
              <Link to="/compress-image" className="hover:text-primary">
                {t.footer.compressImage}
              </Link>
            </li>
            <li>
              <Link to="/convert-image" className="hover:text-primary">
                {t.footer.convertFormat}
              </Link>
            </li>
            <li>
              <Link to="/remove-background" className="hover:text-primary">
                {t.header.removeBackground}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.footer.pdf}
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/image-to-pdf" className="hover:text-primary">
                {t.footer.imageToPdf}
              </Link>
            </li>
            <li>
              <Link to="/pdf-to-image" className="hover:text-primary">
                {t.footer.pdfToImage}
              </Link>
            </li>
            <li>
              <Link to="/merge-split-pdf" className="hover:text-primary">
                {t.footer.mergeSplitPdf}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {t.footer.company}
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link to="/pricing" className="hover:text-primary">
                {t.footer.pricing}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-primary">
                {t.footer.about}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {t.footer.brand}. {t.footer.copyright}
      </div>
    </footer>
  );
}
