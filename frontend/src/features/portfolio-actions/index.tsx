"use client";
import { useState } from "react";
import { invest, redeem, type Portfolio } from "@/entities/portfolio";
import { AmountDialog } from "@/shared/ui/amount-dialog";
import { money } from "@/shared/lib/format";
export function PortfolioActions({
  portfolio,
  onSuccess,
}: {
  portfolio: Portfolio;
  onSuccess: () => void;
}) {
  const [mode, setMode] = useState<"invest" | "redeem" | null>(null);
  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="button button-primary"
        onClick={() => {
          setMode("invest");
        }}
      >
        Инвестировать
      </button>
      <button
        className="button"
        disabled={!Number(portfolio.user_units)}
        onClick={() => {
          setMode("redeem");
        }}
      >
        Вывести паи
      </button>
      {mode && (
        <AmountDialog
          title={
            mode === "invest"
              ? "Инвестировать в стратегию"
              : "Вывести паи из стратегии"
          }
          unit={mode === "invest" ? "USD" : "паёв"}
          max={mode === "redeem" ? Number(portfolio.user_units) : undefined}
          onClose={() => setMode(null)}
          onSubmit={async (amount) => {
            if (mode === "invest") await invest(String(portfolio.id), amount);
            else await redeem(String(portfolio.id), amount);
            onSuccess();
          }}
        />
      )}
      <p className="w-full mt-2 text-xs text-muted">
        Цена пая: {money(portfolio.nav_price, portfolio.currency)}
      </p>
    </div>
  );
}
