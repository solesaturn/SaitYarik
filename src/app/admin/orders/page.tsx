import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { AdminNav } from "@/components/AdminNav";
import { StatusSelect } from "@/components/AdminForms";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session || !isStaff(session.role)) redirect("/account");
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
    take: 100,
  });
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <AdminNav />
      <h1 className="section-title">Заказы</h1>
      <div className="mt-8 space-y-4">
        {orders.map((o) => (
          <article key={o.id} className="rounded-2xl bg-white p-5 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{o.number}</p>
                <p className="text-[var(--muted)]">
                  {o.name} · {o.phone} · {o.email}
                </p>
                <p className="text-[var(--muted)]">
                  {o.deliveryMethod} · {o.deliveryAddress}
                </p>
                <p className="mt-1">{formatPrice(o.total)} · оплата {o.paymentMethod}</p>
              </div>
              <StatusSelect
                id={o.id}
                value={o.status}
                endpoint="/api/admin/order"
                options={["AWAITING_PAYMENT", "PAID", "SHIPPED", "CANCELLED", "DONE"]}
              />
            </div>
            <ul className="mt-3 space-y-1 text-[var(--muted)]">
              {o.items.map((i) => (
                <li key={i.id}>
                  {i.sku} · {i.name} × {i.quantity}
                </li>
              ))}
            </ul>
          </article>
        ))}
        {orders.length === 0 && <p className="text-sm text-[var(--muted)]">Заказов пока нет.</p>}
      </div>
    </div>
  );
}
