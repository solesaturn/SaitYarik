import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { ProductBuyBox } from "@/components/ProductBuyBox";
import { ProductCard } from "@/components/ProductCard";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Товар" };
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description || undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true, categories: { include: { category: true } } },
  });
  if (!product || !product.active) notFound();

  const session = await getSession();
  const related = await prisma.product.findMany({
    where: {
      active: true,
      id: { not: product.id },
      OR: [
        { series: product.series ?? undefined },
        { productType: product.productType ?? undefined },
      ],
    },
    include: { brand: true },
    take: 4,
  });

  const colorVariants = product.sku.includes("-")
    ? await prisma.product.findMany({
        where: {
          active: true,
          sku: {
            startsWith: product.sku.slice(0, product.sku.lastIndexOf("-") + 1),
          },
        },
        orderBy: { sku: "asc" },
      })
    : [];

  const attrs = JSON.parse(product.attrsJson || "{}") as Record<string, string>;
  const docs = JSON.parse(product.documentsJson || "[]") as { name: string; url: string }[];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    brand: product.brand?.name,
    description: product.description,
    offers: {
      "@type": "Offer",
      priceCurrency: "RUB",
      price: product.priceRetail,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-xs text-[var(--muted)]">
        <Link href="/">Главная</Link> / <Link href="/catalog">Каталог</Link>
        {product.categories[0] && (
          <>
            {" "}
            / <Link href={`/catalog/${product.categories[0].category.slug}`}>{product.categories[0].category.name}</Link>
          </>
        )}{" "}
        / <span>{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden border border-[var(--line)] bg-white">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-8" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(160deg,#e8eef2,#d7dde3)]">
              <div className="h-40 w-40 rounded-full border-8 border-[var(--ink)]/10 bg-white/80" />
            </div>
          )}
          <div className="absolute left-4 top-4 flex gap-2">
            {product.isHit && <span className="bg-[var(--ink)] px-2 py-1 text-xs text-white">Хит</span>}
            {product.isNew && <span className="bg-[var(--copper)] px-2 py-1 text-xs text-[var(--ink)]">Новинка</span>}
          </div>
        </div>

        <div>
          <p className="text-sm text-[var(--muted)]">
            {product.brand?.name} · арт. {product.sku}
            {product.series ? ` · серия ${product.series}` : ""}
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl tracking-tight">{product.name}</h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{product.description}</p>

          <div className="mt-6 grid gap-2 text-sm sm:grid-cols-2">
            <p>
              Розница: <strong>{formatPrice(product.priceRetail)}</strong>
            </p>
            <p>
              Опт: <strong>{formatPrice(product.priceWholesale)}</strong>
              {!session?.b2bApproved && <span className="text-[var(--muted)]"> (после одобрения B2B)</span>}
            </p>
            <p>Наличие: {product.stock > 0 ? `${product.stock} шт.` : "под заказ"}</p>
            <p>Кратность: {product.packQty} {product.unit}</p>
          </div>

          {colorVariants.length > 1 && (
            <div className="mt-5">
              <p className="text-sm font-semibold">Цвет</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {colorVariants.map((v) => {
                  const active = v.id === product.id;
                  const swatch =
                    v.color?.includes("чёрн") || v.color?.includes("черн")
                      ? "#1a1a1a"
                      : v.color?.includes("сер")
                        ? "#9aa0a6"
                        : "#f5f5f5";
                  return (
                    <Link
                      key={v.id}
                      href={`/product/${v.slug}`}
                      className={`inline-flex items-center gap-2 rounded border bg-white px-3 py-1.5 text-sm text-[var(--ink)] transition ${
                        active
                          ? "border-[var(--copper)] ring-2 ring-[var(--copper)]/50"
                          : "border-[var(--line)] hover:border-[var(--ink)]/40"
                      }`}
                    >
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15"
                        style={{ backgroundColor: swatch }}
                        aria-hidden
                      />
                      {v.color || v.sku}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <ProductBuyBox product={product} b2bApproved={!!session?.b2bApproved} />

          <div className="mt-8">
            <h2 className="font-semibold">Характеристики</h2>
            <table className="mt-3 w-full text-sm">
              <tbody>
                {Object.entries(attrs).map(([k, v]) => (
                  <tr key={k} className="border-b border-[var(--line)]">
                    <td className="py-2 text-[var(--muted)]">{k}</td>
                    <td className="py-2 font-medium">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {docs.length > 0 && (
            <div className="mt-6">
              <h2 className="font-semibold">Документы</h2>
              <ul className="mt-2 space-y-1 text-sm">
                {docs.map((d) => (
                  <li key={d.name}>
                    <a href={d.url} className="underline">
                      {d.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <section className="mt-16">
        <h2 className="section-title">Похожие и сопутствующие</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} b2bApproved={session?.b2bApproved} />
          ))}
        </div>
      </section>
    </div>
  );
}
