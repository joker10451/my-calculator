# Чеклист деплоя и мониторинга Считай.RU

## Быстрый старт

Этот чеклист поможет вам выполнить деплой и настроить мониторинг для блога Считай.RU.

## Перед деплоем

### 1. Подготовка

```bash
# Запустить все тесты
npm run test

# Проверить производительность
npm run audit:all

# Проверить линтинг
npm run lint
```

- [ ] Все тесты проходят
- [ ] Lighthouse score > 90
- [ ] Нет критических ошибок линтинга

### 2. Обновление контента

```bash
# Обновить sitemap с новыми статьями
npm run generate:sitemap

# Проверить что sitemap содержит новые статьи
cat public/sitemap.xml | grep -c "<url>"
```

- [ ] Sitemap обновлен
- [ ] Robots.txt актуален
- [ ] Все новые статьи в sitemap

### 3. Создание backup

```bash
# Создать backup текущей версии
npm run backup:create
```

- [ ] Backup создан успешно
- [ ] Размер backup корректен
- [ ] Backup сохранен в директории backups/

### 4. Сборка проекта

```bash
# Полная сборка
npm run build

# Или сборка + backup одной командой
npm run deploy:prepare
```

- [ ] Сборка завершена без ошибок
- [ ] Dist директория создана
- [ ] Все файлы на месте

## Деплой

### Вариант 1: Netlify (рекомендуется)

1. **Подключите репозиторий**
   - [ ] Репозиторий подключен к Netlify
   - [ ] Build settings настроены
   - [ ] Environment variables добавлены

2. **Deploy**
   - [ ] Нажмите "Deploy site"
   - [ ] Дождитесь завершения деплоя
   - [ ] Проверьте статус: Published

### Вариант 2: Другие платформы

См. [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) для других вариантов.

## После деплоя

### 1. Проверка работоспособности

```bash
# Автоматическая проверка
npm run production:check
```

Или вручную проверьте:
- [ ] Главная страница загружается
- [ ] Блог отображается
- [ ] Калькуляторы работают
- [ ] Новые статьи доступны
- [ ] Sitemap доступен: https://schitay-online.ru/sitemap.xml
- [ ] Robots.txt доступен: https://schitay-online.ru/robots.txt

### 2. Проверка производительности

- [ ] Lighthouse audit > 90
- [ ] Время загрузки < 2s
- [ ] Нет ошибок в консоли
- [ ] Мобильная версия работает

## Настройка мониторинга

### 1. Google Analytics

```bash
# Настроить аналитику
npm run analytics:setup
```

- [ ] Google Analytics Measurement ID добавлен
- [ ] События отслеживаются
- [ ] Дашборд настроен

### 2. Yandex Metrika

- [ ] Yandex Metrika ID добавлен
- [ ] Счетчик работает
- [ ] Цели настроены
- [ ] Вебвизор включен

### 3. Sentry (опционально)

- [ ] Sentry DSN добавлен
- [ ] Error tracking работает
- [ ] Алерты настроены

### 4. Uptime мониторинг

- [ ] UptimeRobot настроен
- [ ] Мониторы добавлены
- [ ] Алерты настроены

## SEO продвижение

### 1. Генерация списка URL

```bash
# Сгенерировать список URL
npm run seo:generate-urls
```

- [ ] Файл urls-to-submit.txt создан
- [ ] Все новые статьи в списке

### 2. Google Search Console

- [ ] Sitemap отправлен
- [ ] Новые статьи отправлены на индексацию
- [ ] Coverage report проверен

### 3. Yandex Webmaster

- [ ] Sitemap отправлен
- [ ] Новые статьи отправлены на переобход
- [ ] Индексирование проверено

### 4. Social Media

- [ ] Посты созданы для новых статей
- [ ] Open Graph теги проверены
- [ ] Посты опубликованы

### 5. Внутренние ссылки

- [ ] Ссылки из калькуляторов на статьи добавлены
- [ ] Ссылки из статей на калькуляторы работают
- [ ] Навигация между статьями работает

## Мониторинг после деплоя

### День 1

- [ ] Проверить доступность сайта
- [ ] Проверить что нет критических ошибок
- [ ] Проверить аналитику (события отслеживаются)

### Неделя 1

- [ ] Проверить индексацию новых статей (Google)
- [ ] Проверить индексацию новых статей (Yandex)
- [ ] Проанализировать трафик
- [ ] Проверить ошибки в Sentry

### Месяц 1

- [ ] Полный анализ производительности
- [ ] Анализ топ статей
- [ ] Оптимизация слабых статей
- [ ] Планирование новых статей

## Откат (если что-то пошло не так)

```bash
# Посмотреть доступные backup'ы
npm run backup:restore

# Восстановить конкретный backup
npm run backup:restore backup-2026-01-16-14-30-00

# Пересобрать и задеплоить
npm run build
# ... деплой
```

## Полезные команды

```bash
# Разработка
npm run dev                    # Dev сервер
npm run build                  # Сборка
npm run preview                # Предпросмотр

# Тестирование
npm run test                   # Все тесты
npm run test:e2e              # E2E тесты
npm run lint                   # Линтинг

# Аудит
npm run audit:all             # Полный аудит
npm run audit:performance     # Производительность
npm run audit:accessibility   # Доступность

# Backup
npm run backup:create         # Создать backup
npm run backup:restore        # Восстановить

# Деплой
npm run deploy:prepare        # Подготовка
npm run deploy:check          # Проверка
npm run production:check      # Проверка production

# Аналитика
npm run analytics:setup       # Настройка
npm run analytics:dashboard   # Дашборд

# SEO
npm run seo:generate-urls     # Генерация URL
npm run generate:sitemap      # Обновить sitemap
```

## Документация

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Полное руководство по деплою
- [MONITORING_GUIDE.md](./MONITORING_GUIDE.md) - Руководство по мониторингу
- [SEO_PROMOTION_GUIDE.md](./SEO_PROMOTION_GUIDE.md) - Руководство по SEO

## Контакты

При возникновении проблем:
1. Проверьте логи сборки
2. Проверьте консоль браузера
3. Проверьте мониторинг (Sentry, UptimeRobot)
4. Создайте issue в репозитории

---

**Последнее обновление:** 2026-01-16

**Версия:** 1.0.0
