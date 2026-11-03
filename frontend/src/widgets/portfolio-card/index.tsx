import Link from "next/link";
import type { Portfolio } from "@/entities/portfolio";
import { money, percent, tone, riskLabel } from "@/shared/lib/format";
import { Icon } from "@/shared/ui/icon";
export function PortfolioCard({ portfolio: p }: { portfolio: Portfolio }) {
  return (
    <Link
      href={`/portfolio/${p.id}`}
      className="panel group flex flex-col transition-colors hover:border-muted"
    >
      <div className="flex items-start justify-between gap-4 border-b border-line p-5">
        <div className="min-w-0">
          <p className="eyebrow mb-3 break-words">
            {p.broker} / {p.currency}
          </p>
          <h2 className="text-lg font-medium break-words">{p.name}</h2>
        </div>
        <Icon
          name="arrow"
          className="mt-1 h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent"
        />
      </div>
      <div className="flex-1 p-5">
        <p className="eyebrow mb-2">Доходность за всё время</p>
        <p className={`number text-3xl ${tone(p.gain_percent)}`}>
          {Number(p.gain_percent) > 0 ? "+" : ""}
          {percent(p.gain_percent)}
        </p>
        <dl className="mt-7 grid grid-cols-2 gap-5 text-sm">
          <div>
            <dt className="mb-1 text-xs text-muted">Капитал стратегии</dt>
            <dd className="number">{money(p.equity, p.currency)}</dd>
          </div>
          <div>
            <dt className="mb-1 text-xs text-muted">Просадка</dt>
            <dd className="number">{percent(p.drawdown)}</dd>
          </div>
          <div>
            <dt className="mb-1 text-xs text-muted">Риск</dt>
            <dd>{riskLabel(p.risk)}</dd>
          </div>
          <div>
            <dt className="mb-1 text-xs text-muted">Срок работы</dt>
            <dd>{p.duration} дн.</dd>
          </div>
        </dl>
      </div>
      <div className="flex items-center justify-between border-t border-line px-5 py-3 text-xs text-muted">
        <span>{p.holders} инвесторов</span>
        <span className={p.invested_by_user ? "text-accent" : ""}>
          {p.invested_by_user ? "В вашем портфеле" : "Подробнее"}
        </span>
      </div>
    </Link>
  );
}
