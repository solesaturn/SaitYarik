import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PopularProducts } from "@/components/PopularProducts";
import { getSite } from "@/lib/site";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [site, categories, products, faqs, certificates] = await Promise.all([
    getSite(),
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
        brand: { select: { name: true } },
      },
      orderBy: [{ productType: "asc" }, { name: "asc" }],
    }),
    prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.certificate.findMany({ where: { published: true }, orderBy: { number: "asc" } }),
  ]);

  const heroProduct = products.find((p) => p.sku === "D1-BK") || products[0];

  return (
    <div>
      <section className="hero-gradient">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
          <div>
            <h1 className="section-title max-w-xl">{site.tagline}</h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog" className="btn btn-primary">
                В каталог
              </Link>
              <Link href="/constructor" className="btn btn-copper">
                Собрать комплект
              </Link>
            </div>
          </div>
          <div className="justify-self-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroProduct?.imageUrl || "/images/hero-socket.svg"}
              alt={heroProduct?.name || "Розетка Laitys"}
              className="aspect-square w-full max-w-md rounded-[2rem] bg-[#d9e4ee] object-contain p-8"
            />
          </div>
        </div>
      </section>

      <PopularProducts products={products} />

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="section-title">То, что видно каждый день</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              Рамка и механизм собираются в один блок. Цвет один на всю точку: белый, серый или чёрный.
            </p>
          </div>
          <div className="overflow-hidden rounded-[1.5rem] bg-[var(--card)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/lifestyle/interior.svg" alt="Блок розеток в интерьере" className="aspect-[4/3] w-full object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="section-title">Как устроен комплект</h2>
        <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
          Готовое изделие — на один пост. Для двух, трёх и четырёх постов нужны механизмы и рамка одного цвета.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Рамка", d: "Панель на 2, 3 или 4 поста" },
            { t: "Механизм", d: "Розетка, выключатель или TV+PC без панели" },
            { t: "Один цвет", d: "Белый, серый или чёрный — без смешивания" },
            { t: "Документы", d: "Сертификаты ТР ТС привязаны к артикулам" },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl bg-white p-5">
              <p className="font-semibold">{x.t}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="section-title">Категории</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.id} href={`/catalog/${c.slug}`} className="rounded-2xl bg-white p-5 hover:bg-[var(--sand)]">
              <p className="text-lg font-semibold tracking-tight">{c.name}</p>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="section-title">Гарантия и документы</h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div>
              <p className="text-4xl font-semibold tracking-tight">10 лет</p>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Гарантия на механизмы розеток и выключателей. Для USB A+C и TV+компьютер — 1 год.
              </p>
            </div>
            <div className="lg:col-span-2">
              <ul className="space-y-3 text-sm">
                {certificates.map((c) => (
                  <li key={c.id} className="rounded-2xl bg-[var(--paper)] p-4">
                    <p className="font-medium">{c.title}</p>
                    <p className="mt-1 text-[var(--muted)]">{c.number}</p>
                  </li>
                ))}
              </ul>
              <Link href="/documents" className="mt-4 inline-flex items-center gap-1 text-sm font-medium">
                Все документы <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#111] py-16 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="section-title">Проект, опт и спецификация</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
            Соберите корзину и отправьте заявку. Laitys посчитает условия вручную и пришлёт Excel, PDF или счёт. Сайт
            оптовую цену не считает.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/b2b" className="btn bg-white text-[var(--ink)] hover:bg-white/90">
              Запросить расчёт
            </Link>
            <Link href="/catalog" className="btn border border-white/20 bg-transparent text-white hover:bg-white/10">
              Собрать корзину
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="section-title">Вопросы</h2>
        <div className="mt-8 max-w-3xl space-y-3">
          {faqs.map((f) => (
            <details key={f.id} className="rounded-2xl bg-white p-4">
              <summary className="cursor-pointer font-semibold">{f.question}</summary>
              <p className="mt-2 text-sm text-[var(--muted)]">{f.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
