import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { request, ApiError } from "../src/shared/api/http.ts";
import { money, percent, riskLabel } from "../src/shared/lib/format.ts";
test("API keeps cookies, supports 204 and preserves server errors", async () => {
  const previous = globalThis.fetch;
  try {
    let captured;
    globalThis.fetch = async (url, options) => {
      captured = { url, ...options };
      return new Response(null, { status: 204 });
    };
    assert.equal(await request("/api/test", { method: "POST" }), null);
    assert.equal(captured.credentials, "include");
    assert.equal(captured.cache, "no-store");
    globalThis.fetch = async () =>
      Response.json({ detail: "Insufficient funds" }, { status: 402 });
    await assert.rejects(
      request("/api/test"),
      (e) =>
        e instanceof ApiError &&
        e.status === 402 &&
        e.message === "Insufficient funds",
    );
    globalThis.fetch = async () =>
      new Response("upstream unavailable", { status: 502 });
    await assert.rejects(
      request("/api/test"),
      (e) => e.status === 502 && !e.message.includes("upstream"),
    );
  } finally {
    globalThis.fetch = previous;
  }
});
test("all backend risk levels and decimal amounts are represented", () => {
  for (const risk of [
    "conservative",
    "moderately_conservative",
    "moderately_aggressive",
    "aggressive",
    "very_aggressive",
  ])
    assert.notEqual(riskLabel(risk), "Не указан");
  assert.ok(money("1234.56").includes("1"));
  assert.equal(percent("-2.5"), "-2,5%");
});
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? files(`${dir}/${entry.name}`)
          : `${dir}/${entry.name}`,
      ),
    )
  ).flat();
}
test("FSD slices import only lower layers through public APIs", async () => {
  const layers = ["shared", "entities", "features", "widgets", "views"];
  for (const path of await files("src")) {
    if (!/\.tsx?$/.test(path)) continue;
    const [, layer, slice] = path.split("/");
    const source = await readFile(path, "utf8");
    for (const match of source.matchAll(/from ["']@\/([^"']+)["']/g)) {
      const [target, targetSlice, ...segments] = match[1].split("/");
      assert.ok(
        layers.indexOf(target) < layers.indexOf(layer) ||
          (target === layer && (layer === "shared" || slice === targetSlice)),
        `${path} imports ${match[1]}`,
      );
      if (target !== "shared" && target !== layer)
        assert.equal(segments.length, 0, `Private slice import in ${path}`);
    }
    assert.ok(
      !source.includes("localStorage.setItem"),
      `Browser credentials storage in ${path}`,
    );
  }
});
