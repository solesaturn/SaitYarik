function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="section-title">{title}</h1>
      <div className="prose-legal mt-6 space-y-4 text-sm leading-relaxed text-[var(--muted)]">{children}</div>
    </div>
  );
}

export default function PrivacyPage() {
  return (
    <LegalLayout title="Политика конфиденциальности и обработки ПДн (152-ФЗ)">
      <p>
        Оператор обрабатывает персональные данные покупателей (ФИО, телефон, e-mail, адрес доставки, реквизиты юрлица) в целях исполнения договоров розничной купли-продажи и оптовых поставок.
      </p>
      <p>
        Хранение персональных данных осуществляется на серверах на территории РФ. Передача третьим лицам — платёжному провайдеру ЮKassa, службе доставки и ОФД — только в объёме, необходимом для оказания услуг.
      </p>
      <p>
        Карточные данные на сайте не сохраняются: оплата проходит на стороне PCI DSS-совместимого провайдера.
      </p>
      <p>По запросу субъекта ПДн оператор предоставляет сведения, уточняет или удаляет данные, если это не противоречит закону.</p>
    </LegalLayout>
  );
}
