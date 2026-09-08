"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { kitRoleFilterLabel } from "@/lib/product-display";

type Counts = {
  colors: Record<string, number>;
  posts: Record<string, number>;
  types: Record<string, number>;
  kits: Record<string, number>;
};

const typeLabels: Record<string, string> = {
  розетка: "Розетка",
  выключатель: "Выключатель",
  рамка: "Рамка",
  механизм: "Механизм",
};

export function CatalogFilters({
  counts,
  resultCount,
}: {
  counts: Counts;
  resultCount: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(() => new URLSearchParams(sp.toString()));

  useEffect(() => {
    setDraft(new URLSearchParams(sp.toString()));
  }, [sp]);

  function toggle(key: string, value: string) {
    const next = new URLSearchParams(draft.toString());
    if (!value || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    setDraft(next);
  }

  function apply() {
    startTransition(() => router.push(`/catalog?${draft.toString()}`));
  }

  const colors = Object.keys(counts.colors);
  const posts = Object.keys(counts.posts).sort((a, b) => Number(a) - Number(b));
  const types = Object.keys(counts.types);
  const kits = Object.keys(counts.kits);

  return (
    <aside className="h-fit lg:sticky lg:top-24">
      <button
        type="button"
        className="btn btn-copper w-full lg:hidden"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        {open ? "Скрыть фильтры" : "Фильтры"}
      </button>
      <div className={`${open ? "mt-4 block" : "hidden"} lg:mt-0 lg:block`}>
        <p className="hidden text-sm font-semibold lg:block">Фильтры</p>

        {types.length > 0 && (
          <FilterGroup title="Тип">
            {types.map((t) => (
              <CheckRow
                key={t}
                label={typeLabels[t] || t}
                count={counts.types[t]}
                checked={draft.get("type") === t}
                onChange={() => toggle("type", t)}
              />
            ))}
          </FilterGroup>
        )}

        {colors.length > 0 && (
          <FilterGroup title="Цвет">
            {colors.map((c) => (
              <CheckRow
                key={c}
                label={c}
                count={counts.colors[c]}
                checked={draft.get("color") === c}
                onChange={() => toggle("color", c)}
              />
            ))}
          </FilterGroup>
        )}

        {kits.length > 0 && (
          <FilterGroup title="Комплектация">
            {kits.map((k) => (
              <CheckRow
                key={k}
                label={kitRoleFilterLabel(k)}
                count={counts.kits[k]}
                checked={draft.get("kit") === k}
                onChange={() => toggle("kit", k)}
              />
            ))}
          </FilterGroup>
        )}

        {posts.length > 0 && (
          <FilterGroup title="Количество постов">
            {posts.map((p) => (
              <CheckRow
                key={p}
                label={`${p} ${Number(p) === 1 ? "пост" : Number(p) < 5 ? "поста" : "постов"}`}
                count={counts.posts[p]}
                checked={draft.get("posts") === p}
                onChange={() => toggle("posts", p)}
              />
            ))}
          </FilterGroup>
        )}

        <FilterGroup title="Наличие">
          <CheckRow
            label="В наличии"
            checked={draft.get("stock") === "1"}
            onChange={() => toggle("stock", "1")}
          />
        </FilterGroup>

        <FilterGroup title="Цена">
          <div className="flex gap-2">
            <input
              value={draft.get("min") || ""}
              onChange={(e) => {
                const next = new URLSearchParams(draft.toString());
                if (e.target.value) next.set("min", e.target.value);
                else next.delete("min");
                next.delete("page");
                setDraft(next);
              }}
              placeholder="от"
              className="w-20 rounded-full border border-[var(--line)] px-3 py-1.5 text-sm"
            />
            <input
              value={draft.get("max") || ""}
              onChange={(e) => {
                const next = new URLSearchParams(draft.toString());
                if (e.target.value) next.set("max", e.target.value);
                else next.delete("max");
                next.delete("page");
                setDraft(next);
              }}
              placeholder="до"
              className="w-20 rounded-full border border-[var(--line)] px-3 py-1.5 text-sm"
            />
          </div>
        </FilterGroup>

        <p className="mt-6 text-sm text-[var(--muted)]">
          {resultCount} {pluralGoods(resultCount)}
        </p>
        <button type="button" disabled={pending} className="btn btn-primary mt-3 w-full" onClick={apply}>
          Показать товары
        </button>
        <button
          type="button"
          className="btn btn-ghost mt-3 w-full"
          onClick={() => startTransition(() => router.push("/catalog"))}
        >
          Сбросить фильтры
        </button>
      </div>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3 space-y-2">{children}</div>
    </div>
  );
}

function CheckRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-[var(--line)] accent-[var(--accent)]"
      />
      <span className="flex-1">{label}</span>
      {typeof count === "number" && <span className="text-[var(--muted)]">{count}</span>}
    </label>
  );
}

function pluralGoods(n: number) {
  const m = n % 100;
  const m10 = n % 10;
  if (m > 10 && m < 20) return "товаров";
  if (m10 === 1) return "товар";
  if (m10 >= 2 && m10 <= 4) return "товара";
  return "товаров";
}
