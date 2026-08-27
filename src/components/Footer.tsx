import Link from "next/link";
import { SITE } from "@/lib/pricing";

const catalogLinks = [
  { href: "/catalog?type=розетка", label: "Розетки" },
  { href: "/catalog?type=выключатель", label: "Выключатели" },
  { href: "/catalog?type=рамка", label: "Рамки" },
  { href: "/catalog?type=механизм", label: "Механизмы" },
  { href: "/constructor", label: "Конструктор" },
];

const buyerLinks = [
  { href: "/delivery", label: "Доставка и оплата" },
  { href: "/returns", label: "Гарантия и возврат" },
  { href: "/documents", label: "Документы" },
  { href: "/contacts", label: "Контакты" },
];

const bizLinks = [
  { href: "/b2b", label: "Для бизнеса" },
  { href: "/about", label: "О нас" },
  { href: "/legal/offer", label: "Оферта" },
  { href: "/legal/privacy", label: "Конфиденциальность" },
];

export function Footer() {
  return (
    <footer className="mt-auto bg-[#111] text-white">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <p className="max-w-md text-2xl font-semibold tracking-tight sm:text-3xl">
            Тонкая рамка снаружи.
            <br />
            Сталь и медь внутри.
          </p>
          <Link href="/catalog" className="btn bg-white text-[var(--ink)] hover:bg-white/90">
            Перейти в каталог
          </Link>
        </div>

        <div className="mt-14 grid gap-10 border-t border-white/10 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold tracking-tight">{SITE.name}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/55">
              Электроустановочные изделия для интерьера. Белый, серый и чёрный.
            </p>
          </div>
          <FooterCol title="Каталог" links={catalogLinks} />
          <FooterCol title="Покупателям" links={buyerLinks} />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Контакты</p>
            <p className="mt-4 text-lg font-medium">{SITE.phone}</p>
            <p className="mt-1 text-sm text-white/55">{SITE.email}</p>
            <p className="mt-3 text-sm text-white/55">{SITE.city}</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {bizLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {SITE.shortName}
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">{title}</p>
      <ul className="mt-4 space-y-2 text-sm text-white/70">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
