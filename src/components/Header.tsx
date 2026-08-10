"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useFavorites } from "@/lib/favorites-context";
import { SITE } from "@/lib/pricing";

const nav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/constructor", label: "Конструктор" },
  { href: "/delivery", label: "Условия заказа" },
  { href: "/contacts", label: "Контакты" },
];

export function Header() {
  const { count, justAdded } = useCart();
  const { count: favCount } = useFavorites();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3.5">
        <button type="button" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Меню">
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>

        <Link href="/" className="shrink-0 text-xl font-semibold tracking-tight text-[var(--ink)] lowercase">
          {SITE.name}
        </Link>

        <nav className="ml-8 hidden items-center gap-7 text-sm text-[var(--ink)] lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="hover:opacity-60">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            className="rounded-full p-2 hover:bg-black/5"
            aria-label="Поиск"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <Link href="/favorites" className="relative rounded-full p-2 hover:bg-black/5" aria-label="Избранное">
            <Heart className="h-5 w-5" strokeWidth={1.5} />
            {favCount > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-semibold text-white">
                {favCount}
              </span>
            )}
          </Link>
          <Link href="/account" className="rounded-full p-2 hover:bg-black/5" aria-label="Кабинет">
            <User className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <Link
            href="/cart"
            className={`relative rounded-full p-2 hover:bg-black/5 ${justAdded ? "animate-[cart-bump_0.55s_ease]" : ""}`}
            aria-label={count > 0 ? `Корзина, ${count} товаров` : "Корзина"}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            {count > 0 && (
              <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t border-[var(--line)] px-4 py-3">
          <form action="/search" className="mx-auto max-w-7xl">
            <input
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
              placeholder="Розетка, выключатель, артикул…"
              className="w-full rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
            />
          </form>
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-50 bg-black/30 lg:hidden" onClick={() => setOpen(false)}>
          <div
            className="h-full w-[min(100%,18rem)] bg-[var(--paper)] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-semibold lowercase">{SITE.name}</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Закрыть">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex flex-col gap-4 text-base">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <Link href="/favorites" onClick={() => setOpen(false)}>
                Избранное
              </Link>
              <Link href="/about" onClick={() => setOpen(false)}>
                О компании
              </Link>
              <Link href="/b2b" onClick={() => setOpen(false)}>
                Для монтажников и магазинов
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
