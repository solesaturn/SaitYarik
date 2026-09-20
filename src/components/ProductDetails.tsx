import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductBuyBox } from "@/components/ProductBuyBox";
import { ProductCard } from "@/components/ProductCard";
import { hasConfirmedPrice } from "@/lib/pricing";
import { compatibleWith, kitSectionCopy } from "@/lib/compatibility";
import { ProductGallery } from "@/components/ProductGallery";
import { displayProduct, productImages } from "@/lib/product-display";

import type { Product } from "@prisma/client";
import { formatBadge, productBenefits, publicAttrs, photosOf } from "@/lib/product-content";

export type ProductDetailData = Pick<Product, "id"|"slug"|"sku"|"name"|"description"|"color"|"posts"|"kitRole"|"productType"|"warranty"|"certNumber"|"attrsJson"|"documentsJson"|"imageUrl"|"imagesJson"|"priceRetail"|"priceWholesale"|"stock"|"packQty"> & {categories:{category:{slug:string;name:string}}[]};

export async function ProductDetails({product,preview=false}:{product:ProductDetailData;preview?:boolean}) {
  const catalog = await prisma.product.findMany({ where: { active: true } });
  const compatible = compatibleWith(product, catalog);
  const colorVariants = catalog.filter((p) => {
    const base = (sku: string) => sku.replace(/-(WH|GY|BK)$/i, "");
    return base(p.sku) === base(product.sku);
  });
  const kitCopy = kitSectionCopy(product);
  const view = displayProduct(product);

  const attrs = publicAttrs(product.attrsJson);
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
        <ProductGallery key={product.slug} images={productImages(product)} alt={displayProduct(product).title} captions={photosOf(product).map(p=>p.caption)} />

        <div className="min-w-0">
          <p className="text-sm text-[var(--muted)]">
            арт. {product.sku}
            {view.color ? ` · ${view.color}` : ""}
            {view.completeness ? ` · ${view.completeness}` : ""}
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{view.title}</h1>
          <p className="mt-3 inline-block rounded-lg bg-[var(--sand)] px-3 py-2 text-sm font-semibold">{formatBadge(product)}</p>
          <ul className="mt-4 flex flex-wrap gap-2">{productBenefits(product).map(b=><li className="rounded-full border px-3 py-1 text-sm" key={b}>{b}</li>)}</ul>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)] sm:mt-4">{view.description}</p>

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
                      className={`inline-flex min-h-10 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm ${
                        active ? "ring-2 ring-[var(--ink)]" : ""
                      }`}
                    >
                      <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/15" style={{ backgroundColor: swatch }} />
                      {displayProduct(v).color || v.sku}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {preview ? <p className="mt-6 rounded-xl bg-amber-100 p-4">Предпросмотр: покупка недоступна до публикации.</p> : <ProductBuyBox product={product} />}
        </div>
      </div>

      {Object.keys(attrs).length > 0 && (
        <div className="mt-8 max-w-2xl">
          <h2 className="font-semibold">Характеристики</h2>
          <dl className="mt-3 divide-y divide-[var(--line)] text-sm">
            {Object.entries(attrs).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="min-w-0 flex-1 break-words text-[var(--muted)]">{k}</dt>
                <dd className="min-w-0 flex-1 break-words text-right font-medium">{v}</dd>
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
        <p className="mt-6 text-sm text-[var(--muted)]">Цена уточняется. Можно отправить запрос в разделе «Для бизнеса».</p>
      )}

      {compatible.length > 0 && (
        <section className="mt-10 sm:mt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="section-title">Собрать блок</h2>
              <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">{kitCopy.text}</p>
            </div>
            <Link href="/kit" className="text-sm font-medium underline underline-offset-4">
              Открыть конструктор
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
