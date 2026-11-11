import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { recordRecentTool } from "@/lib/recent-tools";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { MobileTabBar } from "./MobileTabBar";
import { UpgradeSheet } from "./UpgradeSheet";

/** Phone-width app column, centered on larger screens. */
const nonToolPaths = new Set(["/", "/files", "/about", "/pricing"]);

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    if (!nonToolPaths.has(pathname)) recordRecentTool(pathname);
  }, [pathname]);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[var(--app-w)] flex-col bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] shadow-[0_0_0_1px_var(--color-border)] has-[.mobile-cta]:pb-[calc(9rem+env(safe-area-inset-bottom))]">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileTabBar />
      <UpgradeSheet />
    </div>
  );
}
