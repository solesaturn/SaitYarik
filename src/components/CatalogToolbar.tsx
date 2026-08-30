"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const pills = [
  { href: "/catalog", label: "Все товары", type: "" },
  { href: "/catalog?type=розетка", label: "Розетки", type: "розетка" },
  { href: "/catalog?type=выключатель", label: "Выключатели", type: "выключатель" },
  { href: "/catalog?type=рамка", label: "Рамки", type: "рамка" },
  { href: "/catalog?type=механизм", label: "Механизмы", type: "механизм" },
];

export function CatalogToolbar({ title }: { title: string }) {
  const router = useRouter();
  const sp = useSearchParams();
  const activeType = sp.get("type") || "";
  const inStock = sp.get("stock") === "1";
  const sort = sp.get("sort") || "popular";

  function patch(updates: Record<string, string | null>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (!v) next.delete(k);
      else next.set(k, v);
    }
    next.delete("page");
    router.push(`/catalog?${next.toString()}`);
  }

  return (
    <div>
      <nav className="text-xs text-[var(--muted)]">
        <Link href="/">Главная</Link>
        {" > "}
        <Link href="/catalog">Каталог</Link>
        {title !== "Каталог" && (
          <>
            {" > "}
            <span>{title}</span>
          </>
        )}
      </nav>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <h1 className="section-title">{title}</h1>
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <span className="text-[var(--muted)]">В наличии</span>
            <button
              type="button"
              role="switch"
              aria-checked={inStock}
              onClick={() => patch({ stock: inStock ? null : "1" })}
              className={`relative h-6 w-11 rounded-full transition ${
                inStock ? "bg-[var(--accent)]" : "bg-[var(--sand)]"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                  inStock ? "left-[1.35rem]" : "left-0.5"
                }`}
              />
            </button>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-[var(--muted)]">Сортировка</span>
            <select
              className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-sm outline-none"
              value={sort}
              onChange={(e) => patch({ sort: e.target.value })}
            >
              <option value="popular">Популярность</option>
              <option value="price_asc">Цена ↑</option>
              <option value="price_desc">Цена ↓</option>
              <option value="new">Новизна</option>
              <option value="stock">Наличие</option>
            </select>
          </label>
        </div>
      </div>
      <div className="mt-6 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
        {pills.map((p) => (
          <Link
            key={p.label}
            href={p.href}
            className={`pill shrink-0 ${activeType === p.type ? "pill-active" : ""}`}
          >
            {p.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
