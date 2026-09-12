"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { getProductPrice, hasConfirmedPrice } from "@/lib/pricing";
import { formatPriceLabel } from "@/lib/utils";
import { displayProduct } from "@/lib/product-display";
import {
  BUNDLE_COLORS,
  BUNDLE_PRESETS,
  MECH_OPTIONS,
  bundleColorMeta,
  bundleComponentSkus,
  mechSku,
  type MechKind,
} from "@/lib/bundle";
import { BundlePreview } from "@/components/BundlePreview";

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

function presetState(preset?: string | null) {
  const found = preset ? BUNDLE_PRESETS[preset] : undefined;
  return {
    color: "белый" as const,
    count: found?.count ?? 2,
    slots: (found?.slots ?? ["m-d1", "m-d1"]) as MechKind[],
  };
}

export function ConstructorWizard({ products, preset }: { products: P[]; preset?: string | null }) {
  const initial = presetState(preset);
  const { addItems } = useCart();
  const [color, setColor] = useState<(typeof BUNDLE_COLORS)[number]["id"]>(initial.color);
  const [count, setCount] = useState(initial.count);
  const [slots, setSlots] = useState<MechKind[]>(initial.slots);
  const [added, setAdded] = useState(false);

  const bySku = useMemo(() => {
    const map = new Map<string, P>();
    for (const p of products) map.set(p.sku.toUpperCase(), p);
    return map;
  }, [products]);

  function setPostCount(n: number) {
    setCount(n);
    setSlots(Array.from({ length: n }, (_, i) => slots[i] || "m-d1"));
    setAdded(false);
  }

  const componentSkus = bundleComponentSkus(color, slots);
  const components = componentSkus.map((sku) => bySku.get(sku.toUpperCase()) || null);
  const complete = components.length > 0 && components.every(Boolean);
  const priced = complete && components.every((p) => p && hasConfirmedPrice(p));
  const total = complete
    ? components.reduce((sum, p) => sum + getProductPrice(p!), 0)
    : 0;

  const grouped = useMemo(() => {
    const rows: { product: P; qty: number }[] = [];
    for (const product of components) {
      if (!product) continue;
      const row = rows.find((r) => r.product.id === product.id);
      if (row) row.qty += 1;
      else rows.push({ product, qty: 1 });
    }
    return rows;
  }, [components]);

  function addKit() {
    if (!complete) return;
    addItems(
      grouped.map(({ product, qty }) => ({
        item: {
          productId: product.id,
          slug: product.slug,
          name: displayProduct(product).title,
          sku: product.sku,
          price: getProductPrice(product),
          imageUrl: product.imageUrl,
          packQty: product.packQty,
          stock: product.stock,
          color: product.color,
          kitRole: product.kitRole,
        },
        qty,
      })),
      `Блок на ${count} поста`
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
      <div className="min-w-0">
        <h2 className="text-lg font-semibold">01 · Количество мест</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPostCount(n)}
              className={`pill ${count === n ? "pill-active" : ""}`}
            >
              {n} поста
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-[var(--muted)]">
          Одно место?{" "}
          <Link href="/catalog" className="underline underline-offset-4">
            Выберите готовое изделие
          </Link>.
        </p>

        <h2 className="mt-8 text-lg font-semibold">02 · Цвет</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Рамка и механизмы только одного цвета.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {BUNDLE_COLORS.map((c) => (
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

        <h2 className="mt-8 text-lg font-semibold">03 · Механизмы</h2>
        <div className="mt-4 space-y-4">
          {slots.map((slot, i) => {
            const sku = mechSku(slot, color) || "";
            const product = bySku.get(sku.toUpperCase());
            return (
              <label key={i} className="block">
                <span className="text-sm text-[var(--muted)]">Место {i + 1}</span>
                <span className="mt-1 flex items-center gap-3">
                  <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[var(--card)]">
                    {product?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.imageUrl} alt="" className="h-full w-full object-contain p-1" />
                    ) : null}
                  </span>
                  <select
                    aria-label={`Механизм для места ${i + 1}`}
                    value={slot}
                    onChange={(e) => {
                      const next = e.target.value as MechKind;
                      setSlots(slots.map((s, j) => (j === i ? next : s)));
                      setAdded(false);
                    }}
                    className="min-h-11 w-full rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm"
                  >
                    {MECH_OPTIONS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="min-w-0 rounded-2xl bg-[var(--sand)] p-5 sm:p-8">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Ваш комплект</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {count} поста · {bundleColorMeta(color).label.toLowerCase()}
        </h2>
        <BundlePreview key={`${color}-${slots.join("_")}`} color={color} mechanisms={slots} />
        <p className="mt-3 text-sm text-[var(--muted)]">
          Совместимость устройств и проекта необходимо подтвердить до покупки.
        </p>
        <dl className="mt-5 divide-y divide-[var(--line)] text-sm">
          {grouped.map(({ product, qty }) => (
            <div key={product.id} className="flex items-center justify-between gap-3 py-2.5">
              <dt>
                <Link href={`/product/${product.slug}`} className="hover:opacity-70">
                  {displayProduct(product).title}
                </Link>
                <span className="ml-2 text-[var(--muted)]">{product.sku}</span>
              </dt>
              <dd className="shrink-0 font-medium">{qty} шт.</dd>
            </div>
          ))}
        </dl>
        {!complete && (
          <p className="mt-4 text-sm text-[var(--muted)]">Такого комплекта нет в каталоге.</p>
        )}
        <div className="mt-6 flex items-end justify-between gap-3">
          <span className="text-sm text-[var(--muted)]">Полный комплект</span>
          <strong className="text-xl font-semibold tracking-tight">{complete ? formatPriceLabel(priced ? total : 0) : "—"}</strong>
        </div>
        <button type="button" className="btn btn-primary mt-5 w-full" disabled={!complete} onClick={addKit}>
          {added ? (
            <>
              <Check className="h-4 w-4" /> В корзине
            </>
          ) : (
            "Добавить комплект"
          )}
        </button>
      </div>
    </div>
  );
}
