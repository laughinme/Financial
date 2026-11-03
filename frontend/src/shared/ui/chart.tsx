"use client";
import { useId, useState } from "react";
import { Empty } from "./states";
import { date } from "@/shared/lib/format";
type Point = { date: string; [key: string]: string | number };
const colors = ["#d1ff26", "#a1a1a1"];
const axisNumber = new Intl.NumberFormat("ru-RU", {
  notation: "compact",
  maximumFractionDigits: 1,
});
export function Chart({
  data,
  series,
  format = (value) => value.toLocaleString("ru-RU"),
  bars = false,
  label,
}: {
  data: Point[];
  series: { key: string; name: string }[];
  format?: (value: number) => string;
  bars?: boolean;
  label: string;
}) {
  const id = useId().replace(/:/g, "");
  const [focused, setFocused] = useState<number | null>(null);
  if (!data.length) return <Empty>За выбранный период данных пока нет</Empty>;
  const values = data
    .flatMap((p) => series.map((s) => Number(p[s.key] ?? 0)))
    .filter(Number.isFinite);
  const min = Math.min(...values, 0),
    max = Math.max(...values, 1),
    span = max - min;
  const x = (i: number) => 10 + (i * 780) / Math.max(data.length - 1, 1);
  const y = (value: unknown) =>
    195 - (((Number(value) || 0) - min) / span) * 180;
  const selected = data[Math.min(focused ?? data.length - 1, data.length - 1)];
  const ticks = [0, 1, 2, 3].map((i) => min + (span * i) / 3);
  return (
    <div className="px-4 py-5 sm:px-5">
      <div className="mb-5 flex min-h-11 flex-wrap items-center justify-between gap-3 text-xs text-muted">
        <span>{date(selected.date)}</span>
        <div className="flex flex-wrap gap-4">
          {series.map((s, i) => (
            <span key={s.key}>
              <span style={{ color: colors[i % colors.length] }}>{s.name}</span>
              <b className="number ml-2 text-ink">
                {format(Number(selected[s.key] ?? 0))}
              </b>
            </span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-2 sm:grid-cols-[64px_minmax(0,1fr)]">
        <div className="relative h-[190px] sm:h-[230px]" aria-hidden="true">
          {ticks.map((value, i) => (
            <span
              key={i}
              className="number absolute right-0 -translate-y-1/2 whitespace-nowrap text-[10px] text-muted sm:text-xs"
              style={{ top: `${(y(value) / 210) * 100}%` }}
            >
              {axisNumber.format(value)}
            </span>
          ))}
        </div>
        <svg
          viewBox="0 0 800 210"
          preserveAspectRatio="none"
          className="h-[190px] w-full overflow-visible sm:h-[230px]"
          role="img"
          aria-label={label}
          onPointerLeave={() => setFocused(null)}
        >
          <title>{label}</title>
          <desc>Точные значения доступны в таблице данных под графиком.</desc>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d1ff26" stopOpacity=".15" />
              <stop offset="100%" stopColor="#d1ff26" stopOpacity="0" />
            </linearGradient>
          </defs>
          {ticks.map((value, i) => (
            <line
              key={i}
              x1="0"
              y1={y(value)}
              x2="800"
              y2={y(value)}
              stroke="#2a2a2a"
              strokeDasharray="3 5"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {series.map((s, si) => {
            const points = data
              .map((p, i) => `${x(i)},${y(p[s.key])}`)
              .join(" ");
            return (
              <g key={s.key}>
                {bars ? (
                  data.map((p, i) => (
                    <rect
                      key={i}
                      x={x(i) - 2}
                      y={Math.min(y(0), y(p[s.key]))}
                      width={Math.max(2, Math.min(12, 500 / data.length))}
                      height={Math.max(1, Math.abs(y(p[s.key]) - y(0)))}
                      fill={Number(p[s.key]) < 0 ? "#ff8585" : colors[si % 2]}
                    />
                  ))
                ) : (
                  <>
                    {si === 0 && (
                      <polygon
                        points={`${x(0)},195 ${points} ${x(data.length - 1)},195`}
                        fill={`url(#${id})`}
                      />
                    )}
                    <polyline
                      points={points}
                      stroke={colors[si % 2]}
                      strokeWidth="2"
                      fill="none"
                      strokeLinejoin="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </>
                )}
              </g>
            );
          })}
          {focused !== null && (
            <line
              x1={x(focused)}
              x2={x(focused)}
              y1="15"
              y2="195"
              stroke="#777"
              strokeDasharray="3 3"
            />
          )}
          <rect
            x="0"
            y="0"
            width="800"
            height="210"
            fill="transparent"
            onPointerMove={(event) => {
              const bounds = event.currentTarget.getBoundingClientRect();
              setFocused(
                Math.max(
                  0,
                  Math.min(
                    data.length - 1,
                    Math.round(
                      ((event.clientX - bounds.left) / bounds.width) *
                        (data.length - 1),
                    ),
                  ),
                ),
              );
            }}
          />
        </svg>
        <div />
        <div className="flex justify-between gap-2 font-mono text-[10px] text-muted sm:text-xs">
          {[0, Math.floor((data.length - 1) / 2), data.length - 1]
            .filter((v, i, a) => a.indexOf(v) === i)
            .map((i) => (
              <span key={i}>{date(data[i].date)}</span>
            ))}
        </div>
      </div>
      <details className="mt-2 text-xs text-muted">
        <summary className="min-h-11 cursor-pointer py-3">
          Таблица данных
        </summary>
        <div className="max-h-64 overflow-auto">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2">Дата</th>
                {series.map((s) => (
                  <th key={s.key}>{s.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={i}>
                  <td className="py-2">{date(p.date)}</td>
                  {series.map((s) => (
                    <td key={s.key} className="number">
                      {format(Number(p[s.key] ?? 0))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
export function RangeSelect({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex" role="group" aria-label="Период графика">
      {[
        [30, "1М"],
        [90, "3М"],
        [180, "6М"],
        [360, "1Г"],
      ].map(([days, text]) => (
        <button
          key={days}
          className={`min-h-11 min-w-11 rounded-sm px-2 font-mono text-xs transition-colors ${value === days ? "bg-surface-hover text-accent" : "text-muted hover:text-ink"}`}
          aria-pressed={value === days}
          onClick={() => onChange(Number(days))}
        >
          {text}
        </button>
      ))}
    </div>
  );
}
