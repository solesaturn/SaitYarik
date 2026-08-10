import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { PopularProducts } from "@/components/PopularProducts";
import { LeadForm } from "@/components/LeadForm";
import { getSession } from "@/lib/auth";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  const [categories, popular, news, reviews, faqs] = await Promise.all([
    prisma.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: "asc" }, take: 8 }),
    prisma.product.findMany({
      where: { active: true, OR: [{ isHit: true }, { isNew: true }] },
      include: { brand: true },
      take: 24,
      orderBy: [{ isHit: "desc" }, { name: "asc" }],
    }),
    prisma.product.findMany({
      where: { isNew: true, active: true },
      include: { brand: true },
      take: 3,
    }),
    prisma.review.findMany({ where: { published: true }, take: 3 }),
    prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" }, take: 4 }),
  ]);

  return (
    <div>
      <section className="mx-auto max-w-7xl px-4 pb-6 pt-10 sm:pt-14">
        <p className="text-sm text-[var(--muted)]">Электрофурнитура Futina</p>
        <h1 className="section-title mt-2 max-w-2xl">Розетки, выключатели и рамки со склада</h1>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
          Белый, серый и чёрный. Официальная поставка. Доставка по РФ или самовывоз в Москве.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/catalog" className="btn btn-primary">
            В каталог <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <Link href="/constructor" className="btn btn-copper">
            Конструктор
          </Link>
        </div>
      </section>

      <PopularProducts products={popular} b2bApproved={session?.b2bApproved} />

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <h2 className="section-title">Соберите свой комплект</h2>
            <Link href="/constructor" className="btn btn-copper mt-6">
              Конструктор <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--muted)] lg:justify-self-end">
            Рамка и механизм покупаются отдельно: сначала выберите механизм (розетка или выключатель), затем рамку
            на нужное число постов в том же цвете. Так проще собрать блок под вашу стену и интерьер.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/lifestyle/kitchen.svg"
            alt="Фурнитура в интерьере кухни"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/lifestyle/interior.svg"
            alt="Розетка в интерьере"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10">
        <h2 className="section-title">Категории</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/catalog/${c.slug}`}
              className="rounded-2xl bg-white p-5 transition hover:bg-[var(--sand)]"
            >
              <p className="text-lg font-semibold tracking-tight">{c.name}</p>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {news.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14">
          <h2 className="section-title">Новинки</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {news.map((p) => (
              <ProductCard key={p.id} product={p} b2bApproved={session?.b2bApproved} />
            ))}
          </div>
        </section>
      )}

      <section className="border-y border-[var(--line)] bg-white py-14">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-3">
          {[
            { t: "Склад в Москве", d: "Отгрузка в день заказа при наличии, самовывоз бесплатно" },
            { t: "Доставка по РФ", d: "Курьер или пункт выдачи — стоимость на оформлении" },
            { t: "Сертифицировано", d: "Официальная поставка Futina, документы по запросу" },
          ].map((x) => (
            <div key={x.t}>
              <p className="font-semibold">{x.t}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="section-title">Отзывы</h2>
            <div className="mt-6 space-y-4">
              {reviews.map((r) => (
                <blockquote key={r.id} className="rounded-2xl bg-white p-5">
                  <p className="text-sm leading-relaxed">“{r.text}”</p>
                  <footer className="mt-2 text-xs text-[var(--muted)]">
                    {r.author} · {"★".repeat(r.rating)}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
          <div>
            <h2 className="section-title">FAQ</h2>
            <div className="mt-6 space-y-3">
              {faqs.map((f) => (
                <details key={f.id} className="rounded-2xl bg-white p-4">
                  <summary className="cursor-pointer font-semibold">{f.question}</summary>
                  <p className="mt-2 text-sm text-[var(--muted)]">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <h2 className="section-title">Обратная связь</h2>
        <LeadForm variant="contact" source="home_contact" className="mt-6 max-w-xl rounded-2xl bg-white p-5" />
      </section>
    </div>
  );
}
