import { getSite } from "@/lib/site";
import Link from "next/link";

export const metadata = { title: "Доставка и оплата" };
export const dynamic = "force-dynamic";

export default async function DeliveryPage() {
  const site = await getSite();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">Доставка и оплата</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-[var(--muted)]">
        <p>Укажите город. Стоимость и срок доставки появятся до оплаты.</p>
        <p>Способ получения и точный тариф зависят от города. Покрытие проверяется при оформлении заказа.</p>
        <p>Частный покупатель оплачивает заказ на сайте. Для бизнеса — расчёт и счёт после заявки.</p>
        <p>Статус заказа можно уточнить по номеру. Заказ считается оплаченным после подтверждения платёжной системы.</p>
        <p>
          Контакты: <a href={`tel:${site.phone.replace(/\s/g, "")}`}>{site.phone}</a>,{" "}
          <a href={`mailto:${site.email}`}>{site.email}</a>.
        </p>
      </div>
      <Link href="/catalog" className="btn btn-primary mt-8">
        В каталог
      </Link>
    </div>
  );
}
