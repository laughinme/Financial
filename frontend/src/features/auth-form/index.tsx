"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authenticate } from "@/entities/session";
import { Icon } from "@/shared/ui/icon";
export function AuthForm({
  mode,
  alternative,
}: {
  mode: "login" | "register";
  alternative: React.ReactNode;
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const registering = mode === "register";
  return (
    <div className="w-full max-w-sm">
      <p className="eyebrow mb-4">
        Financial Work / {registering ? "Новый аккаунт" : "Вход в систему"}
      </p>
      <h1 className="page-title mb-3">
        {registering ? "Начните с главного." : "С возвращением."}
      </h1>
      <p className="mb-9 text-sm leading-6 text-muted">
        {registering
          ? "Создайте аккаунт, чтобы изучать стратегии и управлять своим портфелем."
          : "Войдите, чтобы увидеть, как работают ваши инвестиции."}
      </p>
      <form
        className="space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();
          if (pending) return;
          const data = new FormData(event.currentTarget),
            email = String(data.get("email"));
          setPending(true);
          setError("");
          try {
            await authenticate(mode, email, String(data.get("password")));
            sessionStorage.setItem("financial-email", email);
            router.replace(
              email === "admin@example.com" ? "/admin" : "/dashboard",
            );
            router.refresh();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Ошибка входа");
          } finally {
            setPending(false);
          }
        }}
      >
        <div>
          <label className="label" htmlFor="email">
            Электронная почта
          </label>
          <input
            className="field"
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
            disabled={pending}
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Пароль
          </label>
          <div className="relative">
            <input
              className="field pr-14"
              id="password"
              name="password"
              type={visible ? "text" : "password"}
              autoComplete={registering ? "new-password" : "current-password"}
              minLength={registering ? 6 : undefined}
              required
              disabled={pending}
            />
            <button
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-muted"
              type="button"
              aria-label={visible ? "Скрыть пароль" : "Показать пароль"}
              aria-pressed={visible}
              onClick={() => setVisible(!visible)}
            >
              <Icon name="eye" />
            </button>
          </div>
          {registering && (
            <p className="mt-2 text-xs text-muted">Не менее 6 символов</p>
          )}
        </div>
        {error && (
          <p role="alert" className="text-sm text-loss">
            {error}
          </p>
        )}
        <button disabled={pending} className="button button-primary w-full">
          {pending ? "Подождите…" : registering ? "Создать аккаунт" : "Войти"}
          <Icon name="arrow" />
        </button>
      </form>
      <div className="my-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="eyebrow">или через Telegram</span>
        <span className="h-px flex-1 bg-line" />
      </div>
      {alternative}
      <p className="mt-8 text-sm text-muted">
        {registering ? "Уже есть аккаунт?" : "Ещё нет аккаунта?"}{" "}
        <Link
          className="ml-1 text-ink underline underline-offset-4"
          href={registering ? "/login" : "/register"}
        >
          {registering ? "Войти" : "Регистрация"}
        </Link>
      </p>
    </div>
  );
}
