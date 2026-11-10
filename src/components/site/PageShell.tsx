import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileTabBar } from "./MobileTabBar";

/** Phone-width app column, centered on larger screens. */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[var(--app-w)] flex-col bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] shadow-[0_0_0_1px_var(--color-border)] has-[.mobile-cta]:pb-[calc(9rem+env(safe-area-inset-bottom))]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileTabBar />
    </div>
  );
}
