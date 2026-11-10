import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, FileArchive, FileText, FolderOpen, Lock, Trash2 } from "lucide-react";
import { PageShell } from "@/components/site/PageShell";
import { ShareButton } from "@/components/site/ShareButton";
import {
  clearHistory,
  listHistory,
  onHistoryChange,
  removeFromHistory,
  type HistoryEntry,
} from "@/lib/file-history";
import { useLocale } from "@/lib/i18n";
import { downloadBlob, formatBytes } from "@/lib/image";

export const Route = createFileRoute("/files")({
  // Personal, device-local page: keep it out of search results.
  head: () => ({
    meta: [{ title: "My files | Resize Image" }, { name: "robots", content: "noindex" }],
  }),
  component: FilesPage,
});

function FilesPage() {
  const { t, locale } = useLocale();
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);

  useEffect(() => {
    const load = () => void listHistory().then(setEntries);
    load();
    return onHistoryChange(load);
  }, []);

  // Group by calendar day for an app-like list.
  const groups = useMemo(() => {
    const map = new Map<string, HistoryEntry[]>();
    for (const entry of entries ?? []) {
      const day = new Date(entry.createdAt).toLocaleDateString(locale, {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
      map.set(day, [...(map.get(day) ?? []), entry]);
    }
    return [...map.entries()];
  }, [entries, locale]);

  return (
    <PageShell>
      <div className="px-4 pb-6 pt-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold">{t.header.myFiles}</h1>
          {entries && entries.length > 0 && (
            <button
              type="button"
              onClick={() => void clearHistory()}
              className="rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-secondary hover:text-destructive"
            >
              {t.header.clearAll}
            </button>
          )}
        </div>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" />
          {t.header.filesPrivacy}
        </p>

        {entries === null ? null : entries.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary">
              <FolderOpen className="h-9 w-9" />
            </span>
            <h2 className="mt-4 text-base font-semibold">{t.header.filesEmpty}</h2>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">{t.header.filesEmptyHint}</p>
          </div>
        ) : (
          <div className="mt-4 space-y-5">
            {groups.map(([day, items]) => (
              <section key={day}>
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {day}
                </h2>
                <div className="space-y-2">
                  {items.map((entry) => (
                    <FileRow key={entry.id} entry={entry} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}

function FileRow({ entry }: { entry: HistoryEntry }) {
  const { t, locale } = useLocale();
  const isImage = entry.type.startsWith("image/");
  const [thumb, setThumb] = useState<string | null>(null);

  useEffect(() => {
    if (!isImage) return;
    const url = URL.createObjectURL(entry.blob);
    setThumb(url);
    return () => URL.revokeObjectURL(url);
  }, [entry.blob, isImage]);

  const Icon = entry.type === "application/zip" ? FileArchive : FileText;
  const time = new Date(entry.createdAt).toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-surface p-2">
      {thumb ? (
        <img
          src={thumb}
          alt=""
          className="h-12 w-12 shrink-0 rounded-xl bg-background object-cover"
        />
      ) : (
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-6 w-6" />
        </span>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{entry.filename}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {formatBytes(entry.size)} · {time}
        </div>
      </div>
      <ShareButton
        className="h-10 w-10 rounded-full border-0 bg-background shadow-soft"
        getFiles={() => [{ blob: entry.blob, filename: entry.filename }]}
      />
      <button
        type="button"
        aria-label={t.resizeTool.download}
        onClick={() => downloadBlob(entry.blob, entry.filename, { saveToHistory: false })}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background text-primary shadow-soft"
      >
        <Download className="h-[18px] w-[18px]" />
      </button>
      <button
        type="button"
        aria-label={t.header.deleteFile}
        onClick={() => void removeFromHistory(entry.id)}
        className="flex h-10 w-8 shrink-0 items-center justify-center text-muted-foreground transition hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
