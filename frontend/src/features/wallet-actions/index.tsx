"use client";
import { useState } from "react";
import { AmountDialog } from "@/shared/ui/amount-dialog";
import { Icon } from "@/shared/ui/icon";
import { ApiError } from "@/shared/api/http";
import {
  createDeposit,
  createWithdraw,
  getOnboardingLink,
} from "@/entities/payment";
export function WalletActions({
  balance,
  onSuccess,
}: {
  balance?: number;
  onSuccess?: () => void;
}) {
  const [mode, setMode] = useState<"deposit" | "withdraw" | null>(null);
  const [notice, setNotice] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className="button button-primary"
        onClick={() => {
          setNotice("");
          setMode("deposit");
        }}
      >
        <Icon name="plus" />
        Пополнить
      </button>
      <button
        className="button"
        onClick={() => {
          setNotice("");
          setMode("withdraw");
        }}
      >
        Вывести
      </button>
      {notice && (
        <p role="status" className="w-full text-sm text-accent">
          {notice}
        </p>
      )}
      {mode && (
        <AmountDialog
          title={mode === "deposit" ? "Пополнение счёта" : "Вывод средств"}
          max={mode === "withdraw" ? balance : undefined}
          onClose={() => setMode(null)}
          onSubmit={async (amount) => {
            if (mode === "deposit") {
              const { url } = await createDeposit(amount);
              window.location.assign(url);
              return;
            }
            try {
              await createWithdraw(amount);
              setNotice("Заявка на вывод принята");
              onSuccess?.();
            } catch (e) {
              if (
                e instanceof ApiError &&
                (e.status === 412 || /onboarding/i.test(e.message))
              ) {
                const { url } = await getOnboardingLink();
                window.location.assign(url);
              } else throw e;
            }
          }}
        />
      )}
    </div>
  );
}
