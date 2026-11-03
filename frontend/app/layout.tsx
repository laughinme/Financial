import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: { default: "Financial Work", template: "%s · Financial Work" },
  description:
    "Ваш инвестиционный портфель, стратегии и операции в одном пространстве.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
