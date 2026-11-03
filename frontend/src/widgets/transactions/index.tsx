import type { Transaction } from "@/entities/payment";
import { date, money, tone } from "@/shared/lib/format";
import { Empty, SectionTitle } from "@/shared/ui/states";
const labels: Record<string, string> = {
  deposit: "Пополнение",
  withdraw: "Вывод",
  withdrawal: "Вывод",
  invest: "Инвестиция",
  profit: "Прибыль",
  withdraw_pending: "Вывод в обработке",
  invest_pending: "Инвестиция в обработке",
  payback: "Возврат из стратегии",
  payback_pending: "Возврат в обработке",
  fee: "Комиссия",
  pnl: "Переоценка",
};
export function Transactions({
  rows,
  footer,
}: {
  rows: Transaction[];
  footer?: React.ReactNode;
}) {
  return (
    <section className="panel overflow-hidden">
      <SectionTitle
        title="История операций"
        aside={<span className="eyebrow">USD</span>}
      />
      {!rows.length ? (
        <Empty>
          Пока нет операций. Здесь появится история движения средств.
        </Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[490px]">
            <thead>
              <tr className="eyebrow">
                <th className="table-cell text-xs">Дата</th>
                <th className="table-cell text-xs">Операция</th>
                <th className="table-cell text-xs">Сумма</th>
                <th className="table-cell text-xs">Комментарий</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-surface-hover">
                  <td className="table-cell whitespace-nowrap text-muted">
                    {date(row.created_at)}
                  </td>
                  <td className="table-cell">{labels[row.type] || row.type}</td>
                  <td
                    className={`table-cell number whitespace-nowrap ${tone(row.amount)}`}
                  >
                    {Number(row.amount) > 0 ? "+" : ""}
                    {money(row.amount)}
                  </td>
                  <td className="table-cell max-w-72 break-words text-muted">
                    {row.comment || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {footer && (
        <div className="flex items-center justify-between gap-2 p-4">
          {footer}
        </div>
      )}
    </section>
  );
}
