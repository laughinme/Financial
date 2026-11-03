"use client";
import Link from "next/link";
import { useCallback, useState } from "react";
import { getPortfolio, getHistory } from "@/entities/portfolio";
import { useRemote } from "@/shared/lib/use-remote";
import { money, percent, tone, riskLabel } from "@/shared/lib/format";
import { RemoteState, SectionTitle } from "@/shared/ui/states";
import { Chart, RangeSelect } from "@/shared/ui/chart";
import { PortfolioActions } from "@/features/portfolio-actions";
export function PortfolioDetailPage({ id }: { id: string }) {
  const [days, setDays] = useState(30);
  const [notice, setNotice] = useState("");
  const load = useCallback(
    (signal: AbortSignal) => getPortfolio(id, signal),
    [id],
  );
  const state = useRemote(load);
  const loadHistory = useCallback(
    (signal: AbortSignal) => getHistory(id, days, signal),
    [id, days],
  );
  const history = useRemote(loadHistory),
    p = state.data;
  return (
    <>
      <Link
        href="/portfolio"
        className="mb-6 inline-flex min-h-11 items-center text-sm text-muted hover:text-ink"
      >
        ← Все стратегии
      </Link>
      {notice && (
        <p role="status" className="mb-4 text-sm text-accent">
          {notice}
        </p>
      )}
      <RemoteState
        loading={state.loading}
        error={state.error}
        retry={state.reload}
      >
        {p && (
          <>
            <div className="mb-8 flex flex-wrap justify-between gap-6">
              <div>
                <p className="eyebrow mb-3">
                  {p.broker} / {p.currency}
                </p>
                <h1 className="page-title break-words">{p.name}</h1>
                <p className="mt-3 text-sm text-muted">
                  Риск: {riskLabel(p.risk)} · {p.duration} дн. на рынке ·{" "}
                  {p.holders} инвесторов
                </p>
              </div>
              <PortfolioActions
                portfolio={p}
                onSuccess={() => {
                  setNotice("Заявка принята. Данные портфеля обновляются.");
                  state.reload();
                  history.reload();
                }}
              />
            </div>
            <dl className="mb-7 grid grid-cols-2 border-y border-line sm:grid-cols-4">
              {[
                {
                  label: "Капитал стратегии",
                  value: money(p.equity, p.currency),
                  className: "",
                },
                {
                  label: "Общая доходность",
                  value: percent(p.gain_percent),
                  className: tone(p.gain_percent),
                },
                {
                  label: "Просадка",
                  value: percent(p.drawdown),
                  className: "",
                },
                {
                  label: "Ваши инвестиции",
                  value: p.invested_by_user
                    ? money(p.user_value, p.currency)
                    : "—",
                  className: "",
                },
              ].map((item) => (
                <div key={item.label} className="py-6 pr-4">
                  <dt className="eyebrow mb-3">{item.label}</dt>
                  <dd className={`number text-xl ${item.className}`}>
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg">Результаты стратегии</h2>
              <RangeSelect value={days} onChange={setDays} />
            </div>
            <RemoteState
              loading={history.loading}
              error={history.error}
              retry={history.reload}
            >
              {history.data && (
                <div className="space-y-6">
                  <section className="panel">
                    <SectionTitle title="Баланс и капитал" />
                    <Chart
                      data={history.data.balance_equity}
                      series={[
                        { key: "equity", name: "Капитал" },
                        { key: "balance", name: "Баланс" },
                      ]}
                      format={(v) => money(v, p.currency)}
                      label="История баланса и капитала стратегии"
                    />
                  </section>
                  <div className="grid gap-6 xl:grid-cols-2">
                    <section className="panel min-w-0">
                      <SectionTitle title="Просадка" />
                      <Chart
                        data={history.data.drawdown}
                        series={[{ key: "drawdown", name: "Просадка" }]}
                        format={percent}
                        label="История просадки стратегии"
                        bars
                      />
                    </section>
                    <section className="panel min-w-0">
                      <SectionTitle title="Динамика доходности" />
                      <Chart
                        data={history.data.sparkline}
                        series={[{ key: "gain_percent", name: "Доходность" }]}
                        format={percent}
                        label="История доходности стратегии"
                      />
                    </section>
                  </div>
                </div>
              )}
            </RemoteState>
            <section className="panel mt-6">
              <SectionTitle title="О стратегии" />
              <p className="whitespace-pre-wrap break-words px-5 py-6 text-sm leading-7 text-muted">
                {p.description || "Описание стратегии пока не добавлено."}
              </p>
            </section>
          </>
        )}
      </RemoteState>
    </>
  );
}
