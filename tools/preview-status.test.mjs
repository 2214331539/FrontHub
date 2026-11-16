import test from "node:test";
import assert from "node:assert/strict";
import { createPreviewInspector } from "./preview-status.mjs";

const sites = [{ id: "example", url: "https://example.com" }];
test("only catalog URLs can trigger a request", async () => {
  let calls = 0;
  const inspect = createPreviewInspector(sites, async () => {
    calls++;
    return new Response("", { status: 200 });
  });
  assert.equal(await inspect("https://localhost/private"), null);
  assert.equal(calls, 0);
});
test("fresh checks replace cached policy and do not retain network failures", async () => {
  let calls = 0;
  const inspect = createPreviewInspector(sites, async () => {
    calls++;
    if (calls === 3) throw new Error("offline");
    return new Response("", {
      status: 200,
      headers: calls === 2 ? { "X-Frame-Options": "DENY" } : {},
    });
  });
  assert.equal((await inspect("example")).xFrameOptions, "");
  await inspect("example");
  assert.equal(calls, 1);
  assert.equal((await inspect("example", true)).xFrameOptions, "DENY");
  assert.equal((await inspect("example", true)).error, "connection-failed");
  assert.equal((await inspect("example")).httpStatus, 200);
  assert.equal(calls, 4);
});
test("simultaneous checks share one request and retain HTTP failures for the UI", async () => {
  let calls = 0;
  const inspect = createPreviewInspector(sites, async () => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 10));
    return new Response("blocked", { status: 403 });
  });
  const results = await Promise.all([inspect("example"), inspect("example")]);
  assert.equal(calls, 1);
  assert.equal(results[0].httpStatus, 403);
  await inspect("example");
  assert.equal(calls, 2);
});
