/** Fetch public candidate homepages for a dated, reviewable catalog update. */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join, dirname } from "node:path";
import vm from "node:vm";
const root = resolve(import.meta.dirname, "..");
const input = resolve(
  root,
  process.argv[2] || "tools/candidates-2026-10-19.txt",
);
const output = resolve(
  root,
  process.argv[3] || "tools/research/2026-10-19-candidates.json",
);
const context = { window: {} };
vm.runInNewContext(
  await readFile(join(root, "src/catalog.js"), "utf8"),
  context,
);
const normalize = (url) => {
  const u = new URL(url);
  return (
    u.hostname.replace(/^www\./, "").toLowerCase() +
    u.pathname.replace(/\/$/, "")
  );
};
const existing = new Set(context.window.SITE_DATA.map((s) => normalize(s.url)));
const seen = new Set();
const sites = [];
let category;
for (const raw of (await readFile(input, "utf8")).split(/\r?\n/)) {
  const line = raw.trim();
  if (!line) continue;
  if (line.startsWith("# ")) {
    category = line.slice(2);
    continue;
  }
  const [name, domainPath, tags, summary] = line.split("|");
  if (!name || !domainPath || !tags || !summary || !category)
    throw Error(`Invalid candidate: ${line}`);
  const url = `https://${domainPath}`;
  if (existing.has(normalize(url)) || seen.has(normalize(url)))
    throw Error(`Duplicate candidate: ${name}`);
  seen.add(normalize(url));
  sites.push({
    id: domainPath.replaceAll("/", "_").replaceAll(".", "_").toLowerCase(),
    name,
    url,
    category,
    tags: tags.split(","),
    summary,
  });
}
const clean = (text) =>
  (text || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&(?:nbsp|#160);/g, " ")
    .replace(/\s+/g, " ")
    .trim();
let cursor = 0;
async function worker() {
  while (cursor < sites.length) {
    const site = sites[cursor++];
    site.checkedAt = new Date().toISOString();
    try {
      const response = await fetch(site.url, {
        signal: AbortSignal.timeout(15000),
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; FrontHub-Catalog-Review/1.0)",
        },
      });
      site.httpStatus = response.status;
      site.finalUrl = response.url;
      site.xFrameOptions = response.headers.get("x-frame-options") || "";
      site.csp = response.headers.get("content-security-policy") || "";
      const html = await response.text();
      const markup = html.replace(
        /<!--[\s\S]*?-->|<script\b[^>]*>[\s\S]*?<\/script>/gi,
        "",
      );
      site.title = clean(
        markup.match(/<title(?:\s[^>]*)?>([\s\S]*?)<\/title>/i)?.[1],
      ).slice(0, 200);
      const metas = [...markup.matchAll(/<meta\s+[^>]+>/gi)].map((match) =>
        Object.fromEntries(
          [...match[0].matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map((a) => [
            a[1].toLowerCase(),
            a[3],
          ]),
        ),
      );
      site.description = clean(
        metas.find((m) => m.name === "description")?.content ||
          metas.find((m) => m.property === "og:description")?.content,
      ).slice(0, 240);
      site.heading = clean(
        markup.match(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/i)?.[1],
      ).slice(0, 180);
      site.requiresReview =
        !response.ok ||
        /just a moment|access denied|attention required|not found|deployment paused|for sale|domain parked|robot|captcha/i.test(
          site.title,
        );
      if (normalize(site.finalUrl) !== normalize(site.url))
        site.redirected = true;
      if (existing.has(normalize(site.finalUrl)))
        site.duplicateOfExisting = true;
    } catch (error) {
      site.error = error.message;
      site.requiresReview = true;
    }
    console.log(
      `${site.name} | ${site.httpStatus || "ERR"} | ${site.title || site.error}`,
    );
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
await mkdir(dirname(output), { recursive: true });
await writeFile(
  output,
  JSON.stringify(
    { reviewedAt: new Date().toISOString(), candidates: sites },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify({
    total: sites.length,
    fetched: sites.filter((s) => !s.requiresReview).length,
    needsReview: sites.filter((s) => s.requiresReview).length,
    output,
  }),
);
