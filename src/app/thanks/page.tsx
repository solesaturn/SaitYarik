import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession, isStaff } from "@/lib/auth";
import { verifyOrderAccessToken } from "@/lib/order-token";
import { getSite } from "@/lib/site";
import { displayProduct } from "@/lib/product-display";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; t?: string }>;
}) {
  const { order: number, t: token } = await searchParams;
  const session = await getSession();
  const site = await getSite();

  const found = number
    ? await prisma.order.findUnique({
        where: { number },
        include: { items: true },
      })
    : null;

  const allowed =
    found &&
    (verifyOrderAccessToken(number!, token) || (session && (session.id === found.userId || isStaff(session.role))));
  const order = allowed ? found : null;

  const paymentNote =
    order?.status === "PAID"
      ? "Оплата подтверждена."
      : order?.status === "CANCELLED"
        ? "Оплата не завершена. Проверьте статус заказа перед повторной оплатой."
        : "Ожидаем подтверждение оплаты.";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="section-title text-center">Спасибо за заказ</h1>
      {order ? (
        <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white p-6">
          <p className="text-sm text-[var(--muted)]">Номер заказа</p>
          <p className="text-2xl font-semibold tracking-tight">{order.number}</p>
          <p className="mt-3 text-[0.9375rem]">{paymentNote}</p>
          <ul className="mt-5 space-y-2 text-sm">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3">
                <span>
                  {displayProduct({ sku: item.sku, name: item.name }).title} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          {order.deliveryAddress && (
            <p className="mt-4 text-sm text-[var(--muted)]">Получение: {order.deliveryAddress}</p>
          )}
          <p className="mt-4 text-sm text-[var(--muted)]">
            Поддержка: <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>,{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
          {order.fiscalReceiptUrl && order.status === "PAID" && (
            <a href={order.fiscalReceiptUrl} className="mt-3 inline-block text-sm underline">
              Ссылка на чек
            </a>
          )}
        </div>
      ) : (
        <p className="mt-4 text-center text-sm text-[var(--muted)]">
          {number ? "Заказ не найден или ссылка неполная." : "Заказ принят."}
        </p>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/catalog" className="btn btn-primary">
          В каталог
        </Link>
      </div>
    </div>
  );
}
