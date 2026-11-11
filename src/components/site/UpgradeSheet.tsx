import { useEffect, useState } from "react";
import { Check, Crown } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useLocale, type Locale } from "@/lib/i18n";
import {
  FREE_LIMITS,
  openPaywall,
  reasonSource,
  UPGRADE_EVENT,
  type ProFeature,
  type ProTool,
  type UpgradeReason,
} from "@/lib/pro";

type Copy = {
  batch: (selected: number, limit: number) => string;
  pages: (limit: number) => string;
  locked: (tool: string) => string;
  daily: (limit: number) => string;
  milestone: (count: number) => string;
  features: Record<ProFeature, string>;
  general: string;
  subtitle: string;
  perks: string[];
  cta: string;
  later: string;
  tools: Record<ProTool, string>;
};

const en: Copy = {
  batch: (s, l) => `You picked ${s} files. Free handles ${l} at a time.`,
  pages: (l) => `Free scans include up to ${l} pages.`,
  locked: (t) => `You've used your free try of ${t}.`,
  daily: (l) => `You've used today's ${l} free background removals.`,
  milestone: (n) => `You've processed ${n} files. Nice work! 🎉`,
  features: {
    "pdf-strong": "The Smallest compression level is a Pro feature.",
    "hd-size": `Sizes above ${FREE_LIMITS.maxDimension}px are a Pro feature.`,
  },
  general: "Get more with Pro",
  subtitle: "Unlock every tool with no limits. Files never leave your phone.",
  perks: [
    "Unlimited files per batch",
    "All PDF tools, including PDF → Word",
    "Unlimited AI background removal",
  ],
  cta: "Upgrade to Pro",
  later: "Not now",
  tools: {
    "pdf-to-word": "PDF → Word",
    "protect-pdf": "Protect PDF",
    "unlock-pdf": "Unlock PDF",
    "extract-pdf-images": "Extract images",
  },
};

const copy: Record<Locale, Copy> = {
  "en-US": en,
  "en-IN": en,
  "vi-VN": {
    batch: (s, l) => `Bạn chọn ${s} file. Bản Free xử lý ${l} file mỗi lần.`,
    pages: (l) => `Bản Free quét tối đa ${l} trang.`,
    locked: (t) => `Bạn đã dùng hết lượt thử miễn phí của ${t}.`,
    daily: (l) => `Bạn đã dùng hết ${l} lượt xóa nền miễn phí hôm nay.`,
    milestone: (n) => `Bạn đã xử lý xong ${n} file. Tuyệt vời! 🎉`,
    features: {
      "pdf-strong": "Mức nén Mạnh (nhỏ nhất) dành cho Pro.",
      "hd-size": `Kích thước trên ${FREE_LIMITS.maxDimension}px dành cho Pro.`,
    },
    general: "Dùng nhiều hơn với Pro",
    subtitle: "Mở khóa mọi công cụ, không giới hạn. File luôn ở trên máy bạn.",
    perks: [
      "Không giới hạn số file mỗi lần",
      "Đủ công cụ PDF, cả PDF → Word",
      "Xóa nền AI không giới hạn",
    ],
    cta: "Nâng cấp Pro",
    later: "Để sau",
    tools: {
      "pdf-to-word": "PDF → Word",
      "protect-pdf": "Đặt mật khẩu PDF",
      "unlock-pdf": "Gỡ mật khẩu PDF",
      "extract-pdf-images": "Trích ảnh PDF",
    },
  },
  "pt-BR": {
    batch: (s, l) => `Você escolheu ${s} arquivos. O plano grátis processa ${l} por vez.`,
    pages: (l) => `O plano grátis digitaliza até ${l} páginas.`,
    locked: (t) => `Você já usou o teste grátis de ${t}.`,
    daily: (l) => `Você usou as ${l} remoções de fundo grátis de hoje.`,
    milestone: (n) => `Você já processou ${n} arquivos. Mandou bem! 🎉`,
    features: {
      "pdf-strong": "O nível Menor tamanho é um recurso Pro.",
      "hd-size": `Tamanhos acima de ${FREE_LIMITS.maxDimension}px são recurso Pro.`,
    },
    general: "Faça mais com o Pro",
    subtitle: "Desbloqueie todas as ferramentas, sem limites. Seus arquivos nunca saem do celular.",
    perks: [
      "Arquivos ilimitados por lote",
      "Todas as ferramentas de PDF, incluindo PDF → Word",
      "Remoção de fundo com IA ilimitada",
    ],
    cta: "Assinar o Pro",
    later: "Agora não",
    tools: {
      "pdf-to-word": "PDF → Word",
      "protect-pdf": "Proteger PDF",
      "unlock-pdf": "Desbloquear PDF",
      "extract-pdf-images": "Extrair imagens",
    },
  },
  "fil-PH": {
    batch: (s, l) => `Pumili ka ng ${s} file. ${l} lang kada batch sa Free.`,
    pages: (l) => `Hanggang ${l} pahina lang ang scan sa Free.`,
    locked: (t) => `Nagamit mo na ang libreng try ng ${t}.`,
    daily: (l) => `Nagamit mo na ang ${l} libreng background removal ngayong araw.`,
    milestone: (n) => `Naka-${n} file ka na. Galing! 🎉`,
    features: {
      "pdf-strong": "Pro feature ang Smallest na compression.",
      "hd-size": `Pro feature ang laki na higit ${FREE_LIMITS.maxDimension}px.`,
    },
    general: "Mas marami sa Pro",
    subtitle: "I-unlock ang lahat ng tool, walang limit. Hindi umaalis sa phone mo ang files.",
    perks: [
      "Walang limit na files kada batch",
      "Lahat ng PDF tool, kasama ang PDF → Word",
      "Walang limit na AI background removal",
    ],
    cta: "Mag-upgrade sa Pro",
    later: "Mamaya na",
    tools: {
      "pdf-to-word": "PDF → Word",
      "protect-pdf": "Protect PDF",
      "unlock-pdf": "Unlock PDF",
      "extract-pdf-images": "Extract images",
    },
  },
  "id-ID": {
    batch: (s, l) => `Kamu memilih ${s} file. Versi gratis memproses ${l} file sekaligus.`,
    pages: (l) => `Versi gratis memindai hingga ${l} halaman.`,
    locked: (t) => `Kamu sudah memakai uji coba gratis ${t}.`,
    daily: (l) => `Kamu sudah memakai ${l} hapus latar gratis hari ini.`,
    milestone: (n) => `Kamu sudah memproses ${n} file. Mantap! 🎉`,
    features: {
      "pdf-strong": "Tingkat kompresi Terkecil adalah fitur Pro.",
      "hd-size": `Ukuran di atas ${FREE_LIMITS.maxDimension}px adalah fitur Pro.`,
    },
    general: "Lebih banyak dengan Pro",
    subtitle: "Buka semua alat tanpa batas. File tidak pernah keluar dari ponselmu.",
    perks: [
      "File tanpa batas per proses",
      "Semua alat PDF, termasuk PDF → Word",
      "Hapus latar AI tanpa batas",
    ],
    cta: "Upgrade ke Pro",
    later: "Nanti saja",
    tools: {
      "pdf-to-word": "PDF → Word",
      "protect-pdf": "Kunci PDF",
      "unlock-pdf": "Buka kunci PDF",
      "extract-pdf-images": "Ekstrak gambar",
    },
  },
};

function headline(c: Copy, r: UpgradeReason): string {
  switch (r.kind) {
    case "batch":
      return c.batch(r.selected, r.limit);
    case "pages":
      return c.pages(r.limit);
    case "locked":
      return c.locked(c.tools[r.tool]);
    case "daily":
      return c.daily(r.limit);
    case "milestone":
      return c.milestone(r.count);
    case "feature":
      return c.features[r.feature];
    default:
      return c.general;
  }
}

/** Bottom sheet nudging free users to Pro. Mount once (root layout). */
export function UpgradeSheet() {
  const { locale } = useLocale();
  const [reason, setReason] = useState<UpgradeReason | null>(null);
  const c = copy[locale] ?? en;

  useEffect(() => {
    const onRequest = (e: Event) => setReason((e as CustomEvent<UpgradeReason>).detail);
    window.addEventListener(UPGRADE_EVENT, onRequest);
    return () => window.removeEventListener(UPGRADE_EVENT, onRequest);
  }, []);

  return (
    <Sheet open={!!reason} onOpenChange={(open) => !open && setReason(null)}>
      <SheetContent
        side="bottom"
        className="left-[var(--app-inset)] right-[var(--app-inset)] rounded-t-3xl px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-4"
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" aria-hidden="true" />
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F43F5E] to-[#DC2626] text-white">
          <Crown className="h-6 w-6" />
        </div>
        <SheetTitle className="text-center text-lg font-bold leading-snug">
          {reason ? headline(c, reason) : c.general}
        </SheetTitle>
        <SheetDescription className="mt-1 text-center text-sm">{c.subtitle}</SheetDescription>
        <ul className="mx-auto mt-4 max-w-sm space-y-2">
          {c.perks.map((perk) => (
            <li key={perk} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              <span>{perk}</span>
            </li>
          ))}
        </ul>
        <div className="mx-auto mt-5 flex max-w-sm flex-col gap-2">
          <button
            type="button"
            onClick={() => {
              if (reason) openPaywall(reasonSource(reason));
              setReason(null);
            }}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#F43F5E] to-[#DC2626] text-[15px] font-bold text-white shadow-sm transition active:scale-[0.98]"
          >
            <Crown className="h-4 w-4" />
            {c.cta}
          </button>
          <button
            type="button"
            onClick={() => setReason(null)}
            className="h-11 rounded-xl text-sm font-medium text-muted-foreground transition hover:bg-secondary"
          >
            {c.later}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
