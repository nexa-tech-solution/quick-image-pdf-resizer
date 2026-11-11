import { useEffect, useState, type ReactNode } from "react";
import { Maximize2 } from "lucide-react";
import { useLightbox } from "@/components/site/Lightbox";
import { cn } from "@/lib/utils";

/**
 * Image that never flashes:
 * - no `src` yet → shimmering skeleton (or `placeholder`)
 * - new `src` → keeps showing the previous image and cross-fades once the new one is decoded
 * - `busy` → dims/blurs slightly while a new version is being produced
 *
 * The wrapper owns the box size (pass aspect/size classes via `className`).
 */
export function SmoothImage({
  src,
  alt = "",
  className,
  imgClassName,
  busy = false,
  placeholder,
  onError,
  zoomable = false,
  zoomName,
}: {
  src?: string | null;
  alt?: string;
  className?: string;
  imgClassName?: string;
  busy?: boolean;
  placeholder?: ReactNode;
  onError?: () => void;
  /** Tap to open the image full screen. */
  zoomable?: boolean;
  zoomName?: string;
}) {
  const lightbox = useLightbox();
  // `shown` is the src currently fully visible; `incoming` is fading in on top.
  const [shown, setShown] = useState<string | null>(null);
  const [incoming, setIncoming] = useState<string | null>(null);
  const [incomingReady, setIncomingReady] = useState(false);

  useEffect(() => {
    if (!src) {
      setShown(null);
      setIncoming(null);
      return;
    }
    if (src === shown) return;
    setIncoming(src);
    setIncomingReady(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const fit = imgClassName ?? "object-contain";
  const empty = !shown && !(incoming && incomingReady);

  return (
    <>
      <div
        className={cn(
          "relative overflow-hidden",
          zoomable && src && "group cursor-zoom-in",
          className,
        )}
        onClick={
          zoomable && src ? () => lightbox.open([{ src, name: zoomName ?? alt }]) : undefined
        }
      >
        {empty && (placeholder ?? <div className="skeleton absolute inset-0" />)}

        {shown && (
          <img
            src={shown}
            alt={alt}
            draggable={false}
            className={cn(
              "absolute inset-0 h-full w-full transition-[opacity,filter] duration-300",
              fit,
              busy && "opacity-70 blur-[1px]",
            )}
          />
        )}

        {incoming && (
          <img
            key={incoming}
            src={incoming}
            alt={alt}
            draggable={false}
            onLoad={() => {
              setIncomingReady(true);
              // After the fade completes, promote it and drop the old layer.
              window.setTimeout(() => {
                setShown(incoming);
                setIncoming((cur) => (cur === incoming ? null : cur));
              }, 300);
            }}
            onError={onError}
            className={cn(
              "absolute inset-0 h-full w-full transition-opacity duration-300 ease-out",
              fit,
              incomingReady ? "opacity-100" : "opacity-0",
            )}
          />
        )}

        {zoomable && src && !empty && (
          <span className="pointer-events-none absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/45 text-white opacity-80 backdrop-blur transition group-hover:opacity-100">
            <Maximize2 className="h-3.5 w-3.5" />
          </span>
        )}
      </div>
      {lightbox.node}
    </>
  );
}
