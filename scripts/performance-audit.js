/**
 * Performance Audit Script
 * Проверяет производительность приложения
 */

import { execSync } from 'child_process';
import { readFileSync, statSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

// Цвета для консоли
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

async function analyzeBundleSize() {
  log('\n📦 Анализ размера бандла...', 'cyan');
  
  const distPath = './dist';
  const jsFiles = getAllFiles(join(distPath, 'assets')).filter(f => f.endsWith('.js'));
  const cssFiles = getAllFiles(join(distPath, 'assets')).filter(f => f.endsWith('.css'));
  
  let totalSize = 0;
  let totalGzipSize = 0;
  
  const fileStats = [];
  
  for (const file of [...jsFiles, ...cssFiles]) {
    const stats = statSync(file);
    const gzipSize = await getGzipSize(file);
    
    totalSize += stats.size;
    totalGzipSize += gzipSize;
    
    fileStats.push({
      name: file.replace(distPath + '/', ''),
      size: stats.size,
      gzipSize: gzipSize,
    });
  }
  
  // Сортируем по размеру
  fileStats.sort((a, b) => b.gzipSize - a.gzipSize);
  
  log('\nТоп-10 самых больших файлов (gzipped):', 'blue');
  fileStats.slice(0, 10).forEach((file, index) => {
    const color = file.gzipSize > 50 * 1024 ? 'red' : file.gzipSize > 30 * 1024 ? 'yellow' : 'green';
    log(`  ${index + 1}. ${file.name}: ${formatBytes(file.size)} → ${formatBytes(file.gzipSize)} (gzipped)`, color);
  });
  
  log(`\n📊 Общий размер:`, 'cyan');
  log(`  Исходный: ${formatBytes(totalSize)}`);
  log(`  Gzipped: ${formatBytes(totalGzipSize)}`);
  
  const targetSize = 200 * 1024; // 200KB
  const status = totalGzipSize <= targetSize ? '✅' : '❌';
  const statusColor = totalGzipSize <= targetSize ? 'green' : 'red';
  
  log(`\n${status} Целевой размер: < 200KB gzipped`, statusColor);
  log(`  Текущий: ${formatBytes(totalGzipSize)}`, statusColor);
  
  if (totalGzipSize > targetSize) {
    const excess = totalGzipSize - targetSize;
    log(`  Превышение: ${formatBytes(excess)}`, 'red');
  }
  
  return {
    totalSize,
    totalGzipSize,
    targetSize,
    passed: totalGzipSize <= targetSize,
  };
}

function checkSearchPerformance() {
  log('\n🔍 Проверка производительности поиска...', 'cyan');
  
  // Проверяем наличие оптимизаций поиска
  const searchServicePath = './src/services/searchService.ts';
  const searchCachePath = './src/utils/searchCache.ts';
  
  const checks = [
    {
      name: 'Сервис поиска существует',
      path: searchServicePath,
      required: true,
    },
    {
      name: 'Кеширование поиска реализовано',
      path: searchCachePath,
      required: true,
    },
  ];
  
  let allPassed = true;
  
  checks.forEach(check => {
    try {
      statSync(check.path);
      log(`  ✅ ${check.name}`, 'green');
    } catch {
      if (check.required) {
        log(`  ❌ ${check.name}`, 'red');
        allPassed = false;
      } else {
        log(`  ⚠️  ${check.name} (опционально)`, 'yellow');
      }
    }
  });
  
  log('\n💡 Рекомендации для оптимизации поиска:', 'blue');
  log('  - Используйте debouncing (300ms) для поискового ввода');
  log('  - Кешируйте результаты поиска на 5 минут');
  log('  - Используйте Web Workers для тяжелых вычислений');
  log('  - Индексируйте контент на этапе сборки');
  
  return {
    passed: allPassed,
    targetTime: 500, // ms
  };
}

function checkLoadingOptimizations() {
  log('\n⚡ Проверка оптимизаций загрузки...', 'cyan');
  
  const checks = [
    {
      name: 'Code splitting настроен',
      check: () => {
        const viteConfig = readFileSync('./vite.config.ts', 'utf-8');
        return viteConfig.includes('manualChunks');
      },
    },
    {
      name: 'Lazy loading компонентов',
      check: () => {
        const appFile = readFileSync('./src/App.tsx', 'utf-8');
        return appFile.includes('lazy') || appFile.includes('Suspense');
      },
    },
    {
      name: 'Service Worker настроен',
      check: () => {
        try {
          statSync('./public/sw.js');
          return true;
        } catch {
          return false;
        }
      },
    },
    {
      name: 'PWA манифест настроен',
      check: () => {
        try {
          statSync('./public/manifest.json');
          return true;
        } catch {
          return false;
        }
      },
    },
  ];
  
  let passed = 0;
  let total = checks.length;
  
  checks.forEach(check => {
    const result = check.check();
    if (result) {
      log(`  ✅ ${check.name}`, 'green');
      passed++;
    } else {
      log(`  ❌ ${check.name}`, 'red');
    }
  });
  
  log(`\n📊 Результат: ${passed}/${total} проверок пройдено`, passed === total ? 'green' : 'yellow');
  
  return {
    passed: passed === total,
    score: (passed / total) * 100,
  };
}

function printSummary(results) {
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 ИТОГОВЫЙ ОТЧЕТ', 'cyan');
  log('='.repeat(60), 'cyan');
  
  const checks = [
    {
      name: 'Bundle Size',
      passed: results.bundleSize.passed,
      details: `${formatBytes(results.bundleSize.totalGzipSize)} / ${formatBytes(results.bundleSize.targetSize)}`,
    },
    {
      name: 'Search Performance',
      passed: results.searchPerformance.passed,
      details: `Target: < ${results.searchPerformance.targetTime}ms`,
    },
    {
      name: 'Loading Optimizations',
      passed: results.loadingOptimizations.passed,
      details: `Score: ${results.loadingOptimizations.score.toFixed(0)}%`,
    },
  ];
  
  checks.forEach(check => {
    const status = check.passed ? '✅' : '❌';
    const color = check.passed ? 'green' : 'red';
    log(`\n${status} ${check.name}`, color);
    log(`   ${check.details}`, 'blue');
  });
  
  const allPassed = checks.every(c => c.passed);
  
  log('\n' + '='.repeat(60), 'cyan');
  if (allPassed) {
    log('✅ ВСЕ ПРОВЕРКИ ПРОЙДЕНЫ!', 'green');
  } else {
    log('❌ НЕКОТОРЫЕ ПРОВЕРКИ НЕ ПРОЙДЕНЫ', 'red');
    log('\nРекомендации по оптимизации:', 'yellow');
    
    if (!results.bundleSize.passed) {
      log('  • Уменьшите размер бандла:', 'yellow');
      log('    - Проверьте дублирующиеся зависимости', 'yellow');
      log('    - Используйте tree shaking', 'yellow');
      log('    - Разделите код на более мелкие чанки', 'yellow');
    }
    
    if (!results.searchPerformance.passed) {
      log('  • Оптимизируйте поиск:', 'yellow');
      log('    - Реализуйте кеширование результатов', 'yellow');
      log('    - Используйте debouncing', 'yellow');
    }
    
    if (!results.loadingOptimizations.passed) {
      log('  • Улучшите загрузку:', 'yellow');
      log('    - Настройте code splitting', 'yellow');
      log('    - Добавьте lazy loading', 'yellow');
      log('    - Настройте service worker', 'yellow');
    }
  }
  log('='.repeat(60) + '\n', 'cyan');
  
  return allPassed;
}

async function main() {
  log('🚀 Запуск аудита производительности...', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  // Проверяем наличие dist папки
  try {
    statSync('./dist');
  } catch {
    log('❌ Папка dist не найдена. Запустите сборку: npm run build', 'red');
    process.exit(1);
  }
  
  const results = {
    bundleSize: await analyzeBundleSize(),
    searchPerformance: checkSearchPerformance(),
    loadingOptimizations: checkLoadingOptimizations(),
  };
  
  const allPassed = printSummary(results);
  
  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  log(`\n❌ Ошибка: ${error.message}`, 'red');
  process.exit(1);
});
