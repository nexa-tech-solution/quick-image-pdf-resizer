import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Locale = "en-US" | "en-IN" | "pt-BR" | "fil-PH" | "id-ID" | "vi-VN";

export const supportedLocales: Locale[] = ["en-US", "en-IN", "pt-BR", "fil-PH", "id-ID", "vi-VN"];

export const localeMeta: Record<
  Locale,
  { label: string; short: string; flag: string; country: string }
> = {
  "en-US": { label: "English (US)", short: "EN-US", flag: "🇺🇸", country: "United States" },
  "en-IN": { label: "English (India)", short: "EN-IN", flag: "🇮🇳", country: "India" },
  "pt-BR": { label: "Português (Brasil)", short: "PT-BR", flag: "🇧🇷", country: "Brazil" },
  "fil-PH": {
    label: "Filipino (Philippines)",
    short: "FIL",
    flag: "🇵🇭",
    country: "Philippines",
  },
  "id-ID": { label: "Bahasa Indonesia", short: "ID", flag: "🇮🇩", country: "Indonesia" },
  "vi-VN": { label: "Tiếng Việt", short: "VI", flag: "🇻🇳", country: "Vietnam" },
};

export function detectLocale(value: string | null | undefined): Locale {
  const normalized = (value ?? "").toLowerCase().replace("_", "-");
  if (normalized.startsWith("pt")) return "pt-BR";
  if (normalized.startsWith("fil") || normalized.startsWith("tl")) return "fil-PH";
  if (normalized.startsWith("id")) return "id-ID";
  if (normalized.startsWith("vi")) return "vi-VN";
  if (normalized.startsWith("en-in")) return "en-IN";
  if (normalized.startsWith("en")) return "en-US";
  return "en-US";
}

export function getBrowserLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return detectLocale(stored);
    return detectLocale(window.navigator.language);
  }

  return "en-US";
}

const STORAGE_KEY = "resize-image-locale";

const messages = {
  "en-US": {
    header: {
      resizeImage: "Resize Image",
      compress: "Compress",
      convert: "Convert",
      imageToPdf: "Image → PDF",
      pdfToImage: "PDF → Image",
      pricing: "Pricing",
      language: "Language",
      getPro: "Get Pro",
    },
    footer: {
      brand: "Resize Image",
      blurb: "Browser-based image & PDF tools. Private by design — files never leave your device.",
      image: "Image",
      pdf: "PDF",
      company: "Company",
      resizeImage: "Resize Image",
      compressImage: "Compress Image",
      convertFormat: "Convert Format",
      imageToPdf: "Image to PDF",
      pdfToImage: "PDF to Image",
      pricing: "Pricing",
      about: "About",
      copyright: "All rights reserved.",
    },
    home: {
      badge: "100% browser-based",
      titlePrefix: "Resize, compress &",
      titleAccent: "convert",
      titleSuffix: "in seconds.",
      description:
        "Five focused tools for images and PDFs. No uploads, no accounts — files are processed locally in your browser.",
      startResizing: "Compress now",
      browseAllTools: "Browse all tools",
      tools: "Tools",
      uploads: "Uploads",
      filesPerDay: "Files / day*",
      featurePrivateTitle: "Private by design",
      featurePrivateDesc: "Files never leave your device. Everything runs in your browser.",
      featureInstantTitle: "Instant results",
      featureInstantDesc: "No round-trip to a server. Resize and download in milliseconds.",
      featureAnyFormatTitle: "Any format",
      featureAnyFormatDesc: "JPG, PNG, WebP and PDF. Convert and compress with one click.",
      ctaTitle: "Free up to 250 MB",
      ctaDesc: "Premium plans are coming later. For now, enjoy free files up to 250 MB.",
      viewPricing: "View pricing",
      seoBoost: {
        eyebrow: "Why people use it",
        title: "A fast browser-based image resizer, compressor, converter, and PDF tool",
        intro:
          "Resize Image helps you resize photos to exact dimensions, compress images for smaller file sizes, convert between JPG, PNG, WebP, and AVIF, create PDFs from images, and export PDF pages as images. Everything runs locally in the browser, so there is no upload step and no extra software to install.",
        cards: [
          {
            title: "Free image resizer",
            desc: "Resize JPG, PNG, WebP, and AVIF images to exact dimensions for social posts, product pages, thumbnails, and banners.",
          },
          {
            title: "Image compressor",
            desc: "Compress images locally in your browser to reduce file size while keeping quality under control.",
          },
          {
            title: "Image and PDF converter",
            desc: "Convert image formats, turn images into PDF, and export PDF pages as PNG without uploading files.",
          },
        ],
        howItWorksTitle: "How it works",
        howItWorksSteps: [
          "Drop a file into the tool you need.",
          "Choose resize, compress, convert, or PDF output settings.",
          "Download the result instantly with no upload delay.",
        ],
        searchesTitle: "Common searches we help with",
        searches: [
          "image resizer",
          "image compressor",
          "JPG to PNG converter",
          "image to PDF converter",
          "PDF to image converter",
        ],
        faqTitle: "FAQ",
        faqs: [
          {
            q: "Can I resize images without uploading them?",
            a: "Yes. Resize Image works directly in your browser, so files stay on your device while you resize, compress, or convert them.",
          },
          {
            q: "Which file types do you support?",
            a: "The app supports JPG, PNG, WebP, AVIF, and PDF workflows depending on the tool you choose.",
          },
          {
            q: "Is this good for SEO-friendly content and fast downloads?",
            a: "Yes. The tools are fast, private, and built for common searches like image resizer, image compressor, JPG to PNG converter, image to PDF, and PDF to image.",
          },
        ],
      },
    },
    toolsGrid: {
      toolset: "Toolset",
      title: "Every tool you need",
      desc: "Five focused tools instead of one bloated editor. Pick a job, get it done.",
      resizeImage: {
        title: "Resize Image",
        desc: "JPG, PNG, WebP, AVIF — exact dimensions or presets like 1080×1080.",
      },
      compressImage: {
        title: "Compress Image",
        desc: "Shrink file size with adjustable quality. Side-by-side preview.",
      },
      convertFormat: {
        title: "Convert Format",
        desc: "Swap between JPG, PNG, WebP and AVIF in one click.",
      },
      imageToPdf: {
        title: "Image → PDF",
        desc: "Combine images into a single PDF. Choose A4 or Letter.",
      },
      pdfToImage: {
        title: "PDF → Image",
        desc: "Export every page of a PDF as a high-resolution image.",
      },
      open: "Open",
    },
    resizeTool: {
      dropTitle: "Drop an image to resize",
      dropHint: "JPG, PNG, WebP or AVIF — up to 250 MB",
      dimensions: "Dimensions",
      lockRatio: "Lock Ratio",
      unlockRatio: "Unlock Ratio",
      lockHelp: "Lock ratio keeps the image proportions when you change W or H.",
      fit: "Fit",
      format: "Format",
      quality: "Quality",
      presets: "Presets",
      remove: "Remove",
      preview: "Preview",
      updating: "Updating",
      background: "Background",
      backgroundHint: "Contain / JPG",
      backgroundColor: "Background color",
      backgroundHexColor: "Background hex color",
      fitOptions: {
        contain: "Contain",
        cover: "Cover",
        stretch: "Stretch",
      },
      presetLabels: {
        socialSquare: "Social square",
        storyReel: "Story / Reel",
        youtubeThumb: "YouTube thumb",
        fullHd: "Full HD",
        wideBanner: "Wide banner",
        profile: "Profile",
      },
      new: "New",
      download: "Download",
      original: "Original",
      compressed: "Compressed",
      loadingPreview: "Loading preview...",
      readingDimensions: "Reading dimensions",
      waitingOutput: "Waiting for output",
      sizeChange: "Size change",
      output: "Output",
      readyToDownload: "ready to download",
      smaller: "smaller than original",
      larger: "larger than original",
      lowerQualityHint: "Lower quality usually means a smaller file, especially for photos.",
      pngHint:
        "PNG is lossless here and can make files larger. For smaller downloads, choose JPG, WebP, or AVIF.",
    },
    routes: {
      about: {
        title: "About — Resize Image",
        description:
          "Resize Image builds fast, private, browser-based image and PDF tools. No uploads, no tracking.",
        ogTitle: "About | Resize Image",
        ogDescription: "Why we built Resize Image.",
        eyebrow: "About",
        titleText: "Tools that respect your files.",
        intro:
          "Most online resizers send your files to a server you don't know. Resize Image doesn't. Every operation runs locally in your browser using modern Web APIs — Canvas, WebAssembly, and pdf-lib. Nothing leaves your device.",
        insideTitle: "What's inside",
        insideDesc:
          "Resize Image grew into a focused toolkit for images and PDFs. No bloat, no editor, no signup.",
        roadmapTitle: "Roadmap",
        roadmapItems: [
          "Mobile apps for iOS and Android",
          "Batch processing for Pro users",
          "Merge & split PDF",
          "OCR for scanned documents",
        ],
      },
      pricing: {
        title: "Pricing — Free first, premium later | Resize Image",
        description:
          "Resize Image is free forever with files up to 250 MB. Premium plans are coming later.",
        ogTitle: "Pricing | Resize Image",
        ogDescription: "Simple plans. Cancel anytime.",
        eyebrow: "Pricing",
        titleText: "Free to use. Premium later.",
        intro: "Honest pricing. No tracking. Free files up to 250 MB.",
        popular: "Most popular",
        free: {
          name: "Free",
          cadence: "forever",
          features: [
            "All image & PDF tools",
            "Files up to 250 MB",
            "10 files per day",
            "Ads supported",
          ],
          cta: "Start free",
        },
        pro: {
          name: "Pro",
          cadence: "per month",
          features: [
            "Everything in Free",
            "Files up to 250 MB",
            "Unlimited daily files",
            "Batch processing",
            "Zero ads",
            "Priority queue",
          ],
          cta: "Upgrade to Pro",
        },
        lifetime: {
          name: "Lifetime",
          cadence: "one-time",
          features: ["All Pro features", "Forever — no subscription", "Future tools included"],
          cta: "Buy lifetime",
        },
      },
      convertImage: {
        title: "Convert Image — JPG ⇄ PNG ⇄ WebP ⇄ AVIF | Resize Image",
        description:
          "Convert images between JPG, PNG, WebP and AVIF in your browser. No upload, no signup, instant download.",
        ogTitle: "Convert Image | Resize Image",
        ogDescription: "Switch image formats with one click.",
        eyebrow: "Image",
        titleText: "Convert image format",
        intro: "Move between JPG, PNG, WebP and AVIF without leaving your browser.",
        dropTitle: "Drop an image to convert",
        convertTo: "Convert to",
        outputLabel: "Output:",
        outputAs: "as",
        quality: "Quality",
        outputQuality: "Output quality",
        qualityHint: "Applies to JPG, WebP, and AVIF output. PNG keeps lossless output.",
        newButton: "New",
        convertButton: "Convert & Download",
      },
      imageToPdf: {
        title: "Image to PDF — Convert JPG/PNG to PDF | Resize Image",
        description:
          "Combine JPG and PNG images into a single PDF. Choose A4 or Letter, fit images, download instantly.",
        ogTitle: "Image to PDF | Resize Image",
        ogDescription: "Turn images into a clean PDF in your browser.",
        eyebrow: "PDF",
        titleText: "Image → PDF",
        intro: "Drop images, pick a page size, and get a single PDF. JPG and PNG supported.",
        dropTitleEmpty: "Drop images to combine",
        dropTitleFilled: "Add more images",
        hint: "JPG, PNG, WebP or AVIF",
        pageSize: "Page size",
        orientation: "Orientation",
        orientationOptions: {
          portrait: "Portrait",
          landscape: "Landscape",
        },
        margin: "Margin",
        marginOptions: {
          none: "None",
          small: "Small",
          medium: "Medium",
        },
        buildButton: "Build PDF",
      },
      pdfToImage: {
        title: "PDF to Image — Export PDF pages as PNG | Resize Image",
        description:
          "Convert each page of a PDF to a high-resolution PNG. Browser-based, no upload required.",
        ogTitle: "PDF to Image | Resize Image",
        ogDescription: "Export PDF pages as PNG instantly.",
        eyebrow: "PDF",
        titleText: "PDF → Image",
        intro: "Render every page as a PNG. Choose a scale for higher resolution.",
        dropTitle: "Drop a PDF to export as images",
        scaleLabel: "Scale:",
        format: "Format",
        jpgQuality: "JPG quality",
        pageAlt: "Page",
        newButton: "New",
        renderButton: "Render pages",
        saveButton: "Save",
      },
      compressImage: {
        title: "Compress Image — JPG, PNG, WebP, AVIF | Resize Image",
        description:
          "Compress JPG, PNG, WebP and AVIF images in your browser. Adjust quality with live preview and download instantly.",
        ogTitle: "Compress Image | Resize Image",
        ogDescription: "Reduce image size without losing quality.",
        eyebrow: "Image",
        titleText: "Compress images",
        intro: "Slide to find the sweet spot between size and quality. Everything happens locally.",
        dropTitle: "Drop an image to compress",
        original: "Original",
        compressed: "Compressed",
        loadingPreview: "Loading preview...",
        readingDimensions: "Reading dimensions",
        waitingOutput: "Waiting for output",
        sizeChange: "Size change",
        output: "Output",
        readyToDownload: "ready to download",
        smaller: "smaller",
        larger: "larger",
        format: "Format",
        quality: "Quality",
        qualityPresets: {
          high: "High",
          balanced: "Balanced",
          smallest: "Smallest",
        },
        newButton: "New",
        downloadButton: "Download",
        lowerQualityHint: "Lower quality usually means a smaller file, especially for photos.",
        pngHint:
          "PNG is lossless here and can make files larger. For smaller downloads, choose JPG, WebP, or AVIF.",
      },
      notFound: {
        title: "Page not found",
        description: "The page you're looking for doesn't exist.",
        button: "Go home",
      },
    },
  },
  "en-IN": {
    header: {
      resizeImage: "Resize Image",
      compress: "Compress",
      convert: "Convert",
      imageToPdf: "Image → PDF",
      pdfToImage: "PDF → Image",
      pricing: "Pricing",
      language: "Language",
      getPro: "Get Pro",
    },
    footer: {
      brand: "Resize Image",
      blurb: "Browser-based image & PDF tools. Private by design — files never leave your device.",
      image: "Image",
      pdf: "PDF",
      company: "Company",
      resizeImage: "Resize Image",
      compressImage: "Compress Image",
      convertFormat: "Convert Format",
      imageToPdf: "Image to PDF",
      pdfToImage: "PDF to Image",
      pricing: "Pricing",
      about: "About",
      copyright: "All rights reserved.",
    },
    home: {
      badge: "100% browser-based",
      titlePrefix: "Resize, compress &",
      titleAccent: "convert",
      titleSuffix: "in seconds.",
      description:
        "Five focused tools for images and PDFs. No uploads, no accounts — files are processed locally in your browser.",
      startResizing: "Compress now",
      browseAllTools: "Browse all tools",
      tools: "Tools",
      uploads: "Uploads",
      filesPerDay: "Files / day*",
      featurePrivateTitle: "Private by design",
      featurePrivateDesc: "Files never leave your device. Everything runs in your browser.",
      featureInstantTitle: "Instant results",
      featureInstantDesc: "No round-trip to a server. Resize and download in milliseconds.",
      featureAnyFormatTitle: "Any format",
      featureAnyFormatDesc: "JPG, PNG, WebP and PDF. Convert and compress with one click.",
      ctaTitle: "Free up to 250 MB",
      ctaDesc: "Premium plans are coming later. For now, enjoy free files up to 250 MB.",
      viewPricing: "View pricing",
      seoBoost: {
        eyebrow: "Why people use it",
        title: "A fast browser-based image resizer, compressor, converter, and PDF tool",
        intro:
          "Resize Image helps you resize photos to exact dimensions, compress images for smaller file sizes, convert between JPG, PNG, WebP, and AVIF, create PDFs from images, and export PDF pages as images. Everything runs locally in the browser, so there is no upload step and no extra software to install.",
        cards: [
          {
            title: "Free image resizer",
            desc: "Resize JPG, PNG, WebP, and AVIF images to exact dimensions for social posts, product pages, thumbnails, and banners.",
          },
          {
            title: "Image compressor",
            desc: "Compress images locally in your browser to reduce file size while keeping quality under control.",
          },
          {
            title: "Image and PDF converter",
            desc: "Convert image formats, turn images into PDF, and export PDF pages as PNG without uploading files.",
          },
        ],
        howItWorksTitle: "How it works",
        howItWorksSteps: [
          "Drop a file into the tool you need.",
          "Choose resize, compress, convert, or PDF output settings.",
          "Download the result instantly with no upload delay.",
        ],
        searchesTitle: "Common searches we help with",
        searches: [
          "image resizer",
          "image compressor",
          "JPG to PNG converter",
          "image to PDF converter",
          "PDF to image converter",
        ],
        faqTitle: "FAQ",
        faqs: [
          {
            q: "Can I resize images without uploading them?",
            a: "Yes. Resize Image works directly in your browser, so files stay on your device while you resize, compress, or convert them.",
          },
          {
            q: "Which file types do you support?",
            a: "The app supports JPG, PNG, WebP, AVIF, and PDF workflows depending on the tool you choose.",
          },
          {
            q: "Is this good for SEO-friendly content and fast downloads?",
            a: "Yes. The tools are fast, private, and built for common searches like image resizer, image compressor, JPG to PNG converter, image to PDF, and PDF to image.",
          },
        ],
      },
    },
    toolsGrid: {
      toolset: "Toolset",
      title: "Every tool you need",
      desc: "Five focused tools instead of one bloated editor. Pick a job, get it done.",
      resizeImage: {
        title: "Resize Image",
        desc: "JPG, PNG, WebP, AVIF — exact dimensions or presets like 1080×1080.",
      },
      compressImage: {
        title: "Compress Image",
        desc: "Shrink file size with adjustable quality. Side-by-side preview.",
      },
      convertFormat: {
        title: "Convert Format",
        desc: "Swap between JPG, PNG, WebP and AVIF in one click.",
      },
      imageToPdf: {
        title: "Image → PDF",
        desc: "Combine images into a single PDF. Choose A4 or Letter.",
      },
      pdfToImage: {
        title: "PDF → Image",
        desc: "Export every page of a PDF as a high-resolution image.",
      },
      open: "Open",
    },
    resizeTool: {
      dropTitle: "Drop an image to resize",
      dropHint: "JPG, PNG, WebP or AVIF — up to 250 MB",
      dimensions: "Dimensions",
      lockRatio: "Lock Ratio",
      unlockRatio: "Unlock Ratio",
      lockHelp: "Lock ratio keeps the image proportions when you change W or H.",
      fit: "Fit",
      format: "Format",
      quality: "Quality",
      presets: "Presets",
      remove: "Remove",
      preview: "Preview",
      updating: "Updating",
      background: "Background",
      backgroundHint: "Contain / JPG",
      backgroundColor: "Background color",
      backgroundHexColor: "Background hex color",
      fitOptions: {
        contain: "Contain",
        cover: "Cover",
        stretch: "Stretch",
      },
      presetLabels: {
        socialSquare: "Social square",
        storyReel: "Story / Reel",
        youtubeThumb: "YouTube thumb",
        fullHd: "Full HD",
        wideBanner: "Wide banner",
        profile: "Profile",
      },
      new: "New",
      download: "Download",
      original: "Original",
      compressed: "Compressed",
      loadingPreview: "Loading preview...",
      readingDimensions: "Reading dimensions",
      waitingOutput: "Waiting for output",
      sizeChange: "Size change",
      output: "Output",
      readyToDownload: "ready to download",
      smaller: "smaller than original",
      larger: "larger than original",
      lowerQualityHint: "Lower quality usually means a smaller file, especially for photos.",
      pngHint:
        "PNG is lossless here and can make files larger. For smaller downloads, choose JPG, WebP, or AVIF.",
    },
    routes: {
      about: {
        title: "About — Resize Image",
        description:
          "Resize Image builds fast, private, browser-based image and PDF tools. No uploads, no tracking.",
        ogTitle: "About | Resize Image",
        ogDescription: "Why we built Resize Image.",
        eyebrow: "About",
        titleText: "Tools that respect your files.",
        intro:
          "Most online resizers send your files to a server you don't know. Resize Image doesn't. Every operation runs locally in your browser using modern Web APIs — Canvas, WebAssembly, and pdf-lib. Nothing leaves your device.",
        insideTitle: "What's inside",
        insideDesc:
          "Resize Image grew into a focused toolkit for images and PDFs. No bloat, no editor, no signup.",
        roadmapTitle: "Roadmap",
        roadmapItems: [
          "Mobile apps for iOS and Android",
          "Batch processing for Pro users",
          "Merge & split PDF",
          "OCR for scanned documents",
        ],
      },
      pricing: {
        title: "Pricing — Free first, premium later | Resize Image",
        description:
          "Resize Image is free forever with files up to 250 MB. Premium plans are coming later.",
        ogTitle: "Pricing | Resize Image",
        ogDescription: "Simple plans. Cancel anytime.",
        eyebrow: "Pricing",
        titleText: "Free to use. Premium later.",
        intro: "Honest pricing. No tracking. Free files up to 250 MB.",
        popular: "Most popular",
        free: {
          name: "Free",
          cadence: "forever",
          features: [
            "All image & PDF tools",
            "Files up to 250 MB",
            "10 files per day",
            "Ads supported",
          ],
          cta: "Start free",
        },
        pro: {
          name: "Pro",
          cadence: "per month",
          features: [
            "Everything in Free",
            "Files up to 250 MB",
            "Unlimited daily files",
            "Batch processing",
            "Zero ads",
            "Priority queue",
          ],
          cta: "Upgrade to Pro",
        },
        lifetime: {
          name: "Lifetime",
          cadence: "one-time",
          features: ["All Pro features", "Forever — no subscription", "Future tools included"],
          cta: "Buy lifetime",
        },
      },
      convertImage: {
        title: "Convert Image — JPG ⇄ PNG ⇄ WebP ⇄ AVIF | Resize Image",
        description:
          "Convert images between JPG, PNG, WebP and AVIF in your browser. No upload, no signup, instant download.",
        ogTitle: "Convert Image | Resize Image",
        ogDescription: "Switch image formats with one click.",
        eyebrow: "Image",
        titleText: "Convert image format",
        intro: "Move between JPG, PNG, WebP and AVIF without leaving your browser.",
        dropTitle: "Drop an image to convert",
        convertTo: "Convert to",
        outputLabel: "Output:",
        outputAs: "as",
        quality: "Quality",
        outputQuality: "Output quality",
        qualityHint: "Applies to JPG, WebP, and AVIF output. PNG keeps lossless output.",
        newButton: "New",
        convertButton: "Convert & Download",
      },
      imageToPdf: {
        title: "Image to PDF — Convert JPG/PNG to PDF | Resize Image",
        description:
          "Combine JPG and PNG images into a single PDF. Choose A4 or Letter, fit images, download instantly.",
        ogTitle: "Image to PDF | Resize Image",
        ogDescription: "Turn images into a clean PDF in your browser.",
        eyebrow: "PDF",
        titleText: "Image → PDF",
        intro: "Drop images, pick a page size, and get a single PDF. JPG and PNG supported.",
        dropTitleEmpty: "Drop images to combine",
        dropTitleFilled: "Add more images",
        hint: "JPG, PNG, WebP or AVIF",
        pageSize: "Page size",
        orientation: "Orientation",
        orientationOptions: {
          portrait: "Portrait",
          landscape: "Landscape",
        },
        margin: "Margin",
        marginOptions: {
          none: "None",
          small: "Small",
          medium: "Medium",
        },
        buildButton: "Build PDF",
      },
      pdfToImage: {
        title: "PDF to Image — Export PDF pages as PNG | Resize Image",
        description:
          "Convert each page of a PDF to a high-resolution PNG. Browser-based, no upload required.",
        ogTitle: "PDF to Image | Resize Image",
        ogDescription: "Export PDF pages as PNG instantly.",
        eyebrow: "PDF",
        titleText: "PDF → Image",
        intro: "Render every page as a PNG. Choose a scale for higher resolution.",
        dropTitle: "Drop a PDF to export as images",
        scaleLabel: "Scale:",
        format: "Format",
        jpgQuality: "JPG quality",
        pageAlt: "Page",
        newButton: "New",
        renderButton: "Render pages",
        saveButton: "Save",
      },
      compressImage: {
        title: "Compress Image — JPG, PNG, WebP, AVIF | Resize Image",
        description:
          "Compress JPG, PNG, WebP and AVIF images in your browser. Adjust quality with live preview and download instantly.",
        ogTitle: "Compress Image | Resize Image",
        ogDescription: "Reduce image size without losing quality.",
        eyebrow: "Image",
        titleText: "Compress images",
        intro: "Slide to find the sweet spot between size and quality. Everything happens locally.",
        dropTitle: "Drop an image to compress",
        original: "Original",
        compressed: "Compressed",
        loadingPreview: "Loading preview...",
        readingDimensions: "Reading dimensions",
        waitingOutput: "Waiting for output",
        sizeChange: "Size change",
        output: "Output",
        readyToDownload: "ready to download",
        smaller: "smaller",
        larger: "larger",
        format: "Format",
        quality: "Quality",
        qualityPresets: {
          high: "High",
          balanced: "Balanced",
          smallest: "Smallest",
        },
        newButton: "New",
        downloadButton: "Download",
        lowerQualityHint: "Lower quality usually means a smaller file, especially for photos.",
        pngHint:
          "PNG is lossless here and can make files larger. For smaller downloads, choose JPG, WebP, or AVIF.",
      },
      notFound: {
        title: "Page not found",
        description: "The page you're looking for doesn't exist.",
        button: "Go home",
      },
    },
  },
  "pt-BR": {
    header: {
      resizeImage: "Redimensionar Imagem",
      compress: "Comprimir",
      convert: "Converter",
      imageToPdf: "Imagem → PDF",
      pdfToImage: "PDF → Imagem",
      pricing: "Planos",
      language: "Idioma",
      getPro: "Assine Pro",
    },
    footer: {
      brand: "Redimensionar Imagem",
      blurb:
        "Ferramentas de imagem e PDF no navegador. Privado por design — os arquivos não saem do seu dispositivo.",
      image: "Imagem",
      pdf: "PDF",
      company: "Empresa",
      resizeImage: "Redimensionar Imagem",
      compressImage: "Comprimir Imagem",
      convertFormat: "Converter Formato",
      imageToPdf: "Imagem para PDF",
      pdfToImage: "PDF para Imagem",
      pricing: "Planos",
      about: "Sobre",
      copyright: "Todos os direitos reservados.",
    },
    home: {
      badge: "100% no navegador",
      titlePrefix: "Redimensione, comprima e",
      titleAccent: "converta",
      titleSuffix: "em segundos.",
      description:
        "Cinco ferramentas focadas para imagens e PDFs. Sem uploads, sem conta — tudo é processado localmente no navegador.",
      startResizing: "Comprimir agora",
      browseAllTools: "Ver todas as ferramentas",
      tools: "Ferramentas",
      uploads: "Uploads",
      filesPerDay: "Arquivos / dia*",
      featurePrivateTitle: "Privado por design",
      featurePrivateDesc: "Os arquivos nunca saem do seu dispositivo. Tudo roda no navegador.",
      featureInstantTitle: "Resultado instantâneo",
      featureInstantDesc: "Sem ida ao servidor. Redimensione e baixe em segundos.",
      featureAnyFormatTitle: "Qualquer formato",
      featureAnyFormatDesc: "JPG, PNG, WebP e PDF. Converta e compacte com um clique.",
      ctaTitle: "Grátis até 250 MB",
      ctaDesc: "Planos premium vêm depois. Por enquanto, aproveite arquivos grátis até 250 MB.",
      viewPricing: "Ver preços",
      seoBoost: {
        eyebrow: "Por que as pessoas usam",
        title:
          "Uma ferramenta rápida no navegador para redimensionar, comprimir, converter e criar PDFs",
        intro:
          "O Resize Image ajuda você a redimensionar fotos em dimensões exatas, comprimir imagens para reduzir o tamanho do arquivo, converter entre JPG, PNG, WebP e AVIF, criar PDFs a partir de imagens e exportar páginas de PDF como imagens. Tudo roda localmente no navegador, sem upload e sem instalar nada.",
        cards: [
          {
            title: "Redimensionador grátis de imagens",
            desc: "Redimensione JPG, PNG, WebP e AVIF para tamanhos exatos em posts, páginas de produto, thumbnails e banners.",
          },
          {
            title: "Compressor de imagens",
            desc: "Comprima imagens localmente no navegador para reduzir o tamanho do arquivo com controle de qualidade.",
          },
          {
            title: "Conversor de imagens e PDF",
            desc: "Converta formatos de imagem, transforme imagens em PDF e exporte páginas de PDF como PNG sem enviar arquivos.",
          },
        ],
        howItWorksTitle: "Como funciona",
        howItWorksSteps: [
          "Solte um arquivo na ferramenta que você precisa.",
          "Escolha as opções de redimensionar, comprimir, converter ou saída em PDF.",
          "Baixe o resultado na hora, sem atraso de upload.",
        ],
        searchesTitle: "Buscas comuns que ajudamos",
        searches: [
          "image resizer",
          "image compressor",
          "JPG to PNG converter",
          "image to PDF converter",
          "PDF to image converter",
        ],
        faqTitle: "FAQ",
        faqs: [
          {
            q: "Posso redimensionar imagens sem enviá-las?",
            a: "Sim. O Resize Image funciona diretamente no navegador, então os arquivos ficam no seu dispositivo enquanto você redimensiona, comprime ou converte.",
          },
          {
            q: "Quais tipos de arquivo vocês suportam?",
            a: "O app suporta JPG, PNG, WebP, AVIF e fluxos de PDF, dependendo da ferramenta escolhida.",
          },
          {
            q: "Isso é bom para SEO e downloads rápidos?",
            a: "Sim. As ferramentas são rápidas, privadas e pensadas para buscas comuns como image resizer, image compressor, JPG to PNG converter, image to PDF e PDF to image.",
          },
        ],
      },
    },
    toolsGrid: {
      toolset: "Kit",
      title: "Tudo o que você precisa",
      desc: "Cinco ferramentas focadas em vez de um editor pesado. Escolha e resolva.",
      resizeImage: {
        title: "Redimensionar Imagem",
        desc: "JPG, PNG, WebP, AVIF — dimensões exatas ou predefinições como 1080×1080.",
      },
      compressImage: {
        title: "Comprimir Imagem",
        desc: "Reduza o tamanho com qualidade ajustável. Visualização lado a lado.",
      },
      convertFormat: {
        title: "Converter Formato",
        desc: "Troque entre JPG, PNG, WebP e AVIF com um clique.",
      },
      imageToPdf: {
        title: "Imagem → PDF",
        desc: "Junte imagens em um único PDF. Escolha A4 ou Letter.",
      },
      pdfToImage: {
        title: "PDF → Imagem",
        desc: "Exporte cada página de um PDF como imagem em alta resolução.",
      },
      open: "Abrir",
    },
    resizeTool: {
      dropTitle: "Solte uma imagem para redimensionar",
      dropHint: "JPG, PNG, WebP ou AVIF — até 250 MB",
      dimensions: "Dimensões",
      lockRatio: "Travar proporção",
      unlockRatio: "Destravar proporção",
      lockHelp: "Travar a proporção mantém a imagem proporcional ao alterar W ou H.",
      fit: "Ajuste",
      format: "Formato",
      quality: "Qualidade",
      presets: "Predefinições",
      remove: "Remover",
      preview: "Prévia",
      updating: "Atualizando",
      background: "Fundo",
      backgroundHint: "Contain / JPG",
      backgroundColor: "Cor de fundo",
      backgroundHexColor: "Cor de fundo em HEX",
      fitOptions: {
        contain: "Conter",
        cover: "Cobrir",
        stretch: "Esticar",
      },
      presetLabels: {
        socialSquare: "Quadrado social",
        storyReel: "Story / Reel",
        youtubeThumb: "Thumb do YouTube",
        fullHd: "Full HD",
        wideBanner: "Banner largo",
        profile: "Perfil",
      },
      new: "Novo",
      download: "Baixar",
      original: "Original",
      compressed: "Comprimido",
      loadingPreview: "Carregando prévia...",
      readingDimensions: "Lendo dimensões",
      waitingOutput: "Aguardando resultado",
      sizeChange: "Mudança de tamanho",
      output: "Saída",
      readyToDownload: "pronto para baixar",
      smaller: "menor que o original",
      larger: "maior que o original",
      lowerQualityHint:
        "Qualidade menor normalmente gera arquivos menores, especialmente em fotos.",
      pngHint:
        "PNG não usa compressão por qualidade aqui. Se quiser um arquivo menor, tente JPG ou WebP.",
    },
    routes: {
      about: {
        title: "Sobre — Resize Image",
        description:
          "O Resize Image cria ferramentas rápidas e privadas para imagens e PDF, direto no navegador. Sem upload, sem rastreamento.",
        ogTitle: "Sobre | Resize Image",
        ogDescription: "Por que criamos o Resize Image.",
        eyebrow: "Sobre",
        titleText: "Ferramentas que respeitam seus arquivos.",
        intro:
          "A maioria dos redimensionadores online envia seus arquivos para um servidor que você não conhece. O Resize Image não faz isso. Cada operação roda localmente no navegador usando APIs modernas da web — Canvas, WebAssembly e pdf-lib. Nada sai do seu dispositivo.",
        insideTitle: "O que há dentro",
        insideDesc:
          "O Resize Image virou um kit focado em imagens e PDFs. Sem excesso, sem editor, sem cadastro.",
        roadmapTitle: "Roadmap",
        roadmapItems: [
          "Apps mobile para iOS e Android",
          "Processamento em lote para usuários Pro",
          "Mesclar e dividir PDF",
          "OCR para documentos digitalizados",
        ],
      },
      pricing: {
        title: "Planos — grátis primeiro, premium depois | Resize Image",
        description:
          "O Resize Image é grátis para sempre com arquivos até 250 MB. Os planos premium chegam depois.",
        ogTitle: "Planos | Resize Image",
        ogDescription: "Planos simples. Cancele quando quiser.",
        eyebrow: "Planos",
        titleText: "Grátis para usar. Premium depois.",
        intro: "Preço honesto. Sem rastreamento. Arquivos grátis até 250 MB.",
        popular: "Mais popular",
        free: {
          name: "Grátis",
          cadence: "para sempre",
          features: [
            "Todas as ferramentas de imagem e PDF",
            "Arquivos até 250 MB",
            "10 arquivos por dia",
            "Com anúncios",
          ],
          cta: "Começar grátis",
        },
        pro: {
          name: "Pro",
          cadence: "por mês",
          features: [
            "Tudo do plano Grátis",
            "Arquivos até 250 MB",
            "Arquivos diários ilimitados",
            "Processamento em lote",
            "Sem anúncios",
            "Fila prioritária",
          ],
          cta: "Fazer upgrade para Pro",
        },
        lifetime: {
          name: "Lifetime",
          cadence: "pagamento único",
          features: [
            "Todos os recursos Pro",
            "Para sempre — sem assinatura",
            "Ferramentas futuras incluídas",
          ],
          cta: "Comprar lifetime",
        },
      },
      convertImage: {
        title: "Converter Imagem — JPG ⇄ PNG ⇄ WebP ⇄ AVIF | Resize Image",
        description:
          "Converta imagens entre JPG, PNG, WebP e AVIF no navegador. Sem upload, sem cadastro, download instantâneo.",
        ogTitle: "Converter Imagem | Resize Image",
        ogDescription: "Troque o formato da imagem com um clique.",
        eyebrow: "Imagem",
        titleText: "Converter formato da imagem",
        intro: "Alterne entre JPG, PNG, WebP e AVIF sem sair do navegador.",
        dropTitle: "Solte uma imagem para converter",
        convertTo: "Converter para",
        outputLabel: "Saída:",
        outputAs: "como",
        quality: "Qualidade",
        outputQuality: "Qualidade da saída",
        qualityHint: "Aplica-se a JPG, WebP e AVIF. PNG mantém saída sem perdas.",
        newButton: "Novo",
        convertButton: "Converter e baixar",
      },
      imageToPdf: {
        title: "Imagem para PDF — Converter JPG/PNG em PDF | Resize Image",
        description:
          "Combine imagens JPG e PNG em um único PDF. Escolha A4 ou Letter, ajuste as imagens e baixe na hora.",
        ogTitle: "Imagem para PDF | Resize Image",
        ogDescription: "Transforme imagens em um PDF limpo no navegador.",
        eyebrow: "PDF",
        titleText: "Imagem → PDF",
        intro:
          "Envie imagens, escolha o tamanho da página e gere um PDF único. Compatível com JPG e PNG.",
        dropTitleEmpty: "Solte imagens para combinar",
        dropTitleFilled: "Adicionar mais imagens",
        hint: "JPG, PNG, WebP ou AVIF",
        pageSize: "Tamanho da página",
        orientation: "Orientação",
        orientationOptions: {
          portrait: "Retrato",
          landscape: "Paisagem",
        },
        margin: "Margem",
        marginOptions: {
          none: "Nenhuma",
          small: "Pequena",
          medium: "Média",
        },
        buildButton: "Gerar PDF",
      },
      pdfToImage: {
        title: "PDF para Imagem — Exportar páginas do PDF como PNG | Resize Image",
        description:
          "Converta cada página de um PDF em PNG em alta resolução. Tudo no navegador, sem upload.",
        ogTitle: "PDF para Imagem | Resize Image",
        ogDescription: "Exporte páginas de PDF como PNG instantaneamente.",
        eyebrow: "PDF",
        titleText: "PDF → Imagem",
        intro: "Renderize cada página como PNG. Escolha a escala para maior resolução.",
        dropTitle: "Solte um PDF para exportar como imagens",
        scaleLabel: "Escala:",
        format: "Formato",
        jpgQuality: "Qualidade JPG",
        pageAlt: "Página",
        newButton: "Novo",
        renderButton: "Renderizar páginas",
        saveButton: "Salvar",
      },
      compressImage: {
        title: "Comprimir Imagem — JPG, PNG, WebP, AVIF | Resize Image",
        description:
          "Comprima imagens JPG, PNG, WebP e AVIF no navegador. Ajuste a qualidade com prévia ao vivo e baixe na hora.",
        ogTitle: "Comprimir Imagem | Resize Image",
        ogDescription: "Reduza o tamanho da imagem sem perder qualidade.",
        eyebrow: "Imagem",
        titleText: "Comprimir imagens",
        intro:
          "Deslize para encontrar o equilíbrio ideal entre tamanho e qualidade. Tudo acontece localmente.",
        dropTitle: "Solte uma imagem para comprimir",
        original: "Original",
        compressed: "Comprimido",
        loadingPreview: "Carregando prévia...",
        readingDimensions: "Lendo dimensões",
        waitingOutput: "Aguardando resultado",
        sizeChange: "Mudança de tamanho",
        output: "Saída",
        readyToDownload: "pronto para baixar",
        smaller: "menor",
        larger: "maior",
        format: "Formato",
        quality: "Qualidade",
        qualityPresets: {
          high: "Alta",
          balanced: "Equilibrada",
          smallest: "Menor",
        },
        newButton: "Novo",
        downloadButton: "Baixar",
        lowerQualityHint:
          "Qualidade menor normalmente gera arquivos menores, especialmente em fotos.",
        pngHint:
          "PNG não usa compressão por qualidade aqui. Se quiser um arquivo menor, tente JPG ou WebP.",
      },
      notFound: {
        title: "Página não encontrada",
        description: "A página que você está procurando não existe.",
        button: "Ir para a home",
      },
    },
  },
  "fil-PH": {
    header: {
      resizeImage: "Resize Image",
      compress: "I-compress",
      convert: "I-convert",
      imageToPdf: "Larawan → PDF",
      pdfToImage: "PDF → Larawan",
      pricing: "Presyo",
      language: "Wika",
      getPro: "Kunin ang Pro",
    },
    footer: {
      brand: "Resize Image",
      blurb:
        "Mga tool para sa image at PDF na gumagana sa browser. Private by design — hindi umaalis sa device mo ang files.",
      image: "Larawan",
      pdf: "PDF",
      company: "Kumpanya",
      resizeImage: "Resize Image",
      compressImage: "I-compress ang Larawan",
      convertFormat: "I-convert ang Format",
      imageToPdf: "Larawan to PDF",
      pdfToImage: "PDF to Larawan",
      pricing: "Presyo",
      about: "Tungkol",
      copyright: "Lahat ng karapatan ay nakalaan.",
    },
    home: {
      badge: "100% browser-based",
      titlePrefix: "I-resize, i-compress at",
      titleAccent: "i-convert",
      titleSuffix: "nang mabilis.",
      description:
        "Limang nakatutok na tools para sa images at PDFs. Walang uploads, walang account — processed locally sa browser.",
      startResizing: "Mag-compress ngayon",
      browseAllTools: "Tingnan lahat ng tools",
      tools: "Tools",
      uploads: "Uploads",
      filesPerDay: "Files / araw*",
      featurePrivateTitle: "Private by design",
      featurePrivateDesc: "Hindi umaalis sa device mo ang files. Lahat ay tumatakbo sa browser.",
      featureInstantTitle: "Mabilis na resulta",
      featureInstantDesc: "Walang balik-server. I-resize at i-download agad.",
      featureAnyFormatTitle: "Kahit anong format",
      featureAnyFormatDesc: "JPG, PNG, WebP at PDF. Convert at compress sa isang click.",
      ctaTitle: "Libre hanggang 250 MB",
      ctaDesc: "Darating pa ang premium plans. Sa ngayon, libre ang files hanggang 250 MB.",
      viewPricing: "Tingnan ang presyo",
      seoBoost: {
        eyebrow: "Bakit ito ginagamit",
        title:
          "Mabilis na browser-based na tool para mag-resize, mag-compress, mag-convert, at gumawa ng PDF",
        intro:
          "Tinutulungan ka ng Resize Image na i-resize ang photos sa eksaktong dimensions, i-compress ang images para lumiit ang file size, mag-convert sa JPG, PNG, WebP, at AVIF, gumawa ng PDF mula sa images, at mag-export ng PDF pages bilang images. Lahat ay tumatakbo locally sa browser, kaya walang upload at walang kailangang i-install na extra software.",
        cards: [
          {
            title: "Libreng image resizer",
            desc: "I-resize ang JPG, PNG, WebP, at AVIF para sa social posts, product pages, thumbnails, at banners.",
          },
          {
            title: "Image compressor",
            desc: "I-compress ang images sa browser para bumaba ang file size habang kontrolado ang quality.",
          },
          {
            title: "Image at PDF converter",
            desc: "Mag-convert ng image formats, gawing PDF ang images, at mag-export ng PDF pages bilang PNG nang walang upload.",
          },
        ],
        howItWorksTitle: "Paano ito gumagana",
        howItWorksSteps: [
          "I-drop ang file sa tool na kailangan mo.",
          "Piliin ang resize, compress, convert, o PDF output settings.",
          "I-download agad ang result nang walang upload delay.",
        ],
        searchesTitle: "Karaniwang hinahanap namin tinutulungan",
        searches: [
          "image resizer",
          "image compressor",
          "JPG to PNG converter",
          "image to PDF converter",
          "PDF to image converter",
        ],
        faqTitle: "FAQ",
        faqs: [
          {
            q: "Pwede ba akong mag-resize ng image nang walang upload?",
            a: "Oo. Gumagana ang Resize Image diretso sa browser, kaya nasa device mo lang ang files habang nagre-resize, nagco-compress, o nagco-convert ka.",
          },
          {
            q: "Anong file types ang supported?",
            a: "Sinusuportahan ng app ang JPG, PNG, WebP, AVIF, at mga PDF workflow depende sa tool na pipiliin mo.",
          },
          {
            q: "Okay ba ito para sa SEO at mabilis na download?",
            a: "Oo. Mabilis, private, at ginawa para sa mga common search tulad ng image resizer, image compressor, JPG to PNG converter, image to PDF, at PDF to image.",
          },
        ],
      },
    },
    toolsGrid: {
      toolset: "Toolset",
      title: "Lahat ng kailangan mo",
      desc: "Limang nakatutok na tools kaysa isang sobrang editor. Pumili at tapos agad.",
      resizeImage: {
        title: "Resize Image",
        desc: "JPG, PNG, WebP, AVIF — eksaktong sukat o presets tulad ng 1080×1080.",
      },
      compressImage: {
        title: "I-compress ang Larawan",
        desc: "Bawasan ang file size gamit ang adjustable quality. Side-by-side preview.",
      },
      convertFormat: {
        title: "I-convert ang Format",
        desc: "Palit sa JPG, PNG, WebP at AVIF sa isang click.",
      },
      imageToPdf: {
        title: "Larawan → PDF",
        desc: "Pagsamahin ang images sa iisang PDF. Pumili ng A4 o Letter.",
      },
      pdfToImage: {
        title: "PDF → Larawan",
        desc: "I-export ang bawat page ng PDF bilang high-resolution na image.",
      },
      open: "Buksan",
    },
    resizeTool: {
      dropTitle: "I-drop ang image para i-resize",
      dropHint: "JPG, PNG, WebP o AVIF — hanggang 250 MB",
      dimensions: "Sukat",
      lockRatio: "I-lock ang Ratio",
      unlockRatio: "I-unlock ang Ratio",
      lockHelp: "Pinananatili ng lock ratio ang proporsyon kapag binago mo ang W o H.",
      fit: "Fit",
      format: "Format",
      quality: "Kalidad",
      presets: "Mga preset",
      remove: "Alisin",
      preview: "Preview",
      updating: "Ina-update",
      background: "Background",
      backgroundHint: "Contain / JPG",
      backgroundColor: "Kulay ng background",
      backgroundHexColor: "HEX na kulay ng background",
      fitOptions: {
        contain: "Contain",
        cover: "Cover",
        stretch: "Stretch",
      },
      presetLabels: {
        socialSquare: "Social square",
        storyReel: "Story / Reel",
        youtubeThumb: "YouTube thumb",
        fullHd: "Full HD",
        wideBanner: "Wide banner",
        profile: "Profile",
      },
      new: "Bago",
      download: "I-download",
      original: "Orihinal",
      compressed: "Na-compress",
      loadingPreview: "Naglo-load ng preview...",
      readingDimensions: "Binabasa ang sukat",
      waitingOutput: "Naghihintay ng output",
      sizeChange: "Pagbabago ng laki",
      output: "Output",
      readyToDownload: "handa nang i-download",
      smaller: "mas maliit kaysa orihinal",
      larger: "mas malaki kaysa orihinal",
      lowerQualityHint:
        "Mas mababang quality ay kadalasang mas maliit ang file, lalo na sa photos.",
      pngHint:
        "Hindi gumagamit ng quality compression ang PNG dito. Kung gusto mo ng mas maliit na file, subukan ang JPG o WebP.",
    },
    routes: {
      about: {
        title: "Tungkol — Resize Image",
        description:
          "Gumagawa ang Resize Image ng mabilis at private na browser-based na tools para sa image at PDF. Walang upload, walang tracking.",
        ogTitle: "Tungkol | Resize Image",
        ogDescription: "Bakit namin binuo ang Resize Image.",
        eyebrow: "Tungkol",
        titleText: "Mga tool na nirerespeto ang files mo.",
        intro:
          "Kadalasan, ang mga online resizer ay nagpapadala ng files mo sa server na hindi mo kilala. Hindi ganoon ang Resize Image. Lahat ng operation ay tumatakbo locally sa browser gamit ang modern Web APIs — Canvas, WebAssembly, at pdf-lib. Walang lumalabas sa device mo.",
        insideTitle: "Ano ang nasa loob",
        insideDesc:
          "Ang Resize Image ay naging focused toolkit para sa images at PDFs. Walang kalat, walang editor, walang signup.",
        roadmapTitle: "Roadmap",
        roadmapItems: [
          "Mobile apps para sa iOS at Android",
          "Batch processing para sa Pro users",
          "Merge at split PDF",
          "OCR para sa scanned documents",
        ],
      },
      pricing: {
        title: "Presyo — libre muna, premium later | Resize Image",
        description:
          "Libre ang Resize Image habambuhay para sa files hanggang 250 MB. Darating ang premium plans later.",
        ogTitle: "Presyo | Resize Image",
        ogDescription: "Simple plans. Puwedeng mag-cancel anumang oras.",
        eyebrow: "Presyo",
        titleText: "Libre gamitin. Premium later.",
        intro: "Honest pricing. Walang tracking. Free files hanggang 250 MB.",
        popular: "Pinakasikat",
        free: {
          name: "Libre",
          cadence: "habambuhay",
          features: [
            "Lahat ng image at PDF tools",
            "Files hanggang 250 MB",
            "10 files bawat araw",
            "May ads",
          ],
          cta: "Magsimula nang libre",
        },
        pro: {
          name: "Pro",
          cadence: "buwan-buwan",
          features: [
            "Lahat ng nasa Libre",
            "Files hanggang 250 MB",
            "Unlimited daily files",
            "Batch processing",
            "Walang ads",
            "Priority queue",
          ],
          cta: "Mag-upgrade sa Pro",
        },
        lifetime: {
          name: "Lifetime",
          cadence: "isang bayad",
          features: [
            "Lahat ng Pro features",
            "Habambuhay — walang subscription",
            "Kasama ang future tools",
          ],
          cta: "Bumili ng lifetime",
        },
      },
      convertImage: {
        title: "I-convert ang Image — JPG ⇄ PNG ⇄ WebP ⇄ AVIF | Resize Image",
        description:
          "Mag-convert ng images sa pagitan ng JPG, PNG, WebP, at AVIF sa browser. Walang upload, walang signup, instant download.",
        ogTitle: "I-convert ang Image | Resize Image",
        ogDescription: "Palit ng image format sa isang click.",
        eyebrow: "Image",
        titleText: "I-convert ang image format",
        intro: "Lumipat sa JPG, PNG, WebP, at AVIF nang hindi umaalis sa browser.",
        dropTitle: "I-drop ang image para i-convert",
        convertTo: "I-convert sa",
        outputLabel: "Output:",
        outputAs: "bilang",
        quality: "Quality",
        outputQuality: "Output quality",
        qualityHint: "Nalalapat sa JPG, WebP, at AVIF output. Lossless ang PNG output.",
        newButton: "Bago",
        convertButton: "I-convert at i-download",
      },
      imageToPdf: {
        title: "Image to PDF — JPG/PNG papuntang PDF | Resize Image",
        description:
          "Pagsamahin ang JPG at PNG images sa isang PDF. Pumili ng A4 o Letter, i-fit ang images, at mag-download agad.",
        ogTitle: "Image to PDF | Resize Image",
        ogDescription: "Gawing malinis na PDF ang images sa browser.",
        eyebrow: "PDF",
        titleText: "Image → PDF",
        intro:
          "Mag-drop ng images, pumili ng page size, at gumawa ng isang PDF. Suportado ang JPG at PNG.",
        dropTitleEmpty: "I-drop ang images para pagsamahin",
        dropTitleFilled: "Magdagdag pa ng images",
        hint: "JPG, PNG, WebP o AVIF",
        pageSize: "Laki ng page",
        orientation: "Orientation",
        orientationOptions: {
          portrait: "Portrait",
          landscape: "Landscape",
        },
        margin: "Margin",
        marginOptions: {
          none: "Wala",
          small: "Maliit",
          medium: "Katamtaman",
        },
        buildButton: "Bumuo ng PDF",
      },
      pdfToImage: {
        title: "PDF to Image — I-export ang PDF pages bilang PNG | Resize Image",
        description:
          "I-convert ang bawat page ng PDF sa high-resolution PNG. Browser-based, walang upload na kailangan.",
        ogTitle: "PDF to Image | Resize Image",
        ogDescription: "I-export ang PDF pages bilang PNG agad.",
        eyebrow: "PDF",
        titleText: "PDF → Image",
        intro:
          "I-render ang bawat page bilang PNG. Pumili ng scale para sa mas mataas na resolution.",
        dropTitle: "I-drop ang PDF para i-export bilang images",
        scaleLabel: "Scale:",
        format: "Format",
        jpgQuality: "JPG quality",
        pageAlt: "Page",
        newButton: "Bago",
        renderButton: "I-render ang pages",
        saveButton: "I-save",
      },
      compressImage: {
        title: "I-compress ang Image — JPG, PNG, WebP, AVIF | Resize Image",
        description:
          "I-compress ang JPG, PNG, WebP, at AVIF images sa browser. Ayusin ang quality gamit ang live preview at mag-download agad.",
        ogTitle: "I-compress ang Image | Resize Image",
        ogDescription: "Bawasan ang laki ng image nang hindi nawawala ang quality.",
        eyebrow: "Image",
        titleText: "I-compress ang mga image",
        intro:
          "I-slide para mahanap ang tamang balance ng laki at quality. Lahat ay nangyayari locally.",
        dropTitle: "I-drop ang image para i-compress",
        original: "Orihinal",
        compressed: "Na-compress",
        loadingPreview: "Naglo-load ng preview...",
        readingDimensions: "Binabasa ang dimensions",
        waitingOutput: "Naghihintay ng output",
        sizeChange: "Pagbabago ng laki",
        output: "Output",
        readyToDownload: "handa nang i-download",
        smaller: "mas maliit",
        larger: "mas malaki",
        format: "Format",
        quality: "Quality",
        qualityPresets: {
          high: "High",
          balanced: "Balanced",
          smallest: "Pinakamaliit",
        },
        newButton: "Bago",
        downloadButton: "I-download",
        lowerQualityHint:
          "Mas mababang quality ay karaniwang mas maliit ang file, lalo na sa photos.",
        pngHint:
          "Hindi gumagamit ng quality compression ang PNG dito. Kung gusto mo ng mas maliit na file, subukan ang JPG o WebP.",
      },
      notFound: {
        title: "Hindi nahanap ang page",
        description: "Hindi umiiral ang page na hinahanap mo.",
        button: "Umuwi",
      },
    },
  },
  "id-ID": {
    header: {
      resizeImage: "Resize Image",
      compress: "Kompres",
      convert: "Konversi",
      imageToPdf: "Gambar → PDF",
      pdfToImage: "PDF → Gambar",
      pricing: "Harga",
      language: "Bahasa",
      getPro: "Dapatkan Pro",
    },
    footer: {
      brand: "Resize Image",
      blurb:
        "Alat gambar & PDF berbasis browser. Private by design — file tidak pernah meninggalkan perangkat Anda.",
      image: "Gambar",
      pdf: "PDF",
      company: "Perusahaan",
      resizeImage: "Resize Image",
      compressImage: "Kompres Gambar",
      convertFormat: "Ubah Format",
      imageToPdf: "Gambar ke PDF",
      pdfToImage: "PDF ke Gambar",
      pricing: "Harga",
      about: "Tentang",
      copyright: "Hak cipta dilindungi.",
    },
    home: {
      badge: "100% berbasis browser",
      titlePrefix: "Resize, kompres &",
      titleAccent: "konversi",
      titleSuffix: "dalam hitungan detik.",
      description:
        "Lima alat fokus untuk gambar dan PDF. Tanpa upload, tanpa akun — file diproses lokal di browser.",
      startResizing: "Kompres sekarang",
      browseAllTools: "Lihat semua alat",
      tools: "Alat",
      uploads: "Upload",
      filesPerDay: "File / hari*",
      featurePrivateTitle: "Private by design",
      featurePrivateDesc:
        "File tidak pernah meninggalkan perangkat Anda. Semua berjalan di browser.",
      featureInstantTitle: "Hasil instan",
      featureInstantDesc: "Tanpa bolak-balik ke server. Resize dan download dalam milidetik.",
      featureAnyFormatTitle: "Semua format",
      featureAnyFormatDesc: "JPG, PNG, WebP, dan PDF. Konversi dan kompres dalam satu klik.",
      ctaTitle: "Gratis sampai 250 MB",
      ctaDesc:
        "Rencana premium akan hadir nanti. Untuk sekarang, nikmati file gratis hingga 250 MB.",
      viewPricing: "Lihat harga",
      seoBoost: {
        eyebrow: "Mengapa orang memakainya",
        title: "Tool berbasis browser yang cepat untuk resize, kompres, konversi, dan PDF",
        intro:
          "Resize Image membantu Anda resize foto ke dimensi tepat, kompres gambar agar ukuran file lebih kecil, konversi antara JPG, PNG, WebP, dan AVIF, membuat PDF dari gambar, dan mengekspor halaman PDF sebagai gambar. Semuanya berjalan lokal di browser, jadi tanpa upload dan tanpa perlu install software tambahan.",
        cards: [
          {
            title: "Image resizer gratis",
            desc: "Resize JPG, PNG, WebP, dan AVIF ke ukuran tepat untuk posting, halaman produk, thumbnail, dan banner.",
          },
          {
            title: "Image compressor",
            desc: "Kompres gambar langsung di browser untuk menurunkan ukuran file sambil menjaga kualitas.",
          },
          {
            title: "Konverter image dan PDF",
            desc: "Konversi format gambar, ubah gambar menjadi PDF, dan ekspor halaman PDF sebagai PNG tanpa upload.",
          },
        ],
        howItWorksTitle: "Cara kerjanya",
        howItWorksSteps: [
          "Tarik file ke tool yang Anda butuhkan.",
          "Pilih pengaturan resize, kompres, konversi, atau output PDF.",
          "Unduh hasilnya langsung tanpa delay upload.",
        ],
        searchesTitle: "Pencarian umum yang kami bantu",
        searches: [
          "image resizer",
          "image compressor",
          "JPG to PNG converter",
          "image to PDF converter",
          "PDF to image converter",
        ],
        faqTitle: "FAQ",
        faqs: [
          {
            q: "Apakah saya bisa resize image tanpa upload?",
            a: "Ya. Resize Image berjalan langsung di browser, jadi file tetap ada di perangkat Anda saat resize, kompres, atau konversi.",
          },
          {
            q: "Format file apa yang didukung?",
            a: "Aplikasi mendukung JPG, PNG, WebP, AVIF, dan alur PDF tergantung tool yang Anda pilih.",
          },
          {
            q: "Apakah ini bagus untuk SEO dan download cepat?",
            a: "Ya. Tool-nya cepat, privat, dan dibuat untuk pencarian umum seperti image resizer, image compressor, JPG to PNG converter, image to PDF, dan PDF to image.",
          },
        ],
      },
    },
    toolsGrid: {
      toolset: "Toolset",
      title: "Semua alat yang Anda butuhkan",
      desc: "Lima alat fokus, bukan editor yang berat. Pilih pekerjaan, bereskan.",
      resizeImage: {
        title: "Resize Image",
        desc: "JPG, PNG, WebP, AVIF — ukuran tepat atau preset seperti 1080×1080.",
      },
      compressImage: {
        title: "Kompres Gambar",
        desc: "Kecilkan ukuran file dengan quality yang bisa diatur. Preview berdampingan.",
      },
      convertFormat: {
        title: "Ubah Format",
        desc: "Pindah antara JPG, PNG, WebP, dan AVIF dalam satu klik.",
      },
      imageToPdf: {
        title: "Gambar → PDF",
        desc: "Gabungkan gambar menjadi satu PDF. Pilih A4 atau Letter.",
      },
      pdfToImage: {
        title: "PDF → Gambar",
        desc: "Ekspor setiap halaman PDF sebagai gambar resolusi tinggi.",
      },
      open: "Buka",
    },
    resizeTool: {
      dropTitle: "Tarik gambar untuk di-resize",
      dropHint: "JPG, PNG, WebP, atau AVIF — hingga 250 MB",
      dimensions: "Dimensi",
      lockRatio: "Kunci Rasio",
      unlockRatio: "Buka Rasio",
      lockHelp: "Lock ratio menjaga proporsi gambar saat Anda mengubah W atau H.",
      fit: "Fit",
      format: "Format",
      quality: "Quality",
      presets: "Preset",
      remove: "Hapus",
      preview: "Preview",
      updating: "Memperbarui",
      background: "Latar belakang",
      backgroundHint: "Contain / JPG",
      backgroundColor: "Warna latar belakang",
      backgroundHexColor: "Warna HEX latar belakang",
      fitOptions: {
        contain: "Contain",
        cover: "Cover",
        stretch: "Stretch",
      },
      presetLabels: {
        socialSquare: "Social square",
        storyReel: "Story / Reel",
        youtubeThumb: "YouTube thumb",
        fullHd: "Full HD",
        wideBanner: "Wide banner",
        profile: "Profil",
      },
      new: "Baru",
      download: "Unduh",
      original: "Asli",
      compressed: "Terkompres",
      loadingPreview: "Memuat preview...",
      readingDimensions: "Membaca dimensi",
      waitingOutput: "Menunggu output",
      sizeChange: "Perubahan ukuran",
      output: "Output",
      readyToDownload: "siap diunduh",
      smaller: "lebih kecil dari asli",
      larger: "lebih besar dari asli",
      lowerQualityHint:
        "Quality yang lebih rendah biasanya menghasilkan file yang lebih kecil, terutama foto.",
      pngHint:
        "PNG tidak memakai compression quality di sini. Jika ingin file lebih kecil, coba JPG atau WebP.",
    },
    routes: {
      about: {
        title: "Tentang — Resize Image",
        description:
          "Resize Image membuat alat image dan PDF berbasis browser yang cepat dan privat. Tanpa upload, tanpa tracking.",
        ogTitle: "Tentang | Resize Image",
        ogDescription: "Kenapa kami membuat Resize Image.",
        eyebrow: "Tentang",
        titleText: "Alat yang menghormati file Anda.",
        intro:
          "Kebanyakan resizer online mengirim file Anda ke server yang tidak Anda kenal. Resize Image tidak. Semua operasi berjalan lokal di browser dengan Web APIs modern — Canvas, WebAssembly, dan pdf-lib. Tidak ada yang keluar dari perangkat Anda.",
        insideTitle: "Apa isinya",
        insideDesc:
          "Resize Image berkembang jadi toolkit fokus untuk gambar dan PDF. Tanpa bloat, tanpa editor, tanpa signup.",
        roadmapTitle: "Roadmap",
        roadmapItems: [
          "Aplikasi mobile untuk iOS dan Android",
          "Batch processing untuk pengguna Pro",
          "Gabung & pisah PDF",
          "OCR untuk dokumen hasil scan",
        ],
      },
      pricing: {
        title: "Harga — gratis dulu, premium nanti | Resize Image",
        description:
          "Resize Image gratis selamanya untuk file hingga 250 MB. Paket premium akan hadir nanti.",
        ogTitle: "Harga | Resize Image",
        ogDescription: "Paket sederhana. Bisa dibatalkan kapan saja.",
        eyebrow: "Harga",
        titleText: "Gratis dipakai. Premium nanti.",
        intro: "Harga jujur. Tanpa tracking. File gratis hingga 250 MB.",
        popular: "Paling populer",
        free: {
          name: "Gratis",
          cadence: "selamanya",
          features: [
            "Semua alat image & PDF",
            "File hingga 250 MB",
            "10 file per hari",
            "Didukung iklan",
          ],
          cta: "Mulai gratis",
        },
        pro: {
          name: "Pro",
          cadence: "per bulan",
          features: [
            "Semua yang ada di Gratis",
            "File hingga 250 MB",
            "File harian tanpa batas",
            "Batch processing",
            "Tanpa iklan",
            "Priority queue",
          ],
          cta: "Upgrade ke Pro",
        },
        lifetime: {
          name: "Lifetime",
          cadence: "sekali bayar",
          features: ["Semua fitur Pro", "Selamanya — tanpa langganan", "Termasuk tools masa depan"],
          cta: "Beli lifetime",
        },
      },
      convertImage: {
        title: "Konversi Gambar — JPG ⇄ PNG ⇄ WebP ⇄ AVIF | Resize Image",
        description:
          "Ubah gambar antara JPG, PNG, WebP, dan AVIF di browser. Tanpa upload, tanpa signup, download instan.",
        ogTitle: "Konversi Gambar | Resize Image",
        ogDescription: "Ganti format gambar dengan satu klik.",
        eyebrow: "Gambar",
        titleText: "Konversi format gambar",
        intro: "Pindah antara JPG, PNG, WebP, dan AVIF tanpa meninggalkan browser.",
        dropTitle: "Tarik gambar untuk dikonversi",
        convertTo: "Konversi ke",
        outputLabel: "Output:",
        outputAs: "sebagai",
        quality: "Quality",
        outputQuality: "Quality output",
        qualityHint: "Berlaku untuk output JPG, WebP, dan AVIF. PNG tetap lossless.",
        newButton: "Baru",
        convertButton: "Konversi & Unduh",
      },
      imageToPdf: {
        title: "Gambar ke PDF — Konversi JPG/PNG ke PDF | Resize Image",
        description:
          "Gabungkan gambar JPG dan PNG ke satu PDF. Pilih A4 atau Letter, fit gambar, dan unduh langsung.",
        ogTitle: "Gambar ke PDF | Resize Image",
        ogDescription: "Ubah gambar menjadi PDF yang rapi di browser.",
        eyebrow: "PDF",
        titleText: "Gambar → PDF",
        intro: "Tarik gambar, pilih ukuran halaman, dan buat satu PDF. Mendukung JPG dan PNG.",
        dropTitleEmpty: "Tarik gambar untuk digabung",
        dropTitleFilled: "Tambah gambar lagi",
        hint: "JPG, PNG, WebP atau AVIF",
        pageSize: "Ukuran halaman",
        orientation: "Orientasi",
        orientationOptions: {
          portrait: "Portrait",
          landscape: "Landscape",
        },
        margin: "Margin",
        marginOptions: {
          none: "Tanpa",
          small: "Kecil",
          medium: "Sedang",
        },
        buildButton: "Buat PDF",
      },
      pdfToImage: {
        title: "PDF ke Gambar — Ekspor halaman PDF sebagai PNG | Resize Image",
        description:
          "Ubah setiap halaman PDF menjadi PNG resolusi tinggi. Berbasis browser, tanpa upload.",
        ogTitle: "PDF ke Gambar | Resize Image",
        ogDescription: "Ekspor halaman PDF sebagai PNG seketika.",
        eyebrow: "PDF",
        titleText: "PDF → Image",
        intro: "Render setiap halaman sebagai PNG. Pilih scale untuk resolusi lebih tinggi.",
        dropTitle: "Tarik PDF untuk diekspor sebagai gambar",
        scaleLabel: "Scale:",
        format: "Format",
        jpgQuality: "Quality JPG",
        pageAlt: "Halaman",
        newButton: "Baru",
        renderButton: "Render pages",
        saveButton: "Simpan",
      },
      compressImage: {
        title: "Kompres Gambar — JPG, PNG, WebP, AVIF | Resize Image",
        description:
          "Kompres gambar JPG, PNG, WebP, dan AVIF di browser. Atur quality dengan live preview dan unduh langsung.",
        ogTitle: "Kompres Gambar | Resize Image",
        ogDescription: "Kurangi ukuran gambar tanpa kehilangan kualitas.",
        eyebrow: "Gambar",
        titleText: "Kompres gambar",
        intro:
          "Geser untuk menemukan titik terbaik antara ukuran dan kualitas. Semua proses berjalan lokal.",
        dropTitle: "Tarik gambar untuk dikompres",
        original: "Asli",
        compressed: "Terkompres",
        loadingPreview: "Memuat preview...",
        readingDimensions: "Membaca dimensi",
        waitingOutput: "Menunggu output",
        sizeChange: "Perubahan ukuran",
        output: "Output",
        readyToDownload: "siap diunduh",
        smaller: "lebih kecil",
        larger: "lebih besar",
        format: "Format",
        quality: "Quality",
        qualityPresets: {
          high: "Tinggi",
          balanced: "Seimbang",
          smallest: "Terkecil",
        },
        newButton: "Baru",
        downloadButton: "Unduh",
        lowerQualityHint:
          "Quality yang lebih rendah biasanya menghasilkan file yang lebih kecil, terutama foto.",
        pngHint:
          "PNG tidak memakai compression quality di sini. Jika ingin file lebih kecil, coba JPG atau WebP.",
      },
      notFound: {
        title: "Halaman tidak ditemukan",
        description: "Halaman yang Anda cari tidak ada.",
        button: "Kembali ke beranda",
      },
    },
  },
  "vi-VN": {
    header: {
      resizeImage: "Resize Image",
      compress: "Nén",
      convert: "Chuyển đổi",
      imageToPdf: "Ảnh → PDF",
      pdfToImage: "PDF → Ảnh",
      pricing: "Bảng giá",
      language: "Ngôn ngữ",
      getPro: "Nâng cấp Pro",
    },
    footer: {
      brand: "Resize Image",
      blurb:
        "Công cụ ảnh & PDF chạy ngay trên trình duyệt. Private by design — file không bao giờ rời thiết bị của bạn.",
      image: "Ảnh",
      pdf: "PDF",
      company: "Công ty",
      resizeImage: "Resize Image",
      compressImage: "Nén ảnh",
      convertFormat: "Chuyển đổi định dạng",
      imageToPdf: "Ảnh sang PDF",
      pdfToImage: "PDF sang Ảnh",
      pricing: "Bảng giá",
      about: "Giới thiệu",
      copyright: "Bản quyền thuộc về chúng tôi.",
    },
    home: {
      badge: "100% chạy trên trình duyệt",
      titlePrefix: "Resize, nén &",
      titleAccent: "chuyển đổi",
      titleSuffix: "trong vài giây.",
      description:
        "Năm công cụ tập trung cho ảnh và PDF. Không upload, không tài khoản — file được xử lý ngay trong trình duyệt.",
      startResizing: "Nén ảnh ngay",
      browseAllTools: "Khám phá công cụ",
      tools: "Công cụ",
      uploads: "Tải lên",
      filesPerDay: "File / ngày*",
      featurePrivateTitle: "Private by design",
      featurePrivateDesc:
        "File không bao giờ rời thiết bị của bạn. Mọi thứ chạy trong trình duyệt.",
      featureInstantTitle: "Kết quả tức thì",
      featureInstantDesc: "Không qua server. Resize và tải xuống trong vài mili giây.",
      featureAnyFormatTitle: "Mọi định dạng",
      featureAnyFormatDesc: "JPG, PNG, WebP và PDF. Chuyển đổi và nén bằng một cú nhấp.",
      ctaTitle: "Miễn phí tới 250 MB",
      ctaDesc: "Gói premium sẽ ra mắt sau. Hiện tại, bạn dùng miễn phí file tới 250 MB.",
      viewPricing: "Xem giá",
      seoBoost: {
        eyebrow: "Vì sao mọi người dùng",
        title: "Một công cụ trên trình duyệt để resize, nén, chuyển đổi và tạo PDF thật nhanh",
        intro:
          "Resize Image giúp bạn resize ảnh về kích thước chính xác, nén ảnh để giảm dung lượng, chuyển đổi giữa JPG, PNG, WebP và AVIF, tạo PDF từ ảnh, và xuất từng trang PDF thành ảnh. Mọi thứ chạy cục bộ trong trình duyệt nên không cần upload và không phải cài thêm phần mềm.",
        cards: [
          {
            title: "Resize ảnh miễn phí",
            desc: "Resize JPG, PNG, WebP và AVIF cho bài đăng, trang sản phẩm, thumbnail và banner.",
          },
          {
            title: "Nén ảnh",
            desc: "Nén ảnh ngay trong trình duyệt để giảm dung lượng mà vẫn kiểm soát được chất lượng.",
          },
          {
            title: "Chuyển đổi ảnh và PDF",
            desc: "Chuyển định dạng ảnh, tạo PDF từ ảnh, và xuất trang PDF thành PNG mà không cần upload.",
          },
        ],
        howItWorksTitle: "Cách hoạt động",
        howItWorksSteps: [
          "Thả file vào công cụ bạn cần.",
          "Chọn tùy chọn resize, nén, chuyển đổi hoặc xuất PDF.",
          "Tải kết quả ngay, không có độ trễ upload.",
        ],
        searchesTitle: "Các tìm kiếm phổ biến chúng tôi hỗ trợ",
        searches: [
          "image resizer",
          "image compressor",
          "JPG to PNG converter",
          "image to PDF converter",
          "PDF to image converter",
        ],
        faqTitle: "FAQ",
        faqs: [
          {
            q: "Tôi có thể resize ảnh mà không upload không?",
            a: "Có. Resize Image chạy trực tiếp trên trình duyệt, nên file luôn ở trên thiết bị của bạn khi resize, nén hoặc chuyển đổi.",
          },
          {
            q: "Bạn hỗ trợ những định dạng nào?",
            a: "Ứng dụng hỗ trợ JPG, PNG, WebP, AVIF và luồng PDF tùy theo công cụ bạn chọn.",
          },
          {
            q: "Công cụ này có tốt cho SEO và tải xuống nhanh không?",
            a: "Có. Công cụ nhanh, riêng tư, và được viết cho các tìm kiếm phổ biến như image resizer, image compressor, JPG to PNG converter, image to PDF, và PDF to image.",
          },
        ],
      },
    },
    toolsGrid: {
      toolset: "Bộ công cụ",
      title: "Mọi công cụ bạn cần",
      desc: "Năm công cụ tập trung thay vì một editor cồng kềnh. Chọn việc, làm xong ngay.",
      resizeImage: {
        title: "Resize Image",
        desc: "JPG, PNG, WebP, AVIF — kích thước chính xác hoặc preset như 1080×1080.",
      },
      compressImage: {
        title: "Nén ảnh",
        desc: "Giảm dung lượng với quality tùy chỉnh. Xem trước song song.",
      },
      convertFormat: {
        title: "Chuyển đổi định dạng",
        desc: "Đổi giữa JPG, PNG, WebP và AVIF chỉ với một cú nhấp.",
      },
      imageToPdf: {
        title: "Ảnh → PDF",
        desc: "Ghép ảnh thành một PDF. Chọn A4 hoặc Letter.",
      },
      pdfToImage: {
        title: "PDF → Ảnh",
        desc: "Xuất từng trang PDF thành ảnh độ phân giải cao.",
      },
      open: "Mở",
    },
    resizeTool: {
      dropTitle: "Thả ảnh vào đây để resize",
      dropHint: "JPG, PNG, WebP hoặc AVIF — tối đa 250 MB",
      dimensions: "Kích thước",
      lockRatio: "Khóa tỉ lệ",
      unlockRatio: "Mở khóa tỉ lệ",
      lockHelp: "Khóa tỉ lệ sẽ giữ nguyên tỷ lệ ảnh khi bạn đổi W hoặc H.",
      fit: "Fit",
      format: "Định dạng",
      quality: "Chất lượng",
      presets: "Preset",
      remove: "Xóa",
      preview: "Xem trước",
      updating: "Đang cập nhật",
      background: "Nền",
      backgroundHint: "Contain / JPG",
      backgroundColor: "Màu nền",
      backgroundHexColor: "Mã màu nền",
      fitOptions: {
        contain: "Contain",
        cover: "Cover",
        stretch: "Kéo giãn",
      },
      presetLabels: {
        socialSquare: "Vuông social",
        storyReel: "Story / Reel",
        youtubeThumb: "Thumbnail YouTube",
        fullHd: "Full HD",
        wideBanner: "Banner ngang",
        profile: "Ảnh profile",
      },
      new: "Mới",
      download: "Tải xuống",
      original: "Gốc",
      compressed: "Đã nén",
      loadingPreview: "Đang tải xem trước...",
      readingDimensions: "Đang đọc kích thước",
      waitingOutput: "Đang chờ kết quả",
      sizeChange: "Thay đổi dung lượng",
      output: "Kết quả",
      readyToDownload: "sẵn sàng tải xuống",
      smaller: "nhỏ hơn bản gốc",
      larger: "lớn hơn bản gốc",
      lowerQualityHint: "Chất lượng thấp hơn thường cho file nhỏ hơn, đặc biệt với ảnh chụp.",
      pngHint:
        "PNG không dùng nén theo chất lượng ở đây. Nếu muốn file nhỏ hơn, thử JPG hoặc WebP.",
    },
    routes: {
      about: {
        title: "Giới thiệu — Resize Image",
        description:
          "Resize Image tạo ra các công cụ ảnh và PDF chạy ngay trên trình duyệt, nhanh và riêng tư. Không upload, không tracking.",
        ogTitle: "Giới thiệu | Resize Image",
        ogDescription: "Vì sao chúng tôi xây dựng Resize Image.",
        eyebrow: "Giới thiệu",
        titleText: "Công cụ tôn trọng file của bạn.",
        intro:
          "Phần lớn các công cụ resize online sẽ gửi file của bạn lên server mà bạn không biết. Resize Image thì không. Mọi thao tác chạy local ngay trong trình duyệt bằng các Web API hiện đại — Canvas, WebAssembly, và pdf-lib. Không có gì rời khỏi thiết bị của bạn.",
        insideTitle: "Bên trong có gì",
        insideDesc:
          "Resize Image đã phát triển thành bộ công cụ tập trung cho ảnh và PDF. Không thừa thãi, không editor nặng, không cần đăng ký.",
        roadmapTitle: "Lộ trình",
        roadmapItems: [
          "Ứng dụng mobile cho iOS và Android",
          "Xử lý hàng loạt cho người dùng Pro",
          "Gộp và tách PDF",
          "OCR cho tài liệu scan",
        ],
      },
      pricing: {
        title: "Bảng giá — miễn phí trước, premium sau | Resize Image",
        description:
          "Resize Image miễn phí mãi mãi với file tới 250 MB. Gói premium sẽ ra mắt sau.",
        ogTitle: "Bảng giá | Resize Image",
        ogDescription: "Gói đơn giản. Có thể hủy bất cứ lúc nào.",
        eyebrow: "Bảng giá",
        titleText: "Dùng miễn phí. Premium sau.",
        intro: "Giá rõ ràng. Không tracking. Miễn phí file tới 250 MB.",
        popular: "Phổ biến nhất",
        free: {
          name: "Miễn phí",
          cadence: "mãi mãi",
          features: [
            "Tất cả công cụ ảnh & PDF",
            "File tới 250 MB",
            "10 file mỗi ngày",
            "Có quảng cáo",
          ],
          cta: "Bắt đầu miễn phí",
        },
        pro: {
          name: "Pro",
          cadence: "mỗi tháng",
          features: [
            "Tất cả tính năng của gói Miễn phí",
            "File tới 250 MB",
            "File hằng ngày không giới hạn",
            "Xử lý hàng loạt",
            "Không quảng cáo",
            "Hàng đợi ưu tiên",
          ],
          cta: "Nâng cấp Pro",
        },
        lifetime: {
          name: "Lifetime",
          cadence: "một lần thanh toán",
          features: [
            "Tất cả tính năng Pro",
            "Mãi mãi — không cần subscription",
            "Bao gồm công cụ tương lai",
          ],
          cta: "Mua lifetime",
        },
      },
      convertImage: {
        title: "Chuyển đổi ảnh — JPG ⇄ PNG ⇄ WebP ⇄ AVIF | Resize Image",
        description:
          "Chuyển đổi ảnh giữa JPG, PNG, WebP và AVIF ngay trên trình duyệt. Không upload, không đăng ký, tải xuống ngay.",
        ogTitle: "Chuyển đổi ảnh | Resize Image",
        ogDescription: "Đổi định dạng ảnh chỉ với một cú nhấp.",
        eyebrow: "Ảnh",
        titleText: "Chuyển đổi định dạng ảnh",
        intro: "Chuyển qua lại giữa JPG, PNG, WebP và AVIF mà không rời khỏi trình duyệt.",
        dropTitle: "Thả ảnh vào đây để chuyển đổi",
        convertTo: "Chuyển sang",
        outputLabel: "Kết quả:",
        outputAs: "thành",
        quality: "Chất lượng",
        outputQuality: "Chất lượng đầu ra",
        qualityHint: "Áp dụng cho đầu ra JPG, WebP và AVIF. PNG giữ đầu ra lossless.",
        newButton: "Mới",
        convertButton: "Chuyển đổi & tải xuống",
      },
      imageToPdf: {
        title: "Ảnh sang PDF — chuyển JPG/PNG thành PDF | Resize Image",
        description:
          "Gộp ảnh JPG và PNG thành một PDF duy nhất. Chọn A4 hoặc Letter, fit ảnh và tải xuống ngay.",
        ogTitle: "Ảnh sang PDF | Resize Image",
        ogDescription: "Biến ảnh thành PDF gọn gàng ngay trên trình duyệt.",
        eyebrow: "PDF",
        titleText: "Ảnh → PDF",
        intro: "Thả ảnh, chọn kích thước trang và tạo một PDF duy nhất. Hỗ trợ JPG và PNG.",
        dropTitleEmpty: "Thả ảnh để gộp",
        dropTitleFilled: "Thêm ảnh nữa",
        hint: "JPG, PNG, WebP hoặc AVIF",
        pageSize: "Kích thước trang",
        orientation: "Hướng trang",
        orientationOptions: {
          portrait: "Dọc",
          landscape: "Ngang",
        },
        margin: "Lề",
        marginOptions: {
          none: "Không",
          small: "Nhỏ",
          medium: "Vừa",
        },
        buildButton: "Tạo PDF",
      },
      pdfToImage: {
        title: "PDF sang Ảnh — xuất từng trang PDF thành PNG | Resize Image",
        description:
          "Chuyển từng trang của PDF thành PNG độ phân giải cao. Chạy ngay trên trình duyệt, không cần upload.",
        ogTitle: "PDF sang Ảnh | Resize Image",
        ogDescription: "Xuất từng trang PDF thành PNG ngay lập tức.",
        eyebrow: "PDF",
        titleText: "PDF → Ảnh",
        intro: "Render từng trang thành PNG. Chọn scale để có độ phân giải cao hơn.",
        dropTitle: "Thả PDF vào đây để xuất thành ảnh",
        scaleLabel: "Scale:",
        format: "Định dạng",
        jpgQuality: "Chất lượng JPG",
        pageAlt: "Trang",
        newButton: "Mới",
        renderButton: "Render trang",
        saveButton: "Lưu",
      },
      compressImage: {
        title: "Nén Ảnh — JPG, PNG, WebP, AVIF | Resize Image",
        description:
          "Nén ảnh JPG, PNG, WebP và AVIF ngay trên trình duyệt. Điều chỉnh chất lượng với xem trước trực tiếp và tải xuống ngay.",
        ogTitle: "Nén Ảnh | Resize Image",
        ogDescription: "Giảm dung lượng ảnh mà không mất chất lượng.",
        eyebrow: "Ảnh",
        titleText: "Nén ảnh",
        intro:
          "Kéo thanh trượt để tìm điểm cân bằng giữa dung lượng và chất lượng. Mọi thứ chạy cục bộ.",
        dropTitle: "Thả ảnh vào đây để nén",
        original: "Gốc",
        compressed: "Đã nén",
        loadingPreview: "Đang tải xem trước...",
        readingDimensions: "Đang đọc kích thước",
        waitingOutput: "Đang chờ kết quả",
        sizeChange: "Thay đổi dung lượng",
        output: "Kết quả",
        readyToDownload: "sẵn sàng tải xuống",
        smaller: "nhỏ hơn",
        larger: "lớn hơn",
        format: "Định dạng",
        quality: "Chất lượng",
        qualityPresets: {
          high: "Cao",
          balanced: "Cân bằng",
          smallest: "Nhỏ nhất",
        },
        newButton: "Mới",
        downloadButton: "Tải xuống",
        lowerQualityHint: "Chất lượng thấp hơn thường cho file nhỏ hơn, đặc biệt với ảnh chụp.",
        pngHint:
          "PNG không dùng nén theo chất lượng ở đây. Nếu muốn file nhỏ hơn, thử JPG hoặc WebP.",
      },
      notFound: {
        title: "Không tìm thấy trang",
        description: "Trang bạn đang tìm không tồn tại.",
        button: "Về trang chủ",
      },
    },
  },
} as const;

type WidenTranslation<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? readonly WidenTranslation<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: WidenTranslation<T[Key]> }
      : T;

export const toolEnhancementCopy: Record<
  Locale,
  {
    shared: {
      invalidDimensions: string;
      processingError: string;
      original: string;
      output: string;
      sizeChange: string;
      outputLarger: string;
      downloadAll: string;
      removeAll: string;
      total: string;
      selected: string;
      ready: string;
      error: string;
      unsupportedOutput: string;
      unsupportedImageFormat: string;
    };
    resize: {
      social: string;
      video: string;
      web: string;
      custom: string;
      outputEstimate: string;
      choosePreset: string;
      containTip: string;
      coverTip: string;
      stretchTip: string;
    };
    batch: {
      addMore: string;
      processing: string;
      outputLargerHint: string;
      reencodeWarning: string;
      dimensionsPending: string;
    };
    imageToPdf: {
      moveUp: string;
      moveDown: string;
      files: string;
    };
    pdfToImage: {
      pages: string;
      readingPdf: string;
      renderingPage: string;
      pdfError: string;
    };
  }
> = {
  "en-US": {
    shared: {
      invalidDimensions: "Use dimensions between 1 and 10,000 px.",
      processingError: "Could not process this file. Try another format or a smaller file.",
      original: "Original",
      output: "Output",
      sizeChange: "Size change",
      outputLarger: "Output is larger than the original.",
      downloadAll: "Download all",
      removeAll: "Remove all",
      total: "Total",
      selected: "Selected",
      ready: "Ready",
      error: "Error",
      unsupportedOutput: "Your browser cannot export this format.",
      unsupportedImageFormat: "This image format is not supported.",
    },
    resize: {
      social: "Social",
      video: "Video",
      web: "Web",
      custom: "Custom",
      outputEstimate: "Output estimate",
      choosePreset: "Choose preset",
      containTip: "Keep the full image visible with padding if needed.",
      coverTip: "Fill the canvas and crop from the center.",
      stretchTip: "Force the image into the exact size.",
    },
    batch: {
      addMore: "Add more files",
      processing: "Processing",
      outputLargerHint: "Try a lower quality or WebP/JPG for a smaller result.",
      reencodeWarning: "Same format selected. The file will be re-encoded.",
      dimensionsPending: "Reading dimensions",
    },
    imageToPdf: {
      moveUp: "Move up",
      moveDown: "Move down",
      files: "files",
    },
    pdfToImage: {
      pages: "pages",
      readingPdf: "Reading PDF",
      renderingPage: "Rendering page",
      pdfError: "Could not read this PDF. It may be corrupted or password-protected.",
    },
  },
  "en-IN": {
    shared: {
      invalidDimensions: "Use dimensions between 1 and 10,000 px.",
      processingError: "Could not process this file. Try another format or a smaller file.",
      original: "Original",
      output: "Output",
      sizeChange: "Size change",
      outputLarger: "Output is larger than the original.",
      downloadAll: "Download all",
      removeAll: "Remove all",
      total: "Total",
      selected: "Selected",
      ready: "Ready",
      error: "Error",
      unsupportedOutput: "Your browser cannot export this format.",
      unsupportedImageFormat: "This image format is not supported.",
    },
    resize: {
      social: "Social",
      video: "Video",
      web: "Web",
      custom: "Custom",
      outputEstimate: "Output estimate",
      choosePreset: "Choose preset",
      containTip: "Keep the full image visible with padding if needed.",
      coverTip: "Fill the canvas and crop from the centre.",
      stretchTip: "Force the image into the exact size.",
    },
    batch: {
      addMore: "Add more files",
      processing: "Processing",
      outputLargerHint: "Try a lower quality or WebP/JPG for a smaller result.",
      reencodeWarning: "Same format selected. The file will be re-encoded.",
      dimensionsPending: "Reading dimensions",
    },
    imageToPdf: {
      moveUp: "Move up",
      moveDown: "Move down",
      files: "files",
    },
    pdfToImage: {
      pages: "pages",
      readingPdf: "Reading PDF",
      renderingPage: "Rendering page",
      pdfError: "Could not read this PDF. It may be corrupted or password-protected.",
    },
  },
  "pt-BR": {
    shared: {
      invalidDimensions: "Use dimensões entre 1 e 10.000 px.",
      processingError:
        "Não foi possível processar este arquivo. Tente outro formato ou um arquivo menor.",
      original: "Original",
      output: "Saída",
      sizeChange: "Mudança de tamanho",
      outputLarger: "A saída ficou maior que o original.",
      downloadAll: "Baixar tudo",
      removeAll: "Remover tudo",
      total: "Total",
      selected: "Selecionado",
      ready: "Pronto",
      error: "Erro",
      unsupportedOutput: "Seu navegador não consegue exportar este formato.",
      unsupportedImageFormat: "Este formato de imagem não é compatível.",
    },
    resize: {
      social: "Social",
      video: "Vídeo",
      web: "Web",
      custom: "Personalizado",
      outputEstimate: "Estimativa de saída",
      choosePreset: "Escolha preset",
      containTip: "Mantém a imagem inteira visível com margem quando necessário.",
      coverTip: "Preenche a tela e corta pelo centro.",
      stretchTip: "Força a imagem ao tamanho exato.",
    },
    batch: {
      addMore: "Adicionar arquivos",
      processing: "Processando",
      outputLargerHint: "Tente qualidade menor ou WebP/JPG para reduzir.",
      reencodeWarning: "Mesmo formato selecionado. O arquivo será recodificado.",
      dimensionsPending: "Lendo dimensões",
    },
    imageToPdf: {
      moveUp: "Mover para cima",
      moveDown: "Mover para baixo",
      files: "arquivos",
    },
    pdfToImage: {
      pages: "páginas",
      readingPdf: "Lendo PDF",
      renderingPage: "Renderizando página",
      pdfError: "Não foi possível ler este PDF. Ele pode estar corrompido ou protegido por senha.",
    },
  },
  "fil-PH": {
    shared: {
      invalidDimensions: "Gumamit ng dimensions mula 1 hanggang 10,000 px.",
      processingError: "Hindi ma-process ang file. Subukan ang ibang format o mas maliit na file.",
      original: "Original",
      output: "Output",
      sizeChange: "Size change",
      outputLarger: "Mas malaki ang output kaysa original.",
      downloadAll: "Download all",
      removeAll: "Remove all",
      total: "Total",
      selected: "Selected",
      ready: "Ready",
      error: "Error",
      unsupportedOutput: "Hindi ma-export ng browser mo ang format na ito.",
      unsupportedImageFormat: "Hindi suportado ang format ng image na ito.",
    },
    resize: {
      social: "Social",
      video: "Video",
      web: "Web",
      custom: "Custom",
      outputEstimate: "Output estimate",
      choosePreset: "Choose preset",
      containTip: "Panatilihing kita ang buong image kahit may padding.",
      coverTip: "Punuin ang canvas at i-crop mula sa gitna.",
      stretchTip: "I-stretch ang image sa eksaktong size.",
    },
    batch: {
      addMore: "Add more files",
      processing: "Processing",
      outputLargerHint: "Subukan ang lower quality o WebP/JPG para mas maliit.",
      reencodeWarning: "Parehong format ang napili. Ire-re-encode ang file.",
      dimensionsPending: "Reading dimensions",
    },
    imageToPdf: {
      moveUp: "Move up",
      moveDown: "Move down",
      files: "files",
    },
    pdfToImage: {
      pages: "pages",
      readingPdf: "Reading PDF",
      renderingPage: "Rendering page",
      pdfError: "Hindi mabasa ang PDF. Baka corrupted o password-protected.",
    },
  },
  "id-ID": {
    shared: {
      invalidDimensions: "Gunakan dimensi antara 1 dan 10.000 px.",
      processingError: "File tidak dapat diproses. Coba format lain atau file yang lebih kecil.",
      original: "Asli",
      output: "Output",
      sizeChange: "Perubahan ukuran",
      outputLarger: "Output lebih besar dari file asli.",
      downloadAll: "Unduh semua",
      removeAll: "Hapus semua",
      total: "Total",
      selected: "Dipilih",
      ready: "Siap",
      error: "Error",
      unsupportedOutput: "Browser Anda tidak dapat mengekspor format ini.",
      unsupportedImageFormat: "Format gambar ini tidak didukung.",
    },
    resize: {
      social: "Sosial",
      video: "Video",
      web: "Web",
      custom: "Kustom",
      outputEstimate: "Estimasi output",
      choosePreset: "Pilih preset",
      containTip: "Menjaga seluruh gambar tetap terlihat dengan padding bila perlu.",
      coverTip: "Memenuhi kanvas dan crop dari tengah.",
      stretchTip: "Paksa gambar ke ukuran tepat.",
    },
    batch: {
      addMore: "Tambah file",
      processing: "Memproses",
      outputLargerHint: "Coba kualitas lebih rendah atau WebP/JPG agar lebih kecil.",
      reencodeWarning: "Format yang sama dipilih. File akan di-encode ulang.",
      dimensionsPending: "Membaca dimensi",
    },
    imageToPdf: {
      moveUp: "Naik",
      moveDown: "Turun",
      files: "file",
    },
    pdfToImage: {
      pages: "halaman",
      readingPdf: "Membaca PDF",
      renderingPage: "Merender halaman",
      pdfError: "PDF tidak dapat dibaca. File mungkin rusak atau dilindungi sandi.",
    },
  },
  "vi-VN": {
    shared: {
      invalidDimensions: "Dùng kích thước từ 1 đến 10.000 px.",
      processingError: "Không xử lý được file này. Thử định dạng khác hoặc file nhỏ hơn.",
      original: "Gốc",
      output: "Kết quả",
      sizeChange: "Thay đổi dung lượng",
      outputLarger: "Kết quả lớn hơn file gốc.",
      downloadAll: "Tải tất cả",
      removeAll: "Xóa tất cả",
      total: "Tổng",
      selected: "Đã chọn",
      ready: "Sẵn sàng",
      error: "Lỗi",
      unsupportedOutput: "Trình duyệt của bạn không xuất được định dạng này.",
      unsupportedImageFormat: "Định dạng ảnh này chưa được hỗ trợ.",
    },
    resize: {
      social: "Social",
      video: "Video",
      web: "Web",
      custom: "Tùy chỉnh",
      outputEstimate: "Ước tính kết quả",
      choosePreset: "Chọn preset",
      containTip: "Giữ toàn bộ ảnh hiển thị, thêm nền nếu cần.",
      coverTip: "Phủ kín khung và crop từ trung tâm.",
      stretchTip: "Ép ảnh đúng kích thước đã chọn.",
    },
    batch: {
      addMore: "Thêm file",
      processing: "Đang xử lý",
      outputLargerHint: "Thử giảm chất lượng hoặc dùng WebP/JPG để file nhỏ hơn.",
      reencodeWarning: "Bạn chọn cùng định dạng. File sẽ được encode lại.",
      dimensionsPending: "Đang đọc kích thước",
    },
    imageToPdf: {
      moveUp: "Đưa lên",
      moveDown: "Đưa xuống",
      files: "file",
    },
    pdfToImage: {
      pages: "trang",
      readingPdf: "Đang đọc PDF",
      renderingPage: "Đang render trang",
      pdfError: "Không đọc được PDF này. File có thể bị lỗi hoặc có mật khẩu.",
    },
  },
};

export type TranslationSet = WidenTranslation<(typeof messages)["en-US"]>;

export function getTranslationSet(locale: Locale = getBrowserLocale()): TranslationSet {
  return messages[locale];
}

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TranslationSet;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en-US");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
    const detected = detectLocale(
      stored ?? (typeof navigator !== "undefined" ? navigator.language : "en-US"),
    );
    setLocale(detected);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, locale);
    }
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: messages[locale],
    }),
    [locale],
  );

  return createElement(LocaleContext.Provider, { value }, children);
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
}
