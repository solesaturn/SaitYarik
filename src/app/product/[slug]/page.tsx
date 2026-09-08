import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductBuyBox } from "@/components/ProductBuyBox";
import { ProductCard } from "@/components/ProductCard";
import { compatibleWith } from "@/lib/compatibility";
import { displayProduct, productAlt } from "@/lib/product-display";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { title: "Товар" };
  const view = displayProduct(product);
  return {
    title: product.seoTitle || `${view.title} ${product.sku}`,
    description: product.seoDescription || view.description,
    robots: { index: false, follow: false },
  };
}

const ATTR_GROUPS = {
  completeness: ["Комплектация", "Состав"],
  specs: ["Тип", "Ток / напряжение", "Подключение", "Шторки", "Цвет", "Постов"],
  size: ["Размер", "Монтаж", "Тип монтажа"],
  warranty: ["Гарантия"],
};

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
  const view = displayProduct(product);
  const attrs = JSON.parse(product.attrsJson || "{}") as Record<string, string>;
  const docs = JSON.parse(product.documentsJson || "[]") as { name: string; url: string }[];
  const usedKeys = new Set<string>();

  function pick(keys: string[]): [string, string][] {
    const rows: [string, string][] = [];
    for (const [k, v] of Object.entries(attrs)) {
      if (keys.includes(k)) {
        rows.push([k, v]);
        usedKeys.add(k);
      }
    }
    return rows;
  }

  const completenessRows = pick(ATTR_GROUPS.completeness);
  const specRows = pick(ATTR_GROUPS.specs);
  const sizeRows = pick(ATTR_GROUPS.size);
  if (product.mountType) sizeRows.push(["Тип монтажа", product.mountType]);
  const warrantyRows = pick(ATTR_GROUPS.warranty);
  const otherRows = Object.entries(attrs).filter(([k]) => !usedKeys.has(k) && k !== "Изготовитель" && k !== "Бренд") as [string, string][];

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
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[var(--card)] sm:aspect-square">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={productAlt(product)} className="h-full w-full object-cover object-left" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-white/80 sm:h-40 sm:w-40" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <h1 className="text-[1.75rem] font-semibold tracking-tight sm:text-3xl">{view.title}</h1>
          <div className="mt-3 flex flex-wrap gap-2">
            {view.badges.map((b) => (
              <span
                key={b}
                className={`rounded-full px-3 py-1 text-sm ${
                  b === "Без рамки" ? "bg-[var(--ink)] text-white" : "bg-white text-[var(--muted)]"
                }`}
              >
                {b}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">арт. {product.sku}</p>
          <p className="mt-4 leading-relaxed text-[var(--muted)]">{view.description}</p>

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
                      className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm ${
                        active ? "ring-2 ring-[var(--accent)]" : ""
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

          <ProductBuyBox product={product} />
          <Link href="/kit" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium underline underline-offset-4">
            Собрать блок
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <SpecBlock title="Комплектация" rows={completenessRows.length ? completenessRows : [["Состав", view.completeness || "Состав указан по модели"]]} />
        <SpecBlock title="Характеристики" rows={[...specRows, ...otherRows]} />
        <SpecBlock
          title="Размеры и монтаж"
          rows={sizeRows.length ? sizeRows : product.mountType ? [["Тип монтажа", product.mountType]] : []}
        />
        <section>
          <h2 className="font-semibold">Гарантия</h2>
          <p className="mt-3 text-[0.9375rem] text-[var(--muted)]">
            {product.warranty || warrantyRows[0]?.[1] || "Срок указан для этой модели."}
          </p>
          {product.certNumber && (
            <p className="mt-2 text-sm">
              Сертификат:{" "}
              <Link href="/documents" className="underline">
                {product.certNumber}
              </Link>
            </p>
          )}
          {docs.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {docs.map((d) => (
                <li key={d.name}>
                  <a href={d.url} className="underline">
                    {d.name}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {compatible.length > 0 && (
        <section className="mt-10 sm:mt-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="section-title">Собрать блок</h2>
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

function SpecBlock({ title, rows }: { title: string; rows: [string, string][] }) {
  if (rows.length === 0) return null;
  return (
    <section>
      <h2 className="font-semibold">{title}</h2>
      <dl className="mt-3 divide-y divide-[var(--line)] text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2.5">
            <dt className="shrink-0 text-[var(--muted)]">{k}</dt>
            <dd className="text-right font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
