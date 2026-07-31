import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { getSession } from "@/lib/auth";
import { CatalogFilters } from "@/components/CatalogFilters";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function one(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const brand = one(sp.brand);
  const color = one(sp.color);
  const productType = one(sp.type);
  const ip = one(sp.ip);
  const posts = one(sp.posts);
  const current = one(sp.current);
  const inStock = one(sp.stock) === "1";
  const sort = one(sp.sort) || "popular";
  const q = one(sp.q);
  const page = Math.max(1, Number(one(sp.page) || 1));
  const take = 12;

  const where: Record<string, unknown> = { active: true };
  if (brand) where.brand = { slug: brand };
  if (color) where.color = color;
  if (productType) where.productType = productType;
  if (ip) where.ipRating = ip;
  if (posts) where.posts = Number(posts);
  if (current) where.nominalCurrent = current;
  if (inStock) where.stock = { gt: 0 };
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { sku: { contains: q } },
      { series: { contains: q } },
    ];
  }

  const orderBy =
    sort === "price_asc"
      ? { priceRetail: "asc" as const }
      : sort === "price_desc"
        ? { priceRetail: "desc" as const }
        : sort === "new"
          ? { createdAt: "desc" as const }
          : sort === "stock"
            ? { stock: "desc" as const }
            : { isHit: "desc" as const };

  const session = await getSession();
  const [total, products, brands, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { brand: true },
      orderBy,
      skip: (page - 1) * take,
      take,
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { parentId: null }, orderBy: { name: "asc" } }),
  ]);

  const pages = Math.max(1, Math.ceil(total / take));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <nav className="text-xs text-[var(--muted)]">
        <Link href="/">Главная</Link> / <span>Каталог</span>
      </nav>
      <h1 className="section-title mt-3">Каталог электрофурнитуры</h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        Сначала выберите, что нужно — розетку, выключатель или рамку, затем цвет и число постов. В корзину можно
        добавить прямо из списка.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="border border-[var(--line)] bg-white p-4 text-sm">Фильтры…</div>}>
          <CatalogFilters brands={brands} />
        </Suspense>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--muted)]">Найдено: {total}</p>
            <div className="flex flex-wrap gap-2 text-sm">
              {categories.map((c) => (
                <Link key={c.id} href={`/catalog/${c.slug}`} className="border border-[var(--line)] bg-white px-3 py-1 hover:border-[var(--ink)]">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} b2bApproved={session?.b2bApproved} />
            ))}
          </div>

          {products.length === 0 && (
            <p className="border border-dashed border-[var(--line)] bg-white p-10 text-center text-sm text-[var(--muted)]">
              Ничего не найдено. Сбросьте фильтры или измените запрос.
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/catalog?page=${p}${brand ? `&brand=${brand}` : ""}${sort ? `&sort=${sort}` : ""}`}
                className={`min-w-9 rounded border px-3 py-1.5 text-center text-sm ${
                  p === page ? "border-[var(--ink)] bg-[var(--ink)] text-white" : "border-[var(--line)] bg-white"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
