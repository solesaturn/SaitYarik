"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE } from "@/lib/pricing";

const footerLinks = [
  { href: "/contacts", label: "Контакты" },
  { href: "/returns", label: "Гарантия" },
  { href: "/documents", label: "Документы" },
  { href: "/b2b", label: "Для бизнеса" },
];

export function Footer() {
  const pathname = usePathname();
  const compact = pathname.startsWith("/checkout");

  if (compact) {
    return (
      <footer className="mt-auto border-t border-[var(--line)] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 text-sm text-[var(--muted)] sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-medium text-[var(--ink)]">{SITE.shortName}</p>
            <p className="mt-1">
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a>
              {" · "}
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-2">
            <li>
              <Link href="/returns" className="hover:text-[var(--ink)]">
                Гарантия
              </Link>
            </li>
            <li>
              <Link href="/legal/offer" className="hover:text-[var(--ink)]">
                Оферта
              </Link>
            </li>
            <li>
              <Link href="/legal/privacy" className="hover:text-[var(--ink)]">
                Конфиденциальность
              </Link>
            </li>
          </ul>
        </div>
      </footer>
    );
  }

  return (
    <footer className="mt-auto bg-[#111] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-lg font-semibold tracking-tight">{SITE.name}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/55">
              Розетки, выключатели и рамки для современного интерьера.
            </p>
            <p className="mt-6 text-lg font-medium">
              <a href={`tel:${SITE.phone.replace(/\s/g, "")}`}>{SITE.phone}</a>
            </p>
            <p className="mt-1 text-sm text-white/55">
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
            </p>
            <p className="mt-3 text-sm text-white/55">{SITE.city}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Разделы</p>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/40">Реквизиты</p>
            <ul className="mt-4 space-y-2 text-sm text-white/55">
              <li>{SITE.shortName}</li>
              <li>ИНН {SITE.inn}</li>
              <li>ОГРНИП {SITE.ogrnip}</li>
              <li>{SITE.address}</li>
            </ul>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/70">
              <li>
                <Link href="/legal/offer" className="hover:text-white">
                  Оферта
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-white">
                  Конфиденциальность
                </Link>
              </li>
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
