import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PopularProducts } from "@/components/PopularProducts";
import { HOME_FAQS } from "@/lib/product-display";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, products, certificates] = await Promise.all([
    prisma.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: "asc" } }),
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

  const heroProduct = products.find((p) => p.sku === "D1-BK") || products[0];

  return (
    <div>
      <section className="hero-gradient">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 pb-10 pt-8 sm:gap-10 sm:pb-16 sm:pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
          <div>
            <h1 className="section-title max-w-xl">Розетки и выключатели Laitys</h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              Для современного интерьера. В трёх цветах
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Link href="/catalog" className="btn btn-primary w-full sm:w-auto">
                В каталог
              </Link>
              <Link href="/kit" className="btn btn-copper w-full sm:w-auto">
                Собрать блок
              </Link>
            </div>
          </div>
          <div className="justify-self-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroProduct?.imageUrl || "/images/common/01.png"}
              alt={heroProduct?.name || "Розетка Laitys"}
              className="aspect-[5/3] w-full max-w-md rounded-[1.5rem] bg-[var(--card)] object-contain p-6 sm:aspect-square sm:rounded-[2rem]"
            />
          </div>
        </div>
      </section>

      <PopularProducts products={products} />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="section-title">Почему Laitys</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              Дизайн, качество и доступная цена — в одной коллекции.
            </p>
          </div>
          <div className="overflow-hidden rounded-[1.5rem] bg-[var(--card)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/common/01.png" alt="Розетки Laitys белая, серая и чёрная" className="aspect-[2/1] w-full object-contain p-4 sm:p-6" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="section-title">Как собрать блок</h2>
        <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
          Для одного места выберите готовое изделие. Для нескольких — рамку и подходящие механизмы.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Готовое изделие", d: "Для одного места" },
            { t: "Рамка + механизмы", d: "Для двух, трёх и четырёх мест" },
            { t: "Один цвет", d: "Белый, серый или чёрный" },
            { t: "Пост", d: "Одно место в рамке для розетки или выключателя" },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl bg-white p-5">
              <p className="font-semibold">{x.t}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{x.d}</p>
            </div>
          ))}
        </div>
        <Link href="/kit" className="btn btn-primary mt-8 w-full sm:w-auto">
          Собрать блок
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:pb-16">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="section-title">Примеры</h2>
          <Link href="/kit" className="text-sm font-medium underline underline-offset-4">
            Подобрать свой
          </Link>
        </div>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { title: "Рабочее место", detail: "Две силовые розетки", preset: "desk", n: "2 поста" },
            { title: "Спальня", detail: "Розетка и выключатель", preset: "bed", n: "2 поста" },
            { title: "ТВ-зона", detail: "Две розетки и TV + компьютер", preset: "tv", n: "3 поста" },
          ].map((x) => (
            <Link key={x.preset} href={`/kit?preset=${x.preset}`} className="rounded-2xl bg-white p-5 hover:bg-[var(--sand)]">
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Пример подбора</p>
              <p className="mt-3 text-sm text-[var(--muted)]">{x.n}</p>
              <p className="mt-1 text-lg font-semibold tracking-tight">{x.title}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{x.detail}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <h2 className="section-title">Каталог</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.id} href={`/catalog/${c.slug}`} className="rounded-2xl bg-white p-5 hover:bg-[var(--sand)]">
              <p className="text-lg font-semibold tracking-tight">{c.name}</p>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="section-title">Гарантия</h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div>
              <p className="text-4xl font-semibold tracking-tight">10 лет</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Механизмы розеток и выключателей.</p>
            </div>
            <div>
              <p className="text-4xl font-semibold tracking-tight">1 год</p>
              <p className="mt-2 text-sm text-[var(--muted)]">USB A+C и TV+компьютер.</p>
            </div>
            <div>
              <p className="font-semibold">Рамки</p>
              <p className="mt-2 text-sm text-[var(--muted)]">Срок гарантии указан в карточке конкретной модели.</p>
              <ul className="mt-6 space-y-3 text-sm">
                {certificates.map((c) => (
                  <li key={c.id} className="rounded-2xl bg-[var(--paper)] p-4">
                    <p className="font-medium">{c.title}</p>
                    <p className="mt-1 text-[var(--muted)]">{c.number}</p>
                  </li>
                ))}
              </ul>
              <Link href="/documents" className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                Сертификаты <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#111] py-10 text-white sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="section-title">Для бизнеса</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
            Отправьте список товаров или спецификацию. Мы подготовим расчёт и согласуем условия заказа.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/b2b" className="btn btn-light w-full sm:w-auto">
              Отправить спецификацию
            </Link>
            <Link href="/catalog" className="btn w-full border border-white/20 bg-transparent text-white hover:bg-white/10 sm:w-auto">
              В каталог
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <h2 className="section-title">Вопросы</h2>
        <div className="mt-8 max-w-3xl space-y-3">
          {HOME_FAQS.map((f) => (
            <details key={f.question} className="rounded-2xl bg-white p-4">
              <summary className="cursor-pointer font-semibold">{f.question}</summary>
              <p className="mt-2 text-sm text-[var(--muted)]">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
