import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ColorShowcase } from "@/components/ColorShowcase";
import { ProductCard } from "@/components/ProductCard";
import { HOME_FAQS, productAlt } from "@/lib/product-display";

export const dynamic = "force-dynamic";

const categoryMeta = [
  { slug: "rozetki", name: "Розетки", type: "розетка", sku: "D1-BK", caption: null as string | null },
  { slug: "vyklyuchateli", name: "Выключатели", type: "выключатель", sku: "S1-BK", caption: null },
  { slug: "ramki", name: "Рамки", type: "рамка", sku: "P3-BK", caption: null },
  { slug: "mehanizmy", name: "Механизмы", type: "механизм", sku: "M-D1-BK", caption: "Для сборки блока" },
];

export default async function HomePage() {
  const [products, certificates] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      select: {
        id: true,
        slug: true,
        name: true,
        sku: true,
        priceRetail: true,
        priceWholesale: true,
        stock: true,
        packQty: true,
        imageUrl: true,
        productType: true,
        color: true,
        kitRole: true,
        brand: { select: { name: true } },
      },
      orderBy: [{ productType: "asc" }, { name: "asc" }],
    }),
    prisma.certificate.findMany({ where: { published: true }, orderBy: { number: "asc" } }),
  ]);

  const bySku = (sku: string) => products.find((p) => p.sku === sku);
  const heroProduct = bySku("D1-BK") || products[0];
  const colorProducts = ["D1-WH", "D1-GY", "D1-BK"].map(bySku).filter(Boolean) as typeof products;
  const assembled = bySku("D1-BK") || products.find((p) => p.kitRole === "assembled");
  const frame = bySku("P3-BK") || products.find((p) => p.kitRole === "frame");
  const mechanism = bySku("M-D1-BK") || products.find((p) => p.kitRole === "mechanism");
  const frames = ["P2-BK", "P3-BK", "P4-BK"].map(bySku).filter(Boolean) as typeof products;
  const preferred = ["D1-BK", "S1-WH", "P3-GY", "M-D1-BK", "USB-BK", "S2-WH", "P2-BK", "M-S1-GY"];
  const showcase = preferred.map(bySku).filter(Boolean) as typeof products;
  if (showcase.length < 8) {
    for (const p of products) {
      if (showcase.length >= 8) break;
      if (!showcase.some((s) => s.id === p.id)) showcase.push(p);
    }
  }
  const whyImages = [bySku("D1-BK"), bySku("S1-WH"), bySku("P3-GY")].filter(Boolean) as typeof products;

  return (
    <div>
      <section className="hero-gradient">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 pb-10 pt-8 sm:gap-10 sm:pb-16 sm:pt-12 lg:grid-cols-[1.05fr_0.95fr] lg:pt-16">
          <div>
            <h1 className="section-title max-w-md">Розетки и выключатели Laitys</h1>
            <p className="mt-4 max-w-md text-lg text-[var(--muted)]">Для современного интерьера. В трёх цветах</p>
            <Link href="/catalog" className="btn btn-primary mt-6 w-full sm:mt-8 sm:w-auto">
              В каталог
            </Link>
          </div>
          <div className="justify-self-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroProduct?.imageUrl || "/images/placeholder.png"}
              alt={heroProduct ? productAlt(heroProduct) : "Чёрная розетка Laitys"}
              className="aspect-[4/5] w-full max-w-md rounded-[1.5rem] bg-white object-cover object-left sm:aspect-[5/4] sm:rounded-[2rem]"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="section-title">Каталог</h2>
          <Link href="/catalog" className="text-[0.9375rem] font-medium text-[var(--muted)] hover:text-[var(--ink)]">
            Все товары
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {categoryMeta.map((c) => {
            const sample = bySku(c.sku) || products.find((p) => p.productType === c.type);
            return (
              <Link key={c.slug} href={`/catalog?type=${encodeURIComponent(c.type)}`} className="rounded-2xl bg-white p-3 hover:bg-[var(--sand)] sm:p-5">
                <div className="aspect-square overflow-hidden rounded-xl bg-[var(--card)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sample?.imageUrl || "/images/placeholder.png"}
                    alt={sample ? productAlt(sample) : c.name}
                    className="h-full w-full object-cover object-left"
                  />
                </div>
                <p className="mt-3 text-lg font-semibold tracking-tight">{c.name}</p>
                {c.caption && <p className="mt-1 text-sm text-[var(--muted)]">{c.caption}</p>}
              </Link>
            );
          })}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-5 lg:grid-cols-4">
          {showcase.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <ColorShowcase products={colorProducts.length ? colorProducts : products.filter((p) => p.sku.startsWith("D1-"))} />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <h2 className="section-title">Как собрать блок</h2>
        <p className="mt-3 max-w-xl text-[var(--muted)]">
          Для одного места выберите готовое изделие. Для нескольких — рамку и подходящие механизмы.
        </p>
        <div className="mt-8 grid gap-3 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5">
            <div className="aspect-[4/3] overflow-hidden rounded-xl bg-[var(--card)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={assembled?.imageUrl || "/images/placeholder.png"}
                alt={assembled ? productAlt(assembled) : "Готовое изделие Laitys"}
                className="h-full w-full object-cover object-left"
              />
            </div>
            <p className="mt-4 font-semibold">Готовое изделие</p>
          </div>
          <div className="rounded-2xl bg-white p-5">
            <div className="grid grid-cols-2 gap-2">
              <div className="aspect-square overflow-hidden rounded-xl bg-[var(--card)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={frame?.imageUrl || "/images/placeholder.png"}
                  alt={frame ? productAlt(frame) : "Рамка Laitys"}
                  className="h-full w-full object-cover object-left"
                />
              </div>
              <div className="aspect-square overflow-hidden rounded-xl bg-[var(--card)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mechanism?.imageUrl || "/images/placeholder.png"}
                  alt={mechanism ? productAlt(mechanism) : "Механизм Laitys без рамки"}
                  className="h-full w-full object-cover object-left"
                />
              </div>
            </div>
            <p className="mt-4 font-semibold">Рамка + механизмы</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-[var(--muted)]">Пост — одно место в рамке для розетки или выключателя.</p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {frames.map((f) => (
            <div key={f.id} className="rounded-2xl bg-white p-3 text-center">
              <div className="aspect-square overflow-hidden rounded-xl bg-[var(--card)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={f.imageUrl || "/images/placeholder.png"} alt={productAlt(f)} className="h-full w-full object-cover object-left" />
              </div>
              <p className="mt-2 text-sm font-medium">{f.sku.startsWith("P2") ? "2 места" : f.sku.startsWith("P3") ? "3 места" : "4 места"}</p>
            </div>
          ))}
        </div>
        <Link href="/kit" className="btn btn-primary mt-8 w-full sm:w-auto">
          Собрать блок
        </Link>
      </section>

      <section className="border-y border-[var(--line)] bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="section-title">Почему Laitys</h2>
          <p className="mt-3 max-w-xl text-[var(--muted)]">Дизайн, качество и доступная цена — в одной коллекции.</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {whyImages.map((p) => (
              <div key={p.id} className="overflow-hidden rounded-2xl bg-[var(--card)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.imageUrl || "/images/placeholder.png"} alt={productAlt(p)} className="aspect-square w-full object-cover object-left" />
              </div>
            ))}
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                t: "Единый стиль",
                d: "Розетки, выключатели и рамки, которые сочетаются между собой",
              },
              {
                t: "Качество",
                d: "Сертификаты на продукцию и гарантия на механизмы",
              },
              {
                t: "Доступная цена",
                d: "Выберите изделия и соберите комплект под свой бюджет",
              },
              {
                t: "Три цвета",
                d: "Белый, серый и чёрный для разных интерьеров",
              },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl bg-[var(--paper)] p-5">
                <p className="font-semibold">{x.t}</p>
                <p className="mt-2 text-[0.9375rem] text-[var(--muted)]">{x.d}</p>
              </div>
            ))}
          </div>
          <Link href="/catalog" className="btn btn-primary mt-8 w-full sm:w-auto">
            В каталог
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <h2 className="section-title">Гарантия</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-5">
            <p className="text-3xl font-semibold tracking-tight">10 лет</p>
            <p className="mt-2 text-[0.9375rem] text-[var(--muted)]">Механизмы розеток и выключателей.</p>
          </div>
          <div className="rounded-2xl bg-white p-5">
            <p className="text-3xl font-semibold tracking-tight">1 год</p>
            <p className="mt-2 text-[0.9375rem] text-[var(--muted)]">USB A+C и TV+компьютер.</p>
          </div>
          <div className="rounded-2xl bg-white p-5">
            <p className="font-semibold">Рамки</p>
            <p className="mt-2 text-[0.9375rem] text-[var(--muted)]">Срок гарантии указан в карточке конкретной модели.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link href="/returns" className="btn btn-primary w-full sm:w-auto">
            Условия гарантии
          </Link>
          <Link href="/documents" className="btn btn-copper w-full sm:w-auto">
            Сертификаты
          </Link>
        </div>
        {certificates.length > 0 && (
          <ul className="mt-8 space-y-3 text-sm">
            {certificates.map((c) => (
              <li key={c.id} className="rounded-2xl bg-white p-4">
                <p className="font-medium">{c.title}</p>
                <p className="mt-1 text-[var(--muted)]">{c.number}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="border-y border-[var(--line)] bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="section-title">Доставка и оплата</h2>
          <p className="mt-4 max-w-xl text-[var(--muted)]">
            Укажите город. Стоимость и срок доставки появятся до оплаты.
          </p>
          <Link href="/delivery" className="btn btn-copper mt-6 w-full sm:w-auto">
            Подробнее
          </Link>
          <h2 className="section-title mt-12">Вопросы</h2>
          <div className="mt-8 max-w-3xl space-y-3">
            {HOME_FAQS.map((f) => (
              <details key={f.question} className="rounded-2xl bg-[var(--paper)] p-4">
                <summary className="cursor-pointer font-semibold">{f.question}</summary>
                <p className="mt-2 text-[0.9375rem] text-[var(--muted)]">{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
