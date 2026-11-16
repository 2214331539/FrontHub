/** Inspect only catalog URLs. No page proxy, header rewriting, or arbitrary URL input. */
export function createPreviewInspector(sites, fetchPage = fetch) {
  const catalog = new Map(sites.map((site) => [site.id, site.url]));
  const cache = new Map();
  const pending = new Map();

  return async function inspect(id, refresh = false) {
    const url = catalog.get(id);
    if (!url) return null;
    const cached = cache.get(id);
    if (!refresh && cached && Date.now() - cached.time < 5 * 60_000)
      return cached.record;
    if (pending.has(id)) return pending.get(id);
    const work = (async () => {
      const record = { finalUrl: url, checkedAt: new Date().toISOString() };
      try {
        const response = await fetchPage(url, {
          signal: AbortSignal.timeout(8000),
          headers: {
            "User-Agent": "FrontHub-Preview-Check/2.0",
            "Cache-Control": "no-cache",
          },
          redirect: "follow",
        });
        Object.assign(record, {
          finalUrl: response.url || url,
          httpStatus: response.status,
          xFrameOptions: response.headers.get("x-frame-options") || "",
          csp: response.headers.get("content-security-policy") || "",
        });
        await response.body?.cancel();
      } catch (_) {
        record.error = "connection-failed";
      }
      // Do not keep transient network failures in the cache.
      if (!record.error && record.httpStatus < 400)
        cache.set(id, { time: Date.now(), record });
      else cache.delete(id);
      return record;
    })();
    pending.set(id, work);
    try {
      return await work;
    } finally {
      pending.delete(id);
    }
  };
}
