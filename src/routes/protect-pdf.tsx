import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { FileDropzone } from "@/components/site/FileDropzone";
import { SeoJsonLd } from "@/components/site/SeoJsonLd";
import { ToolPage } from "@/components/site/ToolPage";
import { ActionBar, FileCard, Notice, ProgressBox } from "@/components/site/ToolBits";
import { getBrowserLocale, getTranslationSet } from "@/lib/i18n";
import { downloadBlob } from "@/lib/image";
import { baseName } from "@/lib/pdf-tools";
import { encryptPdf, pdfPasswordState } from "@/lib/qpdf";
import { createRouteHead } from "@/lib/seo";
import { pdfAccept } from "@/lib/tool-files";
import { useV3Copy } from "@/lib/tools-v3";
import { consumeProToolTrial } from "@/lib/pro";

export const Route = createFileRoute("/protect-pdf")({
  head: () => {
    const locale = getBrowserLocale();
    return createRouteHead({ t: getTranslationSet(locale), locale, routeKey: "protectPdf" });
  },
  component: ProtectPdfPage,
});

const passwordInputClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary";

function ProtectPdfPage() {
  const c = useV3Copy();
  const page = c.protectPdf;
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [restrict, setRestrict] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);

  const validation =
    password.length > 0 && password.length < 4
      ? page.tooShort
      : confirm.length > 0 && confirm !== password
        ? page.mismatch
        : null;
  const ready = !!file && password.length >= 4 && password === confirm;

  async function protect() {
    if (!file || !ready) return;
    setBusy(true);
    setError(null);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const state = await pdfPasswordState(bytes);
      if (state === "user") {
        setError(page.alreadyEncrypted);
        return;
      }
      const blob = await encryptPdf(bytes, password, { restrict });
      const next = { blob, filename: `${baseName(file.name)}-protected.pdf` };
      setResult(next);
      downloadBlob(next.blob, next.filename);
    } catch {
      setError(c.common.pdfError);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setFile(null);
    setPassword("");
    setConfirm("");
    setResult(null);
    setError(null);
  }

  return (
    <ToolPage eyebrow={page.eyebrow} title={page.titleText} description={page.intro}>
      <SeoJsonLd routeKey="protectPdf" />
      {!file ? (
        <FileDropzone
          accept={pdfAccept}
          onFiles={([next]) => next && consumeProToolTrial("protect-pdf") && setFile(next)}
          title={c.common.dropPdf}
          hint={c.common.pdfHint}
        />
      ) : (
        <div className="fade-in space-y-4">
          <FileCard name={file.name} size={file.size} icon={<Lock className="h-6 w-6" />} />

          <form
            className="space-y-3 rounded-2xl bg-surface p-3"
            onSubmit={(e) => {
              e.preventDefault();
              void protect();
            }}
          >
            <label className="block">
              <span className="mb-1.5 block px-0.5 text-xs font-semibold text-muted-foreground">
                {page.password}
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setResult(null);
                }}
                className={passwordInputClass}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block px-0.5 text-xs font-semibold text-muted-foreground">
                {page.confirm}
              </span>
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  setResult(null);
                }}
                className={passwordInputClass}
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={restrict}
                onChange={(e) => {
                  setRestrict(e.target.checked);
                  setResult(null);
                }}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              {page.restrict}
            </label>
            <p className="px-0.5 text-[11px] text-muted-foreground">{page.warning}</p>
            <button type="submit" className="hidden" />
          </form>

          {validation && <Notice tone="warn">{validation}</Notice>}
          {busy && <ProgressBox label={page.loadingEngine} />}
          {error && <Notice>{error}</Notice>}
          {result && <Notice tone="ok">{page.done}</Notice>}

          <ActionBar
            onReset={reset}
            resetLabel={c.common.newButton}
            result={result}
            busy={busy}
            primaryLabel={result ? c.common.downloadButton : page.protectButton}
            primaryIcon={result ? undefined : <Lock className="h-4 w-4" />}
            primaryDisabled={busy || (!result && !ready)}
            onPrimary={result ? undefined : () => void protect()}
          />
        </div>
      )}
    </ToolPage>
  );
}
