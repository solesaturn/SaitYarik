"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { SITE } from "@/lib/pricing";

const nav = [
  { href: "/catalog", label: "Каталог" },
  { href: "/kit", label: "Собрать блок" },
  { href: "/delivery", label: "Доставка и оплата" },
  { href: "/about", label: "О бренде" },
];

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const openedAt = useRef(0);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--paper)]/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5 sm:gap-4 sm:py-3.5">
          <button
            type="button"
            className="relative z-10 flex min-h-11 min-w-11 shrink-0 items-center justify-center lg:hidden"
            onClick={() => {
              openedAt.current = Date.now();
              setOpen(true);
            }}
            aria-label="Меню"
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>

          <Link href="/" className="min-w-0 shrink-0 text-lg font-semibold tracking-tight text-[var(--ink)] sm:text-xl">
            {SITE.name}
          </Link>

          <nav className="ml-6 hidden items-center gap-5 text-[0.9375rem] text-[var(--ink)] lg:flex xl:gap-6">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="hover:opacity-60">
                {item.label}
              </Link>
            ))}
          </nav>

          <form action="/search" className="ml-auto hidden min-w-0 max-w-xs flex-1 lg:block">
            <label className="sr-only" htmlFor="header-search">
              Найти товар или артикул
            </label>
            <input
              id="header-search"
              name="q"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Найти товар или артикул"
              className="w-full rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm outline-none focus:border-[var(--ink)]"
            />
          </form>

          <div className="ml-auto flex items-center lg:ml-2">
            <button
              type="button"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-black/5 lg:hidden"
              aria-label="Поиск"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <Link
              href="/account"
              className="hidden min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-black/5 lg:flex"
              aria-label="Кабинет"
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <Link
              href="/cart"
              className="relative flex min-h-11 min-w-11 items-center justify-center rounded-full hover:bg-black/5"
              aria-label={count > 0 ? `Корзина, ${count}` : "Корзина"}
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              <span className="sr-only">Корзина</span>
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--ink)] px-1 text-[10px] font-semibold text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-[var(--line)] px-4 py-3 lg:hidden">
            <form action="/search" className="mx-auto max-w-7xl">
              <label className="sr-only" htmlFor="header-search-mobile">
                Найти товар или артикул
              </label>
              <input
                id="header-search-mobile"
                name="q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus
                placeholder="Найти товар или артикул"
                className="w-full rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm outline-none focus:border-[var(--ink)]"
              />
            </form>
          </div>
        )}
      </header>

      {open && (
        <div id="mobile-menu" className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="Меню">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Закрыть меню"
            onClick={() => {
              if (Date.now() - openedAt.current < 400) return;
              setOpen(false);
            }}
          />
          <div className="relative z-10 flex h-[100dvh] w-[min(100%,20rem)] flex-col bg-[var(--paper)] p-5 pt-[max(1.25rem,env(safe-area-inset-top))] shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-lg font-semibold">{SITE.name}</span>
              <button type="button" className="flex min-h-11 min-w-11 items-center justify-center" onClick={() => setOpen(false)} aria-label="Закрыть">
                <X className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex flex-col gap-1 overflow-y-auto text-base">
              {nav.map((item) => (
                <Link key={item.href} href={item.href} className="py-2.5" onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
              <Link href="/account" className="py-2.5" onClick={() => setOpen(false)}>
                Кабинет
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
