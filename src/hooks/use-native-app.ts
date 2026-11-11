import { useEffect, useState } from "react";

/** API injected by the mobile app (quick-image-pdf-resizer-app/src/webview-bridge.ts). */
type NativeAppApi = {
  isNative?: boolean;
  isPro?: boolean | null;
  purchasesEnabled?: boolean;
  showPaywall?: () => void;
  openCustomerCenter?: () => void;
  restore?: () => void;
};

function getNativeApp(): NativeAppApi | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { NativeApp?: NativeAppApi }).NativeApp;
}

/**
 * Pro status and purchase actions when running inside the mobile app.
 * On the plain website `isNative` stays false, so Pro UI is hidden.
 * Resolved after mount to keep SSR and first client render identical.
 */
export function useNativeApp() {
  // `isNative` is true only once the app has confirmed the Pro status and that
  // purchases work — so Pro UI never flashes the wrong state or leads nowhere.
  const [state, setState] = useState({ isNative: false, isPro: false });

  useEffect(() => {
    const read = () => {
      const app = getNativeApp();
      const ready = !!app?.isNative && app.purchasesEnabled === true && app.isPro != null;
      setState({ isNative: ready, isPro: ready && !!app?.isPro });
    };
    read();
    window.addEventListener("native-pro-change", read);
    return () => window.removeEventListener("native-pro-change", read);
  }, []);

  return {
    ...state,
    showPaywall: () => getNativeApp()?.showPaywall?.(),
    openCustomerCenter: () => getNativeApp()?.openCustomerCenter?.(),
    restore: () => getNativeApp()?.restore?.(),
  };
}
