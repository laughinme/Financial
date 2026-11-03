"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { getMe, logout } from "@/entities/session";
import { useRemote } from "@/shared/lib/use-remote";
import { Icon } from "@/shared/ui/icon";
import { RemoteState } from "@/shared/ui/states";
const navigation = [
  { href: "/dashboard", label: "Обзор", icon: "overview" },
  { href: "/portfolio", label: "Стратегии", icon: "portfolio" },
  { href: "/profile", label: "Мой счёт", icon: "profile" },
] as const;
export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(),
    router = useRouter();
  const session = useRemote(getMe);
  const [signingOut, setSigningOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const name =
    session.data?.display_name || session.data?.first_name || "Инвестор";
  return (
    <div className="min-h-screen lg:flex">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:p-3 focus:text-black"
      >
        К содержимому
      </a>
      <aside className="flex flex-col border-b border-line bg-canvas lg:fixed lg:inset-y-0 lg:w-60 lg:border-r lg:border-b-0 xl:w-64">
        <Link
          href="/dashboard"
          aria-label="Financial Work — обзор"
          className="flex items-center gap-3 px-5 py-6 lg:px-7 lg:py-9"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-accent text-black">
            <Icon name="activity" className="h-5 w-5" />
          </span>
          <span className="text-sm font-bold tracking-[.04em]">
            FINANCIAL<span className="text-accent"> WORK</span>
          </span>
        </Link>
        <p className="eyebrow hidden px-8 pb-4 pt-4 lg:block">
          Рабочее пространство
        </p>
        <nav
          aria-label="Основная навигация"
          className="flex gap-1 px-3 pb-3 lg:flex-col lg:px-4"
        >
          {navigation.map((item) => {
            const active = path.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-sm border px-3 text-xs transition-colors lg:justify-start lg:gap-3 lg:text-sm ${active ? "border-line bg-surface text-ink shadow-[inset_2px_0_0_#d1ff26]" : "border-transparent text-muted hover:bg-surface hover:text-ink"}`}
              >
                <Icon name={item.icon} />
                {item.label}
              </Link>
            );
          })}
          {path === "/admin" && (
            <Link className="button" href="/admin" aria-current="page">
              Расчёты
            </Link>
          )}
        </nav>
        <div className="mt-auto hidden space-y-5 p-6 lg:block">
          <div className="border-t border-line pt-5">
            <p className="eyebrow mb-3">Ваш капитал. Ваш контроль.</p>
            <p className="text-xs leading-5 text-muted">
              Все стратегии и операции
              <br />в одном пространстве.
            </p>
          </div>
          <button
            disabled={signingOut}
            className="button w-full justify-start text-muted"
            onClick={async () => {
              setSigningOut(true);
              setLogoutError("");
              try {
                await logout();
                sessionStorage.removeItem("financial-email");
                router.replace("/login");
              } catch (e) {
                setLogoutError(
                  e instanceof Error ? e.message : "Ошибка выхода",
                );
              } finally {
                setSigningOut(false);
              }
            }}
          >
            <Icon name="logout" />
            {signingOut ? "Выходим…" : "Выйти"}
          </button>
          {logoutError && (
            <p role="alert" className="text-xs text-loss">
              {logoutError}
            </p>
          )}
        </div>
      </aside>
      <div className="min-w-0 flex-1 lg:ml-60 xl:ml-64">
        <header className="flex min-h-20 items-center justify-between gap-4 border-b border-line px-5 sm:px-8 xl:px-10">
          <p className="eyebrow">Инвестиционный терминал</p>
          <Link
            className="flex min-h-11 min-w-11 items-center gap-3 text-sm"
            href="/profile"
          >
            <span className="hidden text-muted sm:inline">{name}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-sm border border-line bg-surface font-mono">
              {name.slice(0, 1).toUpperCase()}
            </span>
          </Link>
        </header>
        <main
          id="content"
          className="route-enter mx-auto max-w-[1600px] px-5 py-7 sm:px-8 sm:py-9 xl:px-10"
          key={path}
        >
          <RemoteState
            loading={session.loading}
            error={session.error}
            retry={session.reload}
          >
            {session.data?.banned ? (
              <p role="alert">
                Доступ к аккаунту ограничен. Обратитесь в поддержку.
              </p>
            ) : session.data ? (
              children
            ) : null}
          </RemoteState>
        </main>
      </div>
    </div>
  );
}
