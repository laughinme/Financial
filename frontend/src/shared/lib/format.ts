export const money = (value: unknown, currency = "USD") =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
export const percent = (value: unknown) =>
  `${Number(value ?? 0).toLocaleString("ru-RU", { maximumFractionDigits: 2 })}%`;
export const date = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    timeZone: "Europe/Moscow",
  }).format(new Date(value));
export const tone = (value: unknown) =>
  Number(value) < 0 ? "text-loss" : "text-accent";
export const riskLabel = (risk: string | null) =>
  ({
    aggressive: "Высокий",
    moderate: "Умеренный",
    moderately_conservative: "Умеренно низкий",
    moderately_aggressive: "Умеренно высокий",
    very_aggressive: "Очень высокий",
    conservative: "Низкий",
  })[risk || ""] || "Не указан";
