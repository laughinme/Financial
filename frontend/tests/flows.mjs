import { expect } from "@playwright/test";
import { mockApi } from "./fixtures.mjs";
export async function checkFlows(browser, base, out, report) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const requests = await mockApi(context);
  await context.route("https://checkout.stripe.com/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<h1>Test checkout</h1>" }),
  );
  const page = await context.newPage();
  page.on("pageerror", (e) => report.errors.push(e.message));
  await page.goto(base + "/register");
  await page.getByLabel("Электронная почта").fill("test@example.com");
  await page.getByLabel("Пароль", { exact: true }).fill("example-password");
  await page.getByRole("button", { name: "Показать пароль" }).click();
  await expect(page.locator("#password")).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Создать аккаунт" }).click();
  await expect(page).toHaveURL(base + "/dashboard");
  await expect(page.getByText("Общая стоимость портфеля")).toBeVisible();
  expect(
    requests.some(
      (r) =>
        r.path.endsWith("/register") && r.body.password === "example-password",
    ),
  ).toBeTruthy();
  expect(await page.evaluate(() => Object.keys(localStorage).length)).toBe(0);
  await page.getByRole("button", { name: "6М", exact: true }).click();
  await expect
    .poll(
      () =>
        requests.filter((r) => r.path.endsWith("/portfolio-value")).at(-1)
          ?.search,
    )
    .toContain("days=180");
  await page.getByRole("button", { name: "Пополнить", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Сумма, USD").fill("100");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Пополнить", exact: true }),
  ).toBeFocused();
  await page.getByRole("link", { name: "Стратегии", exact: true }).click();
  await page.getByRole("button", { name: "Мои инвестиции" }).click();
  await expect(
    page.getByRole("heading", { name: "Momentum Alpha" }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Все стратегии" }).click();
  await page
    .getByRole("textbox", { name: "Поиск на странице" })
    .fill("Balanced");
  await expect(
    page.getByRole("heading", { name: "Balanced Growth" }),
  ).toBeVisible();
  await page.getByRole("heading", { name: "Balanced Growth" }).click();
  await expect(page).toHaveURL(base + "/portfolio/1");
  await page
    .getByRole("button", { name: "Инвестировать", exact: true })
    .click();
  await page.getByLabel("Сумма, USD").fill("125.50");
  await page.getByRole("button", { name: "Подтвердить", exact: true }).click();
  await expect(
    page.getByText("Заявка принята.", { exact: false }),
  ).toBeVisible();
  expect(requests.find((r) => r.path.endsWith("/invest"))?.body).toEqual({
    amount: 125.5,
  });
  await page.getByRole("button", { name: "Вывести паи" }).click();
  await page.getByLabel("Количество паёв").fill("1.25");
  await page.screenshot({ path: out + "redeem-dialog.png" });
  await page.getByRole("button", { name: "Подтвердить", exact: true }).click();
  await expect
    .poll(
      () => requests.filter((r) => r.path.endsWith("/withdraw")).at(-1)?.body,
    )
    .toEqual({ units: 1.25 });
  await page.goto(base + "/profile");
  await page.getByRole("button", { name: "Далее →" }).click();
  await expect(page.getByText("Страница 2")).toBeVisible();
  await expect
    .poll(
      () =>
        requests.filter((r) => r.path.endsWith("/transactions/")).at(-1)
          ?.search,
    )
    .toContain("page=2");
  await page.getByRole("button", { name: "Пополнить", exact: true }).click();
  await page.getByLabel("Сумма, USD").fill("200");
  await page.getByRole("button", { name: "Подтвердить", exact: true }).click();
  await expect(page).toHaveURL("https://checkout.stripe.com/test");
  expect(
    requests.find((r) => r.path === "/api/v1/payments/deposit")?.body,
  ).toMatchObject({
    amount: 200,
    success_url: base + "/profile",
    cancel_url: base + "/profile",
  });
  await page.goto(base + "/profile");
  await page.getByRole("button", { name: "Вывести", exact: true }).click();
  await page.getByLabel("Сумма, USD").fill("100");
  await page.getByRole("button", { name: "Подтвердить", exact: true }).click();
  await expect(page.getByText("Заявка на вывод принята")).toBeVisible();
  expect(
    requests.filter((r) => r.path === "/api/v1/payments/withdraw").at(-1)?.body,
  ).toEqual({ amount: 100 });
  await page.goto(base + "/admin");
  await page.getByRole("button", { name: "Пополнить", exact: true }).click();
  await page.getByRole("button", { name: "Подтвердить", exact: true }).click();
  await expect
    .poll(() => requests.some((r) => r.path.endsWith("/intent")))
    .toBeTruthy();
  await page.goto(base + "/main.html#/portfolio/1");
  await expect(page).toHaveURL(base + "/portfolio/1");
  await page.goto(base + "/profile");
  await page.getByRole("button", { name: "Выйти из аккаунта" }).click();
  await expect(page).toHaveURL(base + "/login");
  await page.getByLabel("Электронная почта").fill("admin@example.com");
  await page.getByLabel("Пароль", { exact: true }).fill("example-password");
  await page.getByRole("button", { name: "Войти", exact: true }).click();
  await expect(page).toHaveURL(base + "/admin");
  report.checks.push(
    "register, login, logout, filters, ranges, invest USD, redeem units, withdraw USD, pagination, admin, legacy redirect, dialog keyboard/focus",
  );
  await context.close();
}
