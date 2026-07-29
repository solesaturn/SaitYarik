import Link from "next/link";
import { B2BRegisterForm } from "@/components/B2BRegisterForm";

export const metadata = {
  title: "Оптовикам",
  description: "Оптовые цены, документооборот, регистрация юрлица",
};

export default async function B2BPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string }>;
}) {
  const { sent } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="section-title">Оптовикам</h1>
      <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
        Условия сотрудничества для монтажных организаций, дилеров и застройщиков. После модерации открываются оптовые типы цен из 1С.
      </p>
      {sent && (
        <p className="mt-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Заявка отправлена. Менеджер свяжется с вами.
        </p>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {[
          {
            t: "Оптовые цены",
            d: "Типы цен из 1С. Отображение после подтверждения юрлица менеджером.",
          },
          {
            t: "Документооборот",
            d: "Счёт PDF, УПД/ТОРГ-12, счёт-фактура — из 1С или генерацией на сайте.",
          },
          {
            t: "Быстрый заказ",
            d: "Добавление по списку артикулов и загрузка спецификации Excel/CSV.",
          },
        ].map((x) => (
          <div key={x.t} className="border border-[var(--line)] bg-white p-5">
            <p className="font-[family-name:var(--font-display)] text-xl">{x.t}</p>
            <p className="mt-2 text-sm text-[var(--muted)]">{x.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold">Оплата B2B</h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <li>• Безнал с р/с на р/с — чек не пробивается, счёт + УПД</li>
            <li>• Оплата картой/СБП юрлицом — чек пробивается (54-ФЗ)</li>
            <li>• Запрос КП и индивидуальных условий</li>
            <li>• Персональный менеджер и история документов</li>
          </ul>
          <div className="mt-6 border border-[var(--line)] bg-white p-4">
            <p className="font-semibold">Быстрый заказ по артикулам</p>
            <QuickSkuForm />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Регистрация юрлица</h2>
          <B2BRegisterForm />
          <p className="mt-4 text-xs text-[var(--muted)]">
            Уже есть аккаунт?{" "}
            <Link href="/account" className="underline">
              Войти в кабинет
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function QuickSkuForm() {
  return (
    <form action="/api/b2b/quick-order" method="post" className="mt-3 space-y-3">
      <textarea
        name="skus"
        required
        rows={5}
        placeholder={"RZ-16-WH;10\nVK-1K-WH;20\nRM-2-WH;5"}
        className="w-full rounded border border-[var(--line)] px-3 py-2 font-mono text-sm"
      />
      <p className="text-xs text-[var(--muted)]">Формат: артикул;количество (или CSV). Кратность упаковки учитывается на оформлении.</p>
      <button type="submit" className="btn btn-primary">
        Добавить в корзину
      </button>
    </form>
  );
}
