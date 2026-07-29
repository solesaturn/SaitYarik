# SaitYarik — интернет-магазин электрофурнитуры

Реализация ТЗ v1.3: B2C/B2B, каталог, корзина, ЮKassa (СБП), обмен CommerceML с 1С, маркировка «Честный ЗНАК» (контур), доставка (модуль СДЭК/Ozon), SEO, админка.

## Стек

- **Next.js 16** (App Router, SSR) + TypeScript + Tailwind CSS
- **Prisma** + SQLite (для разработки; на проде — PostgreSQL в РФ)
- Локальная сессионная авторизация, роли: гость / розница / B2B / менеджер / админ / контент

## Быстрый старт

```bash
cd D:\SaitYarik
cp .env.example .env
# Укажите DATABASE_URL (PostgreSQL). Для Vercel SQLite не подходит.
npm install
npm run db:reset
npm run dev
```

Откройте http://localhost:3000

### Vercel

На Vercel нужен **PostgreSQL** (Prisma Postgres / Neon / Vercel Postgres).  
В Project Settings → Environment Variables задайте:

- `DATABASE_URL` — строка подключения Postgres
- `NEXT_PUBLIC_SITE_URL` — `https://sait-yarik.vercel.app`
- `NEXTAUTH_SECRET` — случайная строка

Build Command уже делает `prisma db push` и seed каталога Futina.

### Демо-аккаунты

| E-mail | Пароль | Роль |
|--------|--------|------|
| admin@saityarik.ru | admin123 | Админ |
| demo@saityarik.ru | demo123 | B2C |
| opt@saityarik.ru | demo123 | B2B (одобрен) |

Промокод: `ELECTRO10` (−10%)

## Ключевые URL

- `/catalog` — каталог и фильтры
- `/product/[slug]` — карточка товара
- `/cart`, `/checkout`, `/thanks` — корзина и оформление
- `/b2b` — опт, регистрация, быстрый заказ по артикулам
- `/account` — личный кабинет
- `/admin` — заказы, модерация B2B, журнал 1С
- `/api/1c/exchange` — приёмник CommerceML («Обмен с сайтом»)
- `/api/delivery/calc` — расчёт доставки (провайдер из env)
- `/sitemap.xml`, `/robots.txt` — SEO

## Переменные окружения (`.env`)

```
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
YOOKASSA_SHOP_ID="demo"
YOOKASSA_SECRET_KEY="demo"
DELIVERY_PROVIDER="cdek"
NEXT_PUBLIC_YANDEX_METRIKA_ID=""
```

При реальных ключах ЮKassa платежи уходят в `api.yookassa.ru` с чеком 54-ФЗ.

## Соответствие этапам ТЗ

**MVP (реализовано в коде):** каталог с фильтрами, карточка, корзина/оформление, онлайн-оплата + демо-фискализация, контур маркировки, обмен 1С, базовый B2B, доставка (самовывоз + расчёт службы), возвраты (страница + логика частичного возврата в модели), юр. страницы, SEO-основа, мобильная вёрстка, аналитика dataLayer.

**Этапы 2–3:** расширенный B2B (УПД PDF), полнотекстовый поиск с опечатками, лояльность, маркетплейсы — заложены моделями/разделами, дорабатываются после доступов заказчика (раздел 22 ТЗ).

## Передача заказчику

Исходники в Git, развёртывание на любом Node-хостинге в РФ без привязки к подрядчику. Для продакшена: PostgreSQL, HTTPS, бэкапы, 2FA админки, доступы к 1С/ЮKassa/ОФД/Честный ЗНАК.
