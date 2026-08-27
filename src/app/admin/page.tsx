import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { AdminNav } from "@/components/AdminNav";
import { StatusSelect } from "@/components/AdminForms";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getSession();
  if (!session || !isStaff(session.role)) redirect("/account");

  const [orders, productCount, unpriced, b2b, faqs] = await Promise.all([
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.product.count(),
    prisma.product.count({ where: { priceRetail: { lte: 0 } } }),
    prisma.b2BRequest.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.faqItem.count(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <AdminNav />
      <h1 className="section-title">Админка</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">{session.email}</p>
      {unpriced > 0 && (
        <p className="mt-4 rounded-2xl bg-[var(--sand)] p-4 text-sm">
          Без подтверждённой цены: {unpriced} из {productCount}. Пока цена 0, на витрине «Цена уточняется».{" "}
          <Link href="/admin/products" className="underline">
            Открыть товары
          </Link>
        </p>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { t: "Товары", v: String(productCount) },
          { t: "Заказы", v: String(orders.length) },
          { t: "Заявки B2B", v: String(b2b.length) },
          { t: "FAQ", v: String(faqs) },
        ].map((x) => (
          <div key={x.t} className="rounded-2xl bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-[var(--muted)]">{x.t}</p>
            <p className="mt-2 text-3xl font-semibold">{x.v}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold">Заказы B2C</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl bg-white">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs text-[var(--muted)]">
                  <th className="p-3">Номер</th>
                  <th className="p-3">Клиент</th>
                  <th className="p-3">Сумма</th>
                  <th className="p-3">Статус</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-t border-[var(--line)]">
                    <td className="p-3 font-medium">{o.number}</td>
                    <td className="p-3">
                      {o.name}
                      <div className="text-xs text-[var(--muted)]">{o.email}</div>
                    </td>
                    <td className="p-3">{formatPrice(o.total)}</td>
                    <td className="p-3">
                      <StatusSelect
                        id={o.id}
                        value={o.status}
                        endpoint="/api/admin/order"
                        options={["AWAITING_PAYMENT", "PAID", "SHIPPED", "CANCELLED", "DONE"]}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/admin/orders" className="mt-3 inline-block text-sm underline">
            Все заказы
          </Link>
        </section>
        <section>
          <h2 className="text-xl font-semibold">Заявки B2B</h2>
          <div className="mt-4 space-y-3">
            {b2b.map((r) => (
              <div key={r.id} className="rounded-2xl bg-white p-4 text-sm">
                <p className="font-semibold">{r.companyName}</p>
                <p className="text-[var(--muted)]">
                  ИНН {r.inn} · {r.email}
                </p>
                <StatusSelect
                  id={r.id}
                  value={r.status}
                  endpoint="/api/admin/b2b"
                  options={["NEW", "IN_PROGRESS", "QUOTED", "CLOSED"]}
                />
              </div>
            ))}
          </div>
          <Link href="/admin/b2b" className="mt-3 inline-block text-sm underline">
            Все заявки
          </Link>
        </section>
      </div>
    </div>
  );
}
