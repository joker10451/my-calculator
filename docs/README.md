# 📚 Документация Считай.RU

## Структура

| Папка | Содержание |
|-------|-----------|
| [01-development](01-development/) | Гайдлайны разработки, тестирование |
| [02-design](02-design/) | Дизайн-система, UX |
| [03-content](03-content/) | Создание контента, блог |
| [04-integrations](04-integrations/) | Партнёрки, API, виджеты банков |
| [05-seo](05-seo/) | SEO, индексация, поисковые системы |
| [06-analytics](06-analytics/) | Яндекс Метрика, Google Analytics |
| [07-deployment](07-deployment/) | Деплой, хостинг, мониторинг |
| [08-performance](08-performance/) | Оптимизация, бандл, скорость |
| [_archive](_archive/) | Устаревшие документы |

## Быстрые ссылки

- **Как начать разработку** → [AGENTS.md](01-development/AGENTS.md)
- **Дизайн-токены** → [DESIGN_GUIDELINES.md](02-design/DESIGN_GUIDELINES.md)
- **Добавить партнёрку** → [REFERRAL_SYSTEM_GUIDE.md](04-integrations/REFERRAL_SYSTEM_GUIDE.md)
- **Написать статью** → [BLOG_ARTICLE_CREATION_GUIDE.md](03-content/BLOG_ARTICLE_CREATION_GUIDE.md)
- **Настроить аналитику** → [ANALYTICS_SETUP.md](06-analytics/ANALYTICS_SETUP.md)

## Статус проекта

- **Хостинг**: Cloudflare Pages
- **Домен**: schitay-online.ru
- **Стек**: React 18 + Vite 5 + TypeScript + Tailwind CSS
- **Аналитика**: Яндекс Метрика (106217699) + GA4 (G-K1W27063WG) + Web Vitals
- **PWA**: Service Worker + offline mode
- **Тема**: Dark по умолчанию, light доступна через toggle

## Калькуляторы (31)

| Категория | Калькуляторы |
|-----------|-------------|
| Финансы | Ипотека, Кредит, Рефинансирование, Вклады, Конвертер валют, Инвестиции, Переплата, Сложный процент, Аренда vs Покупка, Бюджет 50/30/20, Погашение долгов |
| Зарплата | НДФЛ, Отпускные, Больничный, Самозанятые/ИП, Пенсия, Налоговый вычет, Налог на вклады |
| ЖКХ | Коммунальные платежи |
| Авто | ОСАГО, КАСКО, Расход топлива, Размер шин |
| Здоровье | ИМТ, Норма воды, Калории |
| Семья | Материнский капитал, Алименты |
| Юридические | Госпошлина в суд |

## SEO-лендинги

50 автогенерируемых страниц под длинные поисковые запросы (`/calc/:slug`).
Конфигурация: `src/data/seoLandings.ts`

## Ключевые файлы

| Файл | Назначение |
|------|-----------|
| `src/App.tsx` | Маршрутизация (74 маршрута) |
| `src/lib/data.ts` | Категории и калькуляторы для навигации |
| `src/data/bankRates.ts` | Ставки банков (обновлять вручную) |
| `src/data/seoLandings.ts` | Конфигурация SEO-лендингов |
| `src/services/cbrRates.ts` | API курсов ЦБ РФ |
| `src/config/affiliateLinks.ts` | Партнёрские ссылки |
| `scripts/generate-static-html.js` | Генерация HTML при билде |
| `scripts/generate-sitemap.js` | Генерация sitemap.xml |
| `public/_headers` | HTTP-заголовки (кэширование) |
| `public/_redirects` | Редиректы + SPA fallback |
