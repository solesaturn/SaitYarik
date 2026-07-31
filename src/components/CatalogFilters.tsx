"use client";

import { useRouter, useSearchParams } from "next/navigation";

type Brand = { id: string; slug: string; name: string };

const types = ["розетка", "выключатель", "рамка", "механизм"];
const colors = ["белый", "серый", "чёрный"];
const posts = ["1", "2", "3", "4"];
const ips = ["IP20", "IP44"];
const currents = ["10А", "16А"];

export function CatalogFilters({ brands }: { brands: Brand[] }) {
  const router = useRouter();
  const sp = useSearchParams();

  function set(key: string, value: string) {
    const next = new URLSearchParams(sp.toString());
    if (!value || next.get(key) === value) next.delete(key);
    else next.set(key, value);
    next.delete("page");
    router.push(`/catalog?${next.toString()}`);
  }

  const techOpen =
    !!sp.get("ip") || !!sp.get("current") || !!sp.get("brand") || sp.get("tech") === "1";

  return (
    <aside className="h-fit border border-[var(--line)] bg-white p-4 lg:sticky lg:top-28">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Подбор</p>

      <label className="mt-4 block text-sm font-medium">Сортировка</label>
      <select
        className="mt-1 w-full rounded border border-[var(--line)] px-2 py-2 text-sm"
        value={sp.get("sort") || "popular"}
        onChange={(e) => set("sort", e.target.value)}
      >
        <option value="popular">Популярность</option>
        <option value="price_asc">Цена ↑</option>
        <option value="price_desc">Цена ↓</option>
        <option value="new">Новизна</option>
        <option value="stock">Наличие</option>
      </select>

      <FilterGroup title="Что нужно">
        {types.map((t) => (
          <Chip key={t} active={sp.get("type") === t} onClick={() => set("type", t)}>
            {t}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup title="Цвет">
        {colors.map((c) => (
          <Chip key={c} active={sp.get("color") === c} onClick={() => set("color", c)}>
            {c}
          </Chip>
        ))}
      </FilterGroup>

      <FilterGroup title="Количество постов">
        {posts.map((p) => (
          <Chip key={p} active={sp.get("posts") === p} onClick={() => set("posts", p)}>
            {p}
          </Chip>
        ))}
      </FilterGroup>

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={sp.get("stock") === "1"} onChange={() => set("stock", sp.get("stock") === "1" ? "" : "1")} />
        Только в наличии
      </label>

      <details className="mt-5" open={techOpen}>
        <summary className="cursor-pointer text-sm font-medium">Технические параметры</summary>
        <p className="mt-1 text-xs text-[var(--muted)]">Для электриков и монтажников</p>

        <FilterGroup title="Бренд">
          {brands.map((b) => (
            <Chip key={b.id} active={sp.get("brand") === b.slug} onClick={() => set("brand", b.slug)}>
              {b.name}
            </Chip>
          ))}
        </FilterGroup>

        <FilterGroup title="Степень защиты">
          {ips.map((ip) => (
            <Chip key={ip} active={sp.get("ip") === ip} onClick={() => set("ip", ip)}>
              {ip}
            </Chip>
          ))}
        </FilterGroup>

        <FilterGroup title="Ток">
          {currents.map((c) => (
            <Chip key={c} active={sp.get("current") === c} onClick={() => set("current", c)}>
              {c}
            </Chip>
          ))}
        </FilterGroup>
      </details>

      <button type="button" className="btn btn-ghost mt-5 w-full" onClick={() => router.push("/catalog")}>
        Сбросить
      </button>
    </aside>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <p className="text-sm font-medium">{title}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded px-2 py-1 text-xs ${active ? "bg-[var(--ink)] text-white" : "bg-[var(--sand)] text-[var(--ink)]"}`}
    >
      {children}
    </button>
  );
}
