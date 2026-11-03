import { expect } from "@playwright/test";
import { mockApi } from "./fixtures.mjs";
export async function checkStates(browser, base, out, report) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  let fail = true;
  await mockApi(context, {
    override: ({ path }) => {
      if (path.endsWith("/summary") && fail)
        return {
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({ detail: "Сервис временно недоступен" }),
        };
    },
  });
  const page = await context.newPage();
  page.on("pageerror", (e) => report.errors.push(e.message));
  await page.goto(base + "/dashboard");
  await expect(
    page.getByRole("alert").filter({ hasText: "Не удалось загрузить данные" }),
  ).toContainText("Сервис временно недоступен");
  await page.screenshot({ path: out + "390-error.png", fullPage: true });
  fail = false;
  await page.getByRole("button", { name: "Повторить загрузку" }).click();
  await expect(page.getByText("Общая стоимость портфеля")).toBeVisible();
  await page.getByRole("button", { name: "Пополнить", exact: true }).click();
  await page.screenshot({ path: out + "390-deposit-dialog.png" });
  await page.getByLabel("Сумма, USD").fill("-5");
  await page.getByRole("button", { name: "Подтвердить", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("link", { name: "Мой счёт", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("button", { name: "Выйти из аккаунта" }),
  ).toBeVisible();
  await context.route("**/api/v1/payments/withdraw", (route) =>
    route.fulfill({
      status: 412,
      contentType: "application/json",
      body: JSON.stringify({
        detail: "User must complete Stripe onboarding first",
      }),
    }),
  );
  await context.route("https://connect.stripe.com/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<h1>Test onboarding</h1>",
    }),
  );
  await page.getByRole("button", { name: "Вывести", exact: true }).click();
  await page.getByLabel("Сумма, USD").fill("100");
  await page.getByRole("button", { name: "Подтвердить", exact: true }).click();
  await expect(page).toHaveURL("https://connect.stripe.com/test");
  await context.close();
  const denied = await browser.newContext();
  await mockApi(denied, {
    override: ({ path }) =>
      path === "/api/v1/users/me/"
        ? { status: 401, contentType: "application/json", body: "{}" }
        : undefined,
  });
  const unauthorized = await denied.newPage();
  await unauthorized.goto(base + "/dashboard");
  await expect(unauthorized).toHaveURL(base + "/login");
  await denied.close();
  const empty = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  await mockApi(empty, {
    override: ({ path }) =>
      [
        "/api/v1/portfolios/",
        "/api/v1/dashboard/allocation",
        "/api/v1/dashboard/daily-pnl",
        "/api/v1/dashboard/portfolio-value",
        "/api/v1/transactions/",
      ].includes(path)
        ? { status: 200, contentType: "application/json", body: "[]" }
        : undefined,
  });
  const emptyPage = await empty.newPage();
  await emptyPage.goto(base + "/dashboard");
  await expect(
    emptyPage.getByText("Добавьте первую стратегию в портфель"),
  ).toBeVisible();
  await emptyPage.screenshot({ path: out + "390-empty.png", fullPage: true });
  await empty.close();
  report.checks.push(
    "mobile, reduced motion, error/retry, empty data, invalid amount, expired session",
  );
}
