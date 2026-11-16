import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, resolve, relative, isAbsolute } from "node:path";
import vm from "node:vm";
import { createPreviewInspector } from "./preview-status.mjs";
const root = resolve(import.meta.dirname, ".."),
  port = Number(process.env.PORT || 4173);
const types = {
  ".js": "text/javascript; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};
const catalogContext = { window: {} };
vm.runInNewContext(
  await readFile(join(root, "src/catalog.js"), "utf8"),
  catalogContext,
);
const inspectPreview = createPreviewInspector(
  catalogContext.window.SITE_DATA || [],
);
createServer(async (req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405);
      res.end();
      return;
    }
    const url = new URL(req.url, "http://localhost");
    const pathname = decodeURIComponent(url.pathname);
    if (pathname === "/api/preview-status") {
      const record = await inspectPreview(
        url.searchParams.get("id"),
        url.searchParams.get("refresh") === "1",
      );
      res.writeHead(record ? 200 : 404, {
        "content-type": "application/json; charset=utf-8",
      });
      res.end(req.method === "HEAD" ? undefined : JSON.stringify({ record }));
      return;
    }
    const file = resolve(
      root,
      pathname === "/" ? "index.html" : `.${pathname}`,
    );
    const inside = relative(root, file);
    if (inside.startsWith("..") || isAbsolute(inside)) throw Error("Not found");
    const info = await stat(file);
    if (!info.isFile()) throw Error("Not found");
    const buf = await readFile(file);
    res.writeHead(200, {
      "content-type": types[extname(file)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(req.method === "HEAD" ? undefined : buf);
  } catch (_) {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(`FrontHub running at http://localhost:${port}\nCtrl+C to stop`),
);
