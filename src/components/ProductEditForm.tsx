"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type P = {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  priceRetail: number;
  stock: number;
  color: string | null;
  series: string | null;
  kitRole: string | null;
  productType: string | null;
  warranty: string | null;
  posts: number | null;
  active: boolean;
  imageUrl: string | null;
};

export function ProductEditForm({ product }: { product: P }) {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("id", product.id);
    fd.set("full", "1");
    const res = await fetch("/api/admin/product", { method: "POST", body: fd });
    setMsg(res.ok ? "Сохранено" : "Ошибка");
    if (res.ok) router.refresh();
  }
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3 rounded-2xl bg-white p-5 text-sm">
      <input name="name" defaultValue={product.name} className="w-full rounded-full border px-3 py-2" />
      <input name="sku" defaultValue={product.sku} className="w-full rounded-full border px-3 py-2" />
      <textarea name="description" defaultValue={product.description || ""} rows={4} className="w-full rounded-2xl border px-3 py-2" />
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="priceRetail" defaultValue={product.priceRetail} placeholder="Цена" className="rounded-full border px-3 py-2" />
        <input name="stock" defaultValue={product.stock} placeholder="Остаток" className="rounded-full border px-3 py-2" />
        <input name="color" defaultValue={product.color || ""} placeholder="Цвет" className="rounded-full border px-3 py-2" />
        <input name="series" defaultValue={product.series || "Laitys"} placeholder="Серия" className="rounded-full border px-3 py-2" />
        <select name="kitRole" defaultValue={product.kitRole || ""} className="rounded-full border px-3 py-2">
          <option value="assembled">Готовое изделие</option>
          <option value="mechanism">Механизм</option>
          <option value="frame">Рамка</option>
        </select>
        <select name="productType" defaultValue={product.productType || ""} className="rounded-full border px-3 py-2">
          <option value="розетка">розетка</option>
          <option value="выключатель">выключатель</option>
          <option value="рамка">рамка</option>
          <option value="механизм">механизм</option>
        </select>
        <input name="posts" defaultValue={product.posts || ""} placeholder="Постов" className="rounded-full border px-3 py-2" />
        <input name="warranty" defaultValue={product.warranty || ""} placeholder="Гарантия" className="rounded-full border px-3 py-2" />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="active" defaultChecked={product.active} /> В каталоге
      </label>
      <label className="grid gap-1 text-[var(--muted)]">
        Фото
        <input type="file" name="image" accept="image/*" />
      </label>
      {product.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.imageUrl} alt="" className="h-32 w-32 object-contain" />
      )}
      <button className="btn btn-primary" type="submit">
        Сохранить
      </button>
      {msg && <span className="ml-3">{msg}</span>}
    </form>
  );
}
