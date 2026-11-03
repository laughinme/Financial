"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { TelegramAuth } from "@/features/telegram-auth";
import Link from "next/link";
import { AuthForm } from "@/features/auth-form";
import { Icon } from "@/shared/ui/icon";
export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const success = useCallback(() => {
    router.replace("/dashboard");
    router.refresh();
  }, [router]);
  return (
    <main className="min-h-screen lg:grid lg:grid-cols-2">
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-line p-12 xl:p-16 lg:flex">
        <Link
          href="/login"
          className="flex items-center gap-3 text-sm font-bold tracking-wide"
        >
          <span className="grid h-9 w-9 place-content-center bg-accent text-black">
            <Icon name="activity" className="h-6 w-6" />
          </span>
          FINANCIAL WORK
        </Link>
        <div className="relative z-10 max-w-lg py-16">
          <p className="eyebrow mb-6">Инвестиции / Стратегии / Контроль</p>
          <h2 className="text-5xl font-medium leading-[1.12] tracking-tight xl:text-6xl">
            Ваш капитал.
            <br />
            Ясная картина.<span className="text-accent">_</span>
          </h2>
          <p className="mt-7 max-w-sm text-base leading-7 text-muted">
            Портфель, результаты стратегий и движение средств — всё, что нужно
            для взвешенных решений.
          </p>
          <div className="mt-12 grid grid-cols-3 border-y border-line py-5">
            {["Обзор портфеля", "Аналитика стратегий", "История операций"].map(
              (label, i) => (
                <div key={label} className="pr-4">
                  <Icon
                    name={(["overview", "activity", "portfolio"] as const)[i]}
                    className="mb-3 h-5 w-5 text-accent"
                  />
                  <p className="text-xs leading-5 text-muted">{label}</p>
                </div>
              ),
            )}
          </div>
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-15 [background-image:linear-gradient(#555_1px,transparent_1px),linear-gradient(90deg,#555_1px,transparent_1px)] [background-size:64px_64px] [mask-image:linear-gradient(transparent,black)]"
        />
        <p className="eyebrow relative z-10">
          Financial Work · Рабочее пространство инвестора
        </p>
      </section>
      <section className="flex min-h-screen flex-col px-6 py-8 sm:px-12">
        <Link className="mb-12 text-sm font-bold lg:hidden" href="/login">
          FINANCIAL <span className="text-accent">WORK</span>
        </Link>
        <div className="flex flex-1 items-center justify-center py-8">
          <AuthForm
            mode={mode}
            alternative={<TelegramAuth onSuccess={success} />}
          />
        </div>
        <p className="mx-auto mt-12 max-w-sm text-xs leading-5 text-muted">
          Инвестиции связаны с риском. Прошлые результаты не гарантируют будущую
          доходность.
        </p>
      </section>
    </main>
  );
}
