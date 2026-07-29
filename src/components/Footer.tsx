import Link from "next/link";
import { SITE } from "@/lib/pricing";

const footerLinks = [
  { href: "/catalog", label: "Каталог" },
  { href: "/b2b", label: "Оптовикам" },
  { href: "/delivery", label: "Доставка и оплата" },
  { href: "/returns", label: "Возврат и гарантия" },
  { href: "/about", label: "О компании" },
  { href: "/contacts", label: "Контакты" },
  { href: "/blog", label: "Блог" },
  { href: "/brands", label: "Бренды" },
];

const legalLinks = [
  { href: "/legal/privacy", label: "Конфиденциальность" },
  { href: "/legal/terms", label: "Пользовательское соглашение" },
  { href: "/legal/offer", label: "Публичная оферта" },
  { href: "/sitemap-page", label: "Карта сайта" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--ink)] text-[var(--paper)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight">{SITE.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
            Интернет-магазин электрофурнитуры: розница и опт, обмен с 1С, оплата ЮKassa и маркировка «Честный ЗНАК».
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--copper)]">Разделы</p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {footerLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--copper)]">Юридическое</p>
          <ul className="mt-4 space-y-2 text-sm text-white/80">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--copper)]">Контакты</p>
          <p className="mt-4 text-lg font-medium">{SITE.phone}</p>
          <p className="mt-1 text-sm text-white/70">{SITE.email}</p>
          <p className="mt-3 text-sm text-white/60">{SITE.city} · склад и самовывоз</p>
          <p className="mt-6 text-xs text-white/40">ИНН 7700000000 · ОГРН 1027700000000</p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-white/40">
        © {new Date().getFullYear()} {SITE.name}. Сайт соответствует требованиям 54-ФЗ и 152-ФЗ.
      </div>
    </footer>
  );
}
