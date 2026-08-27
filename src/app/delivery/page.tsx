import { getSite } from "@/lib/site";

export const metadata = { title: "Доставка и оплата" };
export const dynamic = "force-dynamic";

export default async function DeliveryPage() {
  const site = await getSite();
  const delivery = await import("@/lib/site").then((m) => m.getSetting("delivery_note", ""));
  const payment = await import("@/lib/site").then((m) => m.getSetting("payment_note", ""));
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">Доставка и оплата</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>{delivery || "Доставка Ozon. Стоимость и срок — по зоне покрытия Ozon."}</p>
        <p>{payment || "Частный покупатель оплачивает заказ на сайте. Для бизнеса — счёт после ручного расчёта."}</p>
        <p>Заказ считается оплаченным только после подтверждения от платёжной системы, а не после возврата на сайт.</p>
        <p>
          Контакты: {site.phone}, {site.email}.
        </p>
      </div>
    </div>
  );
}
