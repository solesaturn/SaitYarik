import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductBuyBox } from "@/components/ProductBuyBox";
import { ProductCard } from "@/components/ProductCard";
import { hasConfirmedPrice } from "@/lib/pricing";
import { compatibleWith, kitSectionCopy } from "@/lib/compatibility";

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
  const kitCopy = kitSectionCopy(product);

  const attrs = JSON.parse(product.attrsJson || "{}") as Record<string, string>;
  const docs = JSON.parse(product.documentsJson || "[]") as { name: string; url: string }[];
  const priced = hasConfirmedPrice(product);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      <nav className="truncate text-xs text-[var(--muted)]">
        <Link href="/">Главная</Link>
        {" / "}
        <Link href="/catalog">Каталог</Link>
        {product.categories[0] && (
          <>
            {" / "}
            <Link href={`/catalog/${product.categories[0].category.slug}`}>{product.categories[0].category.name}</Link>
          </>
        )}
      </nav>

      <div className="mt-4 grid gap-6 sm:mt-6 lg:grid-cols-2 lg:gap-10">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-[var(--card)] sm:aspect-square">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover object-left" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-white/80 sm:h-40 sm:w-40" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <p className="text-sm text-[var(--muted)]">
            арт. {product.sku}
            {product.series ? ` · ${product.series}` : ""}
            {product.color ? ` · ${product.color}` : ""}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{product.name}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:mt-4">{product.description}</p>

          {product.warranty && <p className="mt-4 text-sm">Гарантия: {product.warranty}</p>}
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
              <p className="text-sm font-semibold">Цвет этой модели</p>
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
                      className={`inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm ${
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

          {Object.keys(attrs).length > 0 && (
            <div className="mt-8">
              <h2 className="font-semibold">Характеристики</h2>
              <dl className="mt-3 divide-y divide-[var(--line)] text-sm">
                {Object.entries(attrs).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5">
                    <dt className="shrink-0 text-[var(--muted)]">{k}</dt>
                    <dd className="text-right font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

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
        <section className="mt-10 sm:mt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="section-title">{kitCopy.title}</h2>
              <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{kitCopy.text}</p>
            </div>
            <Link href="/kit" className="text-sm font-medium underline underline-offset-4">
              Собрать в конструкторе
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {compatible.slice(0, 8).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
