import http from "./http";

export const listTransactions = (size = 10, page = 1) =>
  http.get(`/api/v1/transactions/?size=${size}&page=${page}`);

export const getTransaction = (id) =>
  http.get(`/api/v1/transactions/${id}/`);
