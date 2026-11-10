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
      <div className="sm:border-b sm:border-border sm:bg-[var(--gradient-hero)]">
        <div className="mx-auto max-w-4xl px-4 pt-4 sm:px-6 sm:py-14 lg:px-8">
          <div className="hidden font-mono text-xs uppercase tracking-widest text-primary sm:block">
            {eyebrow}
          </div>
          <h1 className="font-display text-xl font-bold tracking-tight sm:mt-3 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 hidden max-w-2xl text-lg text-muted-foreground sm:block">
            {description}
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-3 sm:px-6 sm:py-10 lg:px-8">{children}</div>
    </PageShell>
  );
}
