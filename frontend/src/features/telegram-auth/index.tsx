"use client";
import { useEffect, useRef, useState } from "react";
import { telegramLogin, linkTelegram } from "@/entities/session";
declare global {
  interface Window {
    financialTelegramAuth?: (payload: unknown) => void;
  }
}
export function TelegramAuth({
  link = false,
  onSuccess,
}: {
  link?: boolean;
  onSuccess: () => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const node = container.current;
    window.financialTelegramAuth = async (payload) => {
      setError("");
      try {
        await (link ? linkTelegram(payload) : telegramLogin(payload));
        onSuccess();
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Не удалось подключить Telegram",
        );
      }
    };
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute(
      "data-telegram-login",
      process.env.NEXT_PUBLIC_TELEGRAM_BOT || "ai_financialbot",
    );
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "3");
    script.setAttribute("data-onauth", "financialTelegramAuth(user)");
    script.onerror = () =>
      setError("Виджет Telegram недоступен. Попробуйте позже.");
    node?.appendChild(script);
    return () => {
      node?.replaceChildren();
      delete window.financialTelegramAuth;
    };
  }, [link, onSuccess]);
  return (
    <div>
      <div ref={container} className="min-h-10" />
      {error && (
        <p role="alert" className="mt-2 text-sm text-loss">
          {error}
        </p>
      )}
    </div>
  );
}
