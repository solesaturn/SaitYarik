import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-[family-name:var(--font-display)] text-6xl text-[var(--copper)]">404</p>
      <h1 className="mt-4 text-2xl font-semibold">Страница не найдена</h1>
      <Link href="/" className="btn btn-primary mt-8 inline-flex">
        На главную
      </Link>
    </div>
  );
}
