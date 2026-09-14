"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";
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
  const [activeSlot, setActiveSlot] = useState(0);
  const [added, setAdded] = useState(false);

  const bySku = useMemo(() => {
    const map = new Map<string, P>();
    for (const p of products) map.set(p.sku.toUpperCase(), p);
    return map;
  }, [products]);

  function setPostCount(n: number) {
    setCount(n);
    setActiveSlot(Math.min(activeSlot, n - 1));
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

  const grouped = (() => {
    const rows: { product: P; qty: number }[] = [];
    for (const product of components) {
      if (!product) continue;
      const row = rows.find((r) => r.product.id === product.id);
      if (row) row.qty += 1;
      else rows.push({ product, qty: 1 });
    }
    return rows;
  })();

  function addKit() {
    if (!complete || !priced) return;
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
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-8">
      <div className="min-w-0 rounded-3xl border border-[var(--line)] bg-white p-5 sm:p-7">
        <h2 className="text-lg font-semibold">01 · Количество мест</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              aria-pressed={count === n}
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
              aria-pressed={color === c.id}
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

        <h2 className="mt-8 text-lg font-semibold">03 · Наполнение блока</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Выберите место, затем нажмите на нужный механизм. Порядок — слева направо.</p>
        <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
          {slots.map((slot, index) => {
            const product = bySku.get(mechSku(slot, color) || "");
            return <button key={index} type="button" aria-pressed={activeSlot === index}
              aria-label={`Выбрать место ${index + 1}`} onClick={() => setActiveSlot(index)}
              className={`min-w-0 rounded-2xl border-2 p-2 text-center ${activeSlot === index ? "border-[var(--ink)] bg-[var(--sand)]" : "border-transparent bg-[var(--paper)]"}`}>
              <span className="text-xs font-medium">Место {index + 1}</span>
              {product?.imageUrl ? <ProductImage src={product.imageUrl} alt={displayProduct(product).title} className="mt-2 aspect-square w-full p-2" /> : <span className="block py-4 text-xs">Нет фото</span>}
            </button>;
          })}
        </div>
        <p className="mt-6 text-sm font-semibold">Механизм для места {activeSlot + 1}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {MECH_OPTIONS.map((option) => {
            const product = bySku.get(mechSku(option.id, color) || "");
            const selected = slots[activeSlot] === option.id;
            return <button key={option.id} type="button" aria-pressed={selected} disabled={!product}
              onClick={() => { setSlots(slots.map((slot, index) => index === activeSlot ? option.id : slot)); setAdded(false); }}
              className={`flex items-center gap-3 rounded-2xl border p-3 text-left disabled:opacity-40 sm:flex-col sm:items-stretch ${selected ? "border-[var(--ink)] bg-[var(--sand)]" : "border-[var(--line)] hover:bg-[var(--paper)]"}`}>
              {product?.imageUrl && <ProductImage src={product.imageUrl} alt="" className="h-14 w-14 shrink-0 p-1 sm:h-24 sm:w-full sm:p-3" />}
              <span className="text-xs font-medium leading-relaxed">{option.label}{!product && " · Недоступен"}</span>
            </button>;
          })}
        </div>
      </div>

      <div className="min-w-0 rounded-3xl bg-[var(--sand)] p-5 sm:p-7 lg:sticky lg:top-24">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Ваш комплект</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
          {count} поста · {bundleColorMeta(color).label.toLowerCase()}
        </h2>
        <BundlePreview key={`${color}-${slots.join("_")}`} color={color} mechanisms={slots} products={products} />
        <p className="mt-3 text-sm text-[var(--muted)]">
          В комплекте одна рамка и {count} механизма. Расположение показано слева направо.
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
        {!priced && <p className="mt-4 text-sm text-[var(--muted)]">Для расчёта сообщите менеджеру состав комплекта. <Link href="/contacts" className="underline">Связаться с нами</Link></p>}
        <button type="button" className="btn btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-40" disabled={!complete || !priced} onClick={addKit}>
          {added ? (
            <>
              <Check className="h-4 w-4" /> В корзине
            </>
          ) : (
            priced ? "Добавить комплект в корзину" : "Цена комплекта уточняется"
          )}
        </button>
      </div>
    </div>
  );
}
