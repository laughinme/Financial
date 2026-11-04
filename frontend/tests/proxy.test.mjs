import test from "node:test";
import assert from "node:assert/strict";
import { startProxyFixture } from "./proxy-fixture.mjs";
test(
  "Next.js forwards API slashes, query strings, cookies and mutations",
  { timeout: 60000 },
  async (t) => {
    const fixture = await startProxyFixture();
    t.after(fixture.close);
    const headers = { cookie: "session=proxy-test" };
    const response = await fetch(fixture.origin + "/api/v1/users/me/?probe=1", {
      headers,
      redirect: "manual",
    });
    assert.equal(
      response.status,
      200,
      "API paths must reach FastAPI without Next.js stripping their trailing slash",
    );
    assert.deepEqual(await response.json(), { id: "proxy-test-user" });
    assert.ok(
      response.headers.get("set-cookie").includes("session=refreshed-test"),
    );
    assert.equal(fixture.calls.at(-1).url, "/api/v1/users/me/?probe=1");
    assert.equal(fixture.calls.at(-1).cookie, "session=proxy-test");
    const redirected = await fetch(fixture.origin + "/api/v1/users/me", {
      headers,
    });
    assert.equal(
      redirected.status,
      200,
      "FastAPI's slash redirect must not create a redirect loop",
    );
    assert.equal(new URL(redirected.url).pathname, "/api/v1/users/me/");
    await redirected.text();
    const unauthorized = await fetch(fixture.origin + "/api/v1/users/me/", {
      redirect: "manual",
    });
    assert.equal(unauthorized.status, 401);
    await unauthorized.text();
    const submitted = await fetch(
      fixture.origin + "/api/v1/portfolios/1/invest",
      {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 12.5 }),
      },
    );
    assert.equal(submitted.status, 204);
    assert.equal(fixture.calls.at(-1).method, "POST");
    assert.deepEqual(JSON.parse(fixture.calls.at(-1).body), { amount: 12.5 });
  },
);
