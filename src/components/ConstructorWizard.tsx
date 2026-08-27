"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { canBuildKit, colorSuffix } from "@/lib/compatibility";
import { getProductPrice, hasConfirmedPrice } from "@/lib/pricing";
import { formatPriceLabel } from "@/lib/utils";

type P = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  color: string | null;
  posts: number | null;
  kitRole: string | null;
  productType: string | null;
  imageUrl: string | null;
  priceRetail: number;
  priceWholesale: number;
  stock: number;
  packQty: number;
};

const mechKinds = [
  { id: "розетка", label: "Розетка Schuko", match: (p: P) => p.sku.startsWith("M-D1-") },
  { id: "выключатель", label: "Выключатель", match: (p: P) => p.sku.startsWith("M-S1-") },
  { id: "tv", label: "TV + компьютер", match: (p: P) => p.sku.startsWith("M-TV-") },
];

const colors = [
  { id: "белый", label: "Белый", swatch: "#f5f5f5" },
  { id: "серый", label: "Серый", swatch: "#9aa0a6" },
  { id: "чёрный", label: "Чёрный", swatch: "#1a1a1a" },
] as const;

const postOptions = [2, 3, 4];

export function ConstructorWizard({ products }: { products: P[] }) {
  const { addItem } = useCart();
  const [kind, setKind] = useState<string | null>(null);
  const [posts, setPosts] = useState<number | null>(null);
  const [color, setColor] = useState<(typeof colors)[number]["id"] | null>(null);
  const [added, setAdded] = useState(false);

  const mechanism = useMemo(() => {
    if (!kind || !color) return null;
    const rule = mechKinds.find((k) => k.id === kind);
    return products.find((p) => rule?.match(p) && p.color === color) || null;
  }, [kind, color, products]);

  const frame = useMemo(() => {
    if (!posts || !color) return null;
    const sku = `P${posts}-${colorSuffix(color)}`;
    return products.find((p) => p.sku === sku) || null;
  }, [posts, color, products]);

  const valid = !!(kind && posts && color && mechanism && frame && canBuildKit({ mechanism, frame, color, posts }));

  function addKit() {
    if (!valid || !mechanism || !frame) return;
    for (const item of [mechanism, frame]) {
      if (!hasConfirmedPrice(item)) continue;
      addItem({
        productId: item.id,
        slug: item.slug,
        name: item.name,
        sku: item.sku,
        price: getProductPrice(item),
        imageUrl: item.imageUrl,
        packQty: item.packQty,
        stock: item.stock,
      });
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  const kitPriced = !!(mechanism && frame && hasConfirmedPrice(mechanism) && hasConfirmedPrice(frame));

  return (
    <div className="mt-10 space-y-5">
      <section className="rounded-2xl bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">1. Механизм</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {mechKinds.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setKind(m.id);
                setAdded(false);
              }}
              className={`rounded-2xl border p-4 text-left ${
                kind === m.id ? "border-[var(--ink)] bg-[var(--sand)]" : "border-transparent bg-[var(--paper)]"
              }`}
            >
              <p className="font-semibold">{m.label}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">2. Число постов</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Рамка на 2, 3 или 4 поста. На один пост берите готовое изделие в каталоге.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {postOptions.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPosts(p);
                setAdded(false);
              }}
              className={`pill ${posts === p ? "pill-active" : ""}`}
            >
              {p} поста
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">3. Цвет</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Механизм и рамка только одного цвета.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {colors.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setColor(c.id);
                setAdded(false);
              }}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm ${
                color === c.id ? "bg-[var(--ink)] text-white" : "bg-[var(--sand)]"
              }`}
            >
              <span className="h-4 w-4 rounded-full border border-black/15" style={{ backgroundColor: c.swatch }} />
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {kind && posts && color && (
        <section className="rounded-2xl bg-[#111] p-6 text-white sm:p-8">
          {valid ? (
            <>
              <h2 className="text-xl font-semibold">Комплект собран</h2>
              <ul className="mt-4 space-y-3 text-sm">
                {[mechanism, frame].map((item) =>
                  item ? (
                    <li key={item.id} className="flex items-center justify-between gap-3">
                      <span>
                        {item.name}
                        <span className="ml-2 text-white/50">{item.sku}</span>
                      </span>
                      <span>{formatPriceLabel(item.priceRetail)}</span>
                    </li>
                  ) : null
                )}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                {kitPriced ? (
                  <button type="button" className="btn btn-light" onClick={addKit}>
                    {added ? (
                      <>
                        <Check className="h-4 w-4" /> В корзине
                      </>
                    ) : (
                      "Добавить комплект в корзину"
                    )}
                  </button>
                ) : (
                  <p className="text-sm text-white/60">Цена комплекта уточняется. Можно открыть карточки товаров.</p>
                )}
                {mechanism && (
                  <Link href={`/product/${mechanism.slug}`} className="btn border border-white/20">
                    Механизм
                  </Link>
                )}
                {frame && (
                  <Link href={`/product/${frame.slug}`} className="btn border border-white/20">
                    Рамка
                  </Link>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-white/70">Такого комплекта нет: механизм и рамка должны совпасть по цвету и числу постов.</p>
          )}
        </section>
      )}
    </div>
  );
}
