import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { getSession } from "@/lib/auth";
import { CatalogFilters } from "@/components/CatalogFilters";
import { CatalogToolbar } from "@/components/CatalogToolbar";

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
  const [total, products, allForCounts] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: { brand: true },
      orderBy,
      skip: (page - 1) * take,
      take,
    }),
    prisma.product.findMany({
      where: { active: true },
      select: { color: true, posts: true, productType: true },
    }),
  ]);

  const counts = {
    colors: {} as Record<string, number>,
    posts: {} as Record<string, number>,
    types: {} as Record<string, number>,
  };
  for (const p of allForCounts) {
    if (p.color) counts.colors[p.color] = (counts.colors[p.color] || 0) + 1;
    if (p.posts != null) counts.posts[String(p.posts)] = (counts.posts[String(p.posts)] || 0) + 1;
    if (p.productType) counts.types[p.productType] = (counts.types[p.productType] || 0) + 1;
  }

  const pages = Math.max(1, Math.ceil(total / take));
  const titleMap: Record<string, string> = {
    розетка: "Розетки",
    выключатель: "Выключатели",
    рамка: "Рамки",
    механизм: "Механизмы",
  };
  const title = productType ? titleMap[productType] || productType : "Каталог";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <Suspense fallback={<div className="h-24" />}>
        <CatalogToolbar title={title} />
      </Suspense>

      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <Suspense fallback={<div className="text-sm text-[var(--muted)]">Фильтры…</div>}>
          <CatalogFilters counts={counts} resultCount={total} />
        </Suspense>

        <div>
          {products.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--line)] bg-white p-10 text-center text-sm text-[var(--muted)]">
              Ничего не найдено. Сбросьте фильтры или измените запрос.
            </p>
          ) : (
            <div className="grid divide-y divide-[var(--line)] border-t border-[var(--line)] sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-3">
              {products.map((p, i) => (
                <div
                  key={p.id}
                  className={`p-4 sm:p-5 ${i >= 3 ? "border-t border-[var(--line)]" : ""} ${
                    i % 3 !== 0 ? "lg:border-l lg:border-[var(--line)]" : ""
                  }`}
                >
                  <ProductCard product={p} b2bApproved={session?.b2bApproved} />
                </div>
              ))}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
                const next = new URLSearchParams();
                next.set("page", String(p));
                if (productType) next.set("type", productType);
                if (color) next.set("color", color);
                if (sort) next.set("sort", sort);
                if (inStock) next.set("stock", "1");
                if (posts) next.set("posts", posts);
                return (
                  <Link
                    key={p}
                    href={`/catalog?${next.toString()}`}
                    className={`min-w-9 rounded-full px-3 py-1.5 text-center text-sm ${
                      p === page ? "bg-[var(--ink)] text-white" : "bg-white"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
