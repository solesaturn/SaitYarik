import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession, isStaff } from "@/lib/auth";
import { verifyOrderAccessToken } from "@/lib/order-token";

export const dynamic = "force-dynamic";

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; t?: string }>;
}) {
  const { order: number, t: token } = await searchParams;
  const session = await getSession();

  let order: {
    number: string;
    status: string;
    paymentMethod: string | null;
    fiscalReceiptUrl: string | null;
    userId: string | null;
  } | null = null;

  if (number) {
    const found = await prisma.order.findUnique({ where: { number } });
    if (found) {
      const allowed =
        verifyOrderAccessToken(number, token) ||
        (session && (session.id === found.userId || isStaff(session.role)));
      if (allowed) order = found;
    }
  }

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
              Счёт будет отправлен на e-mail. При безналичной оплате кассовый чек не пробивается — формируются счёт и
              УПД.
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--muted)]">
              {order.status === "PAID"
                ? "Оплата подтверждена. Фискальный чек — по ссылке ниже (если доступен)."
                : "Если оплата ещё обрабатывается — обновите страницу через минуту."}
            </p>
          )}
          {order.fiscalReceiptUrl && order.status === "PAID" && (
            <a href={order.fiscalReceiptUrl} className="mt-3 inline-block text-sm underline">
              Ссылка на чек
            </a>
          )}
        </div>
      ) : (
        <p className="mt-4 text-sm text-[var(--muted)]">
          {number ? "Заказ не найден или ссылка неполная." : "Заказ принят."}
        </p>
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
