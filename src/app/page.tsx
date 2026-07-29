import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/ProductCard";
import { getSession } from "@/lib/auth";
import { ArrowRight, BadgeCheck, Package, Shield, Truck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  const [categories, hits, news, brands, reviews, faqs, posts] = await Promise.all([
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
  ]);

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[var(--line)]">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,#142033_0%,#1c2d4a_45%,#2a3f5f_100%)]" />
        <div
          className="circuit-line absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-[var(--copper)] to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
          <div className="reveal text-white">
            <p className="font-[family-name:var(--font-display)] text-4xl tracking-tight sm:text-6xl">SaitYarik</p>
            <h1 className="mt-5 max-w-xl text-2xl font-medium leading-snug text-white/90 sm:text-3xl">
              Электрофурнитура Futina — розетки, выключатели и рамки со склада
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65">
              Реальный ассортимент из поставки Guangdong Futina: белый, серый и чёрный. Розница и опт, оплата ЮKassa, доставка по РФ.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalog" className="btn btn-copper">
                В каталог <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/b2b" className="btn border border-white/25 bg-white/5 text-white hover:bg-white/10">
                Оптовикам
              </Link>
            </div>
          </div>
          <div className="reveal relative min-h-[280px] rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="absolute inset-6 rounded-xl border border-dashed border-[var(--copper)]/40" />
            <div className="relative grid h-full content-end gap-4">
              <p className="font-[family-name:var(--font-display)] text-5xl text-[var(--copper)]">IP44+</p>
              <p className="max-w-sm text-sm text-white/70">
                Фильтры по бренду, серии, IP, току и типу монтажа. Кратность упаковки и наличие по складам.
              </p>
              <div className="grid grid-cols-3 gap-2 text-center text-xs text-white/80">
                <div className="rounded-lg bg-black/20 p-3">
                  <Truck className="mx-auto mb-1 h-4 w-4 text-[var(--copper)]" />
                  Доставка
                </div>
                <div className="rounded-lg bg-black/20 p-3">
                  <Package className="mx-auto mb-1 h-4 w-4 text-[var(--copper)]" />
                  Наличие
                </div>
                <div className="rounded-lg bg-black/20 p-3">
                  <Shield className="mx-auto mb-1 h-4 w-4 text-[var(--copper)]" />
                  Гарантия
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
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

      <section className="border-y border-[var(--line)] bg-white/50 py-12">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BadgeCheck, t: "Обмен с 1С", d: "CommerceML: номенклатура, цены, остатки, заказы" },
            { icon: Shield, t: "54-ФЗ и Честный ЗНАК", d: "Фискализация ЮKassa и коды маркировки" },
            { icon: Truck, t: "Логистика", d: "СДЭК / Ozon, ПВЗ и самовывоз" },
            { icon: Package, t: "B2B", d: "Оптовые цены, счета и заявка на сотрудничество" },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t} className="flex gap-3">
              <Icon className="mt-1 h-5 w-5 shrink-0 text-[var(--copper)]" />
              <div>
                <p className="font-semibold">{t}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{d}</p>
              </div>
            </div>
          ))}
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

      <section className="border-y border-[var(--line)] bg-[var(--ink)] py-14 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-2">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">Оптовикам и монтажным бригадам</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
              Регистрация юрлица, модерация менеджером, оптовые типы цен из 1С, быстрый заказ по артикулам и счета PDF.
            </p>
            <Link href="/b2b" className="btn btn-copper mt-6">
              Условия сотрудничества
            </Link>
          </div>
          <B2BQuickForm />
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
              <li>• Курьер и ПВЗ логистической службы — по тарифам API</li>
              <li>• Самовывоз со склада — бесплатно</li>
              <li>• Оплата: карты «Мир», СБП, для B2B — безнал по счёту</li>
              <li>• Фискальный чек на e-mail/телефон после оплаты</li>
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
        <ContactForm />
      </section>
    </div>
  );
}

function B2BQuickForm() {
  return (
    <form action="/api/b2b-request" method="post" className="grid gap-3 rounded-2xl bg-white p-5 text-[var(--ink)]">
      <p className="font-semibold">Быстрая заявка B2B</p>
      <input name="companyName" required placeholder="Компания" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
      <input name="inn" required placeholder="ИНН" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
      <input name="contactName" required placeholder="Контактное лицо" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
      <input name="phone" required placeholder="Телефон" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
      <input name="email" type="email" required placeholder="E-mail" className="rounded border border-[var(--line)] px-3 py-2 text-sm" />
      <textarea name="message" placeholder="Комментарий" className="rounded border border-[var(--line)] px-3 py-2 text-sm" rows={3} />
      <label className="flex items-start gap-2 text-xs text-[var(--muted)]">
        <input type="checkbox" name="consent" required className="mt-0.5" />
        Согласен на обработку персональных данных
      </label>
      <button type="submit" className="btn btn-primary">
        Отправить заявку
      </button>
    </form>
  );
}

function ContactForm() {
  return (
    <form action="/api/contact" method="post" className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-2">
      <input name="name" required placeholder="Имя" className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm" />
      <input name="phone" required placeholder="Телефон" className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm" />
      <input name="email" type="email" placeholder="E-mail" className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm sm:col-span-2" />
      <textarea name="message" required placeholder="Сообщение" rows={4} className="rounded border border-[var(--line)] bg-white px-3 py-2 text-sm sm:col-span-2" />
      <label className="flex items-start gap-2 text-xs text-[var(--muted)] sm:col-span-2">
        <input type="checkbox" required className="mt-0.5" />
        Согласие на обработку ПДн (152-ФЗ)
      </label>
      <button type="submit" className="btn btn-primary sm:col-span-2 sm:w-fit">
        Отправить
      </button>
    </form>
  );
}
