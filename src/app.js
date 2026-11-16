/* FrontHub — catalog, filtering, collections and notes. Preview lifecycle lives in preview.js. */
(function () {
  "use strict";
  const BASE = Array.isArray(window.SITE_DATA) ? window.SITE_DATA : [];
  const CAPTURED = window.CAPTURED_PREVIEWS || {};
  const newest = [...BASE].sort((a, b) =>
    (b.addedAt || "").localeCompare(a.addedAt || ""),
  )[0];
  const batchKey = (site) => site.batchId || site.addedAt || "";
  const latestBatch = newest ? batchKey(newest) : "";
  const latestDate = newest?.addedAt?.slice(0, 10) || "";
  const latestBatchIds = new Set(
    BASE.filter((site) => latestBatch && batchKey(site) === latestBatch).map(
      (site) => site.id,
    ),
  );
  const PREVIEW = window.FrontHubPreview;
  const CATEGORIES = [
    ...new Set([...BASE.map((site) => site.category), "其他"]),
  ];
  const KINDS = {
    homepage: "产品与机构官网",
    template: "页面模板",
    docs: "文档与组件",
    visualization: "图表与地图",
    app: "在线应用",
    experiment: "交互实验",
    collection: "资源集合",
  };
  const resourceKind = (site) =>
    Object.hasOwn(KINDS, site.kind) ? site.kind : "homepage";
  const sourceLabel = (site) =>
    site.source?.type === "website" ? "页面源码" : "项目仓库";
  const STYLES = [
    "极简",
    "暗色",
    "浅色",
    "精致",
    "专业",
    "产品演示",
    "编辑感",
    "黑白",
    "大胆",
    "大视觉",
    "AI",
    "动态",
    "实验性",
    "渐变",
    "活泼",
  ];
  const CAT_ICONS = {
    科研与知识管理: "book-open",
    "AI 与 Agent": "sparkles",
    开发者平台: "terminal",
    设计与创作: "palette",
    "企业 SaaS": "layers",
    教育与语言: "graduation",
    硬件与消费品牌: "cpu",
    独立产品与创业团队: "rocket",
    科技公司与创投: "building",
    设计灵感平台: "image",
    后台与管理模板: "grid",
    博客与作品集: "book-open",
    文档与组件库: "code",
    数据可视化与地图: "globe",
    在线工具与开源应用: "terminal",
    交互实验与游戏: "palette",
    文化与公共服务: "building",
    商业与生活方式: "layers",
  };
  const ROOT = document.getElementById("root");
  const STORE = "scientify-site-atlas-v1";
  function storage() {
    try {
      return JSON.parse(localStorage.getItem(STORE) || "{}");
    } catch (_) {
      return {};
    }
  }
  const persisted = storage();
  const saved = {
    favorites: new Set(persisted.favorites || []),
    notes: persisted.notes || {},
    custom: persisted.custom || [],
  };
  function save() {
    try {
      localStorage.setItem(
        STORE,
        JSON.stringify({
          favorites: [...saved.favorites],
          notes: saved.notes,
          custom: saved.custom,
        }),
      );
    } catch (_) {
      toast("浏览器禁止本地存储，当前更改可能无法保留");
    }
  }
  let all = [...BASE, ...saved.custom];
  const state = {
    nav: "all",
    category: "全部网站",
    style: "全部风格",
    kind: "all",
    sort: "featured",
    view: "grid",
    q: "",
    limit: 36,
    selected: null,
    modal: null,
    mobileSidebar: false,
  };
  const ICON = {
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01" stroke-width="3"/>',
    search: '<circle cx="10.8" cy="10.8" r="7.1"/><path d="m16 16 5 5"/>',
    bookmark:
      '<path d="M5.5 4.5A1.5 1.5 0 0 1 7 3h10a1.5 1.5 0 0 1 1.5 1.5V21L12 17l-6.5 4z"/>',
    globe:
      '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-13-2 16"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="M7 17 17 7M7 7h10v10"/>',
    external:
      '<path d="M13 5h6v6M19 5l-9 9"/><path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    chevron: '<path d="m9 18 6-6-6-6"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    upload:
      '<path d="M12 16V3m-5 5 5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/>',
    download:
      '<path d="M12 3v13m-5-5 5 5 5-5M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
    copy: '<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
    image:
      '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L4 21"/>',
    sparkles:
      '<path d="m12 3 1.8 5.5L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.5L12 3Zm7 12 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z"/>',
    "book-open":
      '<path d="M12 7c-3-3-6-3-9-2v14c3-1 6-1 9 2m0-14c3-3 6-3 9-2v14c-3-1-6-1-9 2m0-14v14"/>',
    terminal:
      '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m6 9 3 3-3 3m6 0h6"/>',
    palette:
      '<path d="M12 3a9 9 0 1 0 0 18h1a2 2 0 0 0 2-2c0-.8-.4-1.1-.4-1.9 0-1 .8-1.4 1.7-1.4H18a4 4 0 0 0 4-4C22 7 18 3 12 3Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="11" cy="7" r="1"/><circle cx="16" cy="8" r="1"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
    graduation:
      '<path d="m2 9 10-5 10 5-10 5-10-5Zm4 3v5c3.5 3 8.5 3 12 0v-5M22 9v8"/>',
    cpu: '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6" rx="1"/><path d="M9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4"/>',
    rocket:
      '<path d="M6 14c2-7 7-10 15-11 0 8-4 13-11 15l-4-4Zm0 0-3 7 7-3M14 6l4 4"/><circle cx="15.5" cy="8.5" r="1"/>',
    building:
      '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 21v-5h6v5M8 7h2m4 0h2M8 11h2m4 0h2"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    star: '<path d="m12 3 2.8 5.9 6.5.9-4.7 4.6 1.1 6.5-5.7-3-5.7 3 1.1-6.5-4.7-4.6 6.5-.9z"/>',
    filter: '<path d="M4 7h16M7 12h10m-7 5h4"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>',
    camera:
      '<path d="M3 7h4l2-3h6l2 3h4v13H3V7Z"/><circle cx="12" cy="13" r="3.5"/>',
  };
  function icon(name, cls = "") {
    return `<svg class="${cls}" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name] || ICON.globe}</svg>`;
  }
  function h(s) {
    return String(s ?? "").replace(
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
  }
  function attr(s) {
    return h(s);
  }
  function counts() {
    return {
      all: all.length,
      fav: saved.favorites.size,
      recent: latestBatchIds.size,
      shot: all.filter((s) => !!CAPTURED[s.id]).length,
      source: all.filter((s) => s.source?.url).length,
      pageSource: all.filter((s) => s.source?.type === "website").length,
      live: all.filter((s) => PREVIEW.status(s).status === "available").length,
    };
  }
  function sideLink(key, title, ico, n) {
    return `<button type="button" class="side-link ${state.nav === key ? "active" : ""}" data-nav="${attr(key)}">${icon(ico)}<span>${h(title)}</span>${typeof n === "number" ? `<span class="side-num">${n}</span>` : ""}</button>`;
  }
  function renderSidebar() {
    const c = counts();
    const byCat = Object.fromEntries(
      CATEGORIES.map((category) => [
        category,
        all.filter((site) => site.category === category).length,
      ]),
    );
    return `<div class="brand"><div class="brandmark" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24"><path d="M5 4h15v4H9v4h9v4H9v5H5z" fill="currentColor"/></svg></div><span class="brandword">FrontHub</span></div>
      <button class="mobile-close" data-action="close-menu" aria-label="关闭菜单">${icon("close")}</button>
      <div class="side-scroll"><div class="side-label">浏览</div>
      ${sideLink("all", "全部网站", "grid", c.all)}${c.recent ? sideLink("recent", "本次新增", "plus", c.recent) : ""}${sideLink("featured", "编辑精选", "star")}${sideLink("favorites", "我的收藏", "bookmark", c.fav)}${sideLink("live", "交互预览", "globe", c.live)}${sideLink("captured", "实拍图库", "camera", c.shot)}${sideLink("repositories", "公开仓库", "code", c.source)}${sideLink("opensource", "页面源码", "code", c.pageSource)}
      <div class="side-label">分类</div>
      ${CATEGORIES.filter((category) => byCat[category])
        .map((category) =>
          sideLink(
            "cat:" + category,
            category,
            CAT_ICONS[category] || "globe",
            byCat[category],
          ),
        )
        .join("")}
      <div class="side-label">管理</div>${sideLink("add", "收录网站", "plus")}${sideLink("guide", "使用说明", "info")}</div>
      <div class="sidebar-footer"><span class="footer-local-dot"></span><div><strong>个人资料库</strong><p>收藏与笔记保存在此浏览器</p></div></div>`;
  }
  function layout() {
    const c = counts();
    ROOT.innerHTML = `<div class="shell">
      <aside id="sidebar" class="sidebar">${renderSidebar()}</aside><div class="sidebar-scrim" data-action="close-menu"></div>
      <main class="main"><header class="topbar">
        <button class="mobile-menu" data-action="open-menu" aria-label="打开菜单">${icon("menu")}</button>
        <div class="breadcrumb"><span>资料库</span><span class="crumb-sep">/</span><strong id="crumb">全部网站</strong></div>
        <div class="top-actions"><button class="btn ghost hide-mobile" data-action="export">${icon("download")} 导出</button><button class="btn primary" data-action="add">${icon("plus")} 收录网站</button></div>
      </header><div class="content">
        <div class="heading-top"><div><h1 class="h1">网站参考<span class="heading-period">.</span></h1><p class="lead">官网、应用、模板与交互实验。</p></div>
          <div class="summary-pill"><div><span class="metric-num" id="m-total">${c.all}</span><span class="metric-label">收录网站</span></div><div><span class="metric-num" id="m-shots">${c.shot}</span><span class="metric-label">真实画面</span></div><div><span class="metric-num" id="m-source">${c.source}</span><span class="metric-label">仓库链接</span></div></div>
        </div>
        <div class="toolbar"><label class="search-wrap">${icon("search")}<input id="search-input" type="search" autocomplete="off" placeholder="搜索名称、类型、风格或网址" aria-label="搜索站点"/><kbd class="kbd">Ctrl K</kbd></label><span class="toolbar-sep"></span>
          <select id="kind-filter" class="sel" aria-label="选择资源类型"><option value="all">全部类型</option>${Object.entries(
            KINDS,
          )
            .map(
              ([key, label]) => `<option value="${key}">${h(label)}</option>`,
            )
            .join("")}</select>
          <span class="toolbar-sep"></span><select id="style-filter" class="sel" aria-label="选择设计风格"><option value="全部风格">全部风格</option>${STYLES.map((style) => `<option value="${h(style)}">${h(style)}</option>`).join("")}</select>
          <span class="toolbar-sep"></span><select id="sort-filter" class="sel" aria-label="排序方式"><option value="featured">精选优先</option><option value="recent">最近收录</option><option value="az">名称 A–Z</option><option value="category">按领域</option></select>
          <button class="iconbtn clear-filter" data-action="clear" title="重置筛选" aria-label="重置筛选">${icon("filter")}</button>
        </div>
        <div class="filter-area" id="filter-chips"></div>
        <div class="resultbar"><div class="result-heading"><h2 id="result-title">全部网站</h2><p id="result-info"></p></div><div class="result-actions">
          <button class="hover-toggle" data-action="toggle-hover" aria-pressed="${PREVIEW.hoverEnabled}" title="悬停预览区，自动打开可内嵌页面"><span class="toggle-track" aria-hidden="true"></span>自动预览</button>
          <div class="view-toggle"><button title="网格视图" aria-label="网格视图" data-action="view-grid" class="active">${icon("grid")}</button><button title="列表视图" aria-label="列表视图" data-action="view-list">${icon("list")}</button></div>
        </div></div>
        <div id="gallery" class="gallery"></div><div id="loadmore" class="loadmore"></div>
        <div class="below-note">${icon("info")}<span>悬停体验可内嵌的页面。点击卡片信息打开原站，点击右上角放大画面。</span></div>
        <footer class="footerline"><span>FrontHub</span><span>网站设计参考目录 · 2026</span></footer>
      </div></main></div><div id="layer"></div><div id="toast" role="status"></div><input id="import-input" type="file" accept="application/json,.json" hidden />`;
    renderChips();
    update(false);
  }
  function renderChips() {
    const chips = [
      ["all", "全部网站"],
      ["featured", "精选推荐"],
      ...CATEGORIES.filter((category) =>
        all.some((site) => site.category === category),
      ).map((category) => [category, category]),
    ];
    document.getElementById("filter-chips").innerHTML = chips
      .map(
        ([k, t]) =>
          `<button class="chip ${state.nav === (k === "all" ? "all" : k === "featured" ? "featured" : "cat:" + k) ? "active" : ""}" data-nav="${attr(k === "all" ? "all" : k === "featured" ? "featured" : "cat:" + k)}">${h(t)}</button>`,
      )
      .join("");
  }
  function filtered() {
    let list = [...all];
    if (state.nav === "favorites")
      list = list.filter((s) => saved.favorites.has(s.id));
    if (state.nav === "featured") list = list.filter((s) => s.featured);
    if (state.nav === "recent")
      list = list.filter((s) => latestBatchIds.has(s.id));
    if (state.nav === "captured") list = list.filter((s) => CAPTURED[s.id]);
    if (state.nav === "live")
      list = list.filter((s) => PREVIEW.status(s).status === "available");
    if (state.nav === "opensource")
      list = list.filter((s) => s.source?.type === "website");
    if (state.nav === "repositories") list = list.filter((s) => s.source?.url);
    if (state.kind !== "all")
      list = list.filter((s) => resourceKind(s) === state.kind);
    if (state.nav.startsWith("cat:"))
      list = list.filter((s) => s.category === state.nav.slice(4));
    if (state.style !== "全部风格")
      list = list.filter((s) => s.tags.includes(state.style));
    if (state.q) {
      const needle = state.q.toLocaleLowerCase();
      list = list.filter((s) =>
        [
          s.name,
          s.url,
          s.category,
          s.summary,
          s.tags.join(" "),
          KINDS[resourceKind(s)],
          s.source?.url || "",
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(needle),
      );
    }
    if (state.sort === "az")
      list.sort((a, b) => a.name.localeCompare(b.name, "zh"));
    else if (state.sort === "category")
      list.sort(
        (a, b) => a.category.localeCompare(b.category, "zh") || a.rank - b.rank,
      );
    else if (state.sort === "recent")
      list.sort(
        (a, b) =>
          (b.addedAt || "").localeCompare(a.addedAt || "") || a.rank - b.rank,
      );
    else list.sort((a, b) => a.rank - b.rank);
    return list;
  }
  function siteImg(site) {
    return CAPTURED[site.id] || "";
  }
  function card(s) {
    const favorite = saved.favorites.has(s.id);
    return `<article class="site-card" aria-label="${attr(s.name)} 页面参考">
    ${PREVIEW.markup(s)}
    <div class="card-info"><a class="card-link" href="${attr(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="访问 ${attr(s.name)} 官网">
      <div class="card-first"><span class="site-name">${h(s.name)}</span>${icon("arrow", "card-arrow")}</div>
      <div class="card-domain">${h(s.domain)}</div><div class="card-desc">${h(s.summary)}</div>
    </a><div class="card-meta"><div class="card-taxonomy"><span class="kind-tag">${h(KINDS[resourceKind(s)])}</span><span class="cat-tag">${h(s.category)}</span></div><div class="card-actions">
      ${s.source?.url ? `<a class="source-dot" href="${attr(s.source.url)}" target="_blank" rel="noopener noreferrer" title="${sourceLabel(s)}" aria-label="查看 ${attr(s.name)} ${sourceLabel(s)}">&lt;/&gt;</a>` : ""}
      <button type="button" class="card-details" data-open="${attr(s.id)}" aria-label="查看 ${attr(s.name)} 详情与笔记">详情</button>
      <button type="button" class="card-favorite ${favorite ? "active" : ""}" data-action="favorite" data-id="${attr(s.id)}" title="${favorite ? "取消收藏" : "收藏网站"}" aria-label="${favorite ? "取消收藏" : "收藏"} ${attr(s.name)}" aria-pressed="${favorite}">${icon("bookmark")}</button>
    </div></div></div></article>`;
  }
  function update(alsoNav = true) {
    PREVIEW.stop();
    const items = filtered();
    const visible = items.slice(0, state.limit);
    document.getElementById("gallery").className =
      "gallery " + (state.view === "list" ? "listmode" : "");
    document.getElementById("gallery").innerHTML = visible.length
      ? visible.map(card).join("")
      : `<div class="empty" style="grid-column:1/-1">${icon("search")}<h3>没有找到符合条件的网站</h3><p>尝试更换关键词、清除风格筛选，或自己添加一个好网站。</p><button class="btn primary" data-action="clear">清除筛选</button></div>`;
    document.getElementById("loadmore").innerHTML =
      items.length > visible.length
        ? `<button class="btn" data-action="load">显示更多网站 （还有 ${items.length - visible.length} 个） ${icon("down")}</button>`
        : "";
    const title =
      state.nav === "all"
        ? "全部网站"
        : state.nav === "featured"
          ? "编辑精选"
          : state.nav === "favorites"
            ? "我的收藏"
            : state.nav === "live"
              ? "交互预览"
              : state.nav === "captured"
                ? "实拍图库"
                : state.nav === "opensource"
                  ? "页面源码"
                  : state.nav === "repositories"
                    ? "公开仓库"
                    : state.nav.startsWith("cat:")
                      ? state.nav.slice(4)
                      : "探索网站";
    document.getElementById("result-title").textContent =
      state.nav === "recent" ? "本次新增" : title;
    document.getElementById("crumb").textContent =
      state.nav === "recent" ? "本次新增" : title;
    document.getElementById("result-info").textContent =
      `${items.length} 个页面 · 显示 ${visible.length} 个${state.nav === "recent" ? " · " + latestDate : ""}`;
    document
      .querySelectorAll(".view-toggle button")
      .forEach((b) =>
        b.classList.toggle("active", b.dataset.action === "view-" + state.view),
      );
    if (alsoNav) {
      document.getElementById("sidebar").innerHTML = renderSidebar();
      renderChips();
    }
    const c = counts();
    document.getElementById("m-total").textContent = c.all;
    document.getElementById("m-source").textContent = c.source;
    document.getElementById("m-shots").textContent = c.shot;
  }
  function navigate(nav) {
    state.mobileSidebar = false;
    if (nav === "add") {
      showModal("add");
      return;
    }
    if (nav === "guide") {
      showModal("guide");
      return;
    }
    state.nav = nav;
    state.limit = 36;
    document.getElementById("sidebar").classList.remove("show");
    update();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function drawer(s) {
    const real = !!CAPTURED[s.id],
      source = s.source?.type || "unknown",
      fav = saved.favorites.has(s.id);
    return `<div class="overlay" data-action="close"></div><aside class="drawer" role="dialog" aria-modal="true" aria-label="${attr(s.name)} 详情"><header class="drawer-header"><div class="small">网站详情</div><button class="close" data-action="close" aria-label="关闭">${icon("close")}</button></header><div class="drawer-content"><div class="drawer-preview">${real ? `<img src="${siteImg(s)}" alt="${attr(s.name)} 页面实拍截图"/>` : PREVIEW.placeholder(s)}<span class="preview-label ${real ? "real" : ""}">${real ? "页面截图" : "暂无实拍封面"}</span></div><h2 class="drawer-title">${h(s.name)}</h2><div class="drawer-domain">${h(s.url)}</div><div class="drawer-buttons"><a class="btn primary" href="${attr(s.url)}" target="_blank" rel="noopener noreferrer">访问原页 ${icon("external")}</a>${s.source?.url ? `<a class="btn" href="${attr(s.source.url)}" target="_blank" rel="noopener noreferrer">${sourceLabel(s)} ${icon("code")}</a>` : ""}<button class="btn" data-action="favorite" data-id="${attr(s.id)}">${icon("bookmark")} ${fav ? "已收藏" : "加入收藏"}</button><button class="btn" data-action="copy-url" data-id="${attr(s.id)}" title="复制页面地址">${icon("copy")}</button></div><div class="section-title">设计标签</div><p class="description">${h(s.summary)}。</p><div class="detail-pills">${s.tags.map((t) => `<span># ${h(t)}</span>`).join("")}</div><div class="section-title">参考信息</div><div class="detail-grid"><div class="detail-meta"><span>资源类型</span><strong>${h(KINDS[resourceKind(s)])}</strong></div><div class="detail-meta"><span>核查日期</span><strong>${h(s.reviewedAt || "—")}</strong></div><div class="detail-meta"><span>网站领域</span><strong>${h(s.category)}</strong></div><div class="detail-meta"><span>源码情况</span><strong>${source === "website" ? "页面源码已关联" : source === "product" ? "产品 / 库仓库（不代表当前页面源码）" : "— 未确认源码"}</strong></div><div class="detail-meta"><span>图片状态</span><strong>${real ? "已打包真实网站截图" : "尚未采集实拍封面"}</strong></div><div class="detail-meta"><span>资源入口</span><strong>${h(s.domain)}</strong></div></div><div class="section-title">我的笔记</div><textarea class="notes" id="site-notes" data-id="${attr(s.id)}" placeholder="记录值得学习的地方，例如首屏布局、字体、色彩、动效、产品截图表现方式…">${h(saved.notes[s.id] || "")}</textarea><div class="tiny-note">点评自动保存在当前浏览器，可通过「导出资料」备份。</div>${!real ? `<div class="section-title">获取真实截图</div><div class="capture-help">此网站尚未采集实拍封面，可先体验实时预览。项目目录运行 <code>npm run capture -- --only="${h(s.name)}"</code>，重新打开本页面即可离线显示真实截图。也可以运行 <code>npm run capture -- --all</code> 批量采集。</div>` : ""}</div></aside>`;
  }
  let returnFocus = null;
  function rememberFocus() {
    if (!document.getElementById("layer").contains(document.activeElement))
      returnFocus = document.activeElement;
  }
  function focusLayer() {
    document
      .querySelector("#layer button, #layer a, #layer input")
      ?.focus({ preventScroll: true });
  }
  function openSite(id) {
    rememberFocus();
    PREVIEW.stop();
    const s = all.find((x) => x.id === id);
    if (!s) return;
    state.selected = id;
    document.getElementById("layer").innerHTML = drawer(s);
    document.body.style.overflow = "hidden";
    focusLayer();
  }
  function expandPreview(id) {
    rememberFocus();
    const site = getSite(id);
    if (!site) return;
    PREVIEW.stop();
    state.modal = "preview";
    document.body.style.overflow = "hidden";
    document.getElementById("layer").innerHTML =
      `<div class="overlay" data-action="close"></div><section class="preview-dialog" role="dialog" aria-modal="true" aria-label="${attr(site.name)} 放大预览"><header><div><strong>${h(site.name)}</strong><span>桌面预览</span></div><div class="preview-dialog-actions"><a class="btn" href="${attr(site.url)}" target="_blank" rel="noopener noreferrer">访问原页 ${icon("external")}</a><button class="iconbtn" data-action="close" aria-label="关闭放大预览">${icon("close")}</button></div></header>${PREVIEW.markup(site, true)}<p class="preview-dialog-note">预览中的链接由原站处理。需要完整浏览或原站禁止内嵌时，请在新标签页访问。</p></section>`;
    focusLayer();
    PREVIEW.start(
      document.querySelector(".preview-dialog [data-preview-id]"),
      site,
      true,
    );
  }

  function close() {
    PREVIEW.stop();
    state.selected = null;
    state.modal = null;
    document.getElementById("layer").innerHTML = "";
    document.body.style.overflow = "";
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  }
  function showModal(type) {
    rememberFocus();
    PREVIEW.stop();
    state.modal = type;
    document.body.style.overflow = "hidden";
    let body = "";
    if (type === "add") {
      body = `<h3 class="modal-title">收录一个新网站</h3><p class="modal-sub">添加的网址和笔记保存在浏览器本地，无需账号。可通过 JSON 导出备份。</p><form id="add-form"><div class="field"><label>产品名称 *</label><input required maxlength="90" name="name" placeholder="例如 Linear" /></div><div class="field"><label>页面地址 *</label><input required name="url" type="url" placeholder="https://example.com" /></div><div class="field"><label>资源类型</label><select name="kind">${Object.entries(
        KINDS,
      )
        .map(([key, label]) => `<option value="${key}">${h(label)}</option>`)
        .join(
          "",
        )}</select></div><div class="field"><label>所属领域</label><select name="category">${CATEGORIES.map((x) => `<option>${h(x)}</option>`).join("")}</select></div><div class="field"><label>值得参考的特点</label><input name="summary" maxlength="100" placeholder="例如：极简布局、优秀产品演示" /></div><div class="modal-actions"><button type="button" class="btn" data-action="close">取消</button><button type="submit" class="btn primary">${icon("plus")} 确认收录</button></div></form>`;
    } else if (type === "guide") {
      body = `<h3 class="modal-title">如何采集真实官网截图？</h3><p class="modal-sub">项目无需外部前端依赖。截图由 Chromium 在本地批量采集并编入 JavaScript 文件，完成后完全离线展示。</p><div class="capture-help"><b>1. 进入项目目录</b><br><code>cd FrontHub</code><br><br><b>2. 采集首批 40 个官网</b><br><code>npm run capture -- --limit=40</code><br><br><b>3. 采集全部收录官网</b><br><code>npm run capture -- --all</code><br><br><b>4. 指定单一网站</b><br><code>npm run capture -- --only="Linear"</code><br><br>截图会保存在 <code>src/previews.generated.js</code> 中（WebP / Base64），不是外部 URL。刷新首页即可显示。网站如果限制访问或要求验证，可能采集失败；失败时保留待采集封面。</div><div class="modal-actions"><button class="btn primary" data-action="close">我知道了</button></div>`;
    } else if (type === "export") {
      body = `<h3 class="modal-title">导出你的设计资料库</h3><p class="modal-sub">根据使用场景选择不同格式。导出内容不含网站截图的体积较小，截图已随项目代码保存。</p><div style="display:grid;gap:10px"><button class="btn" data-action="export-json" style="justify-content:flex-start;padding:15px;height:auto">${icon("download")} 导出 JSON · 收藏、笔记和站点信息</button><button class="btn" data-action="export-csv" style="justify-content:flex-start;padding:15px;height:auto">${icon("download")} 导出 CSV · 导入飞书多维表格</button><button class="btn" data-action="import" style="justify-content:flex-start;padding:15px;height:auto">${icon("upload")} 导入之前导出的 JSON</button></div><div class="modal-actions"><button class="btn" data-action="close">关闭</button></div>`;
    }
    document.getElementById("layer").innerHTML =
      `<div class="overlay" data-action="close"></div><div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><div></div><button class="iconbtn" data-action="close" aria-label="关闭">${icon("close")}</button></div>${body}</div>`;
    focusLayer();
  }
  let timer;
  function toast(message) {
    const e = document.getElementById("toast");
    if (!e) return;
    e.innerHTML = `<div class="notice">${h(message)}</div>`;
    clearTimeout(timer);
    timer = setTimeout(() => (e.innerHTML = ""), 3200);
  }
  function getSite(id) {
    return all.find((s) => s.id === id);
  }
  function download(name, txt, type) {
    const b = new Blob([txt], { type });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(u), 3000);
  }
  function csvCell(v) {
    return '"' + String(v ?? "").replace(/"/g, '""') + '"';
  }
  function exportData(type) {
    if (type === "json") {
      download(
        "site-atlas-backup.json",
        JSON.stringify(
          {
            version: 1,
            exportedAt: new Date().toISOString(),
            sites: all,
            favorites: [...saved.favorites],
            notes: saved.notes,
            custom: saved.custom,
          },
          null,
          2,
        ),
        "application/json;charset=utf-8",
      );
    } else {
      const cols = [
        "名称",
        "官网",
        "行业",
        "设计风格",
        "参考描述",
        "源码类型",
        "资源类型",
        "源码地址",
        "收藏",
        "个人点评",
        "本地已缓存截图",
      ];
      const rows = all.map((s) => [
        s.name,
        s.url,
        s.category,
        s.tags.join("/"),
        s.summary,
        s.source?.url ? sourceLabel(s) : "未确认",
        KINDS[resourceKind(s)],
        s.source?.url || "",
        saved.favorites.has(s.id) ? "是" : "否",
        saved.notes[s.id] || "",
        CAPTURED[s.id] ? "是" : "否",
      ]);
      download(
        "site-atlas-feishu.csv",
        "\ufeff" +
          [cols, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n"),
        "text/csv;charset=utf-8",
      );
    }
    close();
    toast("文件已导出");
  }
  function addNew(form) {
    const fd = new FormData(form),
      name = String(fd.get("name") || "").trim(),
      raw = String(fd.get("url") || "").trim();
    let u;
    try {
      u = new URL(raw);
      if (!["https:", "http:"].includes(u.protocol)) throw Error("invalid");
    } catch (_) {
      toast("请输入有效的 https:// 网站地址");
      return;
    }
    if (!name) {
      toast("请输入产品名称");
      return;
    }
    if (
      all.some((s) => s.url.replace(/\/$/, "") === u.href.replace(/\/$/, ""))
    ) {
      toast("这个网站已经收录");
      return;
    }
    const id = "custom_" + Date.now().toString(36),
      s = {
        id,
        name,
        url: u.href,
        domain: u.hostname,
        category: String(fd.get("category")),
        kind: Object.hasOwn(KINDS, fd.get("kind"))
          ? String(fd.get("kind"))
          : "homepage",
        tags: ["产品演示"],
        summary: String(fd.get("summary") || "自定义收录网站"),
        source: { type: "unknown", url: "" },
        featured: false,
        addedAt: new Date().toISOString().slice(0, 10),
        rank: 100000 + saved.custom.length,
      };
    saved.custom.unshift(s);
    all = [...BASE, ...saved.custom];
    save();
    close();
    navigate("all");
    toast("已收录到你的本地网站库");
  }
  function importJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const o = JSON.parse(reader.result);
        if (!o || (!Array.isArray(o.custom) && !Array.isArray(o.sites)))
          throw Error("format");
        saved.custom = (
          o.custom ||
          o.sites.filter((x) => String(x.id).startsWith("custom_")) ||
          []
        ).filter((s) => s && s.id && s.name && /^https?:\/\//.test(s.url));
        saved.favorites = new Set(
          Array.isArray(o.favorites) ? o.favorites : [],
        );
        saved.notes = o.notes || {};
        all = [
          ...BASE,
          ...saved.custom.filter((s) => !BASE.some((b) => b.id === s.id)),
        ];
        save();
        close();
        layout();
        toast("已导入收藏、点评与自定义网站");
      } catch (e) {
        toast("文件格式无效，请使用本项目导出的 JSON");
      }
    };
    reader.readAsText(file);
  }
  async function copyUrl(id) {
    const s = getSite(id);
    if (!s) return;
    try {
      await navigator.clipboard.writeText(s.url);
      toast("官网链接已复制");
    } catch (e) {
      const t = document.createElement("textarea");
      t.value = s.url;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
      toast("官网链接已复制");
    }
  }
  ROOT.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    const nav = e.target.closest("[data-nav]");
    const open = e.target.closest("[data-open]");
    if (btn) {
      const act = btn.dataset.action,
        id = btn.dataset.id;
      if (act === "favorite") {
        e.preventDefault();
        e.stopPropagation();
        saved.favorites.has(id)
          ? saved.favorites.delete(id)
          : saved.favorites.add(id);
        save();
        if (state.selected === id) openSite(id);
        else if (state.nav === "favorites") update();
        else {
          const favorite = saved.favorites.has(id);
          btn.classList.toggle("active", favorite);
          btn.setAttribute("aria-pressed", String(favorite));
          btn.setAttribute(
            "aria-label",
            `${favorite ? "取消收藏" : "收藏"} ${getSite(id)?.name || ""}`,
          );
          btn.title = favorite ? "取消收藏" : "收藏网站";
          const count = document.querySelector(
            '[data-nav="favorites"] .side-num',
          );
          if (count) count.textContent = saved.favorites.size;
        }
        return;
      }
      if (act === "close") {
        close();
        return;
      }
      if (act === "toggle-hover") {
        const enabled = PREVIEW.toggleHover();
        btn.setAttribute("aria-pressed", String(enabled));
        btn.title = enabled
          ? "悬停预览区，自动打开可内嵌页面"
          : "自动预览已关闭，可手动打开页面预览";
        return;
      }
      if (act === "preview-expand") {
        expandPreview(id);
        return;
      }
      if (act === "add") {
        showModal("add");
        return;
      }
      if (act === "export") {
        showModal("export");
        return;
      }
      if (act === "export-json" || act === "export-csv") {
        exportData(act === "export-json" ? "json" : "csv");
        return;
      }
      if (act === "import") {
        document.getElementById("import-input").click();
        return;
      }
      if (act === "copy-url") {
        copyUrl(id);
        return;
      }
      if (act === "clear") {
        state.q = "";
        state.style = "全部风格";
        state.kind = "all";
        state.nav = "all";
        state.limit = 36;
        document.getElementById("search-input").value = "";
        document.getElementById("style-filter").value = "全部风格";
        document.getElementById("kind-filter").value = "all";
        update();
        return;
      }
      if (act === "load") {
        state.limit += 36;
        update(false);
        return;
      }
      if (act === "view-grid" || act === "view-list") {
        state.view = act.split("-")[1];
        update(false);
        return;
      }
      if (act === "open-menu") {
        document.getElementById("sidebar").classList.add("show");
        return;
      }
      if (act === "close-menu") {
        document.getElementById("sidebar").classList.remove("show");
        return;
      }
    }
    if (nav) {
      navigate(nav.dataset.nav);
      return;
    }
    if (open) {
      openSite(open.dataset.open);
      return;
    }
    const card = e.target.closest(".site-card");
    if (
      card &&
      !e.target.closest("a,button,input,select,textarea,[data-preview-id]")
    ) {
      card.querySelector(".card-link").click();
    }
  });

  ROOT.addEventListener("submit", (e) => {
    if (e.target.id === "add-form") {
      e.preventDefault();
      addNew(e.target);
    }
  });
  ROOT.addEventListener("input", (e) => {
    if (e.target.id === "search-input") {
      state.q = e.target.value.trim();
      state.limit = 36;
      update(false);
    }
    if (e.target.id === "site-notes") {
      saved.notes[e.target.dataset.id] = e.target.value;
      save();
    }
  });
  ROOT.addEventListener("change", (e) => {
    if (e.target.id === "kind-filter") {
      state.kind = e.target.value;
      state.limit = 36;
      update(false);
    }
    if (e.target.id === "style-filter") {
      state.style = e.target.value;
      state.limit = 36;
      update(false);
    }
    if (e.target.id === "sort-filter") {
      state.sort = e.target.value;
      update(false);
    }
    if (e.target.id === "import-input") {
      importJSON(e.target.files?.[0]);
      e.target.value = "";
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && document.querySelector('#layer [role="dialog"]')) {
      const controls = [
        ...document.querySelectorAll(
          "#layer a, #layer button, #layer input, #layer select, #layer textarea, #layer iframe",
        ),
      ].filter((el) => !el.disabled && el.getClientRects().length);
      const first = controls[0],
        last = controls.at(-1);
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          !document.getElementById("layer").contains(document.activeElement))
      ) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      close();
      const x = document.getElementById("search-input");
      x.focus();
      x.select();
    }
    if (e.key === "Escape") {
      close();
      document.getElementById("sidebar")?.classList.remove("show");
    }
  });
  PREVIEW.bind(ROOT, getSite);
  layout();
})();
