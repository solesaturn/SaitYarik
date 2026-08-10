import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="text-6xl font-bold tracking-tight text-[var(--muted)]">404</p>
      <h1 className="section-title mt-4">Страница не найдена</h1>
      <Link href="/" className="btn btn-primary mt-8">
        На главную
      </Link>
    </div>
  );
}
