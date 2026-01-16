# Руководство по деплою Считай.RU

## Подготовка к деплою

### 1. Проверка перед деплоем

Выполните все проверки перед деплоем:

```bash
# Запустить все тесты
npm run test

# Запустить аудит производительности
npm run audit:all

# Проверить линтинг
npm run lint
```

### 2. Создание backup

Перед деплоем обязательно создайте backup текущей версии:

```bash
# Создать backup
npm run backup:create
```

Backup будет сохранен в директории `backups/` с timestamp.

### 3. Сборка проекта

```bash
# Полная сборка с генерацией sitemap и других файлов
npm run build
```

Эта команда:
- Собирает проект с помощью Vite
- Генерирует SPA fallback
- Обновляет sitemap.xml с новыми статьями блога
- Обновляет robots.txt

### 4. Подготовка к деплою (все в одной команде)

```bash
# Сборка + создание backup
npm run deploy:prepare
```

## Деплой на production

### Вариант 1: Netlify (рекомендуется)

1. **Подключите репозиторий к Netlify**
   - Зайдите в Netlify Dashboard
   - New site from Git
   - Выберите ваш репозиторий

2. **Настройте build settings**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Настройте переменные окружения** (если нужно)
   - Site settings → Environment variables

4. **Настройте redirects**
   - Файл `public/_redirects` автоматически копируется в dist

5. **Deploy**
   - Нажмите "Deploy site"
   - Или используйте автоматический деплой при push в main

### Вариант 2: Vercel

1. **Подключите репозиторий к Vercel**
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Настройте проект**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Вариант 3: GitHub Pages

1. **Настройте GitHub Actions**
   
   Создайте `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         
         - name: Setup Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
             
         - name: Install dependencies
           run: npm ci
           
         - name: Build
           run: npm run build
           
         - name: Deploy
           uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

2. **Настройте GitHub Pages**
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages

### Вариант 4: Собственный сервер

1. **Соберите проект локально**
   ```bash
   npm run build
   ```

2. **Загрузите dist на сервер**
   ```bash
   # Через SCP
   scp -r dist/* user@server:/var/www/schitay-online.ru/
   
   # Или через rsync
   rsync -avz --delete dist/ user@server:/var/www/schitay-online.ru/
   ```

3. **Настройте Nginx**
   ```nginx
   server {
       listen 80;
       server_name schitay-online.ru www.schitay-online.ru;
       
       root /var/www/schitay-online.ru;
       index index.html;
       
       # SPA routing
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Кеширование статических файлов
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
       
       # Gzip сжатие
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

## Проверка после деплоя

### 1. Функциональные проверки

- [ ] Главная страница загружается
- [ ] Все калькуляторы работают
- [ ] Блог отображается корректно
- [ ] Поиск по блогу работает
- [ ] Навигация между страницами работает
- [ ] Мобильная версия отображается корректно

### 2. SEO проверки

- [ ] Sitemap доступен: `https://schitay-online.ru/sitemap.xml`
- [ ] Robots.txt доступен: `https://schitay-online.ru/robots.txt`
- [ ] Meta теги корректны на всех страницах
- [ ] Open Graph теги работают (проверить в Facebook Debugger)
- [ ] Structured data валидна (проверить в Google Rich Results Test)

### 3. Производительность

```bash
# Lighthouse audit
npm run audit:performance

# Или вручную в Chrome DevTools
# Lighthouse → Generate report
```

Целевые метрики:
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### 4. Мониторинг ошибок

Проверьте консоль браузера на наличие ошибок:
- JavaScript errors
- Network errors
- Console warnings

## Откат к предыдущей версии

Если что-то пошло не так, можно откатиться к backup:

```bash
# Посмотреть доступные backup'ы
npm run backup:restore

# Восстановить конкретный backup
npm run backup:restore backup-2026-01-16-14-30-00

# Пересобрать и задеплоить
npm run build
# ... деплой на production
```

## Мониторинг после деплоя

### Google Analytics

1. Проверьте что события отслеживаются:
   - Page views
   - Calculator usage
   - Blog article reads
   - Search queries

2. Настройте алерты для:
   - Резкое падение трафика
   - Увеличение bounce rate
   - Ошибки JavaScript

### Yandex Metrika

1. Проверьте работу счетчика
2. Настройте цели:
   - Использование калькуляторов
   - Чтение статей блога
   - Клики по партнерским ссылкам

### Uptime мониторинг

Настройте мониторинг доступности сайта:
- UptimeRobot
- Pingdom
- StatusCake

## Обновление контента после деплоя

### Добавление новых статей блога

1. Добавьте статью в `src/data/blogPosts.ts`
2. Пересоберите проект: `npm run build`
3. Sitemap автоматически обновится
4. Задеплойте новую версию

### Отправка в поисковые системы

#### Google Search Console

1. Откройте Google Search Console
2. Sitemaps → Add new sitemap
3. Введите: `https://schitay-online.ru/sitemap.xml`
4. Submit

Для новых статей:
1. URL Inspection
2. Введите URL статьи
3. Request Indexing

#### Yandex Webmaster

1. Откройте Yandex Webmaster
2. Индексирование → Файлы Sitemap
3. Добавьте: `https://schitay-online.ru/sitemap.xml`

Для новых статей:
1. Инструменты → Переобход страниц
2. Добавьте URL статьи

## Troubleshooting

### Проблема: Sitemap не обновляется

**Решение:**
```bash
# Пересгенерировать sitemap
npm run generate:sitemap

# Проверить что файл обновился
cat public/sitemap.xml | grep lastmod
```

### Проблема: 404 ошибки на статьях блога

**Решение:**
1. Проверьте что `_redirects` файл скопирован в dist
2. Проверьте настройки SPA routing на сервере
3. Для Netlify: убедитесь что `_redirects` в корне dist

### Проблема: Медленная загрузка

**Решение:**
```bash
# Оптимизировать bundle
npm run optimize:bundle

# Оптимизировать изображения
npm run optimize:images

# Проверить результат
npm run audit:load-time
```

### Проблема: Ошибки в консоли после деплоя

**Решение:**
1. Проверьте что все зависимости установлены
2. Очистите кеш браузера
3. Проверьте что все файлы загрузились (Network tab)
4. Проверьте CORS настройки для внешних ресурсов

## Чеклист деплоя

- [ ] Все тесты проходят (`npm run test`)
- [ ] Аудит производительности пройден (`npm run audit:all`)
- [ ] Создан backup (`npm run backup:create`)
- [ ] Проект собран (`npm run build`)
- [ ] Sitemap обновлен и содержит новые статьи
- [ ] Robots.txt актуален
- [ ] Redirects настроены (если нужно)
- [ ] Деплой выполнен
- [ ] Функциональные проверки пройдены
- [ ] SEO проверки пройдены
- [ ] Производительность проверена
- [ ] Мониторинг настроен
- [ ] Sitemap отправлен в Google Search Console
- [ ] Sitemap отправлен в Yandex Webmaster
- [ ] Новые статьи отправлены на индексацию

## Полезные команды

```bash
# Разработка
npm run dev                    # Запустить dev сервер
npm run build                  # Собрать проект
npm run preview                # Предпросмотр сборки

# Тестирование
npm run test                   # Запустить все тесты
npm run test:e2e              # E2E тесты
npm run lint                   # Проверить код

# Аудит
npm run audit:all             # Полный аудит
npm run audit:performance     # Аудит производительности
npm run audit:accessibility   # Аудит доступности

# Оптимизация
npm run optimize:all          # Оптимизировать все
npm run optimize:bundle       # Оптимизировать bundle
npm run optimize:images       # Оптимизировать изображения

# Генерация
npm run generate:sitemap      # Сгенерировать sitemap
npm run generate:feeds        # Сгенерировать RSS

# Backup
npm run backup:create         # Создать backup
npm run backup:restore        # Восстановить из backup

# Деплой
npm run deploy:prepare        # Подготовка к деплою
npm run deploy:check          # Проверка перед деплоем
```

## Контакты и поддержка

При возникновении проблем:
1. Проверьте логи сборки
2. Проверьте консоль браузера
3. Проверьте Network tab в DevTools
4. Создайте issue в репозитории с описанием проблемы
