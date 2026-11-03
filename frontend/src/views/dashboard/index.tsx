"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import {
  getSummary,
  getAllocation,
  getDailyPnl,
  getPortfolioValue,
} from "@/entities/dashboard";
import { getBalance, listTransactions } from "@/entities/payment";
import { useRemote } from "@/shared/lib/use-remote";
import { money, percent, tone } from "@/shared/lib/format";
import { Chart, RangeSelect } from "@/shared/ui/chart";
import { RemoteState, Empty, SectionTitle } from "@/shared/ui/states";
import { WalletActions } from "@/features/wallet-actions";
import { Transactions } from "@/widgets/transactions";
export function DashboardPage() {
  const [days, setDays] = useState(90);
  const load = useCallback(async (signal: AbortSignal) => {
    const [summary, balance, allocation, transactions] = await Promise.all([
      getSummary(signal),
      getBalance(signal),
      getAllocation(signal),
      listTransactions(1, 5, signal),
    ]);
    return { summary, balance, allocation, transactions };
  }, []);
  const state = useRemote(load);
  const loadCharts = useCallback(
    async (signal: AbortSignal) => {
      const [value, pnl] = await Promise.all([
        getPortfolioValue(days, signal),
        getDailyPnl(days, signal),
      ]);
      return { value, pnl };
    },
    [days],
  );
  const charts = useRemote(loadCharts);
  const data = state.data;
  return (
    <>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="eyebrow mb-3">Ваше рабочее пространство</p>
          <h1 className="page-title">Обзор портфеля</h1>
          <p className="mt-3 text-sm text-muted">
            Капитал и результаты. Всё перед глазами.
          </p>
        </div>
        <WalletActions
          balance={data ? Number(data.balance.balance) : undefined}
          onSuccess={state.reload}
        />
      </div>
      <RemoteState
        loading={state.loading}
        error={state.error}
        retry={state.reload}
      >
        {data && (
          <>
            <section className="mb-6 grid grid-cols-2 border-y border-line md:grid-cols-[1.5fr_1fr_1fr]">
              <div className="col-span-2 py-7 pr-6 md:col-span-1">
                <p className="eyebrow mb-3">Общая стоимость портфеля</p>
                <p className="number text-4xl sm:text-5xl">
                  {money(data.summary.total_equity)}
                </p>
                <p className="mt-4 text-xs text-muted">
                  Стратегий в портфеле{" "}
                  <span className="number ml-2 text-ink">
                    {data.summary.num_portfolios}
                  </span>
                </p>
              </div>
              <div className="border-t border-line py-7 md:border-t-0 md:border-l md:pl-7">
                <p className="eyebrow mb-4">Результат за всё время</p>
                <p
                  className={`number text-lg sm:text-2xl ${tone(data.summary.total_pnl)}`}
                >
                  {money(data.summary.total_pnl)}
                </p>
                <p className="mt-4 text-xs text-muted">
                  Сегодня{" "}
                  <span
                    className={`number ml-2 ${tone(data.summary.today_pnl)}`}
                  >
                    {money(data.summary.today_pnl)}
                  </span>
                </p>
              </div>
              <div className="border-t border-l border-line py-7 pl-4 md:border-t-0 md:pl-7">
                <p className="eyebrow mb-4">Свободный баланс</p>
                <p className="number text-lg sm:text-2xl">
                  {money(data.balance.balance)}
                </p>
                <Link
                  href="/portfolio"
                  className="mt-4 inline-flex min-h-6 text-xs text-muted underline underline-offset-4"
                >
                  Изучить стратегии →
                </Link>
              </div>
            </section>
            <div className="mb-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
              <section className="panel min-w-0">
                <SectionTitle
                  title="Динамика капитала"
                  aside={<RangeSelect value={days} onChange={setDays} />}
                />
                <RemoteState
                  loading={charts.loading}
                  error={charts.error}
                  retry={charts.reload}
                >
                  {charts.data && (
                    <Chart
                      data={charts.data.value}
                      series={[{ key: "equity", name: "Капитал" }]}
                      label="Стоимость портфеля за выбранный период"
                      format={money}
                    />
                  )}
                </RemoteState>
              </section>
              <section className="panel">
                <SectionTitle title="Распределение капитала" />
                {!data.allocation.length ? (
                  <Empty>Добавьте первую стратегию в портфель</Empty>
                ) : (
                  <div className="space-y-5 p-5">
                    {data.allocation.map((item, i) => (
                      <Link
                        key={item.id}
                        href={`/portfolio/${item.id}`}
                        className="block py-1"
                      >
                        <div className="mb-3 flex items-start justify-between gap-4 text-xs">
                          <span className="break-words text-muted hover:text-ink">
                            {item.name}
                          </span>
                          <span className="number shrink-0">
                            {percent(item.percentage)}
                          </span>
                        </div>
                        <div className="h-1 bg-line">
                          <div
                            className={
                              i === 0 ? "h-1 bg-accent" : "h-1 bg-muted"
                            }
                            style={{
                              width: `${Math.max(0, Math.min(100, Number(item.percentage)))}%`,
                            }}
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                <Link
                  className="flex min-h-12 items-center border-t border-line px-5 text-xs text-muted hover:text-ink"
                  href="/portfolio"
                >
                  Открыть стратегии →
                </Link>
              </section>
            </div>
            <section className="panel mb-6">
              <SectionTitle
                title="Ежедневный результат"
                aside={<span className="eyebrow">За {days} дней</span>}
              />
              <RemoteState
                loading={charts.loading}
                error={charts.error}
                retry={charts.reload}
              >
                {charts.data && (
                  <Chart
                    data={charts.data.pnl}
                    series={[{ key: "pnl", name: "Прибыль / убыток" }]}
                    label="Ежедневная прибыль и убыток"
                    format={money}
                    bars
                  />
                )}
              </RemoteState>
            </section>
            <Transactions
              rows={data.transactions}
              footer={
                <Link href="/profile" className="button text-xs">
                  Все операции →
                </Link>
              }
            />
          </>
        )}
      </RemoteState>
    </>
  );
}
