"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductCard, type ProductCardData } from "@/components/ProductCard";

const tabs = [
  { key: "розетка", label: "Розетки" },
  { key: "выключатель", label: "Выключатели" },
  { key: "рамка", label: "Рамки" },
] as const;

export function PopularProducts({
  products,
  b2bApproved,
}: {
  products: (ProductCardData & { productType?: string | null })[];
  b2bApproved?: boolean;
}) {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("розетка");

  const filtered = useMemo(() => {
    const list = products.filter((p) => (p.productType || "").includes(tab));
    return (list.length ? list : products).slice(0, 3);
  }, [products, tab]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 className="section-title">Ассортимент</h2>
        <Link href="/catalog" className="text-sm text-[var(--muted)] hover:text-[var(--ink)]">
          Все товары →
        </Link>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`pill ${tab === t.key ? "pill-active" : ""}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} b2bApproved={b2bApproved} />
        ))}
      </div>
    </section>
  );
}
