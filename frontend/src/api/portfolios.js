import http from "./http";

export const listPortfolios = (
  size = 5,
  page = 1,
  withCharts = false
) =>
  http.get(
    `/api/v1/portfolios/?size=${size}&page=${page}` +
      `&with_charts=${withCharts ? "true" : "false"}`
  );

export const getPortfolio = (id) =>
  http.get(`/api/v1/portfolios/${id}/`);

export const getHistory = (id, days = 30) =>
  http.get(`/api/v1/portfolios/${id}/history?days=${days}`);

export const invest = (id, amount) =>
  http.post(`/api/v1/portfolios/${id}/invest`, { amount });

export const withdraw = (id, units) =>
  http.post(`/api/v1/portfolios/${id}/withdraw`, { units });

export const getHolding = (id) =>
  http.get(`/api/v1/portfolios/${id}/user-holding`);
