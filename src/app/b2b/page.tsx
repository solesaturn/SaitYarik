import { B2BQuoteForm } from "@/components/B2BQuoteForm";

export const metadata = {
  title: "Для бизнеса",
  description: "Отправьте спецификацию — подготовим расчёт заказа Laitys",
};

export default function B2BPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <h1 className="section-title">Для бизнеса</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
        Отправьте список товаров или спецификацию. Мы подготовим расчёт и согласуем условия заказа.
      </p>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <div className="space-y-4 text-sm text-[var(--muted)]">
          <p>Розничную покупку оформите в каталоге. Эта форма — для расчёта заказа по спецификации.</p>
          <p>Нужны компания, контакт и телефон или почта для ответа. При необходимости приложите файл спецификации.</p>
        </div>
        <B2BQuoteForm />
      </div>
    </div>
  );
}
