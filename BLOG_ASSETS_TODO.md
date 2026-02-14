# Blog Assets - Missing Resources Fix

## Проблема

При загрузке блога возникают 404 ошибки для следующих ресурсов:

### 1. Responsive Image Variants (640w, 768w, etc.)
- `ipoteka-2026-640w.webp`
- `ndfl-2026-640w.webp`
- `alimenty-2026-640w.webp`
- `osago-2026-640w.webp`
- `raschet-kalorij-2026-640w.webp`
- `refinansirovanie-2026-640w.webp`

### 2. WebP Conversions
Все изображения блога должны иметь WebP версии для оптимизации

### 3. Placeholder Images
- `/blog/hero-bg.webp` - фоновое изображение для hero секции
- `/blog/default-thumbnail.webp` - изображение по умолчанию для статей

### 4. Font Files
- `/fonts/inter-var.woff2` - вариативный шрифт Inter

### 5. PWA Icons
- `/icon-192.png` - уже существует, но возможно проблема с путем

## Временное решение (ПРИМЕНЕНО)

✅ Отключена автоматическая конвертация в WebP (`convertToWebP = false`)
✅ Отключена генерация srcset для responsive images (`generateSrcset = false`)
✅ Закомментирован preload для отсутствующих изображений
✅ Закомментирован preload для отсутствующего шрифта

Эти изменения устраняют 404 ошибки, но снижают производительность.

## Полное решение

### Шаг 1: Генерация Responsive Image Variants

Для каждого изображения блога нужно создать варианты разных размеров:

```bash
# Установить sharp для обработки изображений
npm install --save-dev sharp

# Создать скрипт для генерации вариантов
node scripts/generate-responsive-images.js
```

Скрипт должен создать варианты: 320w, 640w, 768w, 1024w, 1280w для каждого изображения.

### Шаг 2: Конвертация в WebP

```bash
# Конвертировать все JPG/PNG в WebP
node scripts/convert-to-webp.js
```

### Шаг 3: Создание Placeholder Images

**hero-bg.webp:**
- Размер: 1920x600px
- Формат: WebP
- Содержание: Градиент или абстрактный фон для hero секции блога

**default-thumbnail.webp:**
- Размер: 1200x630px
- Формат: WebP
- Содержание: Логотип Считай.RU + текст "Блог"

### Шаг 4: Добавление Шрифта

Скачать Inter Variable Font:
```bash
# Создать директорию для шрифтов
mkdir -p public/fonts

# Скачать Inter Variable Font
# https://github.com/rsms/inter/releases
# Поместить inter-var.woff2 в public/fonts/
```

### Шаг 5: Включение Оптимизаций

После создания всех ресурсов:

1. В `src/utils/imageOptimizer.ts`:
```typescript
const {
  convertToWebP: shouldConvertToWebP = true, // Включить
  addLazyLoading = true,
  isBelowFold = true,
  generateSrcset = true, // Включить
} = options;
```

2. В `src/components/blog/BlogResourcePreloader.tsx`:
- Раскомментировать preload для изображений
- Раскомментировать preload для шрифта

## Скрипты для Автоматизации

### generate-responsive-images.js

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [320, 640, 768, 1024, 1280];
const inputDir = 'public/blog';
const outputDir = 'public/blog';

async function generateResponsiveImages() {
  const files = fs.readdirSync(inputDir)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file));

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const baseName = path.basename(file, path.extname(file));
    
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `${baseName}-${size}w.webp`);
      
      await sharp(inputPath)
        .resize(size, null, { withoutEnlargement: true })
        .webp({ quality: 85 })
        .toFile(outputPath);
      
      console.log(`✓ Generated: ${outputPath}`);
    }
  }
}

generateResponsiveImages().catch(console.error);
```

### convert-to-webp.js

```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputDir = 'public/blog';

async function convertToWebP() {
  const files = fs.readdirSync(inputDir)
    .filter(file => /\.(jpg|jpeg|png)$/i.test(file));

  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    const outputPath = inputPath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    
    console.log(`✓ Converted: ${outputPath}`);
  }
}

convertToWebP().catch(console.error);
```

## Проверка После Применения

1. Запустить build: `npm run build`
2. Проверить что все файлы созданы в `dist/blog/`
3. Запустить локально: `npm run preview`
4. Открыть DevTools → Network и проверить что нет 404 ошибок
5. Запустить Lighthouse audit - Performance должен быть 90+

## Ожидаемые Улучшения

После полного решения:
- ✅ Нет 404 ошибок
- ✅ Быстрая загрузка изображений (WebP на 25-35% меньше JPG)
- ✅ Responsive images для разных экранов
- ✅ Лучший Lighthouse Performance score
- ✅ Меньше трафика для пользователей

## Статус

- [x] Временное решение применено (404 ошибки устранены)
- [ ] Создать скрипты генерации изображений
- [ ] Сгенерировать responsive варианты
- [ ] Конвертировать в WebP
- [ ] Создать placeholder изображения
- [ ] Добавить шрифт Inter Variable
- [ ] Включить оптимизации обратно
- [ ] Протестировать на production
