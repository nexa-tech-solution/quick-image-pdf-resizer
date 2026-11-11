import {
  getTranslationSet,
  supportedLocales,
  useLocale,
  type Locale,
  type TranslationSet,
} from "@/lib/i18n";

/**
 * Copy for the phase-3 tools (text→PDF, extract images, PDF→Word, protect/unlock, scan).
 * Full copy for every supported locale.
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

const pt: V3Copy = {
  common: {
    newButton: "Recomeçar",
    downloadButton: "Baixar",
    downloadAll: "Baixar ZIP",
    working: "Processando…",
    pages: "páginas",
    pdfError: "Não foi possível ler este PDF. Ele pode estar danificado.",
    encryptedError: "Este PDF tem senha. Desbloqueie-o primeiro com a ferramenta Desbloquear PDF.",
    dropPdf: "Solte um PDF aqui ou toque para escolher",
    pdfHint: "Processado no seu aparelho — nada é enviado.",
  },
  textToPdf: {
    eyebrow: "Texto → PDF",
    titleText: "Texto para PDF",
    title: "Texto para PDF — converta texto em PDF online, grátis",
    description:
      "Digite, cole ou abra um arquivo .txt e transforme em um PDF limpo, com suporte a acentos. Funciona no seu aparelho.",
    intro: "Digite ou cole um texto, ou abra um arquivo .txt. Acentos são suportados.",
    placeholder: "Digite ou cole seu texto aqui…",
    openTxt: "Abrir .txt",
    pageSize: "Tamanho da página",
    fontSize: "Tamanho da fonte",
    margin: "Margem",
    marginSmall: "Pequena",
    marginNormal: "Normal",
    marginLarge: "Grande",
    filename: "Nome do arquivo",
    createButton: "Criar PDF",
    emptyError: "Digite algum texto primeiro.",
    chars: "caracteres",
  },
  extractPdfImages: {
    eyebrow: "Ferramentas PDF",
    titleText: "Extrair imagens do PDF",
    title: "Extrair imagens do PDF — salve as imagens originais, grátis",
    description:
      "Extraia todas as imagens de um PDF na resolução original e baixe como PNG ou em um ZIP. Sem upload.",
    intro: "Obtenha as imagens originais dentro do PDF — não capturas das páginas.",
    scanning: "Procurando imagens",
    found: "imagens encontradas",
    none: "Nenhuma imagem encontrada. Se o PDF for uma digitalização só de texto, use PDF → Imagem.",
    minSize: "Ignorar imagens menores que 48px (ícones, linhas)",
    page: "Página",
  },
  pdfToWord: {
    eyebrow: "Ferramentas PDF",
    titleText: "PDF para Word",
    title: "PDF para Word — converta o texto do PDF em DOCX editável, grátis",
    description:
      "Converta o texto de um PDF em um documento Word (.docx) editável no próprio navegador. Parágrafos e tamanhos de fonte são mantidos; layouts complexos são simplificados.",
    intro: "Extrai o texto para um .docx editável. Parágrafos e títulos são mantidos.",
    limits:
      "Tabelas, colunas e imagens não são mantidas. PDFs digitalizados (fotos de texto) não têm texto para extrair.",
    converting: "Convertendo",
    noText:
      "Nenhum texto encontrado. Este PDF provavelmente é uma digitalização com apenas imagens de texto.",
    paragraphs: "parágrafos",
    preview: "Pré-visualização",
  },
  protectPdf: {
    eyebrow: "Segurança PDF",
    titleText: "Proteger PDF com senha",
    title: "Proteger PDF — adicione senha a um PDF, grátis",
    description:
      "Criptografe um PDF com AES-256 para exigir senha ao abrir. A criptografia acontece no seu aparelho; o arquivo nunca é enviado.",
    intro: "Adicione uma senha para que só quem a conhece abra o PDF (AES-256).",
    password: "Senha",
    confirm: "Repita a senha",
    mismatch: "As senhas não coincidem.",
    tooShort: "Use pelo menos 4 caracteres.",
    restrict: "Também bloquear impressão e cópia",
    protectButton: "Proteger PDF",
    loadingEngine: "Carregando criptografia…",
    done: "Pronto — o PDF agora pede a senha.",
    alreadyEncrypted: "Este PDF já tem senha. Desbloqueie-o primeiro.",
    warning: "Guarde a senha — ela não pode ser recuperada.",
  },
  unlockPdf: {
    eyebrow: "Segurança PDF",
    titleText: "Desbloquear PDF",
    title: "Desbloquear PDF — remova a senha de um PDF, grátis",
    description:
      "Remova a senha de um PDF cuja senha você conhece. O texto continua selecionável. Funciona no seu aparelho, nada é enviado.",
    intro:
      "Remova a senha de um PDF que você tem permissão para abrir. O texto continua selecionável.",
    password: "Senha do PDF",
    unlockButton: "Desbloquear PDF",
    loadingEngine: "Carregando…",
    wrongPassword: "Senha incorreta. Tente novamente.",
    notEncrypted: "Este PDF não tem senha — nada a remover.",
    ownerOnly: "Este PDF tinha apenas restrições (sem senha de abertura). Elas foram removidas.",
    done: "Pronto — o PDF não pede mais senha.",
  },
  scanDocument: {
    eyebrow: "Scanner",
    titleText: "Digitalizar documento",
    title: "Digitalize documentos com a câmera do celular — em PDF, grátis",
    description:
      "Fotografe um documento em papel, recorte as bordas, endireite e transforme em um PDF preto e branco limpo. Funciona offline no seu aparelho.",
    intro:
      "Fotografe um documento. Arraste os cantos até a página, escolha um filtro e salve em PDF.",
    takePhoto: "Tirar foto",
    addPage: "Adicionar página",
    choosePhoto: "Escolher fotos",
    dropHint: "Ou solte fotos aqui",
    detecting: "Detectando bordas…",
    adjustHint: "Arraste os 4 cantos até as bordas da página.",
    autoDetect: "Auto",
    fullImage: "Inteira",
    filter: "Filtro",
    filterOriginal: "Original",
    filterEnhance: "Realçar",
    filterGray: "Cinza",
    filterBw: "P&B",
    rotate: "Girar",
    done: "Concluir",
    edit: "Editar",
    remove: "Remover",
    savePdf: "Salvar PDF",
    saveJpg: "Salvar JPG",
    pagesLabel: "Páginas",
  },
  viewFile: {
    eyebrow: "Visualizador",
    titleText: "Ver arquivos",
    title: "Abra PDF, Word (DOCX) e imagens online — visualizador grátis",
    description:
      "Abra e leia PDF, Word .docx, imagens e textos no celular. Amplie páginas e fotos em tela cheia. Nada é enviado.",
    intro:
      "Abra PDF, Word (.docx), imagens ou textos. Toque em uma página ou foto para ver em tela cheia.",
    dropTitle: "Solte um arquivo para abrir",
    dropHint: "PDF, DOCX, JPG, PNG, WebP, TXT…",
    openAnother: "Abrir outro arquivo",
  },
  viewer: {
    unsupported:
      "Este tipo de arquivo não pode ser visualizado. Suportados: PDF, DOCX, imagens, texto.",
    docxError:
      "Não foi possível abrir este arquivo Word. Apenas .docx é suportado (não o antigo .doc).",
    view: "Ver",
  },
};

const fil: V3Copy = {
  common: {
    newButton: "Magsimula ulit",
    downloadButton: "I-download",
    downloadAll: "I-download ang ZIP",
    working: "Pinoproseso…",
    pages: "pahina",
    pdfError: "Hindi mabasa ang PDF na ito. Baka sira ito.",
    encryptedError: "May password ang PDF na ito. I-unlock muna gamit ang Unlock PDF.",
    dropPdf: "I-drop ang PDF dito o i-tap para pumili",
    pdfHint: "Pinoproseso sa device mo — walang ina-upload.",
  },
  textToPdf: {
    eyebrow: "Text → PDF",
    titleText: "Text papuntang PDF",
    title: "Text papuntang PDF — gawing PDF ang text online, libre",
    description:
      "Mag-type, mag-paste o magbukas ng .txt file at gawin itong malinis na PDF, suportado ang mga accent. Gumagana sa device mo.",
    intro: "Mag-type o mag-paste ng text, o magbukas ng .txt file. Suportado ang mga accent.",
    placeholder: "Mag-type o mag-paste ng text dito…",
    openTxt: "Buksan ang .txt",
    pageSize: "Laki ng pahina",
    fontSize: "Laki ng font",
    margin: "Margin",
    marginSmall: "Maliit",
    marginNormal: "Karaniwan",
    marginLarge: "Malaki",
    filename: "Pangalan ng file",
    createButton: "Gumawa ng PDF",
    emptyError: "Maglagay muna ng text.",
    chars: "character",
  },
  extractPdfImages: {
    eyebrow: "Mga PDF tool",
    titleText: "Kunin ang mga larawan sa PDF",
    title: "Kunin ang mga larawan sa PDF — i-save ang orihinal, libre",
    description:
      "Kunin ang bawat larawan sa loob ng PDF sa orihinal na resolution at i-download bilang PNG o isang ZIP. Walang upload.",
    intro: "Makuha ang orihinal na mga larawan sa PDF — hindi screenshot ng mga pahina.",
    scanning: "Naghahanap ng mga larawan",
    found: "larawan ang nakita",
    none: "Walang nakitang larawan. Kung scan lang ng text ang PDF, subukan ang PDF → Image.",
    minSize: "Laktawan ang mga larawang mas maliit sa 48px (icon, linya)",
    page: "Pahina",
  },
  pdfToWord: {
    eyebrow: "Mga PDF tool",
    titleText: "PDF papuntang Word",
    title: "PDF papuntang Word — gawing editable na DOCX ang PDF, libre",
    description:
      "Gawing editable na Word (.docx) ang text ng PDF sa browser mo mismo. Napapanatili ang mga talata at laki ng font; pinapasimple ang komplikadong layout.",
    intro:
      "Kinukuha ang text papunta sa editable na .docx. Napapanatili ang mga talata at heading.",
    limits:
      "Hindi napapanatili ang mga table, column at larawan. Walang text na makukuha sa scanned na PDF (larawan ng text).",
    converting: "Kino-convert",
    noText: "Walang nakitang text. Malamang scan ang PDF na ito — larawan lang ng text ang laman.",
    paragraphs: "talata",
    preview: "Preview",
  },
  protectPdf: {
    eyebrow: "Seguridad ng PDF",
    titleText: "Lagyan ng password ang PDF",
    title: "Protect PDF — lagyan ng password ang PDF, libre",
    description:
      "I-encrypt ang PDF gamit ang AES-256 para kailangan ng password bago mabuksan. Sa device mo nangyayari ang encryption; hindi ina-upload ang file.",
    intro: "Lagyan ng password para ang mga nakakaalam lang ang makapagbukas ng PDF (AES-256).",
    password: "Password",
    confirm: "Ulitin ang password",
    mismatch: "Hindi magkapareho ang mga password.",
    tooShort: "Gumamit ng hindi bababa sa 4 na character.",
    restrict: "I-block din ang pag-print at pagkopya",
    protectButton: "Protektahan ang PDF",
    loadingEngine: "Nilo-load ang encryption…",
    done: "Tapos na — hihingi na ng password ang PDF.",
    alreadyEncrypted: "May password na ang PDF na ito. I-unlock muna.",
    warning: "Tandaan ang password — hindi na ito mababawi.",
  },
  unlockPdf: {
    eyebrow: "Seguridad ng PDF",
    titleText: "I-unlock ang PDF",
    title: "Unlock PDF — tanggalin ang password ng PDF, libre",
    description:
      "Tanggalin ang password ng PDF na alam mo ang password. Mase-select pa rin ang text. Gumagana sa device mo, walang ina-upload.",
    intro:
      "Tanggalin ang password ng PDF na may pahintulot kang buksan. Mase-select pa rin ang text.",
    password: "Password ng PDF",
    unlockButton: "I-unlock ang PDF",
    loadingEngine: "Nilo-load…",
    wrongPassword: "Maling password. Subukan ulit.",
    notEncrypted: "Walang password ang PDF na ito — walang tatanggalin.",
    ownerOnly:
      "Mga restriction lang ang mayroon sa PDF na ito (walang password sa pagbukas). Natanggal na ang mga ito.",
    done: "Tapos na — hindi na kailangan ng password ang PDF.",
  },
  scanDocument: {
    eyebrow: "Scanner",
    titleText: "I-scan ang dokumento",
    title: "Mag-scan ng dokumento gamit ang camera ng phone — sa PDF, libre",
    description:
      "Kunan ng litrato ang papel na dokumento, i-crop ang gilid, ituwid at gawing malinis na black & white na PDF. Gumagana offline sa device mo.",
    intro:
      "Kunan ng litrato ang dokumento. I-drag ang mga sulok sa pahina, pumili ng filter, i-save bilang PDF.",
    takePhoto: "Kumuha ng litrato",
    addPage: "Magdagdag ng pahina",
    choosePhoto: "Pumili ng litrato",
    dropHint: "O i-drop ang mga litrato dito",
    detecting: "Hinahanap ang mga gilid…",
    adjustHint: "I-drag ang 4 na sulok sa gilid ng pahina.",
    autoDetect: "Auto",
    fullImage: "Buo",
    filter: "Filter",
    filterOriginal: "Orihinal",
    filterEnhance: "Linawin",
    filterGray: "Gray",
    filterBw: "B&W",
    rotate: "Iikot",
    done: "Tapos",
    edit: "I-edit",
    remove: "Alisin",
    savePdf: "I-save ang PDF",
    saveJpg: "I-save ang JPG",
    pagesLabel: "Mga pahina",
  },
  viewFile: {
    eyebrow: "Viewer",
    titleText: "Tingnan ang mga file",
    title: "Buksan ang PDF, Word (DOCX) at larawan online — libreng viewer",
    description:
      "Buksan at basahin ang PDF, Word .docx, larawan at text file sa phone mo. I-zoom ang mga pahina at litrato nang full screen. Walang ina-upload.",
    intro:
      "Buksan ang PDF, Word (.docx), larawan o text file. I-tap ang pahina o litrato para makita nang full screen.",
    dropTitle: "I-drop ang file para buksan",
    dropHint: "PDF, DOCX, JPG, PNG, WebP, TXT…",
    openAnother: "Magbukas ng ibang file",
  },
  viewer: {
    unsupported: "Hindi ma-preview ang ganitong file. Suportado: PDF, DOCX, larawan, text.",
    docxError:
      "Hindi mabuksan ang Word file na ito. .docx lang ang suportado (hindi ang lumang .doc).",
    view: "Tingnan",
  },
};

const id: V3Copy = {
  common: {
    newButton: "Mulai lagi",
    downloadButton: "Unduh",
    downloadAll: "Unduh ZIP",
    working: "Memproses…",
    pages: "halaman",
    pdfError: "PDF ini tidak bisa dibaca. Mungkin filenya rusak.",
    encryptedError: "PDF ini dilindungi kata sandi. Buka dulu dengan alat Buka Kunci PDF.",
    dropPdf: "Letakkan PDF di sini atau ketuk untuk memilih",
    pdfHint: "Diproses di perangkatmu — tidak ada yang diunggah.",
  },
  textToPdf: {
    eyebrow: "Teks → PDF",
    titleText: "Teks ke PDF",
    title: "Teks ke PDF — ubah teks menjadi PDF online, gratis",
    description:
      "Ketik, tempel, atau buka file .txt lalu ubah menjadi PDF yang rapi, mendukung huruf beraksen. Berjalan di perangkatmu.",
    intro: "Ketik atau tempel teks, atau buka file .txt. Huruf beraksen didukung.",
    placeholder: "Ketik atau tempel teksmu di sini…",
    openTxt: "Buka .txt",
    pageSize: "Ukuran halaman",
    fontSize: "Ukuran huruf",
    margin: "Margin",
    marginSmall: "Kecil",
    marginNormal: "Normal",
    marginLarge: "Besar",
    filename: "Nama file",
    createButton: "Buat PDF",
    emptyError: "Masukkan teks dulu.",
    chars: "karakter",
  },
  extractPdfImages: {
    eyebrow: "Alat PDF",
    titleText: "Ekstrak gambar dari PDF",
    title: "Ekstrak gambar dari PDF — simpan gambar asli, gratis",
    description:
      "Ambil semua gambar di dalam PDF dengan resolusi asli lalu unduh sebagai PNG atau satu ZIP. Tanpa unggah.",
    intro: "Dapatkan gambar asli di dalam PDF — bukan tangkapan layar halamannya.",
    scanning: "Mencari gambar",
    found: "gambar ditemukan",
    none: "Tidak ada gambar ditemukan. Jika PDF hanya hasil pindaian teks, coba PDF → Gambar.",
    minSize: "Lewati gambar lebih kecil dari 48px (ikon, garis)",
    page: "Halaman",
  },
  pdfToWord: {
    eyebrow: "Alat PDF",
    titleText: "PDF ke Word",
    title: "PDF ke Word — ubah teks PDF menjadi DOCX yang bisa diedit, gratis",
    description:
      "Ubah teks PDF menjadi dokumen Word (.docx) yang bisa diedit langsung di browser. Paragraf dan ukuran huruf dipertahankan; tata letak rumit disederhanakan.",
    intro: "Mengambil teks ke file .docx yang bisa diedit. Paragraf dan judul dipertahankan.",
    limits:
      "Tabel, kolom, dan gambar tidak dipertahankan. PDF hasil pindaian (foto teks) tidak punya teks untuk diambil.",
    converting: "Mengonversi",
    noText:
      "Tidak ada teks ditemukan. PDF ini kemungkinan hasil pindaian — isinya hanya gambar teks.",
    paragraphs: "paragraf",
    preview: "Pratinjau",
  },
  protectPdf: {
    eyebrow: "Keamanan PDF",
    titleText: "Kunci PDF dengan kata sandi",
    title: "Kunci PDF — tambahkan kata sandi ke PDF, gratis",
    description:
      "Enkripsi PDF dengan AES-256 sehingga perlu kata sandi untuk membukanya. Enkripsi terjadi di perangkatmu; file tidak pernah diunggah.",
    intro: "Tambahkan kata sandi agar PDF hanya bisa dibuka oleh yang mengetahuinya (AES-256).",
    password: "Kata sandi",
    confirm: "Ulangi kata sandi",
    mismatch: "Kata sandi tidak cocok.",
    tooShort: "Gunakan minimal 4 karakter.",
    restrict: "Blokir juga pencetakan dan penyalinan",
    protectButton: "Kunci PDF",
    loadingEngine: "Memuat enkripsi…",
    done: "Selesai — PDF sekarang meminta kata sandi.",
    alreadyEncrypted: "PDF ini sudah punya kata sandi. Buka kuncinya dulu.",
    warning: "Ingat kata sandinya — tidak bisa dipulihkan.",
  },
  unlockPdf: {
    eyebrow: "Keamanan PDF",
    titleText: "Buka kunci PDF",
    title: "Buka kunci PDF — hapus kata sandi PDF, gratis",
    description:
      "Hapus kata sandi dari PDF yang kata sandinya kamu ketahui. Teks tetap bisa dipilih. Berjalan di perangkatmu, tidak ada yang diunggah.",
    intro: "Hapus kata sandi dari PDF yang boleh kamu buka. Teks tetap bisa dipilih.",
    password: "Kata sandi PDF",
    unlockButton: "Buka kunci PDF",
    loadingEngine: "Memuat…",
    wrongPassword: "Kata sandi salah. Coba lagi.",
    notEncrypted: "PDF ini tidak punya kata sandi — tidak ada yang dihapus.",
    ownerOnly: "PDF ini hanya punya batasan (tanpa kata sandi pembuka). Batasan sudah dihapus.",
    done: "Selesai — PDF tidak lagi perlu kata sandi.",
  },
  scanDocument: {
    eyebrow: "Pemindai",
    titleText: "Pindai dokumen",
    title: "Pindai dokumen dengan kamera ponsel — jadi PDF, gratis",
    description:
      "Foto dokumen kertas, potong tepinya, luruskan, dan ubah menjadi PDF hitam putih yang rapi. Bisa offline di perangkatmu.",
    intro: "Foto dokumen. Seret sudut-sudutnya ke tepi halaman, pilih filter, simpan sebagai PDF.",
    takePhoto: "Ambil foto",
    addPage: "Tambah halaman",
    choosePhoto: "Pilih foto",
    dropHint: "Atau letakkan foto di sini",
    detecting: "Mendeteksi tepi…",
    adjustHint: "Seret 4 sudut ke tepi halaman.",
    autoDetect: "Otomatis",
    fullImage: "Penuh",
    filter: "Filter",
    filterOriginal: "Asli",
    filterEnhance: "Pertajam",
    filterGray: "Abu-abu",
    filterBw: "H&P",
    rotate: "Putar",
    done: "Selesai",
    edit: "Edit",
    remove: "Hapus",
    savePdf: "Simpan PDF",
    saveJpg: "Simpan JPG",
    pagesLabel: "Halaman",
  },
  viewFile: {
    eyebrow: "Penampil",
    titleText: "Lihat file",
    title: "Buka PDF, Word (DOCX), dan gambar online — penampil gratis",
    description:
      "Buka dan baca PDF, Word .docx, gambar, dan file teks di ponselmu. Perbesar halaman dan foto layar penuh. Tidak ada yang diunggah.",
    intro:
      "Buka PDF, Word (.docx), gambar, atau file teks. Ketuk halaman atau foto untuk melihat layar penuh.",
    dropTitle: "Letakkan file untuk membukanya",
    dropHint: "PDF, DOCX, JPG, PNG, WebP, TXT…",
    openAnother: "Buka file lain",
  },
  viewer: {
    unsupported: "Jenis file ini tidak bisa dipratinjau. Didukung: PDF, DOCX, gambar, teks.",
    docxError: "File Word ini tidak bisa dibuka. Hanya .docx yang didukung (bukan .doc lama).",
    view: "Lihat",
  },
};

const copyByLocale: Record<Locale, V3Copy> = {
  "en-US": en,
  "en-IN": en,
  "pt-BR": pt,
  "fil-PH": fil,
  "id-ID": id,
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
