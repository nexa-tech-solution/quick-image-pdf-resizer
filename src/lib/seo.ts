import type { Locale, TranslationSet } from "@/lib/i18n";

export type SeoRouteKey =
  | "home"
  | "compressImage"
  | "convertImage"
  | "removeBackground"
  | "imageToPdf"
  | "pdfToImage"
  | "mergeSplitPdf"
  | "pricing"
  | "about";

export type ToolSeoKey =
  | "resize"
  | "compress"
  | "convert"
  | "removeBackground"
  | "imageToPdf"
  | "pdfToImage"
  | "mergeSplitPdf";

export const siteName = "Resize Image";
export const defaultSiteUrl = "http://localhost:8080";
export const ogImagePath = "/og-image.png";

export const seoRouteRegistry: Record<
  SeoRouteKey,
  {
    path: string;
    priority: number;
    changefreq: "daily" | "weekly" | "monthly" | "yearly";
    schemaType: "WebSite" | "SoftwareApplication" | "WebPage";
  }
> = {
  home: { path: "/", priority: 1, changefreq: "weekly", schemaType: "WebSite" },
  compressImage: {
    path: "/compress-image",
    priority: 0.9,
    changefreq: "weekly",
    schemaType: "SoftwareApplication",
  },
  convertImage: {
    path: "/convert-image",
    priority: 0.9,
    changefreq: "weekly",
    schemaType: "SoftwareApplication",
  },
  removeBackground: {
    path: "/remove-background",
    priority: 0.9,
    changefreq: "weekly",
    schemaType: "SoftwareApplication",
  },
  imageToPdf: {
    path: "/image-to-pdf",
    priority: 0.85,
    changefreq: "weekly",
    schemaType: "SoftwareApplication",
  },
  pdfToImage: {
    path: "/pdf-to-image",
    priority: 0.85,
    changefreq: "weekly",
    schemaType: "SoftwareApplication",
  },
  mergeSplitPdf: {
    path: "/merge-split-pdf",
    priority: 0.85,
    changefreq: "weekly",
    schemaType: "SoftwareApplication",
  },
  pricing: { path: "/pricing", priority: 0.45, changefreq: "monthly", schemaType: "WebPage" },
  about: { path: "/about", priority: 0.4, changefreq: "monthly", schemaType: "WebPage" },
};

export const toolRouteBySeoKey: Record<ToolSeoKey, SeoRouteKey> = {
  resize: "home",
  compress: "compressImage",
  convert: "convertImage",
  removeBackground: "removeBackground",
  imageToPdf: "imageToPdf",
  pdfToImage: "pdfToImage",
  mergeSplitPdf: "mergeSplitPdf",
};

export function getSiteUrl() {
  return normalizeSiteUrl(import.meta.env.VITE_SITE_URL || defaultSiteUrl);
}

export function normalizeSiteUrl(value: string) {
  return value.replace(/\/+$/, "");
}

export function absoluteUrl(path: string, siteUrl = getSiteUrl()) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${cleanPath}`;
}

export function getRouteTitle(t: TranslationSet, key: SeoRouteKey) {
  if (key === "home")
    return `Resize Image — ${t.home.titlePrefix} ${t.home.titleAccent} ${t.home.titleSuffix}`;
  if (key === "compressImage") return t.routes.compressImage.title;
  if (key === "convertImage") return t.routes.convertImage.title;
  if (key === "removeBackground") return t.routes.removeBackground.title;
  if (key === "imageToPdf") return t.routes.imageToPdf.title;
  if (key === "pdfToImage") return t.routes.pdfToImage.title;
  if (key === "mergeSplitPdf") return t.routes.mergeSplitPdf.title;
  if (key === "pricing") return t.routes.pricing.title;
  return t.routes.about.title;
}

export function getRouteDescription(t: TranslationSet, key: SeoRouteKey) {
  if (key === "home") return t.home.description;
  if (key === "compressImage") return t.routes.compressImage.description;
  if (key === "convertImage") return t.routes.convertImage.description;
  if (key === "removeBackground") return t.routes.removeBackground.description;
  if (key === "imageToPdf") return t.routes.imageToPdf.description;
  if (key === "pdfToImage") return t.routes.pdfToImage.description;
  if (key === "mergeSplitPdf") return t.routes.mergeSplitPdf.description;
  if (key === "pricing") return t.routes.pricing.description;
  return t.routes.about.description;
}

export function createRouteHead({
  t,
  routeKey,
  locale,
}: {
  t: TranslationSet;
  routeKey: SeoRouteKey;
  locale: Locale;
}) {
  const route = seoRouteRegistry[routeKey];
  const title = getRouteTitle(t, routeKey);
  const description = getRouteDescription(t, routeKey);
  const url = absoluteUrl(route.path);
  const image = absoluteUrl(ogImagePath);

  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:site_name", content: siteName },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:locale", content: locale.replace("-", "_") },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}

export function websiteSchema(t: TranslationSet) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: absoluteUrl("/"),
    description: t.home.description,
    inLanguage: "en",
  };
}

export function webApplicationSchema(t: TranslationSet, routeKey: SeoRouteKey) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: getRouteTitle(t, routeKey).replace(/ — .*$/, ""),
    url: absoluteUrl(seoRouteRegistry[routeKey].path),
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires a modern browser with Canvas and PDF support.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };
}

export function faqSchema(items: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function howToSchema({
  name,
  description,
  steps,
}: {
  name: string;
  description: string;
  steps: readonly string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    step: steps.map((step, index) => ({
      "@type": "HowToStep",
      position: index + 1,
      name: step,
      text: step,
    })),
  };
}

export function breadcrumbSchema(t: TranslationSet, routeKey: SeoRouteKey) {
  const route = seoRouteRegistry[routeKey];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: siteName,
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: getRouteTitle(t, routeKey).replace(/ — .*$/, ""),
        item: absoluteUrl(route.path),
      },
    ],
  };
}

export type ToolSeoCopy = {
  title: string;
  intro: string;
  howTitle: string;
  how: readonly string[];
  bestTitle: string;
  best: readonly string[];
  faqTitle: string;
  faqs: readonly { q: string; a: string }[];
};

export const englishToolSeoCopy: Record<ToolSeoKey, ToolSeoCopy> = {
  resize: {
    title: "Resize images online without uploading",
    intro:
      "Use this browser-based image resizer for exact dimensions, social media presets, thumbnails, banners, and product photos.",
    howTitle: "How to resize an image",
    how: [
      "Drop a JPG, PNG, WebP, or AVIF image.",
      "Pick exact dimensions or a preset size.",
      "Download the resized image from your browser.",
    ],
    bestTitle: "Best for",
    best: [
      "Social posts and profile images",
      "Website banners and thumbnails",
      "Product images with consistent dimensions",
    ],
    faqTitle: "Resize image FAQ",
    faqs: [
      {
        q: "Are images uploaded to a server?",
        a: "No. Image resizing runs locally in your browser, so your files stay on your device.",
      },
      {
        q: "Can I keep the original aspect ratio?",
        a: "Yes. Lock the ratio before changing width or height to preserve the original proportions.",
      },
      {
        q: "Which formats can I export?",
        a: "You can export JPG, PNG, WebP, and AVIF when your browser supports the selected format.",
      },
    ],
  },
  compress: {
    title: "Compress images in your browser",
    intro:
      "Reduce image file size with adjustable quality and side-by-side previews. Batch processing is handled locally and sequentially.",
    howTitle: "How to compress images",
    how: [
      "Drop one or more images.",
      "Choose JPG, WebP, AVIF, or PNG output.",
      "Adjust quality and download each compressed file.",
    ],
    bestTitle: "Best for",
    best: [
      "Faster website images",
      "Email-friendly image attachments",
      "Batch photo optimization before publishing",
    ],
    faqTitle: "Image compression FAQ",
    faqs: [
      {
        q: "Why can a compressed image be larger?",
        a: "Some formats are already optimized. Try a lower quality setting or switch to WebP or JPG for photos.",
      },
      {
        q: "Can I compress multiple images?",
        a: "Yes. Add multiple images and the tool processes them one by one to protect browser memory.",
      },
      {
        q: "Does PNG quality change the file size?",
        a: "PNG is lossless in this tool. For smaller files, use JPG, WebP, or AVIF.",
      },
    ],
  },
  convert: {
    title: "Convert JPG, PNG, WebP, and AVIF",
    intro:
      "Convert image formats directly in your browser with batch support and adjustable quality for modern web image formats.",
    howTitle: "How to convert images",
    how: [
      "Drop one or more images.",
      "Choose the output format.",
      "Download the converted files instantly.",
    ],
    bestTitle: "Best for",
    best: [
      "JPG to PNG and PNG to JPG workflows",
      "WebP or AVIF exports for websites",
      "Batch format conversion without installing software",
    ],
    faqTitle: "Image conversion FAQ",
    faqs: [
      {
        q: "Can I convert to the same format?",
        a: "Yes. The file will be re-encoded, which can be useful when changing quality.",
      },
      {
        q: "Is AVIF supported everywhere?",
        a: "AVIF export depends on browser support. The app shows an error if your browser cannot encode it.",
      },
      {
        q: "Will transparent PNGs stay transparent?",
        a: "Transparency is preserved for formats that support it, such as PNG and WebP.",
      },
    ],
  },
  removeBackground: {
    title: "Remove image backgrounds in your browser",
    intro:
      "Use this local background remover to cut out subjects from portraits, product photos, and simple scenes without uploading files.",
    howTitle: "How to remove a background",
    how: [
      "Drop a JPG, PNG, WebP, or AVIF image.",
      "Wait for the browser to isolate the subject.",
      "Download the cutout with a transparent background.",
    ],
    bestTitle: "Best for",
    best: [
      "Product photos and profile images",
      "Transparent cutouts for design work",
      "Removing simple backgrounds locally",
    ],
    faqTitle: "Background removal FAQ",
    faqs: [
      {
        q: "Are images uploaded to a server?",
        a: "No. The background removal model runs in your browser, so your files stay on your device.",
      },
      {
        q: "Which images work best?",
        a: "Portraits, products, and single-subject photos with clear edges usually give the best results.",
      },
      {
        q: "Can I export a transparent result?",
        a: "Yes. PNG keeps transparency, and WebP or AVIF can do so when your browser supports them.",
      },
    ],
  },
  imageToPdf: {
    title: "Turn images into a PDF",
    intro:
      "Combine JPG, PNG, WebP, or AVIF images into a single PDF with page size, orientation, margin, and ordering controls.",
    howTitle: "How to create a PDF from images",
    how: [
      "Drop images into the tool.",
      "Reorder them and choose page settings.",
      "Generate and download the PDF.",
    ],
    bestTitle: "Best for",
    best: [
      "Submitting scanned documents",
      "Combining receipts or notes",
      "Creating printable image collections",
    ],
    faqTitle: "Image to PDF FAQ",
    faqs: [
      {
        q: "Can I reorder images before creating the PDF?",
        a: "Yes. Drag files or use the move buttons to choose the final page order.",
      },
      {
        q: "Which page sizes are available?",
        a: "You can use A4, Letter, or fit each PDF page to the image size.",
      },
      {
        q: "Does this work offline after loading?",
        a: "The PDF is generated in your browser, so no upload step is required.",
      },
    ],
  },
  pdfToImage: {
    title: "Export PDF pages as images",
    intro:
      "Render PDF pages as PNG or JPG images in the browser. Choose scale for sharper output and download pages individually or together.",
    howTitle: "How to convert PDF pages to images",
    how: [
      "Drop a PDF file.",
      "Choose scale, format, and JPG quality.",
      "Render pages and download the images.",
    ],
    bestTitle: "Best for",
    best: [
      "Creating page previews",
      "Extracting presentation slides",
      "Saving PDF pages as shareable images",
    ],
    faqTitle: "PDF to image FAQ",
    faqs: [
      {
        q: "Can password-protected PDFs be rendered?",
        a: "Password-protected or corrupted PDFs may not render. The tool will show an error when the file cannot be read.",
      },
      {
        q: "Which output formats are supported?",
        a: "You can export pages as PNG or JPG, with quality control for JPG.",
      },
      {
        q: "How do I get higher-resolution images?",
        a: "Increase the scale setting before rendering the PDF pages.",
      },
    ],
  },
  mergeSplitPdf: {
    title: "Merge and split PDF pages in your browser",
    intro:
      "Organize PDF pages visually, combine multiple PDFs, remove pages you do not need, and export one clean PDF without uploading files.",
    howTitle: "How to organize a PDF",
    how: [
      "Drop one or more PDF files.",
      "Preview, reorder, or remove pages.",
      "Export the visible page order as one PDF.",
    ],
    bestTitle: "Best for",
    best: [
      "Combining documents into one PDF",
      "Removing unwanted PDF pages",
      "Reordering scanned pages before sharing",
    ],
    faqTitle: "Merge and split PDF FAQ",
    faqs: [
      {
        q: "Are PDFs uploaded to a server?",
        a: "No. The PDF organizer runs in your browser, so files stay on your device.",
      },
      {
        q: "Can I combine multiple PDFs?",
        a: "Yes. Add multiple PDFs and the pages are shown together so you can reorder and export them.",
      },
      {
        q: "Can password-protected PDFs be organized?",
        a: "Password-protected or corrupted PDFs may not load. The tool shows an error when a file cannot be read.",
      },
    ],
  },
};

const portugueseToolSeoCopy: Record<ToolSeoKey, ToolSeoCopy> = {
  resize: {
    title: "Redimensione imagens online sem upload",
    intro:
      "Use este redimensionador no navegador para dimensões exatas, presets de redes sociais, miniaturas, banners e fotos de produto.",
    howTitle: "Como redimensionar uma imagem",
    how: [
      "Solte uma imagem JPG, PNG, WebP ou AVIF.",
      "Escolha dimensões exatas ou um tamanho predefinido.",
      "Baixe a imagem redimensionada pelo navegador.",
    ],
    bestTitle: "Ideal para",
    best: [
      "Posts sociais e fotos de perfil",
      "Banners e miniaturas para sites",
      "Imagens de produto com dimensões consistentes",
    ],
    faqTitle: "FAQ sobre redimensionar imagem",
    faqs: [
      {
        q: "As imagens são enviadas para um servidor?",
        a: "Não. O redimensionamento roda localmente no navegador, então seus arquivos ficam no seu dispositivo.",
      },
      {
        q: "Posso manter a proporção original?",
        a: "Sim. Bloqueie a proporção antes de alterar largura ou altura para preservar as medidas originais.",
      },
      {
        q: "Quais formatos posso exportar?",
        a: "Você pode exportar JPG, PNG, WebP e AVIF quando o navegador suportar o formato escolhido.",
      },
    ],
  },
  compress: {
    title: "Comprima imagens no navegador",
    intro:
      "Reduza o tamanho de imagens com qualidade ajustável e prévias lado a lado. O processamento em lote acontece localmente.",
    howTitle: "Como comprimir imagens",
    how: [
      "Solte uma ou mais imagens.",
      "Escolha saída JPG, WebP, AVIF ou PNG.",
      "Ajuste a qualidade e baixe cada arquivo comprimido.",
    ],
    bestTitle: "Ideal para",
    best: [
      "Imagens mais leves para sites",
      "Anexos de e-mail menores",
      "Otimização em lote antes de publicar",
    ],
    faqTitle: "FAQ sobre compressão de imagem",
    faqs: [
      {
        q: "Por que uma imagem comprimida pode ficar maior?",
        a: "Alguns formatos já estão otimizados. Tente reduzir a qualidade ou usar WebP ou JPG para fotos.",
      },
      {
        q: "Posso comprimir várias imagens?",
        a: "Sim. Adicione várias imagens e a ferramenta processa uma por vez para proteger a memória do navegador.",
      },
      {
        q: "A qualidade do PNG muda o tamanho?",
        a: "PNG é sem perdas nesta ferramenta. Para arquivos menores, use JPG, WebP ou AVIF.",
      },
    ],
  },
  convert: {
    title: "Converta JPG, PNG, WebP e AVIF",
    intro:
      "Converta formatos de imagem diretamente no navegador, com suporte a lote e qualidade ajustável para formatos modernos.",
    howTitle: "Como converter imagens",
    how: [
      "Solte uma ou mais imagens.",
      "Escolha o formato de saída.",
      "Baixe os arquivos convertidos instantaneamente.",
    ],
    bestTitle: "Ideal para",
    best: [
      "Fluxos JPG para PNG e PNG para JPG",
      "Exportações WebP ou AVIF para sites",
      "Conversão em lote sem instalar software",
    ],
    faqTitle: "FAQ sobre conversão de imagem",
    faqs: [
      {
        q: "Posso converter para o mesmo formato?",
        a: "Sim. O arquivo será codificado novamente, útil para alterar a qualidade.",
      },
      {
        q: "AVIF funciona em todos os lugares?",
        a: "A exportação AVIF depende do navegador. O app mostra um erro se ele não conseguir codificar o formato.",
      },
      {
        q: "PNGs transparentes continuam transparentes?",
        a: "A transparência é preservada nos formatos compatíveis, como PNG e WebP.",
      },
    ],
  },
  removeBackground: {
    title: "Remova fundos de imagens no navegador",
    intro:
      "Use este removedor local para recortar sujeitos de retratos, fotos de produto e cenas simples sem enviar arquivos.",
    howTitle: "Como remover um fundo",
    how: [
      "Solte uma imagem JPG, PNG, WebP ou AVIF.",
      "Espere o navegador isolar o assunto.",
      "Baixe o recorte com fundo transparente.",
    ],
    bestTitle: "Ideal para",
    best: [
      "Fotos de produto e imagens de perfil",
      "Recortes transparentes para design",
      "Remover fundos simples localmente",
    ],
    faqTitle: "FAQ sobre remoção de fundo",
    faqs: [
      {
        q: "As imagens são enviadas para um servidor?",
        a: "Não. O modelo de remoção de fundo roda no navegador, então seus arquivos ficam no seu dispositivo.",
      },
      {
        q: "Quais imagens funcionam melhor?",
        a: "Retratos, produtos e fotos de um único assunto com bordas claras costumam ter os melhores resultados.",
      },
      {
        q: "Posso exportar com transparência?",
        a: "Sim. PNG mantém transparência, e WebP ou AVIF também podem manter quando o navegador suportar.",
      },
    ],
  },
  imageToPdf: {
    title: "Transforme imagens em PDF",
    intro:
      "Combine JPG, PNG, WebP ou AVIF em um único PDF com controles de tamanho de página, orientação, margem e ordem.",
    howTitle: "Como criar um PDF a partir de imagens",
    how: [
      "Solte imagens na ferramenta.",
      "Reordene e escolha as configurações da página.",
      "Gere e baixe o PDF.",
    ],
    bestTitle: "Ideal para",
    best: [
      "Enviar documentos digitalizados",
      "Combinar recibos ou anotações",
      "Criar coleções de imagens para impressão",
    ],
    faqTitle: "FAQ sobre imagem para PDF",
    faqs: [
      {
        q: "Posso reordenar as imagens antes de criar o PDF?",
        a: "Sim. Arraste os arquivos ou use os botões de mover para definir a ordem final das páginas.",
      },
      {
        q: "Quais tamanhos de página estão disponíveis?",
        a: "Você pode usar A4, Letter ou ajustar cada página ao tamanho da imagem.",
      },
      {
        q: "Isso funciona offline depois de carregar?",
        a: "O PDF é gerado no navegador, então não há etapa de upload.",
      },
    ],
  },
  pdfToImage: {
    title: "Exporte páginas de PDF como imagens",
    intro:
      "Renderize páginas de PDF como PNG ou JPG no navegador. Escolha a escala para uma saída mais nítida.",
    howTitle: "Como converter páginas de PDF em imagens",
    how: [
      "Solte um arquivo PDF.",
      "Escolha escala, formato e qualidade JPG.",
      "Renderize as páginas e baixe as imagens.",
    ],
    bestTitle: "Ideal para",
    best: [
      "Criar prévias de páginas",
      "Extrair slides de apresentações",
      "Salvar páginas de PDF como imagens compartilháveis",
    ],
    faqTitle: "FAQ sobre PDF para imagem",
    faqs: [
      {
        q: "PDFs com senha podem ser renderizados?",
        a: "PDFs protegidos por senha ou corrompidos podem falhar. A ferramenta mostra um erro quando não conseguir ler o arquivo.",
      },
      {
        q: "Quais formatos de saída são suportados?",
        a: "Você pode exportar páginas como PNG ou JPG, com controle de qualidade para JPG.",
      },
      {
        q: "Como obtenho imagens em maior resolução?",
        a: "Aumente a escala antes de renderizar as páginas do PDF.",
      },
    ],
  },
  mergeSplitPdf: {
    title: "Mescle e divida páginas de PDF no navegador",
    intro:
      "Organize páginas de PDF visualmente, combine vários PDFs, remova páginas desnecessárias e exporte um PDF limpo sem upload.",
    howTitle: "Como organizar um PDF",
    how: [
      "Solte um ou mais arquivos PDF.",
      "Visualize, reordene ou remova páginas.",
      "Exporte a ordem visível das páginas como um PDF.",
    ],
    bestTitle: "Ideal para",
    best: [
      "Combinar documentos em um PDF",
      "Remover páginas indesejadas",
      "Reordenar páginas digitalizadas antes de compartilhar",
    ],
    faqTitle: "FAQ sobre mesclar e dividir PDF",
    faqs: [
      {
        q: "Os PDFs são enviados para um servidor?",
        a: "Não. O organizador de PDF roda no navegador, então os arquivos ficam no seu dispositivo.",
      },
      {
        q: "Posso combinar vários PDFs?",
        a: "Sim. Adicione vários PDFs e as páginas aparecem juntas para você reordenar e exportar.",
      },
      {
        q: "PDFs com senha podem ser organizados?",
        a: "PDFs protegidos por senha ou corrompidos podem não carregar. A ferramenta mostra um erro quando não conseguir ler o arquivo.",
      },
    ],
  },
};

const filipinoToolSeoCopy: Record<ToolSeoKey, ToolSeoCopy> = {
  resize: {
    title: "Mag-resize ng images online nang walang upload",
    intro:
      "Gamitin ang browser-based image resizer para sa eksaktong dimensions, social media presets, thumbnails, banners, at product photos.",
    howTitle: "Paano mag-resize ng image",
    how: [
      "I-drop ang JPG, PNG, WebP, o AVIF image.",
      "Pumili ng eksaktong dimensions o preset size.",
      "I-download ang resized image mula sa browser.",
    ],
    bestTitle: "Pinakamainam para sa",
    best: [
      "Social posts at profile images",
      "Website banners at thumbnails",
      "Product images na pare-pareho ang dimensions",
    ],
    faqTitle: "FAQ sa image resize",
    faqs: [
      {
        q: "Ina-upload ba ang images sa server?",
        a: "Hindi. Lokal na tumatakbo sa browser ang resizing, kaya nananatili ang files sa device mo.",
      },
      {
        q: "Puwede bang panatilihin ang original aspect ratio?",
        a: "Oo. I-lock ang ratio bago baguhin ang width o height para manatili ang original proportions.",
      },
      {
        q: "Anong formats ang puwedeng i-export?",
        a: "Puwede kang mag-export ng JPG, PNG, WebP, at AVIF kapag suportado ng browser ang napiling format.",
      },
    ],
  },
  compress: {
    title: "Mag-compress ng images sa browser",
    intro:
      "Paliitin ang image file size gamit ang adjustable quality at side-by-side previews. Lokal at sunod-sunod ang batch processing.",
    howTitle: "Paano mag-compress ng images",
    how: [
      "I-drop ang isa o higit pang images.",
      "Pumili ng JPG, WebP, AVIF, o PNG output.",
      "I-adjust ang quality at i-download ang bawat compressed file.",
    ],
    bestTitle: "Pinakamainam para sa",
    best: [
      "Mas mabilis na website images",
      "Mas maliit na email attachments",
      "Batch photo optimization bago mag-publish",
    ],
    faqTitle: "FAQ sa image compression",
    faqs: [
      {
        q: "Bakit minsan mas malaki ang compressed image?",
        a: "May formats na optimized na. Subukan ang mas mababang quality o WebP/JPG para sa photos.",
      },
      {
        q: "Puwede bang mag-compress ng maraming images?",
        a: "Oo. Magdagdag ng maraming images at ipoproseso ng tool ang mga ito isa-isa para protektahan ang browser memory.",
      },
      {
        q: "Binabago ba ng PNG quality ang file size?",
        a: "Lossless ang PNG sa tool na ito. Para sa mas maliit na files, gumamit ng JPG, WebP, o AVIF.",
      },
    ],
  },
  convert: {
    title: "I-convert ang JPG, PNG, WebP, at AVIF",
    intro:
      "Direktang mag-convert ng image formats sa browser, may batch support at adjustable quality para sa modern web formats.",
    howTitle: "Paano mag-convert ng images",
    how: [
      "I-drop ang isa o higit pang images.",
      "Piliin ang output format.",
      "I-download agad ang converted files.",
    ],
    bestTitle: "Pinakamainam para sa",
    best: [
      "JPG to PNG at PNG to JPG workflows",
      "WebP o AVIF exports para sa websites",
      "Batch format conversion nang walang software install",
    ],
    faqTitle: "FAQ sa image conversion",
    faqs: [
      {
        q: "Puwede bang mag-convert sa parehong format?",
        a: "Oo. Ire-reencode ang file, kapaki-pakinabang kapag binabago ang quality.",
      },
      {
        q: "Suportado ba ang AVIF kahit saan?",
        a: "Depende sa browser ang AVIF export. Magpapakita ng error ang app kung hindi ito kayang i-encode.",
      },
      {
        q: "Mananatili bang transparent ang transparent PNGs?",
        a: "Pinapanatili ang transparency sa formats na sumusuporta rito, gaya ng PNG at WebP.",
      },
    ],
  },
  removeBackground: {
    title: "Alisin ang background ng mga image sa browser",
    intro:
      "Gamitin ang local background remover para putulin ang subject mula sa portraits, product photos, at simpleng scenes nang hindi nag-a-upload ng file.",
    howTitle: "Paano alisin ang background",
    how: [
      "I-drop ang JPG, PNG, WebP, o AVIF na image.",
      "Hintaying ihiwalay ng browser ang subject.",
      "I-download ang cutout na may transparent background.",
    ],
    bestTitle: "Pinakamainam para sa",
    best: [
      "Product photos at profile images",
      "Transparent cutouts para sa design work",
      "Pag-alis ng simpleng background nang lokal",
    ],
    faqTitle: "FAQ sa background removal",
    faqs: [
      {
        q: "Ina-upload ba ang images sa server?",
        a: "Hindi. Tumatakbo ang model sa browser mo, kaya nananatili ang files sa device mo.",
      },
      {
        q: "Aling mga image ang pinakamainam?",
        a: "Kadalasang pinakamaganda ang resulta sa portraits, products, at mga larawang iisang subject lang na malinaw ang edges.",
      },
      {
        q: "Puwede ba akong mag-export ng transparent result?",
        a: "Oo. Pinapanatili ng PNG ang transparency, at puwede rin ang WebP o AVIF kapag suportado ng browser.",
      },
    ],
  },
  imageToPdf: {
    title: "Gawing PDF ang images",
    intro:
      "Pagsamahin ang JPG, PNG, WebP, o AVIF images sa isang PDF na may page size, orientation, margin, at ordering controls.",
    howTitle: "Paano gumawa ng PDF mula sa images",
    how: [
      "I-drop ang images sa tool.",
      "Ayusin ang order at piliin ang page settings.",
      "I-generate at i-download ang PDF.",
    ],
    bestTitle: "Pinakamainam para sa",
    best: [
      "Pagsumite ng scanned documents",
      "Pagsama-sama ng receipts o notes",
      "Paggawa ng printable image collections",
    ],
    faqTitle: "FAQ sa image to PDF",
    faqs: [
      {
        q: "Puwede bang baguhin ang order ng images bago gumawa ng PDF?",
        a: "Oo. I-drag ang files o gamitin ang move buttons para piliin ang final page order.",
      },
      {
        q: "Anong page sizes ang available?",
        a: "Puwede kang gumamit ng A4, Letter, o i-fit ang bawat PDF page sa laki ng image.",
      },
      {
        q: "Gagana ba ito offline pagkatapos mag-load?",
        a: "Ginagawa ang PDF sa browser, kaya walang upload step.",
      },
    ],
  },
  pdfToImage: {
    title: "I-export ang PDF pages bilang images",
    intro:
      "I-render ang PDF pages bilang PNG o JPG images sa browser. Pumili ng scale para sa mas malinaw na output.",
    howTitle: "Paano i-convert ang PDF pages sa images",
    how: [
      "I-drop ang PDF file.",
      "Piliin ang scale, format, at JPG quality.",
      "I-render ang pages at i-download ang images.",
    ],
    bestTitle: "Pinakamainam para sa",
    best: [
      "Paggawa ng page previews",
      "Pagkuha ng presentation slides",
      "Pag-save ng PDF pages bilang shareable images",
    ],
    faqTitle: "FAQ sa PDF to image",
    faqs: [
      {
        q: "Puwede bang i-render ang password-protected PDFs?",
        a: "Maaaring hindi ma-render ang may password o corrupted PDFs. Magpapakita ng error ang tool kapag hindi mabasa ang file.",
      },
      {
        q: "Anong output formats ang suportado?",
        a: "Puwede mong i-export ang pages bilang PNG o JPG, may quality control para sa JPG.",
      },
      {
        q: "Paano makakuha ng mas high-resolution na images?",
        a: "Taasan ang scale bago i-render ang PDF pages.",
      },
    ],
  },
  mergeSplitPdf: {
    title: "I-merge at i-split ang PDF pages sa browser",
    intro:
      "Ayusin ang PDF pages visually, pagsamahin ang maraming PDF, alisin ang hindi kailangan, at mag-export ng malinis na PDF nang walang upload.",
    howTitle: "Paano ayusin ang PDF",
    how: [
      "I-drop ang isa o higit pang PDF files.",
      "I-preview, ayusin ang order, o alisin ang pages.",
      "I-export ang nakikitang page order bilang isang PDF.",
    ],
    bestTitle: "Pinakamainam para sa",
    best: [
      "Pagsamahin ang documents sa isang PDF",
      "Pag-alis ng hindi kailangang PDF pages",
      "Pag-aayos ng scanned pages bago i-share",
    ],
    faqTitle: "FAQ sa merge at split PDF",
    faqs: [
      {
        q: "Ina-upload ba ang PDFs sa server?",
        a: "Hindi. Tumatakbo ang PDF organizer sa browser, kaya nananatili ang files sa device mo.",
      },
      {
        q: "Puwede bang pagsamahin ang maraming PDF?",
        a: "Oo. Magdagdag ng maraming PDF at ipapakita ang pages nang magkakasama para maayos at ma-export mo.",
      },
      {
        q: "Puwede bang ayusin ang password-protected PDFs?",
        a: "Maaaring hindi mag-load ang password-protected o corrupted PDFs. Magpapakita ng error ang tool kapag hindi mabasa ang file.",
      },
    ],
  },
};

const indonesianToolSeoCopy: Record<ToolSeoKey, ToolSeoCopy> = {
  resize: {
    title: "Resize gambar online tanpa upload",
    intro:
      "Gunakan resizer gambar berbasis browser untuk dimensi tepat, preset media sosial, thumbnail, banner, dan foto produk.",
    howTitle: "Cara resize gambar",
    how: [
      "Drop gambar JPG, PNG, WebP, atau AVIF.",
      "Pilih dimensi tepat atau ukuran preset.",
      "Download gambar hasil resize dari browser.",
    ],
    bestTitle: "Cocok untuk",
    best: [
      "Posting sosial dan foto profil",
      "Banner website dan thumbnail",
      "Gambar produk dengan dimensi konsisten",
    ],
    faqTitle: "FAQ resize gambar",
    faqs: [
      {
        q: "Apakah gambar diupload ke server?",
        a: "Tidak. Resize berjalan lokal di browser, jadi file tetap berada di perangkat Anda.",
      },
      {
        q: "Bisakah mempertahankan aspect ratio asli?",
        a: "Bisa. Kunci rasio sebelum mengubah lebar atau tinggi agar proporsi asli tetap terjaga.",
      },
      {
        q: "Format apa saja yang bisa diekspor?",
        a: "Anda bisa mengekspor JPG, PNG, WebP, dan AVIF jika browser mendukung format yang dipilih.",
      },
    ],
  },
  compress: {
    title: "Kompres gambar di browser",
    intro:
      "Kurangi ukuran file gambar dengan kualitas yang bisa diatur dan preview berdampingan. Batch diproses lokal secara berurutan.",
    howTitle: "Cara kompres gambar",
    how: [
      "Drop satu atau beberapa gambar.",
      "Pilih output JPG, WebP, AVIF, atau PNG.",
      "Atur kualitas dan download tiap file terkompres.",
    ],
    bestTitle: "Cocok untuk",
    best: [
      "Gambar website yang lebih cepat",
      "Lampiran email yang lebih kecil",
      "Optimasi foto batch sebelum publikasi",
    ],
    faqTitle: "FAQ kompresi gambar",
    faqs: [
      {
        q: "Mengapa gambar hasil kompres bisa lebih besar?",
        a: "Beberapa format sudah optimal. Coba kualitas lebih rendah atau gunakan WebP/JPG untuk foto.",
      },
      {
        q: "Bisakah kompres banyak gambar?",
        a: "Bisa. Tambahkan banyak gambar dan tool memprosesnya satu per satu untuk menjaga memori browser.",
      },
      {
        q: "Apakah kualitas PNG mengubah ukuran file?",
        a: "PNG bersifat lossless di tool ini. Untuk file lebih kecil, gunakan JPG, WebP, atau AVIF.",
      },
    ],
  },
  convert: {
    title: "Konversi JPG, PNG, WebP, dan AVIF",
    intro:
      "Konversi format gambar langsung di browser dengan dukungan batch dan kualitas yang bisa diatur untuk format web modern.",
    howTitle: "Cara konversi gambar",
    how: [
      "Drop satu atau beberapa gambar.",
      "Pilih format output.",
      "Download file hasil konversi secara instan.",
    ],
    bestTitle: "Cocok untuk",
    best: [
      "Workflow JPG ke PNG dan PNG ke JPG",
      "Ekspor WebP atau AVIF untuk website",
      "Konversi format batch tanpa install software",
    ],
    faqTitle: "FAQ konversi gambar",
    faqs: [
      {
        q: "Bisakah konversi ke format yang sama?",
        a: "Bisa. File akan di-encode ulang, berguna saat mengubah kualitas.",
      },
      {
        q: "Apakah AVIF didukung di semua tempat?",
        a: "Ekspor AVIF bergantung pada dukungan browser. App menampilkan error jika browser tidak bisa mengencode-nya.",
      },
      {
        q: "Apakah PNG transparan tetap transparan?",
        a: "Transparansi dipertahankan untuk format yang mendukungnya, seperti PNG dan WebP.",
      },
    ],
  },
  removeBackground: {
    title: "Hapus background gambar di browser",
    intro:
      "Gunakan background remover lokal ini untuk memotong subjek dari foto portrait, foto produk, dan scene sederhana tanpa upload file.",
    howTitle: "Cara menghapus background",
    how: [
      "Drop gambar JPG, PNG, WebP, atau AVIF.",
      "Tunggu browser mengisolasi subjek.",
      "Download hasil cutout dengan background transparan.",
    ],
    bestTitle: "Cocok untuk",
    best: [
      "Foto produk dan foto profil",
      "Cutout transparan untuk desain",
      "Menghapus background sederhana secara lokal",
    ],
    faqTitle: "FAQ background removal",
    faqs: [
      {
        q: "Apakah gambar diupload ke server?",
        a: "Tidak. Model background removal berjalan di browser, jadi file tetap di perangkat Anda.",
      },
      {
        q: "Gambar seperti apa yang paling cocok?",
        a: "Portrait, produk, dan foto dengan satu subjek dan tepi yang jelas biasanya memberi hasil terbaik.",
      },
      {
        q: "Bisakah saya mengekspor hasil transparan?",
        a: "Ya. PNG menjaga transparansi, dan WebP atau AVIF juga bisa jika browser mendukung.",
      },
    ],
  },
  imageToPdf: {
    title: "Ubah gambar menjadi PDF",
    intro:
      "Gabungkan JPG, PNG, WebP, atau AVIF menjadi satu PDF dengan kontrol ukuran halaman, orientasi, margin, dan urutan.",
    howTitle: "Cara membuat PDF dari gambar",
    how: [
      "Drop gambar ke tool.",
      "Urutkan dan pilih pengaturan halaman.",
      "Generate lalu download PDF.",
    ],
    bestTitle: "Cocok untuk",
    best: [
      "Mengirim dokumen hasil scan",
      "Menggabungkan struk atau catatan",
      "Membuat koleksi gambar siap cetak",
    ],
    faqTitle: "FAQ gambar ke PDF",
    faqs: [
      {
        q: "Bisakah mengurutkan gambar sebelum membuat PDF?",
        a: "Bisa. Drag file atau gunakan tombol pindah untuk menentukan urutan halaman akhir.",
      },
      {
        q: "Ukuran halaman apa saja yang tersedia?",
        a: "Anda bisa memakai A4, Letter, atau menyesuaikan tiap halaman PDF dengan ukuran gambar.",
      },
      {
        q: "Apakah ini bekerja offline setelah halaman dimuat?",
        a: "PDF dibuat di browser, jadi tidak ada proses upload.",
      },
    ],
  },
  pdfToImage: {
    title: "Ekspor halaman PDF sebagai gambar",
    intro:
      "Render halaman PDF sebagai PNG atau JPG di browser. Pilih scale untuk output yang lebih tajam.",
    howTitle: "Cara mengubah halaman PDF menjadi gambar",
    how: [
      "Drop file PDF.",
      "Pilih scale, format, dan kualitas JPG.",
      "Render halaman lalu download gambar.",
    ],
    bestTitle: "Cocok untuk",
    best: [
      "Membuat preview halaman",
      "Mengambil slide presentasi",
      "Menyimpan halaman PDF sebagai gambar yang mudah dibagikan",
    ],
    faqTitle: "FAQ PDF ke gambar",
    faqs: [
      {
        q: "Bisakah PDF berpassword dirender?",
        a: "PDF berpassword atau rusak mungkin tidak bisa dirender. Tool akan menampilkan error saat file tidak dapat dibaca.",
      },
      {
        q: "Format output apa yang didukung?",
        a: "Anda bisa mengekspor halaman sebagai PNG atau JPG, dengan kontrol kualitas untuk JPG.",
      },
      {
        q: "Bagaimana mendapat gambar resolusi lebih tinggi?",
        a: "Naikkan scale sebelum merender halaman PDF.",
      },
    ],
  },
  mergeSplitPdf: {
    title: "Gabung dan pisahkan halaman PDF di browser",
    intro:
      "Atur halaman PDF secara visual, gabungkan beberapa PDF, hapus halaman yang tidak diperlukan, dan ekspor satu PDF rapi tanpa upload.",
    howTitle: "Cara mengatur PDF",
    how: [
      "Drop satu atau beberapa file PDF.",
      "Preview, urutkan, atau hapus halaman.",
      "Ekspor urutan halaman yang terlihat sebagai satu PDF.",
    ],
    bestTitle: "Cocok untuk",
    best: [
      "Menggabungkan dokumen menjadi satu PDF",
      "Menghapus halaman PDF yang tidak perlu",
      "Mengurutkan halaman scan sebelum dibagikan",
    ],
    faqTitle: "FAQ gabung dan pisah PDF",
    faqs: [
      {
        q: "Apakah PDF diupload ke server?",
        a: "Tidak. PDF organizer berjalan di browser, jadi file tetap berada di perangkat Anda.",
      },
      {
        q: "Bisakah menggabungkan beberapa PDF?",
        a: "Bisa. Tambahkan beberapa PDF dan halaman akan tampil bersama untuk diurutkan dan diekspor.",
      },
      {
        q: "Bisakah PDF berpassword diatur?",
        a: "PDF berpassword atau rusak mungkin tidak dapat dimuat. Tool menampilkan error saat file tidak dapat dibaca.",
      },
    ],
  },
};

const vietnameseToolSeoCopy: Record<ToolSeoKey, ToolSeoCopy> = {
  resize: {
    title: "Resize ảnh online không cần upload",
    intro:
      "Dùng công cụ resize ảnh chạy trên trình duyệt cho kích thước chính xác, preset mạng xã hội, thumbnail, banner và ảnh sản phẩm.",
    howTitle: "Cách resize ảnh",
    how: [
      "Thả ảnh JPG, PNG, WebP hoặc AVIF.",
      "Chọn kích thước chính xác hoặc preset có sẵn.",
      "Tải ảnh đã resize ngay từ trình duyệt.",
    ],
    bestTitle: "Phù hợp cho",
    best: [
      "Bài đăng mạng xã hội và ảnh đại diện",
      "Banner website và thumbnail",
      "Ảnh sản phẩm có kích thước đồng nhất",
    ],
    faqTitle: "FAQ resize ảnh",
    faqs: [
      {
        q: "Ảnh có bị upload lên server không?",
        a: "Không. Việc resize chạy cục bộ trong trình duyệt, nên file luôn ở trên thiết bị của bạn.",
      },
      {
        q: "Có giữ được tỷ lệ gốc không?",
        a: "Có. Khóa tỷ lệ trước khi đổi chiều rộng hoặc chiều cao để giữ nguyên tỷ lệ ban đầu.",
      },
      {
        q: "Có thể xuất những định dạng nào?",
        a: "Bạn có thể xuất JPG, PNG, WebP và AVIF khi trình duyệt hỗ trợ định dạng đã chọn.",
      },
    ],
  },
  compress: {
    title: "Nén ảnh ngay trong trình duyệt",
    intro:
      "Giảm dung lượng ảnh với chất lượng tùy chỉnh và xem trước song song. Xử lý hàng loạt chạy cục bộ từng file một.",
    howTitle: "Cách nén ảnh",
    how: [
      "Thả một hoặc nhiều ảnh.",
      "Chọn đầu ra JPG, WebP, AVIF hoặc PNG.",
      "Điều chỉnh chất lượng và tải từng file đã nén.",
    ],
    bestTitle: "Phù hợp cho",
    best: [
      "Ảnh website tải nhanh hơn",
      "File đính kèm email nhẹ hơn",
      "Tối ưu ảnh hàng loạt trước khi đăng",
    ],
    faqTitle: "FAQ nén ảnh",
    faqs: [
      {
        q: "Vì sao ảnh đã nén có thể lớn hơn?",
        a: "Một số định dạng đã được tối ưu. Hãy thử giảm chất lượng hoặc dùng WebP/JPG cho ảnh chụp.",
      },
      {
        q: "Có nén được nhiều ảnh không?",
        a: "Có. Thêm nhiều ảnh và công cụ sẽ xử lý từng file để bảo vệ bộ nhớ trình duyệt.",
      },
      {
        q: "Chất lượng PNG có đổi dung lượng không?",
        a: "PNG ở đây là lossless. Để file nhỏ hơn, hãy dùng JPG, WebP hoặc AVIF.",
      },
    ],
  },
  convert: {
    title: "Chuyển đổi JPG, PNG, WebP và AVIF",
    intro:
      "Chuyển đổi định dạng ảnh trực tiếp trong trình duyệt, hỗ trợ batch và chỉnh chất lượng cho các định dạng web hiện đại.",
    howTitle: "Cách chuyển đổi ảnh",
    how: [
      "Thả một hoặc nhiều ảnh.",
      "Chọn định dạng đầu ra.",
      "Tải file đã chuyển đổi ngay lập tức.",
    ],
    bestTitle: "Phù hợp cho",
    best: [
      "Quy trình JPG sang PNG và PNG sang JPG",
      "Xuất WebP hoặc AVIF cho website",
      "Chuyển đổi hàng loạt không cần cài phần mềm",
    ],
    faqTitle: "FAQ chuyển đổi ảnh",
    faqs: [
      {
        q: "Có thể chuyển sang cùng định dạng không?",
        a: "Có. File sẽ được encode lại, hữu ích khi bạn muốn đổi chất lượng.",
      },
      {
        q: "AVIF có được hỗ trợ mọi nơi không?",
        a: "Xuất AVIF phụ thuộc vào trình duyệt. App sẽ báo lỗi nếu trình duyệt không encode được.",
      },
      {
        q: "PNG trong suốt có giữ trong suốt không?",
        a: "Độ trong suốt được giữ ở các định dạng hỗ trợ, như PNG và WebP.",
      },
    ],
  },
  removeBackground: {
    title: "Xóa nền ảnh ngay trong trình duyệt",
    intro:
      "Dùng công cụ xóa nền cục bộ để cắt chủ thể từ ảnh chân dung, ảnh sản phẩm và các cảnh đơn giản mà không cần tải file lên.",
    howTitle: "Cách xóa nền",
    how: [
      "Thả một ảnh JPG, PNG, WebP hoặc AVIF.",
      "Chờ trình duyệt tách chủ thể ra khỏi nền.",
      "Tải xuống kết quả cắt với nền trong suốt.",
    ],
    bestTitle: "Phù hợp nhất cho",
    best: [
      "Ảnh sản phẩm và ảnh đại diện",
      "Cutout trong suốt cho thiết kế",
      "Xóa nền đơn giản ngay trên máy",
    ],
    faqTitle: "FAQ xóa nền",
    faqs: [
      {
        q: "Ảnh có được tải lên server không?",
        a: "Không. Mô hình xóa nền chạy ngay trong trình duyệt, nên file vẫn ở trên thiết bị của bạn.",
      },
      {
        q: "Ảnh nào cho kết quả tốt nhất?",
        a: "Ảnh chân dung, ảnh sản phẩm và ảnh chỉ có một chủ thể với viền rõ thường cho kết quả tốt nhất.",
      },
      {
        q: "Có xuất được ảnh trong suốt không?",
        a: "Có. PNG giữ được độ trong suốt, và WebP hoặc AVIF cũng có thể giữ nếu trình duyệt hỗ trợ.",
      },
    ],
  },
  imageToPdf: {
    title: "Chuyển ảnh thành PDF",
    intro:
      "Gộp JPG, PNG, WebP hoặc AVIF thành một file PDF với tùy chọn kích thước trang, hướng giấy, lề và thứ tự.",
    howTitle: "Cách tạo PDF từ ảnh",
    how: ["Thả ảnh vào công cụ.", "Sắp xếp lại và chọn cài đặt trang.", "Tạo và tải file PDF."],
    bestTitle: "Phù hợp cho",
    best: ["Nộp tài liệu scan", "Gộp hóa đơn hoặc ghi chú", "Tạo bộ ảnh có thể in"],
    faqTitle: "FAQ ảnh sang PDF",
    faqs: [
      {
        q: "Có sắp xếp lại ảnh trước khi tạo PDF không?",
        a: "Có. Kéo file hoặc dùng nút di chuyển để chọn thứ tự trang cuối cùng.",
      },
      {
        q: "Có những kích thước trang nào?",
        a: "Bạn có thể dùng A4, Letter hoặc để từng trang PDF khớp với kích thước ảnh.",
      },
      {
        q: "Sau khi tải trang, công cụ có chạy offline không?",
        a: "PDF được tạo trong trình duyệt, nên không có bước upload.",
      },
    ],
  },
  pdfToImage: {
    title: "Xuất trang PDF thành ảnh",
    intro:
      "Render trang PDF thành ảnh PNG hoặc JPG trong trình duyệt. Chọn scale để đầu ra sắc nét hơn.",
    howTitle: "Cách chuyển trang PDF thành ảnh",
    how: ["Thả file PDF.", "Chọn scale, định dạng và chất lượng JPG.", "Render trang rồi tải ảnh."],
    bestTitle: "Phù hợp cho",
    best: [
      "Tạo preview từng trang",
      "Trích xuất slide thuyết trình",
      "Lưu trang PDF thành ảnh dễ chia sẻ",
    ],
    faqTitle: "FAQ PDF sang ảnh",
    faqs: [
      {
        q: "Có render được PDF có mật khẩu không?",
        a: "PDF có mật khẩu hoặc bị lỗi có thể không render được. Công cụ sẽ báo lỗi khi không đọc được file.",
      },
      {
        q: "Hỗ trợ định dạng đầu ra nào?",
        a: "Bạn có thể xuất trang thành PNG hoặc JPG, có chỉnh chất lượng cho JPG.",
      },
      {
        q: "Làm sao để có ảnh độ phân giải cao hơn?",
        a: "Tăng scale trước khi render các trang PDF.",
      },
    ],
  },
  mergeSplitPdf: {
    title: "Ghép và tách trang PDF trong trình duyệt",
    intro:
      "Sắp xếp trang PDF trực quan, ghép nhiều PDF, xóa trang không cần thiết và xuất một PDF gọn gàng mà không cần upload.",
    howTitle: "Cách sắp xếp PDF",
    how: [
      "Thả một hoặc nhiều file PDF.",
      "Xem trước, sắp xếp lại hoặc xóa trang.",
      "Xuất thứ tự trang đang hiển thị thành một PDF.",
    ],
    bestTitle: "Phù hợp cho",
    best: [
      "Ghép tài liệu thành một PDF",
      "Xóa trang PDF không cần thiết",
      "Sắp xếp trang scan trước khi chia sẻ",
    ],
    faqTitle: "FAQ ghép và tách PDF",
    faqs: [
      {
        q: "PDF có bị upload lên server không?",
        a: "Không. Công cụ sắp xếp PDF chạy trong trình duyệt, nên file luôn ở trên thiết bị của bạn.",
      },
      {
        q: "Có ghép nhiều PDF được không?",
        a: "Có. Thêm nhiều PDF và các trang sẽ hiển thị chung để bạn sắp xếp rồi xuất.",
      },
      {
        q: "Có sắp xếp được PDF có mật khẩu không?",
        a: "PDF có mật khẩu hoặc bị lỗi có thể không tải được. Công cụ sẽ báo lỗi khi không đọc được file.",
      },
    ],
  },
};

export const toolSeoUiCopy: Record<
  Locale,
  { relatedTools: string; labels: Record<ToolSeoKey, string> }
> = {
  "en-US": {
    relatedTools: "Related tools",
    labels: {
      resize: "Resize Image",
      compress: "Compress Image",
      convert: "Convert Image",
      removeBackground: "Remove Background",
      imageToPdf: "Image to PDF",
      pdfToImage: "PDF to Image",
      mergeSplitPdf: "Merge & Split PDF",
    },
  },
  "en-IN": {
    relatedTools: "Related tools",
    labels: {
      resize: "Resize Image",
      compress: "Compress Image",
      convert: "Convert Image",
      removeBackground: "Remove Background",
      imageToPdf: "Image to PDF",
      pdfToImage: "PDF to Image",
      mergeSplitPdf: "Merge & Split PDF",
    },
  },
  "pt-BR": {
    relatedTools: "Ferramentas relacionadas",
    labels: {
      resize: "Redimensionar Imagem",
      compress: "Comprimir Imagem",
      convert: "Converter Imagem",
      removeBackground: "Remover Fundo",
      imageToPdf: "Imagem para PDF",
      pdfToImage: "PDF para Imagem",
      mergeSplitPdf: "Mesclar e Dividir PDF",
    },
  },
  "fil-PH": {
    relatedTools: "Mga related na tool",
    labels: {
      resize: "Resize Image",
      compress: "Compress Image",
      convert: "Convert Image",
      removeBackground: "Remove Background",
      imageToPdf: "Image to PDF",
      pdfToImage: "PDF to Image",
      mergeSplitPdf: "Merge at Split PDF",
    },
  },
  "id-ID": {
    relatedTools: "Alat terkait",
    labels: {
      resize: "Resize Image",
      compress: "Kompres Gambar",
      convert: "Konversi Gambar",
      removeBackground: "Hapus Background",
      imageToPdf: "Gambar ke PDF",
      pdfToImage: "PDF ke Gambar",
      mergeSplitPdf: "Gabung & Pisah PDF",
    },
  },
  "vi-VN": {
    relatedTools: "Công cụ liên quan",
    labels: {
      resize: "Resize Image",
      compress: "Nén Ảnh",
      convert: "Chuyển đổi ảnh",
      removeBackground: "Xóa nền",
      imageToPdf: "Ảnh sang PDF",
      pdfToImage: "PDF sang Ảnh",
      mergeSplitPdf: "Ghép & Tách PDF",
    },
  },
};

export const seoCopy: Record<Locale, Record<ToolSeoKey, ToolSeoCopy>> = {
  "en-US": englishToolSeoCopy,
  "en-IN": englishToolSeoCopy,
  "pt-BR": portugueseToolSeoCopy,
  "fil-PH": filipinoToolSeoCopy,
  "id-ID": indonesianToolSeoCopy,
  "vi-VN": vietnameseToolSeoCopy,
};
