/**
 * Скрипт для анализа и оптимизации bundle size
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist', 'assets');
const MAX_JS_SIZE = 200 * 1024; // 200KB
const MAX_CSS_SIZE = 50 * 1024; // 50KB

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function analyzeBundle() {
  console.log('📦 Анализ размера bundle...\n');

  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Директория dist/assets не найдена. Запустите npm run build');
    process.exit(1);
  }

  const files = fs.readdirSync(DIST_DIR);
  
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));

  let totalJsSize = 0;
  let totalCssSize = 0;
  let hasIssues = false;

  console.log('📄 JavaScript файлы:');
  jsFiles.forEach(file => {
    const filePath = path.join(DIST_DIR, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    totalJsSize += size;

    const status = size > MAX_JS_SIZE ? '⚠️' : '✅';
    console.log(`  ${status} ${file}: ${formatBytes(size)}`);

    if (size > MAX_JS_SIZE) {
      hasIssues = true;
      console.log(`     ⚠️  Превышает лимит ${formatBytes(MAX_JS_SIZE)}`);
    }
  });

  console.log(`\n  Общий размер JS: ${formatBytes(totalJsSize)}\n`);

  console.log('🎨 CSS файлы:');
  cssFiles.forEach(file => {
    const filePath = path.join(DIST_DIR, file);
    const stats = fs.statSync(filePath);
    const size = stats.size;
    totalCssSize += size;

    const status = size > MAX_CSS_SIZE ? '⚠️' : '✅';
    console.log(`  ${status} ${file}: ${formatBytes(size)}`);

    if (size > MAX_CSS_SIZE) {
      hasIssues = true;
      console.log(`     ⚠️  Превышает лимит ${formatBytes(MAX_CSS_SIZE)}`);
    }
  });

  console.log(`\n  Общий размер CSS: ${formatBytes(totalCssSize)}\n`);

  const totalSize = totalJsSize + totalCssSize;
  console.log(`📊 Общий размер bundle: ${formatBytes(totalSize)}`);

  // Рекомендации по оптимизации
  if (hasIssues) {
    console.log('\n💡 Рекомендации по оптимизации:');
    console.log('  1. Используйте code splitting для разделения кода');
    console.log('  2. Lazy load компоненты, которые не нужны сразу');
    console.log('  3. Проверьте, нет ли дублирующихся зависимостей');
    console.log('  4. Используйте tree shaking для удаления неиспользуемого кода');
    console.log('  5. Минифицируйте и сжимайте код (gzip/brotli)');
    console.log('  6. Проверьте размер зависимостей с помощью webpack-bundle-analyzer');
  }

  // Анализ gzip размера (приблизительно)
  const estimatedGzipSize = totalSize * 0.3; // Примерно 30% от оригинального размера
  console.log(`\n📦 Примерный размер после gzip: ${formatBytes(estimatedGzipSize)}`);

  if (estimatedGzipSize > MAX_JS_SIZE) {
    console.log('⚠️  Размер после gzip все еще превышает рекомендуемый лимит');
    hasIssues = true;
  } else {
    console.log('✅ Размер после gzip в пределах нормы');
  }

  console.log('\n' + '='.repeat(60));

  if (hasIssues) {
    console.log('\n⚠️  Обнаружены проблемы с размером bundle');
    process.exit(1);
  } else {
    console.log('\n✅ Размер bundle оптимален');
    process.exit(0);
  }
}

analyzeBundle();
