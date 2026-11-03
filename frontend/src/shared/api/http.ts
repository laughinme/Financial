export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    ...options,
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) {
    let message = "Сервис временно недоступен. Попробуйте ещё раз.";
    try {
      const body = await response.json();
      if (typeof body.detail === "string") message = body.detail;
      else if (Array.isArray(body.detail))
        message = body.detail.map((e: { msg: string }) => e.msg).join("; ");
    } catch {
      /* An upstream may return HTML rather than JSON. */
    }
    if (response.status === 401) message = "Сессия завершена. Войдите снова.";
    if (response.status === 403)
      message = "Недостаточно прав для этого действия.";
    throw new ApiError(response.status, message);
  }
  return response.status === 204 ? (null as T) : response.json();
}
export const get = <T>(path: string, signal?: AbortSignal) =>
  request<T>(path, { signal });
export const post = <T>(path: string, body?: unknown) =>
  request<T>(path, {
    method: "POST",
    body: body === undefined ? undefined : JSON.stringify(body),
  });
