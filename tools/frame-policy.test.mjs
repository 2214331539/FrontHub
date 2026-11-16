import test from "node:test";
import assert from "node:assert/strict";
import policy from "../src/frame-policy.js";

const record = {
  httpStatus: 200,
  finalUrl: "https://example.com",
  csp: "",
  xFrameOptions: "",
};
const status = (headers, parent = "http://localhost:4173") =>
  policy.evaluate({ ...record, ...headers }, parent).status;

test("unknown and failed audits remain unverified", () => {
  assert.equal(
    policy.evaluate(null, "http://localhost:4173").status,
    "unknown",
  );
  assert.equal(status({ httpStatus: 403 }), "unknown");
  assert.equal(status({ error: "timeout" }), "unknown");
});
test("no enforced framing headers permits an attempt", () =>
  assert.equal(status({}), "available"));
test("X-Frame-Options denies unrelated origins", () => {
  assert.equal(status({ xFrameOptions: "DENY" }), "blocked");
  assert.equal(status({ xFrameOptions: "SAMEORIGIN" }), "blocked");
  assert.equal(
    status({ xFrameOptions: "SAMEORIGIN" }, "https://example.com/dashboard"),
    "available",
  );
});
test("CSP limits each embedding ancestor, including opaque file origins", () => {
  assert.equal(
    status({ csp: "frame-ancestors 'self' https://cms.example.com" }),
    "blocked",
  );
  assert.equal(status({ csp: "frame-ancestors 'none'" }), "blocked");
  assert.equal(status({ csp: "frame-ancestors *" }), "available");
  assert.equal(
    status({ csp: "frame-ancestors *" }, "file:///dashboard.html"),
    "blocked",
  );
  assert.equal(
    status({ csp: "frame-ancestors http://localhost:4173" }),
    "available",
  );
  assert.equal(
    status({ csp: "frame-ancestors http://localhost:3333" }),
    "blocked",
  );
});
test("enforced CSP overrides legacy XFO but multiple policies all apply", () => {
  assert.equal(
    status({ csp: "frame-ancestors *", xFrameOptions: "DENY" }),
    "available",
  );
  assert.equal(
    status({ csp: "frame-ancestors *, frame-ancestors 'self'" }),
    "blocked",
  );
});
test("wildcard hosts and scheme sources match only the intended origins", () => {
  assert.equal(
    status(
      { csp: "frame-ancestors https://*.example.org" },
      "https://app.example.org",
    ),
    "available",
  );
  assert.equal(
    status(
      { csp: "frame-ancestors https://*.example.org" },
      "https://example.org",
    ),
    "blocked",
  );
  assert.equal(status({ csp: "frame-ancestors https:" }), "blocked");
  assert.equal(
    status({ csp: "frame-ancestors https:" }, "https://dashboard.example"),
    "available",
  );
});
