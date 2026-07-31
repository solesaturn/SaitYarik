"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { SITE } from "@/lib/pricing";

const nav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/b2b", label: "Для монтажников и магазинов" },
  { href: "/delivery", label: "Доставка" },
  { href: "/about", label: "О компании" },
  { href: "/contacts", label: "Контакты" },
];

export function Header() {
  const { count, justAdded } = useCart();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur">
      <div className="border-b border-[var(--line)] bg-[var(--ink)] text-[var(--paper)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-xs">
          <p className="text-white/70">Город: {SITE.city} · Доставка по РФ · Самовывоз со склада</p>
          <a href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`} className="text-white/80 hover:text-white">
            {SITE.phone}
          </a>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <button type="button" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Меню">
          <Menu className="h-6 w-6" />
        </button>

        <Link href="/" className="shrink-0 font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)]">
          {SITE.name}
        </Link>

        <nav className="ml-4 hidden items-center gap-5 text-sm font-medium text-[var(--muted)] lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[var(--ink)]">
              {item.label}
            </Link>
          ))}
        </nav>

        <form action="/search" className="ml-auto hidden min-w-0 flex-1 max-w-md md:flex">
          <label className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Розетка, выключатель, артикул…"
              className="w-full rounded-full border border-[var(--line)] bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-[var(--copper)] focus:ring-2"
            />
          </label>
        </form>

        <Link href="/account" className="rounded-full p-2 hover:bg-black/5" aria-label="Кабинет">
          <User className="h-5 w-5" />
        </Link>
        <Link
          href="/cart"
          className={`relative rounded-full p-2 hover:bg-black/5 ${justAdded ? "animate-[cart-bump_0.55s_ease]" : ""}`}
          aria-label={count > 0 ? `Корзина, ${count} товаров` : "Корзина"}
        >
          <ShoppingCart className={`h-5 w-5 ${justAdded ? "text-[var(--ok)]" : ""}`} />
          {count > 0 && (
            <span
              className={`absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
                justAdded
                  ? "scale-110 bg-[var(--ok)] text-white"
                  : "bg-[var(--copper)] text-[var(--ink)]"
              }`}
            >
              {count}
            </span>
          )}
        </Link>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="h-full w-[min(100%,20rem)] bg-[var(--paper)] p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="font-[family-name:var(--font-display)] text-xl">{SITE.name}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть">
                <X />
              </button>
            </div>
            <form action="/search" className="mb-4">
              <input
                name="q"
                placeholder="Поиск…"
                className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              />
            </form>
            <div className="flex flex-col gap-3 text-base">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <Link href="/certificates" onClick={() => setOpen(false)}>
                Сертификаты
              </Link>
              <Link href="/favorites" onClick={() => setOpen(false)}>
                Избранное
              </Link>
              <Link href="/compare" onClick={() => setOpen(false)}>
                Сравнение
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
