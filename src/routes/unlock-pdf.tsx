import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LockOpen } from "lucide-react";
import { FileDropzone } from "@/components/site/FileDropzone";
import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { ToolPage } from "@/components/site/ToolPage";
import { ActionBar, FileCard, Notice, ProgressBox } from "@/components/site/ToolBits";
import { getBrowserLocale, getTranslationSet } from "@/lib/i18n";
import { downloadBlob } from "@/lib/image";
import { baseName } from "@/lib/pdf-tools";
import { decryptPdf, pdfPasswordState, WrongPasswordError } from "@/lib/qpdf";
import { createRouteHead } from "@/lib/seo";
import { pdfAccept } from "@/lib/tool-files";
import { useV3Copy } from "@/lib/tools-v3";
import { consumeProToolTrial } from "@/lib/pro";

export const Route = createFileRoute("/unlock-pdf")({
  head: () => {
    const locale = getBrowserLocale();
    return createRouteHead({ t: getTranslationSet(locale), locale, routeKey: "unlockPdf" });
  },
  component: UnlockPdfPage,
});

type State = "checking" | "none" | "user" | "ownerOnly";

function UnlockPdfPage() {
  const c = useV3Copy();
  const page = c.unlockPdf;
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<State>("checking");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  async function unlock(target: File, pw: string) {
    setBusy(true);
    setError(null);
    try {
      const blob = await decryptPdf(new Uint8Array(await target.arrayBuffer()), pw);
      const next = { blob, filename: `${baseName(target.name)}-unlocked.pdf` };
      setResult(next);
      downloadBlob(next.blob, next.filename);
    } catch (err) {
      setError(err instanceof WrongPasswordError ? page.wrongPassword : c.common.pdfError);
    } finally {
      setBusy(false);
    }
  }

  // Inspect the file: no password → nothing to do; restrictions only → strip right away.
  useEffect(() => {
    if (!file) return;
    let cancelled = false;
    setState("checking");
    setResult(null);
    setError(null);
    (async () => {
      const s = await pdfPasswordState(new Uint8Array(await file.arrayBuffer()));
      if (cancelled) return;
      setState(s);
      if (s === "ownerOnly") await unlock(file, "");
    })().catch(() => !cancelled && setError(c.common.pdfError));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      <SeoJsonLd routeKey="unlockPdf" />
      {!file ? (
        <FileDropzone
          accept={pdfAccept}
          onFiles={([next]) => next && consumeProToolTrial("unlock-pdf") && setFile(next)}
          title={c.common.dropPdf}
          hint={c.common.pdfHint}
        />
      ) : (
        <div className="fade-in space-y-4">
          <FileCard name={file.name} size={file.size} icon={<LockOpen className="h-6 w-6" />} />

          {state === "user" && !result && (
            <form
              className="rounded-2xl bg-surface p-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (password) void unlock(file, password);
              }}
            >
              <label className="block">
                <span className="mb-1.5 block px-0.5 text-xs font-semibold text-muted-foreground">
                  {page.password}
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
              </label>
            </form>
          )}

          {(busy || state === "checking") && !error && <ProgressBox label={page.loadingEngine} />}
          {state === "none" && <Notice tone="warn">{page.notEncrypted}</Notice>}
          {error && <Notice>{error}</Notice>}
          {result && (
            <Notice tone="ok">{state === "ownerOnly" ? page.ownerOnly : page.done}</Notice>
          )}

          <ActionBar
            onReset={() => {
              setFile(null);
              setPassword("");
            }}
            resetLabel={c.common.newButton}
            result={result}
            busy={busy}
            primaryLabel={result ? c.common.downloadButton : page.unlockButton}
            primaryIcon={result ? undefined : <LockOpen className="h-4 w-4" />}
            primaryDisabled={busy || (!result && (state !== "user" || !password))}
            onPrimary={result ? undefined : () => void unlock(file, password)}
          />
        </div>
      )}
    </ToolPage>
  );
}
