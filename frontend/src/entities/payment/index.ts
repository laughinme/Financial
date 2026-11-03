import { get, post } from "@/shared/api/http";
export interface Transaction {
  id: string;
  created_at: string;
  type: string;
  amount: string;
  comment?: string | null;
}
export const getBalance = (signal?: AbortSignal) =>
  get<{ balance: string }>("/api/v1/payments/balance", signal);
export const listTransactions = (page = 1, size = 10, signal?: AbortSignal) =>
  get<Transaction[]>(`/api/v1/transactions/?size=${size}&page=${page}`, signal);
const returnUrl = () => `${window.location.origin}/profile`;
export const createDeposit = (amount: number) =>
  post<{ url: string }>("/api/v1/payments/deposit", {
    amount,
    currency: "USD",
    description: `Deposit $${amount}`,
    action: "deposit",
    action_id: "",
    success_url: returnUrl(),
    cancel_url: returnUrl(),
  });
export const createWithdraw = (amount: number) =>
  post("/api/v1/payments/withdraw", { amount });
export const getOnboardingLink = () =>
  post<{ url: string }>("/api/v1/users/me/stripe/connect/onboarding-link", {
    refresh_url: returnUrl(),
    return_url: returnUrl(),
  });

export const getCashflow = (days: number, signal?: AbortSignal) =>
  get<{ date: string; deposits: string; withdrawals: string }[]>(
    `/api/v1/users/me/cashflow?days=${days}`,
    signal,
  );
