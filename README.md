# Laitys — интернет-магазин электроустановочных изделий

Розница оплачивает заказ на сайте. Бизнес отправляет корзину на ручной расчёт.

Сайт закрыт от индексации, пока владелец не включит её в админке.

## Стек

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + SQLite (на проде лучше PostgreSQL)

## Запуск

```bash
cp .env.example .env
npm install
npm run db:reset
npm run dev
```

Откройте http://localhost:3000

Вход в админку: `/account` → e-mail `kamalovaar@gmail.com`, пароль из `ADMIN_PASSWORD` (по умолчанию при seed: `ChangeMeLaitys`). Смените пароль сразу.

## Переменные

- `DATABASE_URL`
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — только для seed
- `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY` — онлайн-оплата
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` или `NOTIFY_WEBHOOK_URL` — уведомления о заказах и заявках
- `NEXT_PUBLIC_SITE_URL`

Ozon Pay и калькулятор Ozon Доставки — второй этап, когда будут доступы.

## Что делает владелец без разработчика

- Товары: цена, остаток, фото, характеристики, Excel-импорт
- Заказы B2C и статусы
- Заявки B2B, файлы, выгрузка CSV
- Контакты, FAQ, сертификаты PDF
