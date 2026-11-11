import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Download, X, ZoomIn, ZoomOut } from "lucide-react";
import { downloadBlob } from "@/lib/image";
import { cn } from "@/lib/utils";

export type LightboxImage = { src: string; name?: string; blob?: Blob };

const MIN = 1;
const MAX = 6;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Full-screen image viewer.
 * - pinch / wheel / double-tap to zoom, drag to pan when zoomed
 * - swipe left/right (or arrows) between images, swipe down or Esc to close
 */
export function Lightbox({
  images,
  index: startIndex = 0,
  onClose,
}: {
  images: LightboxImage[];
  index?: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragY, setDragY] = useState(0);
  const [animating, setAnimating] = useState(true);
  const stageRef = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    startDist?: number;
    startScale?: number;
    startPos?: { x: number; y: number };
    origin?: { x: number; y: number };
    swipeX?: number;
    lastTap?: number;
    moved?: boolean;
  }>({});

  const image = images[index];
  const many = images.length > 1;

  const reset = useCallback(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, []);

  const go = useCallback(
    (delta: number) => {
      if (!many) return;
      setIndex((i) => (i + delta + images.length) % images.length);
      reset();
    },
    [images.length, many, reset],
  );

  // Esc / arrows; lock page scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => setAnimating(false), 250);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [go, onClose]);

  /** Zoom keeping the point (cx, cy) — relative to stage centre — fixed on screen. */
  const zoomAt = (next: number, cx = 0, cy = 0, base = { scale, pos }) => {
    const s = clamp(next, MIN, MAX);
    const k = s / base.scale;
    const p =
      s === 1 ? { x: 0, y: 0 } : { x: cx - (cx - base.pos.x) * k, y: cy - (cy - base.pos.y) * k };
    setScale(s);
    setPos(p);
  };

  const centerOffset = (clientX: number, clientY: number) => {
    const r = stageRef.current!.getBoundingClientRect();
    return { x: clientX - (r.left + r.width / 2), y: clientY - (r.top + r.height / 2) };
  };

  const onPointerDown = (e: PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    g.moved = false;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      g.startDist = Math.hypot(a.x - b.x, a.y - b.y);
      g.startScale = scale;
      g.startPos = pos;
      g.origin = centerOffset((a.x + b.x) / 2, (a.y + b.y) / 2);
    } else {
      g.startPos = pos;
      g.origin = { x: e.clientX, y: e.clientY };
      g.swipeX = 0;
    }
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;

    if (pointers.current.size === 2 && g.startDist && g.startScale && g.startPos && g.origin) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      g.moved = true;
      zoomAt((g.startScale * dist) / g.startDist, g.origin.x, g.origin.y, {
        scale: g.startScale,
        pos: g.startPos,
      });
      return;
    }
    if (pointers.current.size !== 1 || !g.origin || !g.startPos) return;
    const dx = e.clientX - g.origin.x;
    const dy = e.clientY - g.origin.y;
    if (Math.abs(dx) + Math.abs(dy) > 6) g.moved = true;

    if (scale > 1) {
      setPos({ x: g.startPos.x + dx, y: g.startPos.y + dy });
    } else if (Math.abs(dy) > Math.abs(dx)) {
      setDragY(Math.max(0, dy));
    } else {
      g.swipeX = dx;
      setPos({ x: dx, y: 0 });
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (pointers.current.size > 0) {
      // One finger lifted after a pinch: continue as a pan from here.
      const [rest] = [...pointers.current.values()];
      g.origin = rest;
      g.startPos = pos;
      g.startDist = undefined;
      return;
    }

    if (scale <= 1) {
      if (dragY > 110) return onClose();
      setDragY(0);
      if (Math.abs(g.swipeX ?? 0) > 70) go((g.swipeX ?? 0) < 0 ? 1 : -1);
      else setPos({ x: 0, y: 0 });
    }

    // Double-tap toggles zoom.
    if (!g.moved) {
      const now = Date.now();
      if (g.lastTap && now - g.lastTap < 280) {
        const c = centerOffset(e.clientX, e.clientY);
        if (scale > 1) reset();
        else zoomAt(2.5, c.x, c.y);
        g.lastTap = 0;
      } else {
        g.lastTap = now;
      }
    }
  };

  const onWheel = (e: WheelEvent) => {
    const c = centerOffset(e.clientX, e.clientY);
    zoomAt(scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15), c.x, c.y);
  };

  if (typeof document === "undefined" || !image) return null;
  const backdrop = clamp(1 - dragY / 400, 0.3, 1);
  const gestureActive = pointers.current.size > 0;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex flex-col text-white"
      style={{ backgroundColor: `rgba(0,0,0,${0.94 * backdrop})` }}
    >
      {/* Top bar */}
      <div
        className="relative z-10 flex items-center gap-2 px-3 pb-2 transition-opacity"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0.75rem)", opacity: backdrop }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 truncate text-center text-sm font-medium">
          {image.name}
          {many && (
            <span className="ml-2 text-white/60">
              {index + 1}/{images.length}
            </span>
          )}
        </div>
        {image.blob ? (
          <button
            type="button"
            aria-label="Download"
            onClick={() =>
              downloadBlob(image.blob!, image.name ?? "image", { saveToHistory: false })
            }
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          >
            <Download className="h-5 w-5" />
          </button>
        ) : (
          <span className="w-10" />
        )}
      </div>

      {/* Stage */}
      <div
        ref={stageRef}
        className="relative flex min-h-0 flex-1 touch-none select-none items-center justify-center overflow-hidden"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        <img
          key={image.src}
          src={image.src}
          alt={image.name ?? ""}
          draggable={false}
          className={cn(
            "max-h-full max-w-full object-contain will-change-transform",
            !gestureActive && "transition-transform duration-200 ease-out",
            animating && "animate-in fade-in zoom-in-95 duration-200",
          )}
          style={{
            transform: `translate3d(${pos.x}px, ${pos.y + dragY}px, 0) scale(${scale * (1 - dragY / 1500)})`,
          }}
        />

        {many && scale === 1 && (
          <>
            <button
              type="button"
              aria-label="Previous"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => go(-1)}
              className="absolute left-2 hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:flex"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              aria-label="Next"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => go(1)}
              className="absolute right-2 hidden h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 sm:flex"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Zoom controls */}
      <div
        className="relative z-10 flex items-center justify-center gap-3 pt-2 transition-opacity"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0.75rem)", opacity: backdrop }}
      >
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => zoomAt(scale / 1.5)}
          disabled={scale <= MIN}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40"
        >
          <ZoomOut className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={reset}
          className="h-10 min-w-16 rounded-full bg-white/10 px-3 text-sm font-semibold tabular-nums hover:bg-white/20"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => zoomAt(scale * 1.5)}
          disabled={scale >= MAX}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-40"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
      </div>
    </div>,
    document.body,
  );
}

/** Convenience: `const lb = useLightbox(); lb.open(images, i); {lb.node}` */
export function useLightbox() {
  const [state, setState] = useState<{ images: LightboxImage[]; index: number } | null>(null);
  const close = useCallback(() => setState(null), []);
  return {
    open: (images: LightboxImage[], index = 0) => setState({ images, index }),
    close,
    node: state ? <Lightbox images={state.images} index={state.index} onClose={close} /> : null,
  };
}
