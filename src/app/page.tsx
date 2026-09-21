import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PopularProducts } from "@/components/PopularProducts";
import { getHomeFaqs } from "@/lib/home-faqs";
import { homeContent } from "@/lib/editor-server";
import { getSession, isStaff } from "@/lib/auth";
import { notFound } from "next/navigation";
import { ProductImage } from "@/components/ProductImage";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata() { const content=await homeContent(); return {title:content.seoTitle,description:content.seoDescription}; }

export default async function HomePage({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}) {
  const preview=(await searchParams).preview==="home";
  if(preview){const session=await getSession();if(!session || !isStaff(session.role))notFound();}
  const content=await homeContent(preview);
  const [categories, products, certificates, faqs] = await Promise.all([
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
        attrsJson: true,
        posts: true,
        brand: { select: { name: true } },
      },
      orderBy: [{ productType: "asc" }, { name: "asc" }],
    }),
    prisma.certificate.findMany({ where: { published: true }, orderBy: { number: "asc" } }),
    getHomeFaqs(preview),

  ]);

  return (
    <div>
      {preview && <div className="bg-amber-100 p-4 text-center text-sm">Предпросмотр черновика. Посетители видят опубликованную версию. <Link className="underline" href="/admin/content">Вернуться в редактор</Link></div>}
      <section className="hero-gradient">
        <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 pb-10 pt-8 sm:gap-10 sm:pb-16 sm:pt-12 lg:grid-cols-[0.85fr_1.15fr] lg:pt-16">
          <div>
            <h1 className="section-title max-w-xl">{content.heroTitle}</h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              {content.heroText}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Link href="/catalog" className="btn btn-primary w-full sm:w-auto">
                Смотреть каталог
              </Link>
              <Link href="/kit" className="btn btn-copper w-full sm:w-auto">
                Собрать блок
              </Link>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#d4d2cb]">
            {content.heroImage === '/images/products/D1-WH/01.png' ? <>
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(120deg,#eeeae2_0%,#d4d2cb_70%,#b8b8b1_100%)]" />
              <div aria-hidden="true" className="absolute inset-y-0 left-[12%] w-px bg-white/60 shadow-[30px_0_55px_12px_#b7b4ab]" />
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[15%] border-t-8 border-[#9c7856] bg-[#ba9670]" />
              <ProductImage src={content.heroImage} alt={content.heroAlt} className="absolute right-[22%] top-[23%] aspect-square w-[38%] drop-shadow-xl" />
              <span className="absolute bottom-[21%] left-6 text-xs uppercase tracking-[.2em] text-[#5f5e59]">Laitys · Zero</span>
            </> : <ProductImage src={content.heroImage} alt={content.heroAlt} className="h-full w-full object-contain p-4" />}
          </div>
        </div>
      </section>

      <PopularProducts products={products} />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="section-title">{content.whyTitle}</h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              {content.whyText}
            </p>
          </div>
          <div className="overflow-hidden rounded-[1.5rem] bg-[var(--card)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={content.whyImage} alt="Розетки Laitys белая, серая и чёрная" className="aspect-[2/1] w-full object-contain p-4 sm:p-6" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <h2 className="section-title">{content.guideTitle}</h2>
        <p className="mt-3 max-w-xl text-sm text-[var(--muted)]">
          {content.guideText}
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { t: "Готовое изделие", d: "Одинарная розетка или выключатель. Отдельная рамка не нужна." },
            { t: "Модуль", d: "Элемент для рамки на 2, 3 или 4 поста. Без рамки не используется." },
            { t: "Рамка", d: "Основа блока на 2, 3 или 4 поста. Все модули — одного цвета." },
            { t: "Пост", d: "Одно место в рамке для одного модуля" },
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
          <h2 className="section-title">{content.businessTitle}</h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/60">
            {content.businessText}
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

      {faqs.length > 0 && <section aria-labelledby="home-faq-title" className="border-y border-[var(--line)] bg-[#e5edf3] py-12 sm:py-20">
        <div className="mx-auto max-w-7xl px-4">
        <h2 id="home-faq-title" className="section-title">Вопросы о выборе и заказе</h2>
        <div className="mt-8 grid items-start gap-4 sm:mt-10 lg:grid-cols-2 lg:gap-6">
          {faqs.map((f) => (
            <details key={f.id} open className="rounded-2xl border border-black/10 border-t-4 border-t-[var(--ink)] bg-white p-5 shadow-sm sm:p-7">
              <summary className="cursor-pointer text-lg font-semibold leading-snug marker:text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-4 sm:text-xl">{f.question}</summary>
              <p className="mt-4 whitespace-pre-line text-base leading-relaxed text-[#454b52]">{f.answer}</p>
            </details>
          ))}
        </div>
        </div>
      </section>}
    </div>
  );
}
