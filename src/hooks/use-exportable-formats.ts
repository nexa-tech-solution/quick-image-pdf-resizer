import { useEffect, useState } from "react";
import { exportableFormats, type ImageFormat } from "@/lib/image";

/**
 * Output formats this browser can actually export. Starts with the full list so
 * SSR and first client render match, then narrows after mount. If the current
 * selection isn't exportable (e.g. AVIF in Chrome, WebP in Safari) it falls
 * back to the first supported format.
 */
export function useExportableFormats<T extends ImageFormat>(
  all: T[],
  current: T,
  setCurrent: (f: T) => void,
): T[] {
  const [formats, setFormats] = useState<T[]>(all);
  const key = all.join(",");

  useEffect(() => {
    const ok = exportableFormats(all);
    setFormats(ok);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (formats.length && !formats.includes(current)) setCurrent(formats[0]);
  }, [formats, current, setCurrent]);

  return formats;
}
