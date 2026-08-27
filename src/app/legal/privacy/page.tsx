import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const site = await getSite();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">Политика конфиденциальности</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          Оператор: {site.legalName}, ИНН {site.inn}. Контакт: {site.email}, {site.phone}.
        </p>
        <p>
          Обрабатываются имя, телефон, e-mail, адрес доставки и реквизиты организации — чтобы исполнить заказ или заявку
          на расчёт.
        </p>
        <p>
          Данные могут передаваться платёжному провайдеру и службе доставки Ozon в объёме, нужном для оплаты и доставки.
          Карточные данные на сайте не хранятся.
        </p>
      </div>
    </div>
  );
}
