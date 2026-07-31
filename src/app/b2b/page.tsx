import Link from "next/link";
import { LeadForm } from "@/components/LeadForm";

export const metadata = {
  title: "Для монтажников и магазинов",
  description: "Закупка от 50 штук, ваша цена после подтверждения юрлица",
};

export default async function WholesalePage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="section-title">Для монтажников и магазинов</h1>
      <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">
        Закупка от 50 штук. Оставьте имя и телефон — менеджер перезвонит, уточнит реквизиты и откроет вашу цену в
        личном кабинете.
      </p>
      {sent && (
        <p className="mt-4 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          Заявка принята, перезвоним в течение 15 минут в рабочее время.
        </p>
      )}
      {error && (
        <p className="mt-4 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Проверьте имя и телефон и отправьте снова.
        </p>
      )}

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {[
          {
            t: "Ваша цена",
            d: "После подтверждения юрлица в кабинете показываем специальную цену — без ярлыков и переключателей.",
          },
          {
            t: "Документы",
            d: "Счёт, отгрузочные документы — через менеджера. Работаем с организациями и ИП.",
          },
          {
            t: "Быстрый заказ",
            d: "Можно прислать список артикулов — соберём корзину и согласуем отгрузку.",
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
          <h2 className="text-xl font-semibold">Оплата для организаций</h2>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <li>• Безнал по счёту</li>
            <li>• СБП / карта организации</li>
            <li>• Запрос расчёта и индивидуальных условий</li>
          </ul>
          <div className="mt-6 border border-[var(--line)] bg-white p-4">
            <p className="font-semibold">Быстрый заказ по артикулам</p>
            <QuickSkuForm />
          </div>
        </div>
        <div className="border border-[var(--line)] bg-white p-5">
          <LeadForm variant="quote" source="wholesale_page" />
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
      <p className="text-xs text-[var(--muted)]">Формат: артикул;количество. Кратность упаковки учтём при оформлении.</p>
      <button type="submit" className="btn btn-primary">
        Добавить в корзину
      </button>
    </form>
  );
}
