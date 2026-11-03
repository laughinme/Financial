"use client";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { getMe, logout } from "@/entities/session";
import { getBalance, listTransactions, getCashflow } from "@/entities/payment";
import { getSummary } from "@/entities/dashboard";
import { Chart, RangeSelect } from "@/shared/ui/chart";
import { money, tone } from "@/shared/lib/format";
import { useRemote } from "@/shared/lib/use-remote";
import { RemoteState, SectionTitle } from "@/shared/ui/states";
import { WalletActions } from "@/features/wallet-actions";
import { TelegramAuth } from "@/features/telegram-auth";
import { Transactions } from "@/widgets/transactions";
export function ProfilePage() {
  const router = useRouter();
  const [page, setPage] = useState(1),
    [notice, setNotice] = useState("");
  const [days, setDays] = useState(90);
  const cashflow = useRemote(
    useCallback((signal: AbortSignal) => getCashflow(days, signal), [days]),
  );
  const [signingOut, setSigningOut] = useState(false);
  const load = useCallback(async (signal: AbortSignal) => {
    const [user, balance, summary] = await Promise.all([
      getMe(signal),
      getBalance(signal),
      getSummary(signal),
    ]);
    return { user, balance, summary };
  }, []);
  const state = useRemote(load);
  const loadTransactions = useCallback(
    (signal: AbortSignal) => listTransactions(page, 10, signal),
    [page],
  );
  const transactions = useRemote(loadTransactions);
  const linked = useCallback(
    () => setNotice("Telegram подключён к аккаунту"),
    [],
  );
  const data = state.data;
  return (
    <>
      <div className="mb-8 flex flex-wrap justify-between gap-4">
        <div>
          <p className="eyebrow mb-3">Профиль и средства</p>
          <h1 className="page-title">Мой счёт</h1>
        </div>
        <WalletActions
          balance={data ? Number(data.balance.balance) : undefined}
          onSuccess={() => {
            state.reload();
            transactions.reload();
            cashflow.reload();
          }}
        />
      </div>
      <RemoteState
        loading={state.loading}
        error={state.error}
        retry={state.reload}
      >
        {data && (
          <>
            <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_320px]">
              <section className="panel p-6 sm:p-8">
                <p className="eyebrow mb-4">Доступно для инвестирования</p>
                <p className="number text-4xl sm:text-5xl">
                  {money(data.balance.balance)}
                </p>
                <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-line pt-6">
                  <div>
                    <dt className="mb-2 text-xs text-muted">Общий результат</dt>
                    <dd
                      className={`number text-xl ${tone(data.summary.total_pnl)}`}
                    >
                      {money(data.summary.total_pnl)}
                    </dd>
                  </div>
                  <div>
                    <dt className="mb-2 text-xs text-muted">
                      Стратегий в портфеле
                    </dt>
                    <dd className="number text-xl">
                      {data.summary.num_portfolios}
                    </dd>
                  </div>
                </dl>
              </section>
              <section className="panel">
                <SectionTitle title="Аккаунт" />
                <div className="space-y-5 p-5">
                  <p className="text-lg">
                    {data.user.display_name ||
                      [data.user.first_name, data.user.last_name]
                        .filter(Boolean)
                        .join(" ") ||
                      "Инвестор"}
                  </p>
                  <div>
                    <p className="eyebrow mb-2">Идентификатор</p>
                    <p className="number break-all text-xs text-muted">
                      {data.user.id}
                    </p>
                  </div>
                  <button
                    className="button w-full"
                    disabled={signingOut}
                    onClick={async () => {
                      setSigningOut(true);
                      setNotice("");
                      try {
                        await logout();
                        sessionStorage.removeItem("financial-email");
                        router.replace("/login");
                      } catch (e) {
                        setNotice(
                          e instanceof Error ? e.message : "Не удалось выйти",
                        );
                      } finally {
                        setSigningOut(false);
                      }
                    }}
                  >
                    {signingOut ? "Выходим…" : "Выйти из аккаунта"}
                  </button>
                </div>
              </section>
            </div>
            <section className="panel mb-6">
              <SectionTitle
                title="Движение средств"
                aside={<RangeSelect value={days} onChange={setDays} />}
              />
              <RemoteState
                loading={cashflow.loading}
                error={cashflow.error}
                retry={cashflow.reload}
              >
                {cashflow.data && (
                  <Chart
                    data={cashflow.data.map((row) => ({
                      ...row,
                      withdrawals: -Math.abs(Number(row.withdrawals)),
                    }))}
                    series={[
                      { key: "deposits", name: "Пополнения" },
                      { key: "withdrawals", name: "Выводы" },
                    ]}
                    bars
