import Link from "next/link";
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-content-center gap-5 px-6">
      <p className="eyebrow">404 / Financial Work</p>
      <h1 className="page-title">Страница не найдена</h1>
      <Link className="button" href="/dashboard">
        На обзор портфеля →
      </Link>
    </main>
  );
}
