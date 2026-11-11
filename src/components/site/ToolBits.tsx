import type { ReactNode } from "react";
import { Download, FileText, Loader2, RefreshCw } from "lucide-react";
import { ShareButton } from "@/components/site/ShareButton";
import { downloadBlob, formatBytes } from "@/lib/image";
import { cn } from "@/lib/utils";

/** Small shared building blocks for the phase-3 tool pages. */

export function FileCard({
  name,
  size,
  extra,
  icon,
}: {
  name: string;
  size?: number;
  extra?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="rise-in flex items-center gap-3 rounded-2xl bg-surface p-3">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
        {icon ?? <FileText className="h-6 w-6" />}
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{name}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {size !== undefined && formatBytes(size)}
          {extra}
        </div>
      </div>
    </div>
  );
}

export function ProgressBox({
  label,
  progress,
}: {
  label: string;
  progress?: { current: number; total: number } | null;
}) {
  return (
    <div className="rise-in rounded-2xl bg-surface p-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        {label}
        {progress && ` ${progress.current}/${progress.total}`}
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
        {progress ? (
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-300 ease-out"
            style={{ width: `${(progress.current / progress.total) * 100}%` }}
          />
        ) : (
          <div className="skeleton h-full w-full rounded-full !bg-primary/30" />
        )}
      </div>
    </div>
  );
}

export function Notice({
  tone = "error",
  children,
}: {
  tone?: "error" | "warn" | "ok" | "info";
  children: ReactNode;
}) {
  return (
    <p
      className={cn(
        "rise-in rounded-xl px-3 py-2 text-sm",
        tone === "error" && "bg-destructive/10 text-destructive",
        tone === "warn" && "bg-amber-50 text-xs text-amber-800",
        tone === "ok" && "bg-success/15 text-success",
        tone === "info" && "bg-secondary text-xs text-muted-foreground",
      )}
    >
      {children}
    </p>
  );
}

/** Reset · share · primary action row, matching the existing tool pages. */
export function ActionBar({
  onReset,
  resetLabel,
  result,
  busy,
  primaryLabel,
  onPrimary,
  primaryIcon,
  primaryDisabled,
}: {
  onReset: () => void;
  resetLabel: string;
  result: { blob: Blob; filename: string } | null;
  busy?: boolean;
  primaryLabel: string;
  /** Defaults to downloading `result`. */
  onPrimary?: () => void;
  primaryIcon?: ReactNode;
  primaryDisabled?: boolean;
}) {
  const disabled = primaryDisabled ?? (!result || busy);
  return (
    <div className="mobile-cta flex gap-2">
      <button
        type="button"
        aria-label={resetLabel}
        onClick={onReset}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition hover:bg-secondary"
      >
        <RefreshCw className="h-5 w-5" />
      </button>
      <ShareButton
        disabled={!result}
        getFiles={() => (result ? [{ blob: result.blob, filename: result.filename }] : [])}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (onPrimary) onPrimary();
          else if (result) downloadBlob(result.blob, result.filename);
        }}
        className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-primary-foreground shadow-soft transition hover:opacity-90 disabled:opacity-50"
      >
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          (primaryIcon ?? <Download className="h-4 w-4" />)
        )}
        {primaryLabel}
      </button>
    </div>
  );
}

export function Segmented<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { id: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 px-0.5 text-xs font-semibold text-muted-foreground">{label}</div>
      <div className="flex gap-1.5">
        {options.map((o) => (
          <button
            key={String(o.id)}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "h-9 flex-1 rounded-lg px-2 text-sm font-medium transition",
              o.id === value
                ? "bg-primary text-primary-foreground shadow-soft"
                : "bg-background shadow-soft hover:bg-primary-soft",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
