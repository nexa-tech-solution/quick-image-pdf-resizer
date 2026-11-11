import { useEffect, useState, type ReactNode } from "react";
import { getRecentTools } from "@/lib/recent-tools";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  FileArchive,
  FileImage,
  FileStack,
  FileText,
  ImageIcon,
  Layers,
  Minimize2,
  Scaling,
  Scissors,
  Type,
  Images,
  FileType,
  Lock,
  LockOpen,
  ScanLine,
  Eye,
  type LucideIcon,
} from "lucide-react";
import type { TranslationSet } from "@/lib/i18n";
import { useLocale } from "@/lib/i18n";

type HeaderKey = keyof TranslationSet["header"];

/** Pastel tile per tool: soft background + saturated icon color. */
const gridTools: { to: string; key: HeaderKey; icon: LucideIcon; tile: string }[] = [
  { to: "/", key: "resizeImage", icon: ImageIcon, tile: "bg-rose-100 text-rose-600" },
  { to: "/compress-image", key: "compress", icon: Layers, tile: "bg-emerald-100 text-emerald-600" },
  { to: "/convert-image", key: "convert", icon: FileImage, tile: "bg-sky-100 text-sky-600" },
  {
    to: "/remove-background",
    key: "removeBackground",
    icon: Scissors,
    tile: "bg-violet-100 text-violet-600",
  },
  {
    to: "/compress-pdf",
    key: "compressPdf",
    icon: FileArchive,
    tile: "bg-red-100 text-red-600",
  },
  { to: "/image-to-pdf", key: "imageToPdf", icon: FileText, tile: "bg-orange-100 text-orange-600" },
  { to: "/pdf-to-image", key: "pdfToImage", icon: FileImage, tile: "bg-amber-100 text-amber-600" },
  {
    to: "/merge-split-pdf",
    key: "mergeSplitPdf",
    icon: FileStack,
    tile: "bg-teal-100 text-teal-600",
  },
  { to: "/view", key: "viewFile", icon: Eye, tile: "bg-cyan-100 text-cyan-700" },
  {
    to: "/scan-document",
    key: "scanDocument",
    icon: ScanLine,
    tile: "bg-indigo-100 text-indigo-600",
  },
  { to: "/text-to-pdf", key: "textToPdf", icon: Type, tile: "bg-lime-100 text-lime-700" },
  { to: "/pdf-to-word", key: "pdfToWord", icon: FileType, tile: "bg-blue-100 text-blue-600" },
  {
    to: "/extract-pdf-images",
    key: "extractPdfImages",
    icon: Images,
    tile: "bg-fuchsia-100 text-fuchsia-600",
  },
  { to: "/protect-pdf", key: "protectPdf", icon: Lock, tile: "bg-slate-200 text-slate-700" },
  { to: "/unlock-pdf", key: "unlockPdf", icon: LockOpen, tile: "bg-yellow-100 text-yellow-700" },
];

/** App-style home: two featured cards + an icon grid of every tool. */
export function AppHomeDashboard() {
  const { t } = useLocale();
  // Read after mount: localStorage isn't available during SSR.
  const [recent, setRecent] = useState<typeof gridTools>([]);
  useEffect(() => {
    const paths = getRecentTools();
    setRecent(
      paths
        .map((path) => gridTools.find((tool) => tool.to === path))
        .filter((tool): tool is (typeof gridTools)[number] => Boolean(tool)),
    );
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <FeatureCard
          href="#tool"
          gradient="from-rose-500 via-red-500 to-red-600"
          icon={Scaling}
          title={t.toolsGrid.resizeImage.title}
          desc={t.toolsGrid.resizeImage.desc}
          art={<ResizeArt />}
        />
        <FeatureCard
          to="/compress-image"
          gradient="from-emerald-500 via-green-500 to-teal-600"
          icon={Minimize2}
          title={t.toolsGrid.compressImage.title}
          desc={t.toolsGrid.compressImage.desc}
          art={<CompressArt />}
        />
      </div>

      {recent.length > 0 && (
        <section>
          <h2 className="mb-2.5 text-base font-bold">{t.header.recent}</h2>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {recent.map(({ to, key, icon: Icon, tile }) => (
              <Link
                key={to}
                to={to}
                className="flex shrink-0 items-center gap-2 rounded-full bg-surface py-1.5 pl-1.5 pr-3.5 text-sm font-medium transition hover:bg-secondary active:scale-[0.98]"
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-full ${tile}`}>
                  <Icon className="h-4 w-4" />
                </span>
                {t.header[key]}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-base font-bold">{t.toolsGrid.toolset}</h2>
        <div className="rise-stagger grid grid-cols-4 gap-x-2 gap-y-4">
          {gridTools.map(({ to, key, icon: Icon, tile }) => (
            <Link key={to} to={to} className="group flex flex-col items-center gap-1.5 text-center">
              <span
                className={`flex h-14 w-14 items-center justify-center rounded-full transition group-active:scale-95 ${tile}`}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="line-clamp-2 text-[11px] font-medium leading-tight text-foreground">
                {t.header[key]}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  href,
  to,
  gradient,
  icon: Icon,
  title,
  desc,
  art,
}: {
  href?: string;
  to?: string;
  gradient: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  art: ReactNode;
}) {
  const className = `group relative flex min-h-44 flex-col overflow-hidden rounded-3xl bg-gradient-to-br ${gradient} p-3.5 text-white shadow-elevated transition active:scale-[0.98]`;
  const body = (
    <>
      {/* soft light blobs for depth */}
      <span className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
      <span className="pointer-events-none absolute -bottom-10 -left-6 h-24 w-24 rounded-full bg-black/10 blur-2xl" />

      <div className="relative flex items-start justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/25 ring-1 ring-white/30 backdrop-blur">
          <Icon className="h-5 w-5" />
        </span>
        {art}
      </div>

      <div className="relative mt-auto pt-3">
        <div className="text-[15px] font-bold leading-tight">{title}</div>
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-white/85">{desc}</p>
      </div>
      <span className="absolute bottom-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-foreground opacity-0 transition group-hover:opacity-100">
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </>
  );

  return to ? (
    <Link to={to} className={className}>
      {body}
    </Link>
  ) : (
    <a href={href} className={className}>
      {body}
    </a>
  );
}

/** Mini illustration: a large photo frame shrinking into a smaller one. */
function ResizeArt() {
  return (
    <span aria-hidden="true" className="relative mr-1 mt-1 block h-12 w-14">
      <span className="absolute inset-0 rounded-lg border-2 border-dashed border-white/60" />
      <span className="absolute bottom-0 left-0 flex h-8 w-9 items-end overflow-hidden rounded-md bg-white shadow-md">
        <span className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-rose-400" />
        <span className="h-3 w-full bg-gradient-to-r from-rose-300 to-rose-200 [clip-path:polygon(0_100%,35%_20%,60%_70%,80%_40%,100%_100%)]" />
      </span>
      <span className="absolute -right-0.5 -top-0.5 rounded bg-white px-1 text-[8px] font-bold leading-3 text-rose-600">
        1080
      </span>
    </span>
  );
}

/** Mini illustration: file size bars shrinking. */
function CompressArt() {
  return (
    <span aria-hidden="true" className="mr-1 mt-1 flex h-12 flex-col justify-center gap-1">
      <span className="flex items-center gap-1">
        <span className="h-2 w-12 rounded-full bg-white/40" />
        <span className="text-[8px] font-bold leading-none text-white/80">2.4M</span>
      </span>
      <span className="flex items-center gap-1">
        <span className="h-2 w-5 rounded-full bg-white" />
        <span className="rounded bg-white px-1 text-[8px] font-bold leading-3 text-emerald-600">
          -80%
        </span>
      </span>
    </span>
  );
}
