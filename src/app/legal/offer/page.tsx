import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function OfferPage() {
  const site = await getSite();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">Публичная оферта</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          {site.legalName} (ИНН {site.inn}, ОГРНИП {site.ogrnip}) предлагает заключить договор купли-продажи
          электроустановочных изделий Laitys на условиях, указанных на сайте.
        </p>
        <p>Адрес: {site.address}.</p>
        <p>Акцепт оферты для розницы — оформление и оплата заказа. Для бизнеса — заявка на расчёт и последующий счёт.</p>
        <p>Оплата розничного заказа проходит через платёжную систему. Заказ оплачен только после её подтверждения.</p>
      </div>
    </div>
  );
}
