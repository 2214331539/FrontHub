import { mkdir, copyFile, cp } from "node:fs/promises";
await mkdir("dist", { recursive: true });
await copyFile("index.html", "dist/index.html");
await cp("src", "dist/src", { recursive: true });
await copyFile("site-atlas-standalone.html", "dist/site-atlas-standalone.html");
console.log("FrontHub static assets ready in dist/");
