import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { createPreviewInspector } from "../tools/preview-status.mjs";

const context = { window: {} };
vm.runInNewContext(
  await readFile(new URL("../src/catalog.js", import.meta.url), "utf8"),
  context,
);
const inspect = createPreviewInspector(context.window.SITE_DATA);

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "method-not-allowed" });
  }
  const url = new URL(req.url, "https://fronthub.local");
  const record = await inspect(
    url.searchParams.get("id"),
    url.searchParams.get("refresh") === "1",
  );
  return res.status(record ? 200 : 404).json({ record });
}
