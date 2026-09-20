import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPriceLabel } from "@/lib/utils";
import { AdminNav } from "@/components/AdminNav";
import { ProductQuickForm } from "@/components/AdminForms";
import { CatalogImport } from "@/components/CatalogImport";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await getSession();
  if (!session || !isStaff(session.role)) redirect("/account");
  const products = await prisma.product.findMany({ orderBy: { sku: "asc" } });
  const drafts = await prisma.siteSetting.findMany({where:{key:{startsWith:'draft:product:'}}});

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <AdminNav />
      <h1 className="section-title">Товары</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Цена и остаток только отсюда. 0 = «Цена уточняется».</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/admin/products/new" className="btn btn-primary">Добавить товар</Link>
        <a href="/api/admin/catalog-file" className="btn btn-copper">
          Скачать Excel (CSV)
        </a>
        <CatalogImport />
      </div>
      {drafts.length > 0 && <section className="mt-6 rounded-xl bg-[var(--sand)] p-4"><h2 className="font-semibold">Черновики</h2><ul className="mt-2 space-y-2">{drafts.map(d => {
        const value = JSON.parse(d.value) as {name:string;sku:string};
        return <li key={d.key}><Link className="underline" href={`/admin/products/${d.key.replace('draft:product:', '')}`}>{value.sku} · {value.name}</Link></li>;
      })}</ul></section>}
      <div className="mt-8 overflow-x-auto rounded-2xl bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-xs text-[var(--muted)]">
              <th className="p-3">Артикул</th>
              <th className="p-3">Название</th>
              <th className="p-3">Цвет</th>
              <th className="p-3">Сейчас</th>
              <th className="p-3">Цена / остаток</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-[var(--line)]">
                <td className="p-3 font-mono">
                  <Link href={`/admin/products/${p.id}`} className="underline">
                    {p.sku}
                  </Link>
                </td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.color}</td>
                <td className="p-3">{formatPriceLabel(p.priceRetail)}</td>
                <td className="p-3">
                  <ProductQuickForm id={p.id} priceRetail={p.priceRetail} stock={p.stock} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
