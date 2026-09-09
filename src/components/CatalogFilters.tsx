"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

type Counts = {
  colors: Record<string, number>;
  posts: Record<string, number>;
  types: Record<string, number>;
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

  function set(key: string, value: string) {
    const next = new URLSearchParams(sp.toString());
    if (!value || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    startTransition(() => router.push(`/catalog?${next.toString()}`));
  }

  function toggleMulti(key: string, value: string) {
    // single-select chips for MVP matching current query API
    set(key, value);
  }

  const colors = Object.keys(counts.colors);
  const posts = Object.keys(counts.posts).sort((a, b) => Number(a) - Number(b));
  const types = Object.keys(counts.types);

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

      {colors.length > 0 && (
        <FilterGroup title="Цвет">
          {colors.map((c) => (
            <CheckRow
              key={c}
              label={c}
              count={counts.colors[c]}
              checked={sp.get("color") === c}
              onChange={() => toggleMulti("color", c)}
            />
          ))}
        </FilterGroup>
      )}

      {types.length > 0 && (
        <FilterGroup title="Тип">
          {types.map((t) => (
            <CheckRow
              key={t}
              label={typeLabels[t] || t}
              count={counts.types[t]}
              checked={sp.get("type") === t}
              onChange={() => toggleMulti("type", t)}
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
              checked={sp.get("posts") === p}
              onChange={() => toggleMulti("posts", p)}
            />
          ))}
        </FilterGroup>
      )}

      <FilterGroup title="Серия">
        <CheckRow
          label="Laitys"
          count={undefined}
          checked={sp.get("series") === "Laitys"}
          onChange={() => set("series", "Laitys")}
        />
      </FilterGroup>

      <FilterGroup title="Цена">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            const min = String(fd.get("min") || "");
            const max = String(fd.get("max") || "");
            const next = new URLSearchParams(sp.toString());
            if (min) next.set("min", min);
            else next.delete("min");
            if (max) next.set("max", max);
            else next.delete("max");
            next.delete("page");
            startTransition(() => router.push(`/catalog?${next.toString()}`));
          }}
        >
          <input name="min" defaultValue={sp.get("min") || ""} placeholder="от" className="w-20 rounded-full border border-[var(--line)] px-3 py-1.5 text-sm" />
          <input name="max" defaultValue={sp.get("max") || ""} placeholder="до" className="w-20 rounded-full border border-[var(--line)] px-3 py-1.5 text-sm" />
          <button type="submit" className="text-sm underline">
            OK
          </button>
        </form>
      </FilterGroup>

      <button
        type="button"
        disabled={pending}
        className="btn btn-copper mt-8 w-full !rounded-full"
        onClick={() => startTransition(() => router.push(`/catalog?${sp.toString()}`))}
      >
        Показать {resultCount} {pluralGoods(resultCount)}
      </button>
      <button
        type="button"
        className="btn btn-ghost mt-3 w-full !rounded-full"
        onClick={() => startTransition(() => router.push("/catalog"))}
      >
        Сбросить всё
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
    <label className="flex cursor-pointer items-center gap-2.5 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-[var(--line)] accent-[var(--ink)]"
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
