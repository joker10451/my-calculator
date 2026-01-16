/**
 * Скрипт для оптимизации изображений блога
 * Конвертирует в WebP и генерирует разные размеры
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_IMAGES_DIR = path.join(__dirname, '..', 'public', 'blog');
const MAX_IMAGE_SIZE = 500 * 1024; // 500KB

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function analyzeImages(dir = BLOG_IMAGES_DIR, results = []) {
  if (!fs.existsSync(dir)) {
    console.log('⚠️  Директория с изображениями блога не найдена');
    return results;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      analyzeImages(filePath, results);
    } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
      results.push({
        path: filePath,
        name: file,
        size: stats.size,
        isWebP: file.endsWith('.webp'),
      });
    }
  });

  return results;
}

function main() {
  console.log('🖼️  Анализ изображений блога...\n');

  const images = analyzeImages();

  if (images.length === 0) {
    console.log('ℹ️  Изображения не найдены');
    return;
  }

  let totalSize = 0;
  let largeImages = 0;
  let nonWebPImages = 0;

  console.log('📊 Найдено изображений:', images.length);
  console.log('\n📄 Детали:\n');

  images.forEach(img => {
    totalSize += img.size;
    const isLarge = img.size > MAX_IMAGE_SIZE;
    const needsWebP = !img.isWebP;

    if (isLarge) largeImages++;
    if (needsWebP) nonWebPImages++;

    const status = isLarge ? '⚠️' : '✅';
    const webpStatus = needsWebP ? '🔄' : '✅';

    console.log(`  ${status} ${img.name}`);
    console.log(`     Размер: ${formatBytes(img.size)}`);
    console.log(`     WebP: ${webpStatus} ${img.isWebP ? 'Да' : 'Нет'}`);

    if (isLarge) {
      console.log(`     ⚠️  Превышает рекомендуемый размер ${formatBytes(MAX_IMAGE_SIZE)}`);
    }
    console.log('');
  });

  console.log('='.repeat(60));
  console.log(`\n📊 Статистика:`);
  console.log(`  Всего изображений: ${images.length}`);
  console.log(`  Общий размер: ${formatBytes(totalSize)}`);
  console.log(`  Средний размер: ${formatBytes(totalSize / images.length)}`);
  console.log(`  Больших изображений (>${formatBytes(MAX_IMAGE_SIZE)}): ${largeImages}`);
  console.log(`  Не в формате WebP: ${nonWebPImages}`);

  console.log('\n💡 Рекомендации:');

  if (nonWebPImages > 0) {
    console.log(`  • Конвертируйте ${nonWebPImages} изображений в WebP формат`);
    console.log('    Используйте: npm install -D sharp');
    console.log('    Или онлайн: https://squoosh.app/');
  }

  if (largeImages > 0) {
    console.log(`  • Оптимизируйте ${largeImages} больших изображений`);
    console.log('    - Уменьшите разрешение');
    console.log('    - Увеличьте сжатие');
    console.log('    - Используйте responsive images (srcset)');
  }

  console.log('  • Используйте lazy loading для изображений ниже fold');
  console.log('  • Добавьте blur-up placeholder для лучшего UX');
  console.log('  • Генерируйте несколько размеров для разных устройств');

  console.log('\n' + '='.repeat(60));

  if (largeImages > 0 || nonWebPImages > 0) {
    console.log('\n⚠️  Требуется оптимизация изображений');
    process.exit(1);
  } else {
    console.log('\n✅ Все изображения оптимизированы');
    process.exit(0);
  }
}

main();
