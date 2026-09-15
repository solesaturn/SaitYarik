"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
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
import "./calculator.css";

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
    <section className="laitys-calculator" aria-label="Конструктор блока">
      <div className="laitys-calculator__controls">
        <fieldset>
          <legend>01 · Количество мест</legend>
          <div className="laitys-calculator__choices">
            {[2, 3, 4].map((n) => (
              <button key={n} type="button" aria-pressed={count === n} onClick={() => setPostCount(n)}>
                {n} поста
              </button>
            ))}
          </div>
          <p className="laitys-calculator__hint">
            Одно место? <Link href="/catalog">Выберите готовое изделие</Link>.
          </p>
        </fieldset>
        <fieldset>
          <legend>02 · Цвет</legend>
          <div className="laitys-calculator__choices">
            {BUNDLE_COLORS.map((c) => (
              <button key={c.id} type="button" aria-pressed={color === c.id}
                onClick={() => { setColor(c.id); setAdded(false); }}>
                <span className="laitys-calculator__swatch" style={{ backgroundColor: c.swatch }} aria-hidden="true" />
                {c.label}
              </button>
            ))}
          </div>
          <p className="laitys-calculator__hint">Рамка и все механизмы — в одном цвете.</p>
        </fieldset>
        <fieldset>
          <legend>03 · Механизмы</legend>
          <div className="laitys-calculator__slots">
            {slots.map((slot, index) => (
              <label key={index}>
                <span>Место {index + 1}</span>
                <select aria-label={("Механизм для места " + (index + 1))} value={slot}
                  onChange={(event) => {
                    const value = event.target.value as MechKind;
                    setSlots(slots.map((current, i) => i === index ? value : current));
                    setAdded(false);
                  }}>
                  {MECH_OPTIONS.map((option) => {
                    const available = bySku.has(mechSku(option.id, color) || "");
                    return <option key={option.id} value={option.id} disabled={!available}>
                      {option.label}{!available ? " · Недоступен" : ""}
                    </option>;
                  })}
                </select>
              </label>
            ))}
          </div>
          <p className="laitys-calculator__hint">Порядок механизмов — слева направо.</p>
        </fieldset>
      </div>
      <div className="laitys-calculator__result">
        <p className="laitys-calculator__eyebrow">Ваш комплект</p>
        <h2>{count} поста · {bundleColorMeta(color).label.toLowerCase()}</h2>
        <BundlePreview key={(color + "-" + slots.join("_"))} color={color} mechanisms={slots} />
        <p className="laitys-calculator__hint">В комплекте одна рамка и {count} механизма.</p>
        <dl>
          {grouped.map(({ product, qty }) => (
            <div key={product.id}>
              <dt>
                <Link href={("/product/" + product.slug)}>{displayProduct(product).title}</Link>
                <small>{product.sku}</small>
              </dt>
              <dd>{qty} шт.</dd>
            </div>
          ))}
        </dl>
        {!complete && <p className="laitys-calculator__hint" role="status">Такого комплекта нет в каталоге.</p>}
        <div className="laitys-calculator__total" aria-live="polite" aria-atomic="true">
          <span>Полный комплект</span>
          <strong>{complete ? formatPriceLabel(priced ? total : 0) : "—"}</strong>
        </div>
        {!priced && <p className="laitys-calculator__hint">Для расчёта сообщите менеджеру состав комплекта. <Link href="/contacts">Связаться с нами</Link></p>}
        <button type="button" className="laitys-calculator__add" disabled={!complete || !priced} onClick={addKit}>
          {added ? <><Check size={18} /> В корзине</> : priced ? <>Добавить комплект в корзину <Plus size={18} /></> : "Цена комплекта уточняется"}
        </button>
      </div>
    </section>
  );
}
