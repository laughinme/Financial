import type { ReactNode } from "react";
export function RemoteState({
  loading,
  error,
  retry,
  children,
}: {
  loading?: boolean;
  error?: string;
  retry: () => void;
  children: ReactNode;
}) {
  if (loading)
    return (
      <div
        role="status"
        aria-label="Загрузка данных"
        className="space-y-4 py-5"
      >
        <div className="h-8 w-1/3 bg-surface-hover" />
        <div className="h-48 border border-line bg-surface" />
        <p className="text-sm text-muted">Загружаем данные…</p>
      </div>
    );
  if (error)
    return (
      <div role="alert" className="panel my-6 space-y-4 p-6">
        <h2 className="text-lg">Не удалось загрузить данные</h2>
        <p className="text-muted">{error}</p>
        <button className="button" onClick={retry}>
          Повторить загрузку
        </button>
      </div>
    );
  return children;
}
export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-12 text-center text-sm text-muted">{children}</p>;
}
export function SectionTitle({
  title,
  aside,
}: {
  title: string;
  aside?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
      <h2 className="text-sm font-medium">{title}</h2>
      {aside}
    </div>
  );
}
