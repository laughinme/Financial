import { get, post } from "@/shared/api/http";
export interface Settlement {
  portfolio_id: number;
  name: string;
  delta: string;
  orders: {
    id: string;
    user_id: string;
    amount: string;
    direction: string;
    status: string;
    created_at: string;
  }[];
}
export const listSettlements = (signal?: AbortSignal) =>
  get<Settlement[]>("/api/v1/admins/settlements?orders_quantity=5", signal);
export const createIntent = (id: number) => post(`/api/v1/admins/${id}/intent`);
