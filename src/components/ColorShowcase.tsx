"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { productAlt } from "@/lib/product-display";

type ColorProduct = {
  sku: string;
  name: string;
  color: string | null;
  imageUrl: string | null;
  slug: string;
};

const colors = [
  { id: "белый", label: "Белый" },
  { id: "серый", label: "Серый" },
  { id: "чёрный", label: "Чёрный" },
] as const;

function sameColor(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  return a.toLowerCase().replace("ё", "е") === b.toLowerCase().replace("ё", "е");
}

export function ColorShowcase({ products }: { products: ColorProduct[] }) {
  const [color, setColor] = useState<(typeof colors)[number]["id"]>("чёрный");
  const current = useMemo(
    () => products.find((p) => sameColor(p.color, color)) || products[0],
    [products, color]
  );

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:py-16">
      <h2 className="section-title">Три цвета</h2>
      <div className="mt-6 flex flex-wrap gap-2">
        {colors.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setColor(c.id)}
            className={`pill ${color === c.id ? "pill-active" : ""}`}
            aria-pressed={color === c.id}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="mt-6 overflow-hidden rounded-[1.5rem] bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current?.imageUrl || "/images/placeholder.png"}
          alt={current ? productAlt(current) : "Розетка Laitys"}
          className="aspect-[4/3] w-full object-cover object-left sm:aspect-[16/9]"
        />
      </div>
      <p className="mt-3 text-sm text-[var(--muted)]">Цвет на экране может отличаться от реального.</p>
      <Link href={`/catalog?color=${encodeURIComponent(color)}`} className="btn btn-primary mt-6">
        Выбрать товары
      </Link>
    </section>
  );
}
