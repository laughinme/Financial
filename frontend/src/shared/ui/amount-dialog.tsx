"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./icon";
export function AmountDialog({
  title,
  unit = "USD",
  max,
  onClose,
  onSubmit,
}: {
  title: string;
  unit?: string;
  max?: number;
  onClose: () => void;
  onSubmit: (amount: number) => Promise<void>;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const opener =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const dialog = ref.current;
    dialog?.showModal();
    dialog?.querySelector("input")?.focus();
    return () => {
      dialog?.close();
      if (opener?.isConnected) opener.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby="amount-title"
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-sm border border-line p-6 shadow-2xl"
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onClose();
      }}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 id="amount-title" className="text-xl font-medium">
          {title}
        </h2>
        <button
          disabled={pending}
          type="button"
          className="button px-3"
          aria-label="Закрыть"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (pending) return;
          const amount = Number(
            new FormData(event.currentTarget).get("amount"),
          );
          if (
            !Number.isFinite(amount) ||
            amount <= 0 ||
            (max !== undefined && amount > max)
          ) {
            setError("Проверьте сумму");
            return;
          }
          setPending(true);
          setError("");
          try {
            await onSubmit(amount);
            onClose();
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Не удалось выполнить операцию",
            );
          } finally {
            setPending(false);
          }
        }}
      >
        <label className="label" htmlFor="amount">
          {unit === "USD" ? "Сумма, USD" : "Количество паёв"}
        </label>
        <input
          className="field number"
          id="amount"
          name="amount"
          type="number"
          min={unit === "USD" ? "0.01" : "0.0001"}
          step={unit === "USD" ? "0.01" : "0.0001"}
          max={max}
          required
          disabled={pending}
        />
        {max !== undefined && (
          <p className="mt-2 text-xs text-muted">
            Доступно: {max.toLocaleString("ru-RU")} {unit}
          </p>
        )}
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Проверьте значение перед подтверждением. Статус операции появится в
          истории.
        </p>
        {error && (
          <p role="alert" className="mt-4 text-sm text-loss">
            {error}
          </p>
        )}
        <button
          className="button button-primary mt-6 w-full"
          disabled={pending}
        >
          {pending ? "Обрабатываем…" : "Подтвердить"}
        </button>
      </form>
    </dialog>
  );
}
