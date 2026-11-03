export const user = {
  id: "58db2c78-55ed-4e56-b2e7-b2d1a8db4432",
  display_name: "Александр",
  banned: false,
};
export const portfolios = [
  {
    id: 1,
    name: "Balanced Growth",
    broker: "IC Markets",
    currency: "USD",
    risk: "moderately_conservative",
    equity: "184250.30",
    nav_price: "12.45",
    drawdown: "4.2",
    gain_percent: "24.6",
    duration: 365,
    holders: 48,
    invested_by_user: true,
    user_units: "150.5",
    user_value: "1873.73",
    description:
      "Сбалансированная стратегия.\nКонтроль риска и диверсификация.",
  },
  {
    id: 2,
    name: "Momentum Alpha",
    broker: "RoboForex",
    currency: "USD",
    risk: "aggressive",
    equity: "96200",
    nav_price: "8.32",
    drawdown: "12.4",
    gain_percent: "38.2",
    duration: 240,
    holders: 26,
    invested_by_user: false,
    user_units: "0",
    user_value: "0",
    description: "Активная торговая стратегия.",
  },
  {
    id: 3,
    name: "Capital Reserve",
    broker: "IC Markets",
    currency: "USD",
    risk: "conservative",
    equity: "312800",
    nav_price: "10.72",
    drawdown: "2.1",
    gain_percent: "8.6",
    duration: 720,
    holders: 104,
    invested_by_user: false,
    user_units: "0",
    user_value: "0",
    description: "Консервативный подход.",
  },
];
export const history = Array.from({ length: 32 }, (_, i) => ({
  date: `2026-10-${String(Math.min(31, i + 1)).padStart(2, "0")}`,
  equity: 12500 + i * 110 + Math.sin(i * 1.8) * 210,
  balance: 12400 + i * 92,
  pnl: Math.sin(i * 1.6) * 125,
  drawdown: -Math.abs(Math.sin(i * 0.4) * 4.2),
  gain_percent: 10 + i * 0.4 + Math.sin(i),
}));
export const transactions = Array.from({ length: 14 }, (_, i) => ({
  id: String(i),
  created_at: `2026-10-${String(30 - i).padStart(2, "0")}T12:00:00Z`,
  type: i % 3 ? "deposit" : "withdraw",
  amount: i % 3 ? "500" : "-250",
  comment: i % 3 ? "Пополнение счёта" : "Вывод средств",
}));
export async function mockApi(context, options = {}) {
  const requests = [];
  await context.route("https://telegram.org/**", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: 'document.currentScript?.parentElement?.insertAdjacentHTML("beforeend", "<span>Telegram</span>");',
    }),
  );
  await context.route("**/api/v1/**", async (route) => {
    const request = route.request(),
      url = new URL(request.url()),
      path = url.pathname;
    const body = request.postDataJSON();
    requests.push({ path, method: request.method(), body, search: url.search });
    if (options.override) {
      const result = await options.override({ path, request, url, body });
      if (result) return route.fulfill(result);
    }
    let data;
    if (path === "/api/v1/users/me/") data = user;
    else if (/auth\/(login|register)$/.test(path)) data = user;
    else if (path.endsWith("/logout")) return route.fulfill({ status: 204 });
    else if (path.endsWith("/summary"))
      data = {
        total_equity: "15842.75",
        total_pnl: "2342.75",
        today_pnl: "124.30",
        num_portfolios: 2,
      };
    else if (path.endsWith("/cashflow"))
      data = history.map((p, i) => ({
        date: p.date,
        deposits: i % 4 ? "0" : "500",
        withdrawals: i % 7 ? "0" : "-250",
      }));
    else if (path.endsWith("/balance")) data = { balance: "4250.50" };
    else if (path.endsWith("/allocation"))
      data = [
        { id: 1, name: "Balanced Growth", percentage: "64" },
        { id: 2, name: "Momentum Alpha", percentage: "36" },
      ];
    else if (path.endsWith("/portfolio-value") || path.endsWith("/daily-pnl"))
      data = history;
    else if (path === "/api/v1/portfolios/") data = portfolios;
    else if (/portfolios\/\d+\/$/.test(path))
      data = portfolios.find((p) => path.includes(`/${p.id}/`));
    else if (path.endsWith("/history"))
      data = { balance_equity: history, drawdown: history, sparkline: history };
    else if (path.endsWith("/transactions/")) {
      const offset =
        (Number(url.searchParams.get("page")) - 1) *
        Number(url.searchParams.get("size"));
      data = transactions.slice(
        offset,
        offset + Number(url.searchParams.get("size")),
      );
    } else if (path.endsWith("/settlements"))
      data = [
        {
          portfolio_id: 1,
          name: portfolios[0].name,
          delta: "1500",
          orders: [
            {
              id: "1",
              user_id: user.id,
              amount: "1500",
              direction: "invest",
              status: "pending",
              created_at: "2026-10-30",
            },
          ],
        },
      ];
    else if (path.endsWith("/deposit"))
      data = { url: "https://checkout.stripe.com/test" };
    else if (path.endsWith("/onboarding-link"))
      data = { url: "https://connect.stripe.com/test" };
    else if (request.method() === "POST") return route.fulfill({ status: 204 });
    else throw new Error(`Unexpected API request ${path}`);
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(data),
    });
  });
  return requests;
}
