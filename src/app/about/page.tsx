import Link from "next/link";
import { SITE } from "@/lib/pricing";

export const metadata = {
  title: "О компании",
  description: "SaitYarik — поставка электрофурнитуры Futina со склада в Москве",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">О компании</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
        <p>
          <strong className="text-[var(--ink)]">{SITE.name}</strong> — интернет-магазин электрофурнитуры Futina для
          частных покупателей, монтажников и магазинов. Мы продаём розетки, выключатели, рамки и механизмы со склада
          в {SITE.city}.
        </p>
        <p>
          Ассортимент — официальная поставка Guangdong Futina. Работаем с физлицами и юрлицами: можно купить одну
          розетку или заказать партию на объект. Отгрузка в день заказа при наличии на складе.
        </p>
        <p>
          Наши покупатели — люди, которые меняют одну точку в квартире; бригады на ремонте; магазины и снабженцы на
          стройке. Цель сайта — короткий путь: каталог → корзина → имя и телефон.
        </p>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Контакты и реквизиты</h2>
      <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
        <li>Телефон: {SITE.phone}</li>
        <li>E-mail: {SITE.email}</li>
        <li>Город: {SITE.city}, склад и самовывоз</li>
        <li>ИНН 7700000000 · ОГРН 1027700000000</li>
      </ul>
      <p className="mt-3 text-xs text-[var(--muted)]">
        Реквизиты на сайте сейчас демо-заглушка — финальные данные подставит заказчик (см. ТЗ № 2).
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/certificates" className="btn btn-primary">
          Сертификаты и документы
        </Link>
        <Link href="/contacts" className="btn btn-ghost">
          Написать нам
        </Link>
      </div>
    </div>
  );
}
