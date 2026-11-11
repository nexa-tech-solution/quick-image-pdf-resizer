import {
  getTranslationSet,
  supportedLocales,
  useLocale,
  type Locale,
  type TranslationSet,
} from "@/lib/i18n";

/**
 * Copy for the phase-3 tools (text→PDF, extract images, PDF→Word, protect/unlock, scan).
 * Full copy exists for English and Vietnamese; other locales fall back to English.
 */
export type V3ToolKey =
  | "textToPdf"
  | "extractPdfImages"
  | "pdfToWord"
  | "protectPdf"
  | "unlockPdf"
  | "scanDocument"
  | "viewFile";

const en = {
  common: {
    newButton: "Start over",
    downloadButton: "Download",
    downloadAll: "Download ZIP",
    working: "Working…",
    pages: "pages",
    pdfError: "Could not read this PDF. It may be damaged.",
    encryptedError: "This PDF is password protected. Unlock it first with the Unlock PDF tool.",
    dropPdf: "Drop a PDF here or tap to choose",
    pdfHint: "Processed on your device — nothing is uploaded.",
  },
  textToPdf: {
    eyebrow: "Text → PDF",
    titleText: "Text to PDF",
    title: "Text to PDF — convert plain text to a PDF online, free",
    description:
      "Type, paste or open a .txt file and turn it into a clean PDF with Vietnamese and accented characters supported. Runs on your device.",
    intro: "Type or paste text, or open a .txt file. Accented characters are supported.",
    placeholder: "Type or paste your text here…",
    openTxt: "Open .txt",
    pageSize: "Page size",
    fontSize: "Font size",
    margin: "Margin",
    marginSmall: "Small",
    marginNormal: "Normal",
    marginLarge: "Large",
    filename: "File name",
    createButton: "Create PDF",
    emptyError: "Enter some text first.",
    chars: "characters",
  },
  extractPdfImages: {
    eyebrow: "PDF tools",
    titleText: "Extract images from PDF",
    title: "Extract images from PDF — save original pictures, free",
    description:
      "Pull every embedded image out of a PDF at its original resolution and download them as PNG files or one ZIP. No upload.",
    intro: "Get the original pictures embedded in a PDF — not screenshots of the pages.",
    scanning: "Looking for images",
    found: "images found",
    none: "No embedded images found. If the PDF is a scan of text only, try PDF → Image instead.",
    minSize: "Skip images smaller than 48px (icons, lines)",
    page: "Page",
  },
  pdfToWord: {
    eyebrow: "PDF tools",
    titleText: "PDF to Word",
    title: "PDF to Word — convert PDF text to editable DOCX, free",
    description:
      "Convert the text of a PDF into an editable Word (.docx) document right in your browser. Paragraphs and font sizes are kept; complex layout is simplified.",
    intro: "Pulls the text out into an editable .docx. Paragraphs and headings are kept.",
    limits:
      "Tables, columns and images are not kept. Scanned PDFs (pictures of text) have no text to extract.",
    converting: "Converting",
    noText: "No text found. This PDF is probably a scan — it contains pictures of text only.",
    paragraphs: "paragraphs",
    preview: "Preview",
  },
  protectPdf: {
    eyebrow: "PDF security",
    titleText: "Protect PDF with a password",
    title: "Protect PDF — add a password to a PDF, free",
    description:
      "Encrypt a PDF with AES-256 so it needs a password to open. Encryption happens on your device; your file is never uploaded.",
    intro: "Add a password so the PDF can only be opened by people who know it (AES-256).",
    password: "Password",
    confirm: "Repeat password",
    mismatch: "Passwords do not match.",
    tooShort: "Use at least 4 characters.",
    restrict: "Also block printing and copying",
    protectButton: "Protect PDF",
    loadingEngine: "Loading encryption engine…",
    done: "Done — the PDF now asks for the password.",
    alreadyEncrypted: "This PDF already has a password. Unlock it first.",
    warning: "Remember the password — it cannot be recovered.",
  },
  unlockPdf: {
    eyebrow: "PDF security",
    titleText: "Unlock PDF",
    title: "Unlock PDF — remove a PDF password, free",
    description:
      "Remove the password from a PDF you know the password to. Text stays selectable. Runs on your device, nothing is uploaded.",
    intro: "Remove the password from a PDF you are allowed to open. Text stays selectable.",
    password: "PDF password",
    unlockButton: "Unlock PDF",
    loadingEngine: "Loading engine…",
    wrongPassword: "Wrong password. Try again.",
    notEncrypted: "This PDF has no password — nothing to remove.",
    ownerOnly: "This PDF has restrictions only (no open password). They were removed.",
    done: "Done — the PDF no longer needs a password.",
  },
  scanDocument: {
    eyebrow: "Scanner",
    titleText: "Scan document",
    title: "Scan documents with your phone camera — to PDF, free",
    description:
      "Take a photo of a paper document, crop the edges, straighten it and turn it into a clean black & white PDF. Works offline on your device.",
    intro:
      "Take a photo of a document. Drag the corners to fit the page, pick a filter, save as PDF.",
    takePhoto: "Take photo",
    addPage: "Add page",
    choosePhoto: "Choose photos",
    dropHint: "Or drop photos here",
    detecting: "Detecting edges…",
    adjustHint: "Drag the 4 corners onto the page edges.",
    autoDetect: "Auto",
    fullImage: "Full",
    filter: "Filter",
    filterOriginal: "Original",
    filterEnhance: "Enhance",
    filterGray: "Gray",
    filterBw: "B&W",
    rotate: "Rotate",
    done: "Done",
    edit: "Edit",
    remove: "Remove",
    savePdf: "Save PDF",
    saveJpg: "Save JPG",
    pagesLabel: "Pages",
  },
  viewFile: {
    eyebrow: "Viewer",
    titleText: "View files",
    title: "Open PDF, Word (DOCX) and image files online — free viewer",
    description:
      "Open and read PDF, Word .docx, images and text files right on your phone. Zoom pages and photos full screen. Nothing is uploaded.",
    intro:
      "Open PDF, Word (.docx), images or text files. Tap a page or photo to view it full screen.",
    dropTitle: "Drop a file to open it",
    dropHint: "PDF, DOCX, JPG, PNG, WebP, TXT…",
    openAnother: "Open another file",
  },
  viewer: {
    unsupported: "This file type can't be previewed. Supported: PDF, DOCX, images, text.",
    docxError: "Could not open this Word file. Only .docx is supported (not the old .doc).",
    view: "View",
  },
};

type V3Copy = typeof en;

const vi: V3Copy = {
  common: {
    newButton: "Làm lại",
    downloadButton: "Tải xuống",
    downloadAll: "Tải ZIP",
    working: "Đang xử lý…",
    pages: "trang",
    pdfError: "Không đọc được PDF này. File có thể bị lỗi.",
    encryptedError: "PDF này có mật khẩu. Hãy gỡ mật khẩu trước bằng công cụ Gỡ mật khẩu PDF.",
    dropPdf: "Thả file PDF vào đây hoặc chạm để chọn",
    pdfHint: "Xử lý ngay trên máy — không tải file lên mạng.",
  },
  textToPdf: {
    eyebrow: "Văn bản → PDF",
    titleText: "Văn bản sang PDF",
    title: "Chuyển văn bản sang PDF online miễn phí, hỗ trợ tiếng Việt",
    description:
      "Gõ, dán hoặc mở file .txt rồi xuất ra PDF gọn đẹp, hỗ trợ đầy đủ dấu tiếng Việt. Xử lý ngay trên thiết bị.",
    intro: "Gõ hoặc dán văn bản, hoặc mở file .txt. Hỗ trợ đầy đủ dấu tiếng Việt.",
    placeholder: "Gõ hoặc dán văn bản vào đây…",
    openTxt: "Mở .txt",
    pageSize: "Khổ giấy",
    fontSize: "Cỡ chữ",
    margin: "Lề",
    marginSmall: "Hẹp",
    marginNormal: "Vừa",
    marginLarge: "Rộng",
    filename: "Tên file",
    createButton: "Tạo PDF",
    emptyError: "Hãy nhập nội dung trước.",
    chars: "ký tự",
  },
  extractPdfImages: {
    eyebrow: "Công cụ PDF",
    titleText: "Trích ảnh từ PDF",
    title: "Trích xuất ảnh từ PDF — lấy ảnh gốc miễn phí",
    description:
      "Lấy toàn bộ ảnh nhúng trong PDF với độ phân giải gốc, tải về PNG hoặc một file ZIP. Không tải file lên mạng.",
    intro: "Lấy ảnh gốc được nhúng trong PDF — không phải chụp lại trang.",
    scanning: "Đang tìm ảnh",
    found: "ảnh",
    none: "Không có ảnh nhúng. Nếu PDF chỉ là bản scan, hãy dùng PDF → Ảnh.",
    minSize: "Bỏ qua ảnh nhỏ hơn 48px (icon, đường kẻ)",
    page: "Trang",
  },
  pdfToWord: {
    eyebrow: "Công cụ PDF",
    titleText: "PDF sang Word",
    title: "Chuyển PDF sang Word (DOCX) miễn phí, không cần tải lên",
    description:
      "Chuyển chữ trong PDF thành file Word (.docx) chỉnh sửa được ngay trên trình duyệt. Giữ đoạn văn và cỡ chữ; bố cục phức tạp sẽ được đơn giản hóa.",
    intro: "Lấy chữ ra file .docx chỉnh sửa được. Giữ đoạn văn và tiêu đề.",
    limits: "Không giữ bảng, cột và hình ảnh. PDF scan (ảnh chụp chữ) không có chữ để lấy.",
    converting: "Đang chuyển",
    noText: "Không tìm thấy chữ. PDF này có thể là bản scan — chỉ chứa ảnh.",
    paragraphs: "đoạn",
    preview: "Xem trước",
  },
  protectPdf: {
    eyebrow: "Bảo mật PDF",
    titleText: "Đặt mật khẩu PDF",
    title: "Đặt mật khẩu cho PDF miễn phí — mã hóa AES-256",
    description:
      "Mã hóa PDF bằng AES-256 để cần mật khẩu mới mở được. Mã hóa ngay trên thiết bị, không tải file lên mạng.",
    intro: "Đặt mật khẩu để chỉ người biết mật khẩu mới mở được PDF (AES-256).",
    password: "Mật khẩu",
    confirm: "Nhập lại mật khẩu",
    mismatch: "Mật khẩu không khớp.",
    tooShort: "Dùng ít nhất 4 ký tự.",
    restrict: "Chặn in và sao chép nội dung",
    protectButton: "Đặt mật khẩu",
    loadingEngine: "Đang tải bộ mã hóa…",
    done: "Xong — PDF giờ sẽ hỏi mật khẩu khi mở.",
    alreadyEncrypted: "PDF này đã có mật khẩu. Hãy gỡ trước.",
    warning: "Hãy nhớ mật khẩu — không thể khôi phục nếu quên.",
  },
  unlockPdf: {
    eyebrow: "Bảo mật PDF",
    titleText: "Gỡ mật khẩu PDF",
    title: "Gỡ mật khẩu PDF miễn phí — giữ nguyên chữ",
    description:
      "Gỡ mật khẩu khỏi file PDF mà bạn biết mật khẩu. Chữ vẫn chọn được. Xử lý trên thiết bị, không tải lên mạng.",
    intro: "Gỡ mật khẩu khỏi PDF bạn có quyền mở. Chữ vẫn chọn và sao chép được.",
    password: "Mật khẩu PDF",
    unlockButton: "Gỡ mật khẩu",
    loadingEngine: "Đang tải bộ xử lý…",
    wrongPassword: "Sai mật khẩu. Thử lại.",
    notEncrypted: "PDF này không có mật khẩu.",
    ownerOnly: "PDF chỉ có giới hạn quyền (không có mật khẩu mở). Đã gỡ giới hạn.",
    done: "Xong — PDF không còn mật khẩu.",
  },
  scanDocument: {
    eyebrow: "Máy quét",
    titleText: "Quét tài liệu",
    title: "Quét tài liệu bằng camera điện thoại ra PDF miễn phí",
    description:
      "Chụp ảnh giấy tờ, cắt viền, làm thẳng và chuyển thành PDF trắng đen rõ nét. Chạy offline ngay trên máy.",
    intro: "Chụp ảnh tài liệu. Kéo 4 góc khớp mép giấy, chọn bộ lọc, lưu PDF.",
    takePhoto: "Chụp ảnh",
    addPage: "Thêm trang",
    choosePhoto: "Chọn ảnh",
    dropHint: "Hoặc thả ảnh vào đây",
    detecting: "Đang tìm mép giấy…",
    adjustHint: "Kéo 4 góc vào đúng mép giấy.",
    autoDetect: "Tự động",
    fullImage: "Cả ảnh",
    filter: "Bộ lọc",
    filterOriginal: "Gốc",
    filterEnhance: "Làm nét",
    filterGray: "Xám",
    filterBw: "Trắng đen",
    rotate: "Xoay",
    done: "Xong",
    edit: "Sửa",
    remove: "Xóa",
    savePdf: "Lưu PDF",
    saveJpg: "Lưu JPG",
    pagesLabel: "Trang",
  },
  viewFile: {
    eyebrow: "Trình xem",
    titleText: "Xem file",
    title: "Mở file PDF, Word (DOCX), ảnh online miễn phí",
    description:
      "Mở và đọc file PDF, Word .docx, ảnh và file văn bản ngay trên điện thoại. Phóng to trang và ảnh toàn màn hình. Không tải lên mạng.",
    intro:
      "Mở PDF, Word (.docx), ảnh hoặc file văn bản. Chạm vào trang hoặc ảnh để xem toàn màn hình.",
    dropTitle: "Thả file vào để mở",
    dropHint: "PDF, DOCX, JPG, PNG, WebP, TXT…",
    openAnother: "Mở file khác",
  },
  viewer: {
    unsupported: "Không xem trước được loại file này. Hỗ trợ: PDF, DOCX, ảnh, văn bản.",
    docxError: "Không mở được file Word này. Chỉ hỗ trợ .docx (không hỗ trợ .doc cũ).",
    view: "Xem",
  },
};

const copyByLocale: Record<Locale, V3Copy> = {
  "en-US": en,
  "en-IN": en,
  "pt-BR": en,
  "fil-PH": en,
  "id-ID": en,
  "vi-VN": vi,
};

export function getV3Copy(locale: Locale): V3Copy {
  return copyByLocale[locale] ?? en;
}

/** Resolve copy from a TranslationSet (used by SEO helpers that only receive `t`). */
export function getV3CopyForT(t: TranslationSet): V3Copy {
  const locale = supportedLocales.find((l) => getTranslationSet(l) === t) ?? "en-US";
  return getV3Copy(locale);
}

export function useV3Copy() {
  const { locale } = useLocale();
  return getV3Copy(locale);
}

export const v3RouteKeys: V3ToolKey[] = [
  "textToPdf",
  "extractPdfImages",
  "pdfToWord",
  "protectPdf",
  "unlockPdf",
  "scanDocument",
  "viewFile",
];
