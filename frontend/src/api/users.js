
import http from './http';

export const getMe = () => http.get('/api/v1/users/me/');

export const linkTelegram = (payload, replace = false) =>
  http.post(
    `/api/v1/users/me/auth_methods/telegram?replace_fields=${replace}`,
    payload,
  );
