import { useLocale, type Locale } from "@/lib/i18n";

/** Small shared UI labels (mostly screen-reader labels) for every locale. */
type UiCopy = {
  close: string;
  download: string;
  previous: string;
  next: string;
  zoomIn: string;
  zoomOut: string;
  upgradePro: string;
  manageSubscription: string;
};

const en: UiCopy = {
  close: "Close",
  download: "Download",
  previous: "Previous",
  next: "Next",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  upgradePro: "Upgrade to Pro",
  manageSubscription: "Pro · Manage subscription",
};

const uiCopy: Record<Locale, UiCopy> = {
  "en-US": en,
  "en-IN": en,
  "vi-VN": {
    close: "Đóng",
    download: "Tải xuống",
    previous: "Trước",
    next: "Tiếp",
    zoomIn: "Phóng to",
    zoomOut: "Thu nhỏ",
    upgradePro: "Nâng cấp Pro",
    manageSubscription: "Pro · Quản lý gói",
  },
  "pt-BR": {
    close: "Fechar",
    download: "Baixar",
    previous: "Anterior",
    next: "Próximo",
    zoomIn: "Ampliar",
    zoomOut: "Reduzir",
    upgradePro: "Assinar o Pro",
    manageSubscription: "Pro · Gerenciar assinatura",
  },
  "fil-PH": {
    close: "Isara",
    download: "I-download",
    previous: "Nakaraan",
    next: "Susunod",
    zoomIn: "Palakihin",
    zoomOut: "Paliitin",
    upgradePro: "Mag-upgrade sa Pro",
    manageSubscription: "Pro · Pamahalaan ang subscription",
  },
  "id-ID": {
    close: "Tutup",
    download: "Unduh",
    previous: "Sebelumnya",
    next: "Berikutnya",
    zoomIn: "Perbesar",
    zoomOut: "Perkecil",
    upgradePro: "Upgrade ke Pro",
    manageSubscription: "Pro · Kelola langganan",
  },
};

export function useUiCopy(): UiCopy {
  const { locale } = useLocale();
  return uiCopy[locale] ?? en;
}
