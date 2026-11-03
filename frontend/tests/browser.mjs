import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { mockApi } from "./fixtures.mjs";
import { checkFlows } from "./flows.mjs";
import { checkStates } from "./states.mjs";
const browser = await chromium.launch({ headless: true });
const base = process.env.TEST_BASE_URL || "http://localhost:4173";
const out = new URL("../../design/captures/", import.meta.url).pathname;
await mkdir(out, { recursive: true });
const report = { screenshots: [], errors: [], checks: [] };
try {
  for (const [width, height] of [
    [1440, 900],
    [1366, 768],
    [390, 844],
  ]) {
    const context = await browser.newContext({
      viewport: { width, height },
      reducedMotion: "reduce",
    });
    await mockApi(context);
    const page = await context.newPage();
    page.on("pageerror", (error) => report.errors.push(error.message));
    for (const path of [
      "/login",
      "/register",
      "/dashboard",
      "/portfolio",
      "/portfolio/1",
      "/profile",
      "/admin",
    ]) {
      await page.goto(base + path);
      await page
        .locator('[role="status"]')
        .filter({ hasText: "Загружаем" })
        .waitFor({ state: "hidden" })
        .catch(() => {});
      await page.waitForTimeout(300);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      if (overflow) throw new Error(`Horizontal overflow at ${width} ${path}`);
      const name = `${width}-${path.replaceAll("/", "-").slice(1)}.png`;
      await page.screenshot({ path: out + name, fullPage: true });
      report.screenshots.push(name);
    }
    await context.close();
  }
  await checkFlows(browser, base, out, report);
  await checkStates(browser, base, out, report);
  if (report.errors.length) throw new Error(report.errors.join("\n"));
  console.log(JSON.stringify(report, null, 2));
} finally {
  await writeFile(out + "report.json", JSON.stringify(report, null, 2));
  await browser.close();
}
