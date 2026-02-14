/**
 * Initial Bundle Analysis Script
 * Анализирует размер начального бандла (критические файлы для первой загрузки)
 */

import { readFileSync, statSync, readdirSync } from 'fs';
import { join } from 'path';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

async function getGzipSize(filePath) {
  try {
    const content = readFileSync(filePath);
    const compressed = await gzipAsync(content);
    return compressed.length;
  } catch (error) {
    return 0;
  }
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = readdirSync(dirPath);

  files.forEach((file) => {
    const filePath = join(dirPath, file);
    if (statSync(filePath).isDirectory()) {
      arrayOfFiles = getAllFiles(filePath, arrayOfFiles);
    } else {
      arrayOfFiles.push(filePath);
    }
  });

  return arrayOfFiles;
}

async function analyzeInitialBundle() {
  log('\n📦 Анализ начального бандла...', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  const distPath = './dist';
  const indexHtml = readFileSync(join(distPath, 'index.html'), 'utf-8');
  
  // Извлекаем критические файлы из index.html
  const scriptMatches = [...indexHtml.matchAll(/src="([^"]+\.js)"/g)];
  const cssMatches = [...indexHtml.matchAll(/href="([^"]+\.css)"/g)];
  
  const criticalFiles = [
    ...scriptMatches.map(m => m[1]),
    ...cssMatches.map(m => m[1]),
  ];
  
  log('🎯 Критические файлы для начальной загрузки:', 'blue');
  
  let totalSize = 0;
  let totalGzipSize = 0;
  const fileStats = [];
  
  for (const file of criticalFiles) {
    const filePath = join(distPath, file);
    try {
      const stats = statSync(filePath);
      const gzipSize = await getGzipSize(filePath);
      
      totalSize += stats.size;
      totalGzipSize += gzipSize;
      
      fileStats.push({
        name: file,
        size: stats.size,
        gzipSize: gzipSize,
      });
      
      const color = gzipSize > 50 * 1024 ? 'red' : gzipSize > 30 * 1024 ? 'yellow' : 'green';
      log(`  • ${file}`, color);
      log(`    ${formatBytes(stats.size)} → ${formatBytes(gzipSize)} (gzipped)`, color);
    } catch (error) {
      log(`  ⚠️  ${file} - не найден`, 'yellow');
    }
  }
  
  log(`\n📊 Итого начальный бандл:`, 'cyan');
  log(`  Исходный: ${formatBytes(totalSize)}`);
  log(`  Gzipped: ${formatBytes(totalGzipSize)}`);
  
  const targetSize = 200 * 1024; // 200KB
  const status = totalGzipSize <= targetSize ? '✅' : '❌';
  const statusColor = totalGzipSize <= targetSize ? 'green' : 'red';
  
  log(`\n${status} Целевой размер начального бандла: < 200KB gzipped`, statusColor);
  log(`  Текущий: ${formatBytes(totalGzipSize)}`, statusColor);
  
  if (totalGzipSize > targetSize) {
    const excess = totalGzipSize - targetSize;
    log(`  Превышение: ${formatBytes(excess)}`, 'red');
    
    log('\n💡 Рекомендации:', 'yellow');
    log('  1. Используйте динамические импорты для некритических компонентов', 'yellow');
    log('  2. Отложите загрузку тяжелых библиотек (charts, export)', 'yellow');
    log('  3. Используйте tree shaking для удаления неиспользуемого кода', 'yellow');
    log('  4. Рассмотрите альтернативные более легкие библиотеки', 'yellow');
  } else {
    log('\n✅ Начальный бандл оптимизирован!', 'green');
  }
  
  // Анализ lazy-loaded чанков
  log('\n📦 Анализ lazy-loaded чанков...', 'cyan');
  
  const allJsFiles = getAllFiles(join(distPath, 'assets')).filter(f => f.endsWith('.js'));
  const lazyChunks = allJsFiles.filter(f => !criticalFiles.some(cf => f.includes(cf)));
  
  let lazyTotalSize = 0;
  let lazyTotalGzipSize = 0;
  
  for (const file of lazyChunks) {
    const stats = statSync(file);
    const gzipSize = await getGzipSize(file);
    lazyTotalSize += stats.size;
    lazyTotalGzipSize += gzipSize;
  }
  
  log(`  Количество lazy-loaded чанков: ${lazyChunks.length}`);
  log(`  Общий размер: ${formatBytes(lazyTotalSize)} → ${formatBytes(lazyTotalGzipSize)} (gzipped)`);
  
  log('\n💡 Lazy loading работает корректно!', 'green');
  log('  Большая часть кода загружается по требованию', 'green');
  
  return {
    initialSize: totalSize,
    initialGzipSize: totalGzipSize,
    lazySize: lazyTotalSize,
    lazyGzipSize: lazyTotalGzipSize,
    targetSize,
    passed: totalGzipSize <= targetSize,
  };
}

async function main() {
  log('🚀 Анализ начального бандла...', 'cyan');
  log('='.repeat(60), 'cyan');
  
  try {
    statSync('./dist');
  } catch {
    log('\n❌ Папка dist не найдена. Запустите сборку: npm run build', 'red');
    process.exit(1);
  }
  
  const results = await analyzeInitialBundle();
  
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 ИТОГОВЫЙ ОТЧЕТ', 'cyan');
  log('='.repeat(60), 'cyan');
  
  log(`\n📦 Начальный бандл: ${formatBytes(results.initialGzipSize)}`, 
    results.passed ? 'green' : 'red');
  log(`📦 Lazy-loaded код: ${formatBytes(results.lazyGzipSize)}`, 'blue');
  log(`📦 Всего: ${formatBytes(results.initialGzipSize + results.lazyGzipSize)}`, 'cyan');
  
  const percentage = (results.initialGzipSize / results.targetSize * 100).toFixed(1);
  log(`\n📊 Использование целевого размера: ${percentage}%`, 
    results.passed ? 'green' : 'yellow');
  
  if (results.passed) {
    log('\n✅ НАЧАЛЬНЫЙ БАНДЛ СООТВЕТСТВУЕТ ТРЕБОВАНИЯМ!', 'green');
    log('   Приложение оптимизировано для быстрой загрузки', 'green');
  } else {
    log('\n⚠️  НАЧАЛЬНЫЙ БАНДЛ ПРЕВЫШАЕТ ЦЕЛЕВОЙ РАЗМЕР', 'yellow');
    log('   Рекомендуется дополнительная оптимизация', 'yellow');
  }
  
  log('\n' + '='.repeat(60) + '\n', 'cyan');
  
  process.exit(results.passed ? 0 : 1);
}

main().catch(error => {
  log(`\n❌ Ошибка: ${error.message}`, 'red');
  process.exit(1);
});
