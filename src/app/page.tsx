import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { getSession } from "@/lib/auth";
import { LeadForm } from "@/components/LeadForm";
import { ArrowRight, BadgeCheck, Package, Shield, Truck, Warehouse } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  const [categories, hits, news, brands, reviews, faqs, posts, productCount] = await Promise.all([
    prisma.category.findMany({ where: { parentId: null }, orderBy: { sortOrder: "asc" }, take: 8 }),
    prisma.product.findMany({
      where: { isHit: true, active: true },
      include: { brand: true },
      take: 4,
    }),
    prisma.product.findMany({
      where: { isNew: true, active: true },
      include: { brand: true },
      take: 4,
    }),
    prisma.brand.findMany({ take: 6 }),
    prisma.review.findMany({ where: { published: true }, take: 3 }),
    prisma.faqItem.findMany({ orderBy: { sortOrder: "asc" }, take: 4 }),
    prisma.blogPost.findMany({ where: { published: true }, take: 2, orderBy: { createdAt: "desc" } }),
    prisma.product.count({ where: { active: true } }),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#142033_0%,#1c2d4a_45%,#2a3f5f_100%)]" />
        <div
          className="circuit-line absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-[var(--copper)] to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-16 lg:py-24">
          <div className="reveal max-w-2xl text-white">
            <p className="font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-6xl">SaitYarik</p>
            <h1 className="mt-5 max-w-xl text-2xl font-medium leading-snug text-white/90 sm:text-3xl">
              Электрофурнитура Futina — розетки, выключатели и рамки со склада
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65">
              Белый, серый и чёрный. Официальная поставка Guangdong Futina. Доставка по РФ или самовывоз в Москве.
            </p>
            <div className="mt-8">
              <Link href="/catalog" className="btn btn-copper">
                В каталог <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="section-title">С чего начать</h2>
        <p className="mt-2 max-w-xl text-sm text-[var(--muted)]">Выберите ситуацию — покажем подходящие товары.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            {
              href: "/catalog?type=розетка",
              t: "Меняю одну розетку",
              d: "Быстрый подбор розетки по цвету и наличию",
            },
            {
              href: "/catalog",
              t: "Ремонт в квартире — нужен комплект",
              d: "Розетки, выключатели и рамки в одной серии",
            },
            {
              href: "/b2b",
              t: "Объект / стройка",
              d: "Закупка от 50 штук для монтажников и магазинов",
            },
          ].map((x) => (
            <Link
              key={x.t}
              href={x.href}
              className="group border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--ink)]"
            >
              <p className="font-[family-name:var(--font-display)] text-xl">{x.t}</p>
              <p className="mt-2 text-sm text-[var(--muted)]">{x.d}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--ink)]">
                Перейти <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white/50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="section-title">Как это работает</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { n: "01", t: "Выбираете", d: "Розетку, выключатель или рамку — цвет и количество постов" },
              { n: "02", t: "Оформляете за 2 поля", d: "Имя и телефон — или сразу оплата в корзине без регистрации" },
              { n: "03", t: "Получаете", d: "В пункте выдачи, курьером или самовывозом со склада в Москве" },
            ].map((s) => (
              <div key={s.n}>
                <p className="font-[family-name:var(--font-display)] text-3xl text-[var(--copper)]">{s.n}</p>
                <p className="mt-2 font-semibold">{s.t}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="section-title">Рамка и механизм — отдельно</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          В серии Futina рамка и механизм покупаются по отдельности: сначала выбираете механизм (розетка или
          выключатель), затем подходящую рамку на нужное число постов и в том же цвете. Так проще собрать блок
          под вашу стену.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/catalog?type=механизм" className="btn btn-primary">
            Механизмы
          </Link>
          <Link href="/catalog?type=рамка" className="btn btn-ghost">
            Рамки
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="section-title">Категории</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <Link
              key={c.id}
              href={`/catalog/${c.slug}`}
              className="group border border-[var(--line)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--ink)]"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <p className="font-[family-name:var(--font-display)] text-xl">{c.name}</p>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-[var(--ink)] py-14 text-white">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">Почему мы</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Warehouse,
                t: "Склад в Москве",
                d: "Собственный склад — самовывоз и отгрузка в день заказа при наличии.",
              },
              {
                icon: Package,
                t: `${productCount} позиций Futina`,
                d: "Реальный ассортимент из поставки Guangdong Futina: белый, серый, чёрный.",
              },
              {
                icon: BadgeCheck,
                t: "Официальная поставка",
                d: "Товар сертифицирован. Документы ТР ТС — в разделе сертификатов.",
              },
              {
                icon: Truck,
                t: "Доставка по РФ",
                d: "Курьер, пункт выдачи или самовывоз. Сроки и стоимость — на оформлении.",
              },
              {
                icon: Shield,
                t: "Гарантия производителя",
                d: "Работаем с физлицами и юрлицами. Возврат по закону и условиям магазина.",
              },
              {
                icon: ArrowRight,
                t: "Отгрузка без лишних шагов",
                d: "Каталог → корзина → имя и телефон. Регистрация не обязательна.",
              },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="flex gap-3">
                <Icon className="mt-1 h-5 w-5 shrink-0 text-[var(--copper)]" />
                <div>
                  <p className="font-semibold">{t}</p>
                  <p className="mt-1 text-sm text-white/70">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex items-end justify-between gap-4">
          <h2 className="section-title">Хиты продаж</h2>
          <Link href="/catalog?sort=popular" className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--ink)]">
            Весь каталог →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {hits.map((p) => (
            <ProductCard key={p.id} product={p} b2bApproved={session?.b2bApproved} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14">
        <h2 className="section-title">Новинки</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {news.map((p) => (
            <ProductCard key={p.id} product={p} b2bApproved={session?.b2bApproved} />
          ))}
        </div>
      </section>

      <section className="border-y border-[var(--line)] bg-white/60 py-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
              Для монтажников и магазинов
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              Закупка от 50 штук: после подтверждения юрлица в кабинете показываем вашу цену. Счета и отгрузка —
              через менеджера.
            </p>
            <Link href="/b2b" className="btn btn-primary mt-6">
              Условия для опта
            </Link>
          </div>
          <LeadForm variant="quote" source="wholesale_home" className="border border-[var(--line)] bg-white p-5" />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="section-title">Бренды</h2>
        <div className="mt-8 flex flex-wrap gap-3">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/brands/${b.slug}`}
              className="border border-[var(--line)] bg-white px-5 py-3 text-sm font-semibold hover:border-[var(--ink)]"
            >
              {b.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="section-title">Доставка и оплата</h2>
            <ul className="mt-6 space-y-3 text-sm text-[var(--muted)]">
              <li>• Курьер и пункт выдачи — по тарифам службы</li>
              <li>• Самовывоз со склада в Москве — бесплатно</li>
              <li>• Оплата: карты «Мир», СБП; для юрлиц — безнал по счёту</li>
            </ul>
            <Link href="/delivery" className="mt-4 inline-block text-sm font-semibold underline">
              Подробнее
            </Link>
          </div>
          <div>
            <h2 className="section-title">Отзывы</h2>
            <div className="mt-6 space-y-4">
              {reviews.map((r) => (
                <blockquote key={r.id} className="border border-[var(--line)] bg-white p-4">
                  <p className="text-sm leading-relaxed">“{r.text}”</p>
                  <footer className="mt-2 text-xs text-[var(--muted)]">
                    {r.author} · {"★".repeat(r.rating)}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-white/60 py-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2">
          <div>
            <h2 className="section-title">Блог</h2>
            <div className="mt-6 space-y-4">
              {posts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="block border border-[var(--line)] bg-white p-4 hover:border-[var(--ink)]">
                  <p className="font-semibold">{p.title}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h2 className="section-title">FAQ</h2>
            <div className="mt-6 space-y-3">
              {faqs.map((f) => (
                <details key={f.id} className="border border-[var(--line)] bg-white p-4">
                  <summary className="cursor-pointer font-semibold">{f.question}</summary>
                  <p className="mt-2 text-sm text-[var(--muted)]">{f.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="section-title">Обратная связь</h2>
        <LeadForm variant="contact" source="home_contact" className="mt-6 max-w-xl border border-[var(--line)] bg-white p-5" />
      </section>
    </div>
  );
}
