"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

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
      <p className="text-sm font-semibold">Фильтры</p>

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

      <details className="mt-6">
        <summary className="cursor-pointer text-sm font-medium text-[var(--muted)]">Технические параметры</summary>
        <div className="mt-3 space-y-2 text-sm">
          {["IP20", "IP44"].map((ip) => (
            <CheckRow
              key={ip}
              label={ip}
              count={undefined}
              checked={sp.get("ip") === ip}
              onChange={() => set("ip", ip)}
            />
          ))}
          {["10А", "16А"].map((c) => (
            <CheckRow
              key={c}
              label={c}
              count={undefined}
              checked={sp.get("current") === c}
              onChange={() => set("current", c)}
            />
          ))}
        </div>
      </details>

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
