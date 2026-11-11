import { useEffect, useState } from "react";

/** API injected by the mobile app (quick-image-pdf-resizer-app/src/webview-bridge.ts). */
type NativeAppApi = {
  isNative?: boolean;
  isPro?: boolean;
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
  const [state, setState] = useState({ isNative: false, isPro: false });

  useEffect(() => {
    const app = getNativeApp();
    if (!app?.isNative) return;
    setState({ isNative: true, isPro: !!app.isPro });
    const onChange = (e: Event) =>
      setState({ isNative: true, isPro: !!(e as CustomEvent<{ isPro: boolean }>).detail?.isPro });
    window.addEventListener("native-pro-change", onChange);
    return () => window.removeEventListener("native-pro-change", onChange);
  }, []);

  return {
    ...state,
    showPaywall: () => getNativeApp()?.showPaywall?.(),
    openCustomerCenter: () => getNativeApp()?.openCustomerCenter?.(),
    restore: () => getNativeApp()?.restore?.(),
  };
}
