import Link from "next/link";
import { SITE } from "@/lib/pricing";

const footerLinks = [
  { href: "/catalog", label: "Каталог" },
  { href: "/constructor", label: "Конструктор" },
  { href: "/delivery", label: "Условия заказа" },
  { href: "/returns", label: "Возврат и гарантия" },
  { href: "/about", label: "О компании" },
  { href: "/certificates", label: "Сертификаты" },
  { href: "/contacts", label: "Контакты" },
  { href: "/b2b", label: "Для монтажников и магазинов" },
];

const legalLinks = [
  { href: "/legal/privacy", label: "Конфиденциальность" },
  { href: "/legal/terms", label: "Пользовательское соглашение" },
  { href: "/legal/offer", label: "Публичная оферта" },
  { href: "/sitemap-page", label: "Карта сайта" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xl font-semibold tracking-tight lowercase">{SITE.name}</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-[var(--muted)]">
            Электрофурнитура Futina со склада в Москве: розетки, выключатели и рамки.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Разделы</p>
          <ul className="mt-4 space-y-2 text-sm">
            {footerLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:opacity-60">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Юридическое</p>
          <ul className="mt-4 space-y-2 text-sm">
            {legalLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:opacity-60">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Контакты</p>
          <p className="mt-4 text-lg font-medium">{SITE.phone}</p>
          <p className="mt-1 text-sm text-[var(--muted)]">{SITE.email}</p>
          <p className="mt-3 text-sm text-[var(--muted)]">{SITE.city} · склад и самовывоз</p>
        </div>
      </div>
      <div className="border-t border-[var(--line)] px-4 py-4 text-center text-xs text-[var(--muted)]">
        © {new Date().getFullYear()} {SITE.name}
      </div>
    </footer>
  );
}
