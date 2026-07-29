import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: number } = await searchParams;
  const order = number
    ? await prisma.order.findUnique({ where: { number }, include: { items: true } })
    : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <h1 className="section-title">Спасибо за заказ!</h1>
      {order ? (
        <div className="mt-6 border border-[var(--line)] bg-white p-6 text-left">
          <p className="text-sm text-[var(--muted)]">Номер заказа</p>
          <p className="font-[family-name:var(--font-display)] text-2xl">{order.number}</p>
          <p className="mt-3 text-sm">Статус: {order.status}</p>
          {order.paymentMethod === "INVOICE" ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              Счёт будет отправлен на e-mail. При безналичной оплате с р/с на р/с кассовый чек не пробивается — формируются счёт и УПД.
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">
              Фискальный чек отправлен на e-mail/телефон. Трекинг появится после передачи в службу доставки.
            </p>
          )}
          {order.fiscalReceiptUrl && (
            <a href={order.fiscalReceiptUrl} className="mt-3 inline-block text-sm underline">
              Ссылка на чек (демо)
            </a>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--muted)]">Заказ принят.</p>
      )}
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/account" className="btn btn-primary">
          Личный кабинет
        </Link>
        <Link href="/catalog" className="btn btn-ghost">
          Продолжить покупки
        </Link>
      </div>
    </div>
  );
}
