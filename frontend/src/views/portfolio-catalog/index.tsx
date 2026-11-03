"use client";
import { useCallback, useMemo, useState } from "react";
import { listPortfolios } from "@/entities/portfolio";
import { useRemote } from "@/shared/lib/use-remote";
import { RemoteState, Empty } from "@/shared/ui/states";
import { PortfolioCard } from "@/widgets/portfolio-card";
import { Icon } from "@/shared/ui/icon";
export function PortfolioCatalogPage() {
  const [page, setPage] = useState(1),
    [query, setQuery] = useState("");
  const [onlyMine, setOnlyMine] = useState(false),
    [risk, setRisk] = useState("");
  const load = useCallback(
    (signal: AbortSignal) => listPortfolios(page, 12, signal),
    [page],
  );
  const state = useRemote(load);
  const rows = useMemo(
    () =>
      (state.data || []).filter(
        (p) =>
          (!onlyMine || p.invested_by_user) &&
          (!risk || p.risk === risk) &&
          `${p.name} ${p.broker}`
            .toLocaleLowerCase()
            .includes(query.toLocaleLowerCase()),
      ),
    [state.data, onlyMine, risk, query],
  );
  return (
    <>
      <div className="mb-8">
        <p className="eyebrow mb-3">Каталог стратегий</p>
        <h1 className="page-title">Найдите свой подход.</h1>
        <p className="mt-3 text-sm text-muted">
          Сравнивайте результаты, изучайте риски, собирайте портфель.
        </p>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-3 border-y border-line py-4">
        <div role="group" aria-label="Состав каталога" className="flex gap-1">
          <button
            className={`button ${!onlyMine ? "bg-surface-hover text-accent" : "text-muted"}`}
            aria-pressed={!onlyMine}
            onClick={() => setOnlyMine(false)}
          >
            Все стратегии
          </button>
          <button
            className={`button ${onlyMine ? "bg-surface-hover text-accent" : "text-muted"}`}
            aria-pressed={onlyMine}
            onClick={() => setOnlyMine(true)}
          >
            Мои инвестиции
          </button>
        </div>
        <label className="relative min-w-44 flex-1 sm:ml-auto sm:max-w-xs">
          <span className="sr-only">Поиск на странице</span>
          <Icon
            name="search"
            className="absolute top-4 left-3 h-4 w-4 text-muted"
          />
          <input
            className="field pl-10"
            value={query}
            placeholder="Название или брокер…"
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">Уровень риска</span>
          <select
            className="field w-auto max-w-full"
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
          >
            <option value="">Любой риск</option>
            <option value="conservative">Низкий</option>
            <option value="moderately_conservative">Умеренно низкий</option>
            <option value="moderately_aggressive">Умеренно высокий</option>
            <option value="aggressive">Высокий</option>
            <option value="very_aggressive">Очень высокий</option>
          </select>
        </label>
      </div>
      <RemoteState
        loading={state.loading}
        error={state.error}
        retry={state.reload}
      >
        {rows.length ? (
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {rows.map((p) => (
              <PortfolioCard key={p.id} portfolio={p} />
            ))}
          </div>
        ) : (
          <Empty>
            {query || onlyMine || risk
              ? "На этой странице подходящих стратегий нет. Измените фильтры или перейдите к следующей."
              : "Стратегии пока не опубликованы"}
          </Empty>
        )}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            className="button"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Назад
          </button>
          <span className="eyebrow">Страница {page}</span>
          <button
            className="button"
            disabled={(state.data?.length || 0) < 12}
            onClick={() => setPage((p) => p + 1)}
          >
            Далее →
          </button>
        </div>
      </RemoteState>
      <p className="mt-8 max-w-2xl text-xs leading-5 text-muted">
        Прошлая доходность не гарантирует будущих результатов. Перед
        инвестированием изучите описание стратегии и уровень риска.
      </p>
    </>
  );
}
