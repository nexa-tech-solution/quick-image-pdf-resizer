import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const publicDir = join(root, "public");
const env = {
  ...(await readEnvFile(join(root, ".env"))),
  ...(await readEnvFile(join(root, ".env.production"))),
  ...process.env,
};
const siteUrl = normalizeSiteUrl(env.SITE_URL || env.VITE_SITE_URL || "http://localhost:8080");

const routes = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/compress-image", priority: "0.9", changefreq: "weekly" },
  { path: "/convert-image", priority: "0.9", changefreq: "weekly" },
  { path: "/image-to-pdf", priority: "0.85", changefreq: "weekly" },
  { path: "/pdf-to-image", priority: "0.85", changefreq: "weekly" },
  { path: "/pricing", priority: "0.45", changefreq: "monthly" },
  { path: "/about", priority: "0.4", changefreq: "monthly" },
];

await mkdir(publicDir, { recursive: true });

const now = new Date().toISOString();
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (route) => `  <url>
    <loc>${escapeXml(absoluteUrl(route.path))}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;

await writeFile(join(publicDir, "sitemap.xml"), sitemap);
await writeFile(join(publicDir, "robots.txt"), robots);

function normalizeSiteUrl(value) {
  return value.replace(/\/+$/, "");
}

function absoluteUrl(path) {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function readEnvFile(path) {
  try {
    const content = await readFile(path, "utf8");
    return Object.fromEntries(
      content
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#"))
        .map((line) => {
          const index = line.indexOf("=");
          if (index === -1) return [line, ""];
          const key = line.slice(0, index).trim();
          const value = line
            .slice(index + 1)
            .trim()
            .replace(/^['"]|['"]$/g, "");
          return [key, value];
        }),
    );
  } catch {
    return {};
  }
}
