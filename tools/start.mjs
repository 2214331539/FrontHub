/** Windows one-click launcher. Reuse an existing FrontHub server and open the browser once ready. */
import { spawn } from "node:child_process";
import { get } from "node:http";
import { resolve, join } from "node:path";

if (Number(process.versions.node.split(".")[0]) < 22) {
  console.error("[FrontHub] Please install Node.js 22 or newer: https://nodejs.org/");
  process.exit(1);
}

const root = resolve(import.meta.dirname, "..");
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("[FrontHub] PORT must be an integer between 1 and 65535.");
  process.exit(1);
}
const url = `http://localhost:${port}/`;
const noOpen = process.argv.includes("--no-open");

function openBrowser() {
  if (noOpen) return;
  const browser = spawn("cmd.exe", ["/d", "/c", "start", "", url], {
    stdio: "ignore",
    windowsHide: true,
  });
  browser.on("error", () => console.error(`[FrontHub] Open this URL in your browser: ${url}`));
  browser.unref();
}

const existing = await new Promise((resolveStatus) => {
  const request = get(`http://127.0.0.1:${port}/`, (response) => {
    let html = "";
    response.setEncoding("utf8");
    response.on("data", (chunk) => {
      html += chunk;
      if (html.length > 65536) response.destroy();
    });
    response.on("close", () => resolveStatus(response.statusCode === 200 && /<title>FrontHub\b/i.test(html) ? "fronthub" : "occupied"));
    response.on("error", () => resolveStatus("occupied"));
  });
  request.setTimeout(2000, () => request.destroy());
  request.on("error", (error) => resolveStatus(error.code === "ECONNREFUSED" ? "free" : "occupied"));
});

if (existing === "fronthub") {
  console.log(`[FrontHub] Already running: ${url}`);
  openBrowser();
} else if (existing === "occupied") {
  console.error(`[FrontHub] Port ${port} is occupied by another application. Close that application and try again.`);
  process.exitCode = 1;
} else {
  const server = spawn(process.execPath, [join(root, "tools", "serve.mjs")], {
    cwd: root,
    env: { ...process.env, PORT: String(port) },
    stdio: ["inherit", "pipe", "inherit"],
    windowsHide: true,
  });
  let opened = false;
  let output = "";
  server.stdout.on("data", (chunk) => {
    process.stdout.write(chunk);
    output = (output + chunk).slice(-2048);
    if (!opened && output.includes("FrontHub running at")) {
      opened = true;
      openBrowser();
    }
  });
  server.on("error", (error) => {
    console.error(`[FrontHub] Could not start the server: ${error.message}`);
    process.exitCode = 1;
  });
  server.on("exit", (code) => { process.exitCode = code ?? 0; });
  process.once("SIGINT", () => server.kill("SIGINT"));
  process.once("SIGTERM", () => server.kill("SIGTERM"));
}
