"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-content-center gap-5 px-6">
      <h1 className="page-title">Не удалось открыть страницу</h1>
      <p className="text-muted">Попробуйте загрузить её ещё раз.</p>
      <button className="button" onClick={reset}>
        Повторить
      </button>
    </main>
  );
}
