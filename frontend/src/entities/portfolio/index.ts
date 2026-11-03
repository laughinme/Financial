import { get, post } from "@/shared/api/http";
export interface Point {
  date: string;
  [key: string]: string | number;
}
export interface Portfolio {
  id: number;
  name: string;
  description: string | null;
  broker: string;
  currency: string;
  risk: string | null;
  nav_price: string;
  balance: string;
  equity: string;
  drawdown: string;
  gain_percent: string;
  net_profit: string;
  deposit: string;
  holders: number;
  duration: number;
  invested_by_user: boolean;
  user_units: string | null;
  user_value: string | null;
  user_share: string | null;
  sparkline_gain?: Point[];
}
export interface History {
  balance_equity: Point[];
  drawdown: Point[];
  sparkline: Point[];
}
export const listPortfolios = (page = 1, size = 50, signal?: AbortSignal) =>
  get<Portfolio[]>(
    `/api/v1/portfolios/?size=${size}&page=${page}&with_charts=true`,
    signal,
  );
export const getPortfolio = (id: string, signal?: AbortSignal) =>
  get<Portfolio>(`/api/v1/portfolios/${encodeURIComponent(id)}/`, signal);
export const getHistory = (id: string, days: number, signal?: AbortSignal) =>
  get<History>(
    `/api/v1/portfolios/${encodeURIComponent(id)}/history?days=${days}`,
    signal,
  );
export const invest = (id: string, amount: number) =>
  post(`/api/v1/portfolios/${encodeURIComponent(id)}/invest`, { amount });
export const redeem = (id: string, units: number) =>
  post(`/api/v1/portfolios/${encodeURIComponent(id)}/withdraw`, { units });
