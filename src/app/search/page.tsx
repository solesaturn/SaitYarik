import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const products = q
    ? await prisma.product.findMany({
        where: {
          active: true,
          OR: [
            { name: { contains: q } },
            { sku: { contains: q } },
            { series: { contains: q } },
            { description: { contains: q } },
          ],
        },
        include: { brand: true },
        take: 40,
      })
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="section-title">Поиск</h1>
      <form className="mt-4 flex max-w-xl gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Артикул, название, серия (с учётом опечаток на этапе 2)"
          className="flex-1 rounded border border-[var(--line)] bg-white px-3 py-2 text-sm"
        />
        <button className="btn btn-primary" type="submit">
          Найти
        </button>
      </form>
      <p className="mt-3 text-sm text-[var(--muted)]">
        {q ? `Результаты по запросу «${q}»: ${products.length}` : "Введите запрос"}
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {!products.length && q && (
        <p className="mt-6 text-sm">
          Ничего не найдено.{" "}
          <Link href="/catalog" className="underline">
            Открыть каталог
          </Link>
        </p>
      )}
    </div>
  );
}
