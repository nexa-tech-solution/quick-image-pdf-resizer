import { useLocale, type Locale } from "@/lib/i18n";

export type IdPhotoCopy = {
  title: string;
  seoTitle: string;
  description: string;
  intro: string;
  dropTitle: string;
  dropHint: string;
  selfie: string;
  tips: string;
  processing: string;
  firstTime: string;
  noPerson: string;
  error: string;
  size: string;
  background: string;
  zoom: string;
  autoAlign: string;
  adjustHint: string;
  crown: string;
  chin: string;
  savePhoto: string;
  saveSheet: (count: number) => string;
  newPhoto: string;
  specTags: Record<string, string>;
  bgNames: Record<string, string>;
};

const en: IdPhotoCopy = {
  title: "ID & passport photo",
  seoTitle: "ID & passport photo maker — 3×4, 4×6, 35×45, 2×2 inch, free",
  description:
    "Make ID, passport and visa photos on your phone: AI removes the background, sizes the head to the official spec and makes a 10×15 cm print sheet. Nothing is uploaded.",
  intro:
    "Take a selfie or pick a photo. AI cuts you out, sets the background and sizes it to spec.",
  dropTitle: "Choose a portrait photo",
  dropHint: "Face the camera, plain light, shoulders visible",
  selfie: "Take a selfie",
  tips: "Tip: look straight at the camera, no glasses glare, hair off your face, even lighting.",
  processing: "Removing the background with AI…",
  firstTime: "First time only: downloading the AI model (~25 MB).",
  noPerson:
    "Couldn't find a person in this photo. Try a clearer portrait with your shoulders visible.",
  error:
    "Something went wrong. Check your connection (the AI model downloads on first use) and try again.",
  size: "Size",
  background: "Background",
  zoom: "Zoom",
  autoAlign: "Auto align",
  adjustHint: "Drag to move. Put the top of your head and your chin on the two dashed lines.",
  crown: "Top of head",
  chin: "Chin",
  savePhoto: "Save photo",
  saveSheet: (n) => `Print sheet 10×15 (${n})`,
  newPhoto: "New photo",
  specTags: {
    "3x4": "ID card",
    "4x6": "ID / documents",
    "35x45": "Passport · Schengen · UK",
    "2x2in": "US passport / visa",
    "5x7": "Passport (BR)",
  },
  bgNames: { white: "White", blue: "Blue", lightBlue: "Light blue", gray: "Gray", red: "Red" },
};

const copy: Record<Locale, IdPhotoCopy> = {
  "en-US": en,
  "en-IN": en,
  "vi-VN": {
    title: "Ảnh thẻ / hộ chiếu",
    seoTitle: "Làm ảnh thẻ, ảnh hộ chiếu, visa — 3×4, 4×6, 35×45, miễn phí",
    description:
      "Làm ảnh thẻ, hộ chiếu, visa ngay trên điện thoại: AI xóa nền, canh đầu đúng chuẩn và tạo bản in 10×15 cm. Ảnh không bị tải lên mạng.",
    intro: "Chụp selfie hoặc chọn ảnh. AI tách nền, đổi màu nền và canh đúng kích thước chuẩn.",
    dropTitle: "Chọn ảnh chân dung",
    dropHint: "Nhìn thẳng, đủ sáng, thấy vai",
    selfie: "Chụp selfie",
    tips: "Mẹo: nhìn thẳng ống kính, không lóa kính, vén tóc khỏi mặt, ánh sáng đều.",
    processing: "Đang xóa nền bằng AI…",
    firstTime: "Lần đầu: đang tải model AI (~25 MB).",
    noPerson: "Không tìm thấy người trong ảnh. Hãy thử ảnh chân dung rõ hơn, thấy cả vai.",
    error: "Có lỗi xảy ra. Kiểm tra kết nối mạng (lần đầu cần tải model AI) rồi thử lại.",
    size: "Kích thước",
    background: "Màu nền",
    zoom: "Phóng to",
    autoAlign: "Tự canh",
    adjustHint: "Kéo để di chuyển. Đặt đỉnh đầu và cằm vào 2 đường nét đứt.",
    crown: "Đỉnh đầu",
    chin: "Cằm",
    savePhoto: "Lưu ảnh",
    saveSheet: (n) => `Bản in 10×15 (${n} ảnh)`,
    newPhoto: "Ảnh mới",
    specTags: {
      "3x4": "Ảnh thẻ",
      "4x6": "Hồ sơ, giấy tờ",
      "35x45": "Hộ chiếu · Schengen",
      "2x2in": "Visa / hộ chiếu Mỹ",
      "5x7": "Hộ chiếu (BR)",
    },
    bgNames: { white: "Trắng", blue: "Xanh", lightBlue: "Xanh nhạt", gray: "Xám", red: "Đỏ" },
  },
  "pt-BR": {
    title: "Foto 3×4 / passaporte",
    seoTitle: "Foto 3×4, passaporte e visto — 5×7, 35×45, 2×2 polegadas, grátis",
    description:
      "Faça fotos para documento, passaporte e visto no celular: a IA remove o fundo, ajusta a cabeça ao padrão oficial e cria uma folha 10×15 cm para imprimir. Nada é enviado.",
    intro:
      "Tire uma selfie ou escolha uma foto. A IA recorta você, troca o fundo e ajusta ao padrão.",
    dropTitle: "Escolha uma foto de rosto",
    dropHint: "De frente, boa luz, ombros visíveis",
    selfie: "Tirar selfie",
    tips: "Dica: olhe direto para a câmera, sem reflexo nos óculos, cabelo fora do rosto, luz uniforme.",
    processing: "Removendo o fundo com IA…",
    firstTime: "Só na primeira vez: baixando o modelo de IA (~25 MB).",
    noPerson:
      "Não encontramos uma pessoa na foto. Tente um retrato mais nítido com os ombros visíveis.",
    error:
      "Algo deu errado. Verifique a conexão (o modelo de IA é baixado no primeiro uso) e tente de novo.",
    size: "Tamanho",
    background: "Fundo",
    zoom: "Zoom",
    autoAlign: "Alinhar",
    adjustHint:
      "Arraste para mover. Coloque o topo da cabeça e o queixo nas duas linhas tracejadas.",
    crown: "Topo da cabeça",
    chin: "Queixo",
    savePhoto: "Salvar foto",
    saveSheet: (n) => `Folha 10×15 (${n})`,
    newPhoto: "Nova foto",
    specTags: {
      "3x4": "Documento 3×4",
      "4x6": "Documentos",
      "35x45": "Passaporte · Schengen",
      "2x2in": "Visto / passaporte EUA",
      "5x7": "Passaporte brasileiro",
    },
    bgNames: {
      white: "Branco",
      blue: "Azul",
      lightBlue: "Azul claro",
      gray: "Cinza",
      red: "Vermelho",
    },
  },
  "fil-PH": {
    title: "ID at passport photo",
    seoTitle: "ID, passport at visa photo maker — 2×2, 35×45, 3×4, libre",
    description:
      "Gumawa ng ID, passport at visa photo sa phone mo: inaalis ng AI ang background, inaayos ang laki ng ulo ayon sa standard at gumagawa ng 4R print sheet. Walang ina-upload.",
    intro:
      "Mag-selfie o pumili ng litrato. Ihihiwalay ka ng AI, papalitan ang background at aayusin ang laki.",
    dropTitle: "Pumili ng portrait na litrato",
    dropHint: "Nakaharap, maliwanag, kita ang balikat",
    selfie: "Mag-selfie",
    tips: "Tip: tumingin nang diretso sa camera, walang silaw sa salamin, buhok wala sa mukha, pantay na ilaw.",
    processing: "Inaalis ang background gamit ang AI…",
    firstTime: "Unang beses lang: dina-download ang AI model (~25 MB).",
    noPerson:
      "Walang nakitang tao sa litrato. Subukan ang mas malinaw na portrait na kita ang balikat.",
    error:
      "May nangyaring mali. Tingnan ang internet (dina-download ang AI model sa unang gamit) at subukan ulit.",
    size: "Laki",
    background: "Background",
    zoom: "Zoom",
    autoAlign: "Auto align",
    adjustHint:
      "I-drag para ilipat. Ilagay ang tuktok ng ulo at baba sa dalawang putol-putol na linya.",
    crown: "Tuktok ng ulo",
    chin: "Baba",
    savePhoto: "I-save ang litrato",
    saveSheet: (n) => `4R print sheet (${n})`,
    newPhoto: "Bagong litrato",
    specTags: {
      "3x4": "ID",
      "4x6": "Mga dokumento",
      "35x45": "Passport · Schengen",
      "2x2in": "US visa / passport",
      "5x7": "Passport (BR)",
    },
    bgNames: { white: "Puti", blue: "Asul", lightBlue: "Light blue", gray: "Gray", red: "Pula" },
  },
  "id-ID": {
    title: "Pas foto / paspor",
    seoTitle: "Pas foto, foto paspor & visa — 3×4, 4×6, 2×2 inci, gratis",
    description:
      "Buat pas foto, foto paspor, dan visa di ponsel: AI menghapus latar, mengatur ukuran kepala sesuai standar, dan membuat lembar cetak 10×15 cm. Tidak ada yang diunggah.",
    intro:
      "Ambil selfie atau pilih foto. AI memotong dirimu, mengganti latar, dan menyesuaikan ukuran.",
    dropTitle: "Pilih foto wajah",
    dropHint: "Menghadap kamera, cahaya cukup, bahu terlihat",
    selfie: "Ambil selfie",
    tips: "Tips: lihat lurus ke kamera, kacamata tidak silau, rambut tidak menutupi wajah, cahaya merata.",
    processing: "Menghapus latar dengan AI…",
    firstTime: "Hanya pertama kali: mengunduh model AI (~25 MB).",
    noPerson:
      "Tidak menemukan orang di foto. Coba foto wajah yang lebih jelas dengan bahu terlihat.",
    error:
      "Terjadi kesalahan. Periksa koneksi (model AI diunduh saat pertama dipakai) lalu coba lagi.",
    size: "Ukuran",
    background: "Latar",
    zoom: "Perbesar",
    autoAlign: "Rapikan otomatis",
    adjustHint:
      "Geser untuk memindahkan. Letakkan puncak kepala dan dagu di dua garis putus-putus.",
    crown: "Puncak kepala",
    chin: "Dagu",
    savePhoto: "Simpan foto",
    saveSheet: (n) => `Lembar cetak 10×15 (${n})`,
    newPhoto: "Foto baru",
    specTags: {
      "3x4": "Pas foto",
      "4x6": "Dokumen",
      "35x45": "Paspor · Schengen",
      "2x2in": "Visa / paspor AS",
      "5x7": "Paspor (BR)",
    },
    bgNames: {
      white: "Putih",
      blue: "Biru",
      lightBlue: "Biru muda",
      gray: "Abu-abu",
      red: "Merah",
    },
  },
};

export function useIdPhotoCopy(): IdPhotoCopy {
  const { locale } = useLocale();
  return copy[locale] ?? en;
}

export function getIdPhotoCopy(locale: Locale): IdPhotoCopy {
  return copy[locale] ?? en;
}
