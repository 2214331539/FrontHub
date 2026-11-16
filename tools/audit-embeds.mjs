/** Audit the public URLs in the catalog. No website proxy or header bypass. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import vm from "node:vm";
import policy from "../src/frame-policy.js";

const root = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const value = (name, fallback) =>
  args.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ??
  fallback;
const sandbox = { window: {} };
vm.runInNewContext(
  await readFile(join(root, "src/catalog.js"), "utf8"),
  sandbox,
);
vm.runInNewContext(
  await readFile(join(root, "src/embeds.generated.js"), "utf8"),
  sandbox,
);
const only = value("only", "").toLowerCase().split(",").filter(Boolean);
const selectedIds = value("ids-file", "")
  ? new Set(
      JSON.parse(await readFile(resolve(root, value("ids-file", "")), "utf8")),
    )
  : null;
const sites = sandbox.window.SITE_DATA.filter(
  (site) =>
    (!only.length || only.includes(site.name.toLowerCase())) &&
    (!selectedIds || selectedIds.has(site.id)),
)
  .sort((a, b) => a.rank - b.rank)
  .slice(0, Number(value("limit", "Infinity")));
const records = sandbox.window.EMBED_POLICIES || {};
const parent = value("parent", "http://localhost:4173");
let cursor = 0;
async function worker() {
  while (cursor < sites.length) {
    const site = sites[cursor++];
    const record = { checkedAt: new Date().toISOString(), finalUrl: site.url };
    try {
      const response = await fetch(site.url, {
        signal: AbortSignal.timeout(12000),
        headers: { "User-Agent": "FrontHub-Preview-Audit/1.0" },
      });
      Object.assign(record, {
        finalUrl: response.url,
        httpStatus: response.status,
        xFrameOptions: response.headers.get("x-frame-options") || "",
        csp: response.headers.get("content-security-policy") || "",
      });
      await response.body?.cancel();
    } catch (error) {
      record.error = error.message;
    }
    records[site.id] = record;
    console.log(`${site.name}: ${policy.evaluate(record, parent).status}`);
  }
}
await Promise.all(Array.from({ length: 5 }, worker));
await writeFile(
  join(root, "src/embeds.generated.js"),
  `/* Website response headers audited at ${new Date().toISOString()}. Re-run npm run audit:embeds to refresh. */\nwindow.EMBED_POLICIES = ${JSON.stringify(records, null, 2)};\n`,
);
const counts = sites.reduce((result, site) => {
  const status = policy.evaluate(records[site.id], parent).status;
  result[status] = (result[status] || 0) + 1;
  return result;
}, {});
console.log("Audit complete:", JSON.stringify(counts));
