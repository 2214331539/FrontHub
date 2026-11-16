/** Build candidate input and record public repository evidence without cloning code. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
const prefix = "tools/research/2026-10-19-community";
let category;
const seeds = [];
const catalog = [];
for (const line of (
  await readFile(resolve(root, `${prefix}-seeds.txt`), "utf8")
).split(/\r?\n/)) {
  if (!line.trim()) continue;
  if (line.startsWith("# ")) {
    category = line.slice(2);
    catalog.push(line);
    continue;
  }
  const [name, path, tags, summary, kind, repo, sourceType] = line.split("|");
  if (!sourceType || !category) throw Error(`Invalid seed: ${line}`);
  seeds.push({
    name,
    url: `https://${path}`,
    category,
    kind,
    repo: repo === "-" ? null : repo,
    sourceType,
  });
  catalog.push([name, path, tags, summary].join("|"));
}
await writeFile(
  resolve(root, "tools/candidates-2026-10-19-community.txt"),
  catalog.join("\n") + "\n",
);
let cursor = 0;
async function worker() {
  while (cursor < seeds.length) {
    const seed = seeds[cursor++];
    if (!seed.repo) continue;
    seed.referenceUrl = `https://github.com/${seed.repo}`;
    seed.checkedAt = new Date().toISOString();
    try {
      const url = `https://raw.githubusercontent.com/${seed.repo}/HEAD/README.md`;
      const response = await fetch(url, { signal: AbortSignal.timeout(18000) });
      seed.readmeStatus = response.status;
      if (!response.ok) throw Error(`README HTTP ${response.status}`);
      const readme = await response.text();
      const links = [
        ...new Set(readme.match(/https?:\/\/[^\s<>"\)\]]+/g) || []),
      ];
      const host = new URL(seed.url).hostname.replace(/^www\./, "");
      seed.matchingLinks = links
        .filter((link) => {
          try {
            return new URL(link).hostname.replace(/^www\./, "") === host;
          } catch {
            return false;
          }
        })
        .slice(0, 15);
      seed.demoLinks = links
        .filter((link) =>
          /demo|preview|vercel\.app|netlify\.app|github\.io|pages\.dev/.test(
            link,
          ),
        )
        .slice(0, 12);
      seed.licenseReferences = readme
        .split("\n")
        .filter((line) =>
          /\b(?:MIT|Apache-2\.0|GPL|BSD|license|licence)\b/i.test(line),
        )
        .map((line) => line.slice(0, 250))
        .slice(0, 3);
      seed.readmeUrl = url;
      console.log(
        `${seed.name} | ${seed.readmeStatus} | ${seed.matchingLinks.length ? "linked" : "review relationship"}`,
      );
    } catch (error) {
      seed.error = error.message;
      console.log(`${seed.name} | ${seed.error}`);
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));
await writeFile(
  resolve(root, `${prefix}-repositories.json`),
  JSON.stringify({ checkedAt: new Date().toISOString(), seeds }, null, 2) +
    "\n",
);
console.log(`Recorded ${seeds.length} candidates.`);
