"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { getProductPrice, hasConfirmedPrice } from "@/lib/pricing";
import { formatPriceLabel } from "@/lib/utils";
import { displayProduct } from "@/lib/product-display";
import {
  BUNDLE_COLORS,
  BUNDLE_PRESETS,
  bundleColorMeta,
} from "@/lib/bundle";
import { constructorEnabled } from "@/lib/product-content";
import { sameColor } from "@/lib/compatibility";
import { skuBase } from "@/lib/product-display";
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
  attrsJson: string;
};

export function ConstructorWizard({ products, preset }: { products: P[]; preset?: string | null }) {
  const initial = preset ? BUNDLE_PRESETS[preset] : undefined;
  const modules = products.filter(constructorEnabled);
  const initialModules = modules.filter(p=>sameColor(p.color,'белый'));
  const { addItems } = useCart();
  const [color, setColor] = useState<(typeof BUNDLE_COLORS)[number]["id"]>('белый');
  const [count, setCount] = useState(initial?.count || 2);
  const [slots, setSlots] = useState<string[]>(()=>(initial?.slots || ['m-d1','m-d1']).map(kind=>initialModules.find(p=>skuBase(p.sku).toLowerCase()===kind)?.id || initialModules[0]?.id || ''));
  const [added, setAdded] = useState(false);

  const available = modules.filter(p=>sameColor(p.color,color));
  function changeColor(next: typeof color) {
    const candidates = modules.filter(p=>sameColor(p.color,next));
    setSlots(slots.map(id=>{
      const previous=modules.find(p=>p.id===id);
      return candidates.find(p=>previous && skuBase(p.sku)===skuBase(previous.sku))?.id || candidates[0]?.id || '';
    }));
    setColor(next);setAdded(false);
  }

  function setPostCount(n: number) {
    setCount(n);
    setSlots(Array.from({ length: n }, (_, i) => slots[i] || available[0]?.id || ''));
    setAdded(false);
  }

  const frame = products.find(p=>p.kitRole==='frame' && p.posts===count && sameColor(p.color,color));
  const selected = slots.map(id=>available.find(p=>p.id===id) || null);
  const components = [frame || null, ...selected];
  const complete = slots.length === count && [2,3,4].includes(count) && components.every(Boolean);
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
          <legend>01 · Количество постов</legend>
          <div className="laitys-calculator__choices">
            {[2, 3, 4].map((n) => (
              <button key={n} type="button" aria-pressed={count === n} onClick={() => setPostCount(n)}>
                {n} поста
              </button>
            ))}
          </div>
          <p className="laitys-calculator__hint">
            Одно место? <Link href="/catalog?format=assembled">Выберите готовое изделие</Link> — отдельная рамка не нужна.
          </p>
        </fieldset>
        <fieldset>
          <legend>02 · Цвет</legend>
          <div className="laitys-calculator__choices">
            {BUNDLE_COLORS.map((c) => (
              <button key={c.id} type="button" aria-pressed={color === c.id}
                onClick={() => changeColor(c.id)}>
                <span className="laitys-calculator__swatch" style={{ backgroundColor: c.swatch }} aria-hidden="true" />
                {c.label}
              </button>
            ))}
          </div>
          <p className="laitys-calculator__hint">Рамка и все модули — в одном цвете.</p>
        </fieldset>
        <fieldset>
          <legend>03 · Модули слева направо</legend>
          <div className="laitys-calculator__slots">
            {slots.map((slot, index) => (
              <label key={index}>
                <span>Место {index + 1}</span>
                <select aria-label={("Модуль для поста " + (index + 1))} value={slot} disabled={!available.length}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSlots(slots.map((current, i) => i === index ? value : current));
                    setAdded(false);
                  }}>
                  {!available.length && <option value="">Нет доступных модулей</option>}
                  {available.map(p=><option key={p.id} value={p.id}>{displayProduct(p).title} · {p.sku}</option>)}
                </select>
              </label>
            ))}
          </div>
          <p className="laitys-calculator__hint">Один пост — одно место для одного модуля.</p>
        </fieldset>
      </div>
      <div className="laitys-calculator__result">
        <p className="laitys-calculator__eyebrow">Ваш комплект</p>
        <h2>{count} поста · {bundleColorMeta(color).label.toLowerCase()}</h2>
        <BundlePreview key={(color + "-" + slots.join("_"))} color={color} mechanisms={selected.map(p=>p ? skuBase(p.sku).toLowerCase() : '')} labels={selected.map(p=>p ? displayProduct(p).title : 'Нет модуля')} images={selected.map(p=>p?.imageUrl || null)} />
        <p className="laitys-calculator__hint">В комплекте одна рамка и {count} модуля.</p>
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
