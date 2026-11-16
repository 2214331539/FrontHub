/**
 * Site Atlas image harvester — Node 22+, Chrome/Chromium, no npm dependencies.
 * Captures REAL website screenshots through Chrome DevTools Protocol.
 * Images are encoded as WebP Base64 literals INSIDE src/previews.generated.js.
 * Once generated, the dashboard requests zero third-party images or services.
 *
 * Examples:
 *   npm run capture -- --limit=40
 *   npm run capture -- --all
 *   npm run capture -- --only="Linear,Raycast,Outline"
 *   npm run capture -- --category="科研与知识管理" --limit=25
 *   npm run capture -- --all --force --wait=5000
 */
import { readFile, writeFile, rename, mkdtemp, rm } from "node:fs/promises";
import { accessSync, constants, statSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import vm from "node:vm";

const root = resolve(import.meta.dirname, "..");
const args = process.argv.slice(2);
const val = (key, defaultVal = "") => {
  const found = args.find((x) => x.startsWith(`--${key}=`));
  return found ? found.slice(key.length + 3) : defaultVal;
};
const on = (key) => args.includes(`--${key}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const wait = Number(val("wait", "2800"));
const limit = on("all") ? Infinity : Number(val("limit", "40"));
const quality = Math.max(35, Math.min(95, Number(val("quality", "68"))));
const targetNames = val("only")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);
const category = val("category");
const selectedIds = val("ids-file")
  ? new Set(JSON.parse(await readFile(resolve(root, val("ids-file")), "utf8")))
  : null;
const probe = val("probe-url");
const fullPage = on("full-page");
const concurrency = Math.max(
  1,
  Math.min(3, Number(val("concurrency", "1")) || 1),
);

function readJS(file) {
  return readFile(file, "utf8").then((js) => {
    const sandbox = { window: {} };
    vm.runInNewContext(js, sandbox, { timeout: 12000 });
    return sandbox.window;
  });
}
function chromePath() {
  const candidates = [
    process.env.CHROME_PATH,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "google-chrome",
    "chromium",
    "chrome",
  ].filter(Boolean);
  for (const c of candidates) {
    if (c.includes("/") || c.includes("\\")) {
      try {
        // Windows Chrome is a GUI executable; --version may not exit or print.
        accessSync(c, constants.X_OK);
        if (statSync(c).isFile()) return c;
      } catch {}
    } else {
      try {
        const r = spawnSync(
          process.platform === "win32" ? "where" : "which",
          [c],
          { timeout: 4000, encoding: "utf8" },
        );
        if (r.status === 0) return r.stdout.trim().split(/\r?\n/)[0];
      } catch {}
    }
  }
  return null;
}
function createClient(wsUrl) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(wsUrl);
    const pending = new Map();
    let seq = 0;
    let closed = false;
    const kill = setTimeout(
      () => reject(new Error("CDP websocket timeout")),
      8000,
    );
    socket.addEventListener("open", () => {
      clearTimeout(kill);
      resolve({
        async send(method, params = {}, timeout = 13000) {
          if (closed) throw Error("CDP connection closed");
          const id = ++seq;
          return await new Promise((yes, no) => {
            const t = setTimeout(() => {
              pending.delete(id);
              no(Error(`${method} timed out`));
            }, timeout);
            pending.set(id, { yes, no, t });
            socket.send(JSON.stringify({ id, method, params }));
          });
        },
        close() {
          closed = true;
          socket.close();
        },
      });
    });
    socket.addEventListener("message", (event) => {
      try {
        const m = JSON.parse(event.data);
        if (!m.id) return;
        const p = pending.get(m.id);
        if (!p) return;
        clearTimeout(p.t);
        pending.delete(m.id);
        if (m.error) p.no(Error(m.error.message));
        else p.yes(m.result || {});
      } catch {}
    });
    socket.addEventListener("error", () => {
      clearTimeout(kill);
      reject(new Error("CDP websocket error"));
    });
    socket.addEventListener("close", () => {
      closed = true;
      for (const p of pending.values()) {
        clearTimeout(p.t);
        p.no(Error("Chrome connection lost"));
      }
      pending.clear();
    });
  });
}
async function launchBrowser() {
  const executable = chromePath();
  if (!executable)
    throw new Error(
      "找不到 Chrome / Chromium。请安装 Google Chrome，或设置 CHROME_PATH 指向 Chrome 的可执行文件。",
    );
  const profile = await mkdtemp(join(tmpdir(), "scientify-capture-"));
  const chrome = spawn(
    executable,
    [
      "--headless=new",
      "--disable-dev-shm-usage",
      "--disable-extensions",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--window-size=1280,800",
      "--remote-allow-origins=*",
      "--remote-debugging-port=0",
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { stdio: "ignore", windowsHide: true },
  );
  let port;
  for (let i = 0; i < 95; i++) {
    if (chrome.exitCode !== null) break;
    try {
      const t = await readFile(join(profile, "DevToolsActivePort"), "utf8");
      port = Number(t.split("\n")[0]);
      if (port) break;
    } catch {}
    await sleep(200);
  }
  if (!port) {
    chrome.kill();
    await rm(profile, { recursive: true, force: true });
    throw Error(
      "Chrome 无法启动远程调试端口，请确认 Chromium 支持 Headless 模式。",
    );
  }
  const tabs = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) =>
    r.json(),
  );
  let tab = tabs.find((t) => t.type === "page");
  if (!tab) {
    tab = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {
      method: "PUT",
    }).then((r) => r.json());
  }
  const client = await createClient(tab.webSocketDebuggerUrl);
  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Network.enable");
  await client.send("Emulation.setDeviceMetricsOverride", {
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    mobile: false,
  });
  const quit = async () => {
    try {
      client.close();
    } catch {}
    try {
      chrome.kill("SIGTERM");
    } catch {}
    await sleep(200);
    await rm(profile, {
      recursive: true,
      force: true,
      maxRetries: 2,
      retryDelay: 250,
    }).catch(() => {});
  };
  // Isolate sites so a heavy or stalled renderer cannot poison the next capture.
  async function createPage() {
    const target = await fetch(
      `http://127.0.0.1:${port}/json/new?about:blank`,
      { method: "PUT" },
    ).then((r) => r.json());
    const pageClient = await createClient(target.webSocketDebuggerUrl);
    await pageClient.send("Page.enable");
    await pageClient.send("Runtime.enable");
    await pageClient.send("Page.bringToFront");
    await pageClient.send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 800,
      deviceScaleFactor: 1,
      mobile: false,
    });
    return {
      client: pageClient,
      async close() {
        pageClient.close();
        await fetch(`http://127.0.0.1:${port}/json/close/${target.id}`).catch(
          () => {},
        );
      },
    };
  }
  return { client, quit, executable, createPage };
}
async function capture(client, url) {
  const navigation = await client.send("Page.navigate", { url }, 18000);
  if (navigation.errorText) throw Error(navigation.errorText);
  await client.send("Page.bringToFront");
  await sleep(wait);
  // Wait for fonts and finish finite entrance animations before photographing the page.
  await client
    .send(
      "Runtime.evaluate",
      {
        expression: on("natural-animations")
          ? "Promise.resolve(document.fonts?.ready)"
          : `Promise.resolve(document.fonts?.ready).then(() => { for (const animation of document.getAnimations()) { try { if (animation.effect?.getComputedTiming().iterations !== Infinity) animation.finish(); } catch (_) {} } })`,
        awaitPromise: true,
      },
      6000,
    )
    .catch(() => {});
  await sleep(300);
  let page = {};
  try {
    const res = await client.send(
      "Runtime.evaluate",
      {
        expression:
          'JSON.stringify({title:document.title,url:location.href,text:(document.body?.innerText||"").slice(0,500)})',
        returnByValue: true,
      },
      6000,
    );
    page = JSON.parse(res.result?.value || "{}");
  } catch {}
  if (page.url?.startsWith("chrome-error://")) throw Error("Chrome 网络错误");
  if (
    /sit tight|waiting room|you are in (?:a |the )?queue/i.test(page.text || "")
  )
    throw Error("网站排队或等待验证页面");
  if (
    /your browser is not supported|browser does not support WebGL|WebGL is not supported|please enable WebGL/i.test(
      page.text || "",
    )
  )
    throw Error("浏览器未能呈现网站的图形内容");
  if (
    /Just a moment|Access Denied|Gateway Timeout|Bad Gateway|This site can.t be reached|Not Found|Attention Required|Robot Check|Bot Verification|^\s*(?:403|404|500|502|503|504)\b|^\s*Error\s+\d{3,4}\b/i.test(
      page.title || "",
    )
  )
    throw Error("网站反爬或加载失败: " + page.title);
  if (
    /Checking your browser before accessing|Verify you are human|verifying you are human|complete the captcha|One more step|Just a moment|正在验证|验证您是|验证您是否|验证您的连接|人机验证|安全验证|请完成.*验证|确认您是真人|ERROR_INTERNET_DISCONNECTED|ERR_TUNNEL_CONNECTION_FAILED|^\s*(?:403|404|500|502|503|504)\s+(?:ERROR|Forbidden|Not Found)|^\s*Error\s+10\d\d\b|The request could not be satisfied|Origin DNS error/i.test(
      page.text || "",
    )
  )
    throw Error("网页访问受限/验证码");
  if (
    /deployment is temporarily paused|This page doesn.t exist|We.re saying goodbye/i.test(
      page.text || "",
    )
  )
    throw Error("站点已暂停或页面已下线");
  const metrics = fullPage ? await client.send("Page.getLayoutMetrics") : null;
  const height = fullPage
    ? Math.min(5000, Math.max(800, metrics.cssContentSize?.height || 800))
    : 800;
  await client.send("Page.bringToFront");
  await sleep(300);
  const shot = await client.send(
    "Page.captureScreenshot",
    {
      format: "webp",
      quality,
      captureBeyondViewport: fullPage,
      fromSurface: true,
      clip: { x: 0, y: 0, width: 1280, height, scale: 0.58 },
    },
    16000,
  );
  if (!shot.data) throw Error("无截图数据");
  const buffer = Buffer.from(shot.data, "base64");
  if (buffer.length < 2600) throw Error("截图过小，可能未渲染");
  if (
    buffer.toString("ascii", 0, 4) !== "RIFF" ||
    buffer.toString("ascii", 8, 12) !== "WEBP"
  )
    throw Error("Chrome 未返回 WebP");
  return {
    data: `data:image/webp;base64,${shot.data}`,
    bytes: buffer.length,
    title: page.title || "",
    url: page.url || "",
  };
}
async function main() {
  const sites = (await readJS(join(root, "src/catalog.js"))).SITE_DATA || [];
  const existing =
    (await readJS(join(root, "src/previews.generated.js"))).CAPTURED_PREVIEWS ||
    {};
  const selected = sites
    .filter(
      (s) =>
        (!selectedIds || selectedIds.has(s.id)) &&
        (!category || s.category === category) &&
        (!targetNames.length ||
          targetNames.some(
            (q) =>
              s.name.toLowerCase().includes(q) ||
              s.domain.toLowerCase().includes(q),
          )),
    )
    .sort((a, b) => a.rank - b.rank);
  const candidates = selected
    .filter((s) => on("force") || !existing[s.id])
    .slice(0, limit);
  const store = { ...existing };
  const fails = [];
  console.log(`\nSite Atlas Screenshot Capture`);
  console.log(
    `Catalog: ${sites.length}  |  Cached: ${Object.keys(store).length}  |  Queue: ${candidates.length}`,
  );
  console.log(
    `Format: WebP ${quality}% · ${fullPage ? "full page (up to 5000 px)" : "742×464"} · screenshot resources embedded directly into JS\n`,
  );
  if (!candidates.length && !probe) {
    console.log("没有待采集网站。使用 --force 可以覆盖原截图。");
    return;
  }
  const browser = await launchBrowser();
  console.log("Chrome:", browser.executable);
  let success = 0;
  let saving = Promise.resolve();
  function save() {
    saving = saving.then(async () => {
      const destination = join(root, "src/previews.generated.js");
      const temporary = destination + ".tmp";
      await writeFile(
        temporary,
        `/* Real website captures. Updated ${new Date().toISOString()}. */\nwindow.CAPTURED_PREVIEWS = ${JSON.stringify(store)};\n`,
      );
      await rename(temporary, destination);
    });
    return saving;
  }
  try {
    if (probe) {
      if (probe === "atlas" || probe === "atlas-check") {
        const tree = await browser.client.send("Page.getFrameTree");
        await browser.client.send("Emulation.setDeviceMetricsOverride", {
          width: 1440,
          height: 1040,
          deviceScaleFactor: 1,
          mobile: false,
        });
        const html = await readFile(
          join(root, "site-atlas-standalone.html"),
          "utf8",
        );
        await browser.client.send(
          "Page.setDocumentContent",
          { frameId: tree.frameTree.frame.id, html },
          18000,
        );
        await sleep(1600);
        const check = await browser.client.send("Runtime.evaluate", {
          expression:
            'JSON.stringify({title:document.title,cards:document.querySelectorAll(".site-card").length,rootSize:document.getElementById("root")?.innerHTML.length})',
          returnByValue: true,
        });
        console.log("Page smoke test:", check.result?.value);
        if (probe === "atlas-check") {
          const expr = `(()=>{const out={};document.querySelector('[data-nav="featured"]').click();out.featured=document.querySelectorAll('.site-card').length;document.querySelector('.site-card').click();out.drawer=!!document.querySelector('.drawer');document.querySelector('#layer [data-action="close"]').click();out.closed=!document.querySelector('.drawer');const q=document.getElementById('search-input');q.value='raycast';q.dispatchEvent(new Event('input',{bubbles:true}));out.filtered=document.querySelectorAll('.site-card').length;out.first=document.querySelector('.site-name')?.textContent;document.querySelector('[data-action="add"]').click();out.modal=!!document.getElementById('add-form');document.querySelector('#layer [data-action="close"]').click();out.modalClosed=!document.querySelector('.modal');return JSON.stringify(out)})()`;
          const result = await browser.client.send("Runtime.evaluate", {
            expression: expr,
            returnByValue: true,
          });
          console.log(
            "Interaction smoke test:",
            result.result?.value || result.exceptionDetails?.text,
          );
          return;
        }
        const image = await browser.client.send(
          "Page.captureScreenshot",
          {
            format: "webp",
            quality: 86,
            clip: { x: 0, y: 0, width: 1440, height: 1040, scale: 0.9 },
          },
          18000,
        );
        await writeFile(
          "/mnt/data/site-atlas-preview.webp",
          Buffer.from(image.data, "base64"),
        );
        console.log("Preview captured: /mnt/data/site-atlas-preview.webp");
        return;
      }
      if (probe === "internal") {
        const tree = await browser.client.send("Page.getFrameTree");
        await browser.client.send("Page.setDocumentContent", {
          frameId: tree.frameTree.frame.id,
          html: '<html><body style="margin:0;background:#121820;color:#e7ebff;font:52px Arial;padding:80px">Screenshot probe <div style="background:#746fff;width:420px;height:250px;border-radius:24px;margin-top:30px"></div></body></html>',
        });
        await sleep(500);
        const image = await browser.client.send("Page.captureScreenshot", {
          format: "webp",
          quality,
          clip: { x: 0, y: 0, width: 1280, height: 800, scale: 0.58 },
        });
        await writeFile(
          join(root, "tools/probe.webp"),
          Buffer.from(image.data, "base64"),
        );
        console.log("CDP WebP probe saved: tools/probe.webp");
        return;
      }
      const r = await capture(browser.client, probe);
      await writeFile(
        join(root, "tools/probe.webp"),
        Buffer.from(r.data.split(",")[1], "base64"),
      );
      console.log(
        `Probe saved: tools/probe.webp (${r.bytes} B), title=${r.title}`,
      );
      return;
    }
    let cursor = 0;
    let completed = 0;
    async function worker() {
      while (cursor < candidates.length) {
        const site = candidates[cursor++];
        let page;
        try {
          page = await browser.createPage();
          const shot = await capture(page.client, site.url);
          store[site.id] = shot.data;
          success++;
          console.log(
            `[${++completed}/${candidates.length}] ${site.name}: OK ${(shot.bytes / 1024).toFixed(0)} KB`,
          );
        } catch (error) {
          fails.push({
            site: site.name,
            url: site.url,
            error: String(error.message || error),
          });
          console.log(
            `[${++completed}/${candidates.length}] ${site.name}: ${error.message}`,
          );
        } finally {
          await page?.close();
        }
        if (completed % 10 === 0) await save();
      }
    }
    await Promise.all(Array.from({ length: concurrency }, worker));
    await save();
    await writeFile(
      join(root, "tools/capture-failures.json"),
      JSON.stringify(fails, null, 2),
    );
    const size = (
      Buffer.byteLength(JSON.stringify(store)) /
      1024 /
      1024
    ).toFixed(2);
    console.log(
      `\nComplete: ${success} added, ${fails.length} failed, ${Object.keys(store).length} total · previews.generated.js ≈ ${size} MB`,
    );
    if (fails.length) console.log("Failure log: tools/capture-failures.json");
    console.log(
      "Reload index.html: your screenshots now work fully offline.\n",
    );
  } finally {
    await browser.quit();
  }
}
main().catch((e) => {
  console.error("\nCapture failed:", e.message);
  process.exitCode = 1;
});
