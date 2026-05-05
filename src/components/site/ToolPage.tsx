import { ReactNode } from "react";
import { PageShell } from "./PageShell";

export function ToolPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <PageShell>
      <div className="border-b border-border bg-[var(--gradient-hero)]">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</div>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">{description}</p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>
    </PageShell>
  );
}
