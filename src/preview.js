/* One active original website. Covers remain available during checks and failures. */
(function () {
  "use strict";
  const escape = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const policies = window.EMBED_POLICIES || {};
  const screenshots = window.CAPTURED_PREVIEWS || {};
  const failedSites = new Set();
  const brokenImages = new Set();
  const preferenceKey = "fronthub-hover-preview";
  const symbols = {
    open: '<path d="M5 15 15 5M5 5h10v10"/>',
    expand: '<path d="M7 3H3v4m10-4h4v4M3 13v4h4m10-4v4h-4"/>',
    reload: '<path d="M16 6a7 7 0 1 0 1 7M16 2v5h-5"/>',
  };
  const glyph = (name) =>
    `<svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${symbols[name]}</svg>`;
  let hoverEnabled = true;
  try {
    hoverEnabled = localStorage.getItem(preferenceKey) !== "off";
  } catch (_) {}
  let active = null;
  let hoverTimer;
  let resizeObserver;

  function status(site) {
    return window.FrontHubFramePolicy.evaluate(
      policies[site.id],
      location.href,
    );
  }
  function placeholder(site) {
    return `<div class="preview-placeholder"><span class="placeholder-caption">${escape(site.category || "网站参考")}</span><strong>${escape(site.name)}</strong><span class="placeholder-message">暂时没有可用画面</span><span class="placeholder-link">访问原页 ${glyph("open")}</span></div>`;
  }
  function idleLabel(site) {
    if (failedSites.has(site.id)) return "已恢复封面";
    if (status(site).status === "blocked")
      return screenshots[site.id] ? "原页截图" : "原页限制预览";
    return status(site).status === "available" ? "支持尝试交互" : "未验证交互";
  }
  function markup(site, expanded = false) {
    const check = status(site);
    const image = !brokenImages.has(site.id) && screenshots[site.id];
    return `<div class="preview ${expanded ? "preview-expanded" : ""}" data-preview-id="${escape(site.id)}" data-preview-state="idle" data-embed-status="${check.status}">
      <div class="preview-browser"><span class="browser-address">${escape(site.domain)}</span><div class="preview-browser-actions">
        <button type="button" data-preview-action="stop" class="preview-stop" aria-label="停止原页预览">返回封面</button>
        ${!expanded ? `<button type="button" data-action="preview-expand" data-id="${escape(site.id)}" title="放大预览" aria-label="放大 ${escape(site.name)} 原页预览">${glyph("expand")}</button>` : ""}
        <a href="${escape(site.url)}" target="_blank" rel="noopener noreferrer" title="访问原页" aria-label="打开 ${escape(site.name)} 原页">${glyph("open")}</a>
      </div></div>
      <div class="preview-viewport">
        <a class="preview-fallback" href="${escape(site.url)}" target="_blank" rel="noopener noreferrer" aria-label="访问 ${escape(site.name)} 原页">${image ? `<img class="preview-screenshot" loading="lazy" decoding="async" src="${image}" alt="${escape(site.name)} 原页截图"/>` : placeholder(site)}</a>
        <div class="preview-frame-host"></div>
        <div class="preview-cover" aria-hidden="true"><span>${check.status === "blocked" ? "点击访问原页" : "悬停浏览 · 点击访问"}</span></div>
        <div class="preview-loading" role="status"><span class="preview-spinner"></span><span class="loading-text">正在检查网站…</span></div>
      </div>
      <div class="preview-toolbar"><span class="preview-status" aria-live="polite">${idleLabel(site)}</span><div class="preview-tools">
        <button type="button" data-preview-action="report" class="preview-report">显示异常</button>
        <button type="button" data-preview-action="start">${check.status === "blocked" ? "重新检测" : "交互预览"}</button>
      </div></div>
      <div class="preview-notice" hidden><span></span><a href="${escape(site.url)}" target="_blank" rel="noopener noreferrer">访问原页 ${glyph("open")}</a></div>
    </div>`;
  }
  function setStatus(container, text) {
    container.querySelector(".preview-status").textContent = text;
  }
  function stop() {
    clearTimeout(hoverTimer);
    if (!active) return;
    const { container, timer, controller, site } = active;
    active = null;
    clearTimeout(timer);
    controller.abort();
    resizeObserver?.disconnect();
    container.querySelector(".preview-frame-host").replaceChildren();
    container.dataset.previewState = "idle";
    container.querySelector(".preview-notice").hidden = true;
    setStatus(container, idleLabel(site));
  }
  function fail(session, message) {
    if (active !== session) return;
    failedSites.add(session.site.id);
    stop();
    const { container } = session;
    container.dataset.previewState = "failed";
    setStatus(container, "封面浏览");
    container.querySelector('[data-preview-action="start"]').textContent =
      "重试预览";
    const notice = container.querySelector(".preview-notice");
    notice.querySelector("span").textContent = message;
    notice.hidden = false;
  }
  function resize() {
    if (!active?.frame) return;
    const viewport = active.container.querySelector(".preview-viewport");
    const width = active.container.classList.contains("preview-expanded")
      ? 1440
      : 1280;
    const scale = Math.max(1, viewport.clientWidth) / width;
    Object.assign(active.frame.style, {
      width: `${width}px`,
      height: `${Math.ceil(viewport.clientHeight / scale)}px`,
      transform: `scale(${scale})`,
    });
  }
  async function checkCurrent(site, session, force) {
    if (!["http:", "https:"].includes(location.protocol)) return null;
    try {
      const response = await fetch(
        `/api/preview-status?id=${encodeURIComponent(site.id)}${force ? "&refresh=1" : ""}`,
        { cache: "no-store", signal: session.controller.signal },
      );
      if (
        !response.ok ||
        !response.headers.get("content-type")?.includes("application/json")
      )
        return null;
      const { record } = await response.json();
      if (record && active === session) policies[site.id] = record;
      return record;
    } catch (_) {
      return null;
    }
  }
  async function start(container, site, explicit = false) {
    if (!container?.isConnected || !site || active?.container === container)
      return;
    const original = status(site);
    // Unverified or previously failed pages require a deliberate click; hovering never replaces a cover with them.
    if (
      !explicit &&
      (original.status !== "available" ||
        failedSites.has(site.id) ||
        document.querySelector("#layer .overlay"))
    )
      return;
    stop();
    if (explicit) failedSites.delete(site.id);
    const session = {
      container,
      site,
      explicit,
      controller: new AbortController(),
      frame: null,
      timer: null,
    };
    active = session;
    container.dataset.previewState = "checking";
    container.querySelector(".loading-text").textContent = "正在检查网站…";
    container.querySelector(".preview-notice").hidden = true;
    setStatus(container, "检查网站状态");
    session.timer = setTimeout(
      () => fail(session, "网站响应较慢，已保留封面。"),
      24000,
    );
    const record = await checkCurrent(site, session, explicit);
    if (active !== session || !container.isConnected) return;
    const checked = status(site);
    container.dataset.embedStatus = checked.status;
    if (record?.error || record?.httpStatus >= 400) {
      fail(session, "原页当前无法连接或要求验证。");
      return;
    }
    if (checked.status === "blocked") {
      fail(session, "原页限制内嵌，请在新标签页浏览。");
      return;
    }
    const frame = document.createElement("iframe");
    session.frame = frame;
    frame.title = `${site.name} 原页互动预览`;
    frame.setAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox",
    );
    frame.referrerPolicy = "strict-origin-when-cross-origin";
    frame.src = record?.finalUrl || site.url;
    container.dataset.previewState = "loading";
    container.querySelector(".loading-text").textContent = "正在打开原页…";
    setStatus(container, "加载网页");
    frame.addEventListener("load", () => {
      if (active !== session) return;
      clearTimeout(session.timer);
      container.dataset.previewState = "live";
      setStatus(container, "网页视图");
      // Cross-origin rendering cannot be inspected. Keep a visible recovery control instead of claiming success.
    });
    frame.addEventListener("error", () =>
      fail(session, "网页未能打开，已恢复封面。"),
    );
    container.querySelector(".preview-frame-host").append(frame);
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container.querySelector(".preview-viewport"));
    resize();
  }
  function bind(root, getSite) {
    root.addEventListener("pointerover", (event) => {
      const container = event.target.closest("[data-preview-id]");
      if (!container || container.contains(event.relatedTarget)) return;
      clearTimeout(hoverTimer);
      if (
        !hoverEnabled ||
        !matchMedia("(hover:hover) and (pointer:fine)").matches ||
        container.closest(".listmode")
      )
        return;
      hoverTimer = setTimeout(
        () => start(container, getSite(container.dataset.previewId)),
        650,
      );
    });
    root.addEventListener("pointerout", (event) => {
      const container = event.target.closest("[data-preview-id]");
      if (!container || container.contains(event.relatedTarget)) return;
      clearTimeout(hoverTimer);
      if (
        active?.container === container &&
        !active.explicit &&
        container.dataset.previewState === "checking"
      )
        stop();
    });
    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-preview-action]");
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      const container = button.closest("[data-preview-id]");
      const site = getSite(container.dataset.previewId);
      if (button.dataset.previewAction === "start")
        start(container, site, true);
      else if (
        button.dataset.previewAction === "report" &&
        active?.container === container
      )
        fail(active, "已恢复封面。可重试，或直接访问原页。");
      else {
        failedSites.add(site.id);
        stop();
      }
    });
    root.addEventListener(
      "error",
      (event) => {
        if (!event.target.matches?.(".preview-screenshot")) return;
        const container = event.target.closest("[data-preview-id]");
        const site = getSite(container.dataset.previewId);
        if (!site) return;
        brokenImages.add(site.id);
        container.querySelector(".preview-fallback").innerHTML =
          placeholder(site);
        setStatus(container, "封面暂不可用");
      },
      true,
    );
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
    });
    window.addEventListener(
      "scroll",
      () => {
        if (!active) return;
        const rect = active.container.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > innerHeight) stop();
      },
      { passive: true },
    );
  }
  function toggleHover() {
    hoverEnabled = !hoverEnabled;
    try {
      localStorage.setItem(preferenceKey, hoverEnabled ? "on" : "off");
    } catch (_) {}
    if (!hoverEnabled) stop();
    return hoverEnabled;
  }
  window.FrontHubPreview = {
    markup,
    status,
    placeholder,
    bind,
    start,
    stop,
    toggleHover,
    get hoverEnabled() {
      return hoverEnabled;
    },
  };
})();
