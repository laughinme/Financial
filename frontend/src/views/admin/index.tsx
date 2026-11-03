"use client";
import { useState } from "react";
import {
  listSettlements,
  createIntent,
  type Settlement,
} from "@/entities/settlement";
import { useRemote } from "@/shared/lib/use-remote";
import { money, date, tone } from "@/shared/lib/format";
import { RemoteState, Empty } from "@/shared/ui/states";
export function AdminPage() {
  const state = useRemote(listSettlements);
  const [selected, setSelected] = useState<Settlement | null>(null);
  const [pending, setPending] = useState(false),
    [error, setError] = useState("");
  return (
    <>
      <div className="mb-8">
        <p className="eyebrow mb-3">Администрирование</p>
        <h1 className="page-title">Расчёты по стратегиям</h1>
        <p className="mt-3 text-sm text-muted">
          Заявки инвесторов и итоговое движение средств.
        </p>
      </div>
      <RemoteState
        loading={state.loading}
        error={state.error}
        retry={state.reload}
      >
        {!state.data?.length ? (
          <Empty>Нет заявок для расчёта</Empty>
        ) : (
          <div className="panel overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="text-muted">
                  {[
                    "Стратегия",
                    "Ввод − вывод",
                    "Последние 5 заявок",
                    "Действие",
                  ].map((label) => (
                    <th key={label} className="table-cell text-xs">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {state.data.map((row) => (
                  <tr key={row.portfolio_id}>
                    <td className="table-cell align-top">{row.name}</td>
                    <td
                      className={`table-cell number align-top whitespace-nowrap ${tone(row.delta)}`}
                    >
                      {money(row.delta)}
                    </td>
                    <td className="table-cell">
                      <ul className="space-y-3">
                        {row.orders.map((order) => (
                          <li
                            key={order.id}
                            className="flex flex-wrap gap-x-3 gap-y-1 text-xs"
                          >
                            <span
                              className="number text-muted"
                              title={order.user_id}
                            >
                              {order.user_id.slice(0, 6)}…
                            </span>
                            <span>
                              {order.direction === "invest" ? "+" : "−"}
                              {money(order.amount)}
                            </span>
                            <span className="text-muted">{order.status}</span>
                            <span className="text-muted">
                              {date(order.created_at)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="table-cell align-top">
                      <button
                        disabled={pending || Number(row.delta) === 0}
                        className="button text-xs"
                        onClick={() => {
                          setError("");
                          setSelected(row);
                        }}
                      >
                        {Number(row.delta) >= 0 ? "Пополнить" : "Вывести"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </RemoteState>
      {selected && (
        <section
          className="panel mt-6 p-6"
          aria-labelledby="settlement-confirm"
        >
          <h2 id="settlement-confirm" className="text-lg">
            Подтвердите расчёт: {selected.name}
          </h2>
          <p className="my-4 text-sm text-muted">
            Будет создано поручение на{" "}
            {Number(selected.delta) >= 0 ? "пополнение" : "вывод"}{" "}
            {money(Math.abs(Number(selected.delta)))}.
          </p>
          {error && (
            <p role="alert" className="mb-4 text-sm text-loss">
              {error}
            </p>
          )}
          <div className="flex gap-3">
            <button
              className="button button-primary"
              disabled={pending}
              onClick={async () => {
                setPending(true);
                setError("");
                try {
                  await createIntent(selected.portfolio_id);
                  setSelected(null);
                  state.reload();
                } catch (e) {
                  setError(
                    e instanceof Error
                      ? e.message
                      : "Не удалось создать поручение",
                  );
                } finally {
                  setPending(false);
                }
              }}
            >
              {pending ? "Обрабатываем…" : "Подтвердить"}
            </button>
            <button
              className="button"
              disabled={pending}
              onClick={() => setSelected(null)}
            >
              Отмена
            </button>
