import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductBuyBox } from "@/components/ProductBuyBox";
import { ProductCard } from "@/components/ProductCard";
import { hasConfirmedPrice } from "@/lib/pricing";
import { compatibleWith } from "@/lib/compatibility";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Товар" };
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.description || undefined,
    robots: { index: false, follow: false },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { brand: true, categories: { include: { category: true } } },
  });
  if (!product || !product.active) notFound();

  const catalog = await prisma.product.findMany({ where: { active: true } });
  const compatible = compatibleWith(product, catalog);
  const colorVariants = catalog.filter((p) => {
    const base = (sku: string) => sku.replace(/-(WH|GY|BK)$/i, "");
    return base(p.sku) === base(product.sku);
  });

  const attrs = JSON.parse(product.attrsJson || "{}") as Record<string, string>;
  const docs = JSON.parse(product.documentsJson || "[]") as { name: string; url: string }[];
  const priced = hasConfirmedPrice(product);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
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
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[var(--card)]">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-10" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-full bg-white/80" />
            </div>
          )}
        </div>

        <div>
          <p className="text-sm text-[var(--muted)]">
            арт. {product.sku}
            {product.series ? ` · ${product.series}` : ""}
            {product.color ? ` · ${product.color}` : ""}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{product.name}</h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">{product.description}</p>

          {product.warranty && (
            <p className="mt-4 text-sm">Гарантия: {product.warranty}</p>
          )}
          {product.certNumber && (
            <p className="mt-2 text-sm">
              Сертификат:{" "}
              <Link href="/documents" className="underline">
                {product.certNumber}
              </Link>
            </p>
          )}

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
                      className={`inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm ${
                        active ? "ring-2 ring-[var(--ink)]" : ""
                      }`}
                    >
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15" style={{ backgroundColor: swatch }} />
                      {v.color || v.sku}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <ProductBuyBox product={product} />

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
          {!priced && (
            <p className="mt-6 text-sm text-[var(--muted)]">Цена на сайте появится после подтверждения в админке.</p>
          )}
        </div>
      </div>

      {compatible.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title">
            {product.kitRole === "mechanism"
              ? "Совместимые рамки"
              : product.kitRole === "frame"
                ? "Совместимые механизмы"
                : "Другие цвета"}
          </h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {compatible.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
