import { redirect } from "next/navigation";
import { getSession, isStaff } from "@/lib/auth";
import { AdminNav } from "@/components/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminHelpPage() {
  const session = await getSession();
  if (!session || !isStaff(session.role)) redirect("/account");
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <AdminNav />
      <h1 className="section-title">Как работать с сайтом</h1>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-[var(--muted)]">
        <section>
          <h2 className="font-semibold text-[var(--ink)]">Товары</h2>
          <p className="mt-2">
            В разделе «Товары» задайте цену и остаток. Пока цена 0, покупатель видит «Цена уточняется» и не может
            оплатить. Можно скачать CSV, заполнить в Excel и загрузить обратно.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-[var(--ink)]">Черновик, предпросмотр и публикация</h2>
          <p className="mt-2">Откройте товар по артикулу или нажмите «Добавить товар». Измените данные, фотографии и подписи, затем сохраните черновик. «Предпросмотр» показывает его только сотрудникам. «Опубликовать» применяет изменения на сайте. Первой фотографией поставьте вид спереди; порядок меняется кнопками «Раньше» и «Позже».</p>
          <p className="mt-2">В разделе «Тексты и FAQ» так же редактируются главная страница и вопросы. Быстрые цена и остаток в списке товаров, CSV-импорт и контактные настройки сохраняются сразу.</p>
        </section>
        <section>
          <h2 className="font-semibold text-[var(--ink)]">Новый модуль в конструкторе</h2>
          <p className="mt-2">Выберите формат «Модуль для рамки», цвет, один пост и включите «Показывать модуль в конструкторе». После публикации он появится в списке автоматически. Готовые изделия и рамки в список модулей не попадают. Для переключения между цветовыми вариантами используйте общий артикул с окончаниями -WH, -GY и -BK.</p>
        </section>
        <section>
          <h2 className="font-semibold text-[var(--ink)]">Заказы</h2>
          <p className="mt-2">
            Розница оформляет корзину, адрес и онлайн-оплату. Статус PAID появляется после подтверждения платёжной
            системы. Доставка — Ozon.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-[var(--ink)]">Заявки B2B</h2>
          <p className="mt-2">
            Корзина клиента, реквизиты и файл приходят сюда. Сайт опт не считает. Выгрузите CSV, подготовьте расчёт
            вручную и смените статус.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-[var(--ink)]">Вход</h2>
          <p className="mt-2">
            Логин администратора — e-mail из базы (по умолчанию kamalovaar@gmail.com). Пароль задаётся переменной
            ADMIN_PASSWORD при заполнении базы. Смените его после первого входа.
          </p>
        </section>
        <section>
          <h2 className="font-semibold text-[var(--ink)]">Сервисы</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>Оплата: ЮKassa (YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY)</li>
            <li>Уведомления: TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID или NOTIFY_WEBHOOK_URL</li>
            <li>Ozon Pay / виджет Ozon Доставки — второй этап, когда будут доступы</li>
          </ul>
        </section>
        <section>
          <h2 className="font-semibold text-[var(--ink)]">Второй этап</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>Подключить Ozon Pay и калькулятор Ozon Доставки</li>
            <li>Загрузить финальные декларации вместо макетов</li>
            <li>Живые фото товаров и логотип</li>
            <li>Корпоративная почта и Telegram для заявок</li>
            <li>Открыть индексацию, когда уйдут нулевые цены</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
