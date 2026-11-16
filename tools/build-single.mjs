/** Generates a single standalone HTML including CSS, JS, records, and encoded screenshots. */
import { readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
const root = resolve(import.meta.dirname, "..");
const style = (
  await Promise.all(
    ["styles", "preview"].map((name) =>
      readFile(join(root, `src/${name}.css`), "utf8"),
    ),
  )
).join("\n");
const js = await Promise.all(
  [
    "catalog",
    "previews.generated",
    "embeds.generated",
    "frame-policy",
    "preview",
    "app",
  ].map((x) => readFile(join(root, `src/${x}.js`), "utf8")),
);
const html = (await readFile(join(root, "index.html"), "utf8"))
  .replace(
    '<link rel="stylesheet" href="./src/styles.css" />',
    `<style>\n${style.replace(/<\/style/gi, "<\\/style")}\n</style>`,
  )
  .replace('  <link rel="stylesheet" href="./src/preview.css" />', "")
  .replace(/^[\t ]*<script src="\.\/src\/[a-z.-]+\.js"><\/script>[\t ]*$/gm, "")
  .replace(
    "</body>",
    js
      .map(
        (source) =>
          `<script>\n${source.replace(/<\/script/gi, "<\\/script")}\n</script>`,
      )
      .join("\n") + "\n</body>",
  );
const output = join(root, "site-atlas-standalone.html");
await writeFile(output, html, "utf8");
console.log(
  `Created ${output} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`,
);
