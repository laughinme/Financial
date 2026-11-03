import { get } from "@/shared/api/http";
type Point = { date: string; [key: string]: string | number };
export interface Summary {
  total_equity: string;
  total_pnl: string;
  today_pnl: string;
  num_portfolios: number;
}
export interface Allocation {
  id: number;
  name: string;
  percentage: string;
}
export const getSummary = (signal?: AbortSignal) =>
  get<Summary>("/api/v1/dashboard/summary", signal);
export const getAllocation = (signal?: AbortSignal) =>
  get<Allocation[]>("/api/v1/dashboard/allocation", signal);
export const getDailyPnl = (days: number, signal?: AbortSignal) =>
  get<Point[]>(`/api/v1/dashboard/daily-pnl?days=${days}`, signal);
export const getPortfolioValue = (days: number, signal?: AbortSignal) =>
  get<Point[]>(`/api/v1/dashboard/portfolio-value?days=${days}`, signal);
