"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { canBuildKit, colorSuffix } from "@/lib/compatibility";
import { getProductPrice, hasConfirmedPrice } from "@/lib/pricing";
import { formatPrice, formatPriceLabel } from "@/lib/utils";
import { displayProduct, productAlt } from "@/lib/product-display";

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
  { id: "розетка", label: "Розетка", match: (p: P) => p.sku.startsWith("M-D1-") },
  { id: "выключатель", label: "Выключатель", match: (p: P) => p.sku.startsWith("M-S1-") },
  { id: "tv", label: "TV + компьютер", match: (p: P) => p.sku.startsWith("M-TV-") },
];

const colors = [
  { id: "белый", label: "Белый", swatch: "#f5f5f5" },
  { id: "серый", label: "Серый", swatch: "#9aa0a6" },
  { id: "чёрный", label: "Чёрный", swatch: "#1a1a1a" },
] as const;

const postOptions = [1, 2, 3, 4];

function sameColor(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  return a.toLowerCase().replace("ё", "е") === b.toLowerCase().replace("ё", "е");
}

export function ConstructorWizard({ products }: { products: P[] }) {
  const { addItem } = useCart();
  const [posts, setPosts] = useState<number | null>(null);
  const [color, setColor] = useState<(typeof colors)[number]["id"] | null>(null);
  const [assembledId, setAssembledId] = useState<string | null>(null);
  const [slots, setSlots] = useState<(string | null)[]>([]);
  const [added, setAdded] = useState(false);

  const assembledOptions = useMemo(() => {
    if (!color) return [];
    return products.filter((p) => p.kitRole === "assembled" && sameColor(p.color, color));
  }, [products, color]);

  const mechanismOptions = useMemo(() => {
    if (!color) return [];
    return products.filter((p) => p.kitRole === "mechanism" && sameColor(p.color, color));
  }, [products, color]);

  const frame = useMemo(() => {
    if (!posts || posts < 2 || !color) return null;
    const sku = `P${posts}-${colorSuffix(color)}`;
    return products.find((p) => p.sku === sku) || null;
  }, [posts, color, products]);

  const assembled = assembledOptions.find((p) => p.id === assembledId) || null;
  const selectedMechs = slots.map((id) => mechanismOptions.find((p) => p.id === id) || null);
  const slotsComplete = posts !== null && posts >= 2 && slots.length === posts && slots.every(Boolean);

  const kitItems = useMemo(() => {
    if (posts === 1 && assembled) return [assembled];
    if (slotsComplete && frame) return [frame, ...selectedMechs.filter(Boolean)] as P[];
    return [];
  }, [posts, assembled, slotsComplete, frame, selectedMechs]);

  const missingStock = kitItems.find((p) => p.stock <= 0);
  const valid =
    posts === 1
      ? !!assembled
      : !!(
          posts &&
          posts >= 2 &&
          color &&
          frame &&
          slotsComplete &&
          selectedMechs.every((m) => m && canBuildKit({ mechanism: m, frame, color, posts }))
        );

  const total = kitItems.reduce((s, p) => s + (hasConfirmedPrice(p) ? getProductPrice(p) : 0), 0);
  const kitPriced = kitItems.length > 0 && kitItems.every(hasConfirmedPrice);

  function resetSelection() {
    setAssembledId(null);
    setAdded(false);
  }

  function addKit() {
    if (!valid || !kitPriced || missingStock) return;
    for (const item of kitItems) {
      addItem({
        productId: item.id,
        slug: item.slug,
        name: displayProduct(item).title,
        sku: item.sku,
        price: getProductPrice(item),
        imageUrl: item.imageUrl,
        packQty: item.packQty,
        stock: item.stock,
        color: item.color,
        kitRole: item.kitRole,
      });
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  const preview = kitItems[0] || assembled || frame || mechanismOptions[0];

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr] lg:items-start">
      <div className="space-y-5">
        <section className="rounded-2xl bg-white p-4 sm:p-6">
          <h2 className="text-xl font-semibold">Количество мест</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {postOptions.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setPosts(p);
                  setSlots(p >= 2 ? Array.from({ length: p }, () => null) : []);
                  resetSelection();
                }}
                className={`pill ${posts === p ? "pill-active" : ""}`}
              >
                {p}
              </button>
            ))}
          </div>
          {posts === 1 && <p className="mt-3 text-sm text-[var(--muted)]">Выберите готовое изделие</p>}
        </section>

        <section className="rounded-2xl bg-white p-4 sm:p-6">
          <h2 className="text-xl font-semibold">Цвет</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setColor(c.id);
                  resetSelection();
                  if (posts && posts >= 2) setSlots(Array.from({ length: posts }, () => null));
                }}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-sm ${
                  color === c.id ? "bg-[var(--accent)] text-white" : "bg-[var(--sand)]"
                }`}
              >
                <span className="h-4 w-4 rounded-full border border-black/15" style={{ backgroundColor: c.swatch }} />
                {c.label}
              </button>
            ))}
          </div>
        </section>

        {posts === 1 && color && (
          <section className="rounded-2xl bg-white p-4 sm:p-6">
            <h2 className="text-xl font-semibold">Готовое изделие</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {assembledOptions.map((p) => {
                const view = displayProduct(p);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setAssembledId(p.id);
                      setAdded(false);
                    }}
                    className={`rounded-2xl border p-3 text-left ${
                      assembledId === p.id ? "border-[var(--accent)] bg-[var(--sand)]" : "border-transparent bg-[var(--paper)]"
                    }`}
                  >
                    <p className="font-semibold">{view.title}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">{view.badges.join(" · ")}</p>
                    {p.stock <= 0 && <p className="mt-2 text-sm text-[var(--copper)]">Этой детали сейчас нет в наличии</p>}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {posts !== null && posts >= 2 && color && (
          <section className="rounded-2xl bg-white p-4 sm:p-6">
            <h2 className="text-xl font-semibold">Механизмы</h2>
            {!slotsComplete && <p className="mt-2 text-sm text-[var(--muted)]">Выберите механизм для каждого места</p>}
            <div className="mt-4 space-y-4">
              {slots.map((selected, index) => (
                <div key={index}>
                  <p className="text-sm font-medium">Место {index + 1}</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {mechKinds.map((kind) => {
                      const item = mechanismOptions.find(kind.match) || null;
                      const active = item && selected === item.id;
                      return (
                        <button
                          key={kind.id}
                          type="button"
                          disabled={!item}
                          onClick={() => {
                            if (!item) return;
                            setSlots((prev) => prev.map((id, i) => (i === index ? item.id : id)));
                            setAdded(false);
                          }}
                          className={`rounded-2xl border p-3 text-left text-sm disabled:opacity-40 ${
                            active ? "border-[var(--accent)] bg-[var(--sand)]" : "border-transparent bg-[var(--paper)]"
                          }`}
                        >
                          {kind.label}
                          {item && item.stock <= 0 && (
                            <span className="mt-1 block text-[var(--copper)]">Этой детали сейчас нет в наличии</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <aside className="rounded-2xl bg-white p-4 sm:p-6 lg:sticky lg:top-24">
        <div className="aspect-square overflow-hidden rounded-2xl bg-[var(--card)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview?.imageUrl || "/images/placeholder.png"}
            alt={preview ? productAlt(preview) : "Сборка блока Laitys"}
            className="h-full w-full object-cover object-left"
          />
        </div>
        <h2 className="mt-5 text-xl font-semibold">Состав</h2>
        {kitItems.length > 0 ? (
          <ul className="mt-3 space-y-2 text-sm">
            {kitItems.map((item) => {
              const view = displayProduct(item);
              return (
                <li key={item.id} className="flex justify-between gap-3">
                  <span>
                    {view.title}
                    {view.completeness ? ` · ${view.completeness}` : ""}
                  </span>
                  <span>{formatPriceLabel(item.priceRetail)}</span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-[var(--muted)]">
            {posts === 1 ? "Выберите готовое изделие" : posts && posts >= 2 ? "Выберите механизм для каждого места" : "Выберите количество мест и цвет"}
          </p>
        )}
        <p className="mt-5 text-2xl font-semibold tracking-tight">Итого: {kitPriced && kitItems.length ? formatPrice(total) : "—"}</p>
        {missingStock && <p className="mt-3 text-sm text-[var(--copper)]">Этой детали сейчас нет в наличии</p>}
        {valid && kitPriced && !missingStock ? (
          <button type="button" className={`btn mt-5 w-full ${added ? "!bg-[var(--ok)] text-white" : "btn-primary"}`} onClick={addKit}>
            {added ? (
              <>
                <Check className="h-4 w-4" /> В корзине
              </>
            ) : (
              "В корзину"
            )}
          </button>
        ) : (
          <p className="mt-5 text-sm text-[var(--muted)]">
            {posts === null || !color
              ? "Сначала выберите места и цвет"
              : !valid
                ? posts === 1
                  ? "Выберите готовое изделие"
                  : "Выберите механизм для каждого места"
                : "Цена уточняется"}
          </p>
        )}
        {frame && (
          <Link href={`/product/${frame.slug}`} className="mt-3 inline-block text-sm underline underline-offset-4">
            Рамка в составе
          </Link>
        )}
      </aside>
    </div>
  );
}
