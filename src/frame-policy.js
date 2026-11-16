/* Shared by the browser and the header audit. Headers are a hint, not a load guarantee. */
(function (root) {
  "use strict";
  function matches(source, parent, target) {
    if (source === "'self'")
      return parent.origin !== "null" && parent.origin === target.origin;
    if (source === "*") return ["http:", "https:"].includes(parent.protocol);
    if (/^[a-z]+:$/.test(source)) return parent.protocol === source;
    if (source.startsWith("'")) return false;
    try {
      const url = new URL(
        source.includes("://") ? source : `${target.protocol}//${source}`,
      );
      const host = url.hostname.toLowerCase();
      const sameHost =
        host === parent.hostname ||
        (host.startsWith("*.") && parent.hostname.endsWith(host.slice(1)));
      return (
        sameHost && url.protocol === parent.protocol && url.port === parent.port
      );
    } catch (_) {
      return false;
    }
  }
  function evaluate(record, parentUrl) {
    if (
      !record ||
      record.error ||
      record.httpStatus < 200 ||
      record.httpStatus >= 400
    )
      return { status: "unknown", reason: "尚未确认是否支持内嵌，可尝试预览" };
    let parent, target;
    try {
      parent = new URL(parentUrl);
      target = new URL(record.finalUrl);
    } catch (_) {
      return { status: "unknown", reason: "尚未检查嵌入权限" };
    }
    const policies = [
      ...(record.csp || "").matchAll(
        /(?:^|[;,])\s*frame-ancestors(?:\s+([^;,]*))?/gi,
      ),
    ];
    // Enforced frame-ancestors takes precedence over X-Frame-Options.
    if (policies.length) {
      if (
        policies.some(
          (match) =>
            !(match[1] || "")
              .trim()
              .split(/\s+/)
              .some((source) => matches(source, parent, target)),
        )
      )
        return { status: "blocked", reason: "该官网限制在其他网站内嵌展示" };
    } else {
      const xfo = (record.xFrameOptions || "").toUpperCase();
      if (
        /(?:^|[,\s])DENY(?:$|[,\s])/.test(xfo) ||
        (/SAMEORIGIN/.test(xfo) && parent.origin !== target.origin)
      )
        return { status: "blocked", reason: "该官网限制在其他网站内嵌展示" };
    }
    return {
      status: "available",
      reason: "响应头未发现嵌入限制，实际加载以浏览器为准",
    };
  }
  const api = { evaluate };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.FrontHubFramePolicy = api;
})(globalThis);
