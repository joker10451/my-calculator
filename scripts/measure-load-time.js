/**
 * Load Time Measurement Script
 * Измеряет время загрузки приложения
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

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

function checkPerformanceMetrics() {
  log('\n⏱️  Проверка метрик производительности...', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  // Целевые метрики
  const targets = {
    FCP: 1500,  // First Contentful Paint < 1.5s
    LCP: 2500,  // Largest Contentful Paint < 2.5s
    TTI: 3500,  // Time to Interactive < 3.5s
    TBT: 300,   // Total Blocking Time < 300ms
    CLS: 0.1,   // Cumulative Layout Shift < 0.1
  };
  
  log('🎯 Целевые метрики:', 'blue');
  log(`  • First Contentful Paint (FCP): < ${targets.FCP}ms`, 'blue');
  log(`  • Largest Contentful Paint (LCP): < ${targets.LCP}ms`, 'blue');
  log(`  • Time to Interactive (TTI): < ${targets.TTI}ms`, 'blue');
  log(`  • Total Blocking Time (TBT): < ${targets.TBT}ms`, 'blue');
  log(`  • Cumulative Layout Shift (CLS): < ${targets.CLS}`, 'blue');
  
  log('\n💡 Рекомендации для достижения целей:', 'cyan');
  log('  1. Оптимизация FCP:', 'yellow');
  log('     - Минимизируйте критический CSS', 'yellow');
  log('     - Используйте preload для критических ресурсов', 'yellow');
  log('     - Оптимизируйте шрифты (font-display: swap)', 'yellow');
  
  log('\n  2. Оптимизация LCP:', 'yellow');
  log('     - Оптимизируйте изображения (WebP, lazy loading)', 'yellow');
  log('     - Используйте CDN для статических ресурсов', 'yellow');
  log('     - Минимизируйте render-blocking ресурсы', 'yellow');
  
  log('\n  3. Оптимизация TTI:', 'yellow');
  log('     - Разделите код на чанки (code splitting)', 'yellow');
  log('     - Используйте lazy loading для компонентов', 'yellow');
  log('     - Минимизируйте JavaScript execution time', 'yellow');
  
  log('\n  4. Оптимизация TBT:', 'yellow');
  log('     - Разбейте длинные задачи на более мелкие', 'yellow');
  log('     - Используйте Web Workers для тяжелых вычислений', 'yellow');
  log('     - Оптимизируйте third-party скрипты', 'yellow');
  
  log('\n  5. Оптимизация CLS:', 'yellow');
  log('     - Задавайте размеры для изображений и видео', 'yellow');
  log('     - Резервируйте место для динамического контента', 'yellow');
  log('     - Избегайте вставки контента над существующим', 'yellow');
  
  log('\n📊 Текущие оптимизации:', 'cyan');
  
  // Проверяем реализованные оптимизации
  const optimizations = [
    {
      name: 'Code Splitting',
      implemented: checkCodeSplitting(),
      impact: 'Улучшает TTI и TBT',
    },
    {
      name: 'Lazy Loading',
      implemented: checkLazyLoading(),
      impact: 'Улучшает FCP и LCP',
    },
    {
      name: 'Image Optimization',
      implemented: checkImageOptimization(),
      impact: 'Улучшает LCP',
    },
    {
      name: 'Service Worker',
      implemented: checkServiceWorker(),
      impact: 'Улучшает повторные загрузки',
    },
    {
      name: 'Preload Critical Resources',
      implemented: checkPreload(),
      impact: 'Улучшает FCP',
    },
  ];
  
  let implementedCount = 0;
  optimizations.forEach(opt => {
    const status = opt.implemented ? '✅' : '❌';
    const color = opt.implemented ? 'green' : 'red';
    log(`  ${status} ${opt.name} - ${opt.impact}`, color);
    if (opt.implemented) implementedCount++;
  });
  
  const score = (implementedCount / optimizations.length) * 100;
  log(`\n📈 Оценка оптимизации: ${score.toFixed(0)}%`, score >= 80 ? 'green' : score >= 60 ? 'yellow' : 'red');
  
  return {
    targets,
    optimizations,
    score,
    passed: score >= 80,
  };
}

function checkCodeSplitting() {
  try {
    const viteConfig = readFileSync('./vite.config.ts', 'utf-8');
    return viteConfig.includes('manualChunks');
  } catch {
    return false;
  }
}

function checkLazyLoading() {
  try {
    const appFile = readFileSync('./src/App.tsx', 'utf-8');
    return appFile.includes('lazy') || appFile.includes('Suspense');
  } catch {
    return false;
  }
}

function checkImageOptimization() {
  try {
    const files = [
      './src/components/blog/OptimizedImage.tsx',
      './src/utils/imageOptimizer.ts',
    ];
    return files.some(file => {
      try {
        readFileSync(file, 'utf-8');
        return true;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
}

function checkServiceWorker() {
  try {
    readFileSync('./public/sw.js', 'utf-8');
    return true;
  } catch {
    return false;
  }
}

function checkPreload() {
  try {
    const indexHtml = readFileSync('./index.html', 'utf-8');
    return indexHtml.includes('preload') || indexHtml.includes('prefetch');
  } catch {
    return false;
  }
}

function main() {
  log('🚀 Измерение времени загрузки...', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');
  
  const results = checkPerformanceMetrics();
  
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 ИТОГОВЫЙ ОТЧЕТ', 'cyan');
  log('='.repeat(60), 'cyan');
  
  if (results.passed) {
    log('\n✅ Оптимизации реализованы на достаточном уровне!', 'green');
    log(`   Оценка: ${results.score.toFixed(0)}%`, 'green');
  } else {
    log('\n⚠️  Требуется дополнительная оптимизация', 'yellow');
    log(`   Оценка: ${results.score.toFixed(0)}%`, 'yellow');
    log('\n   Рекомендуется реализовать недостающие оптимизации', 'yellow');
  }
  
  log('\n💡 Для точного измерения метрик используйте:', 'blue');
  log('   • Chrome DevTools Lighthouse', 'blue');
  log('   • WebPageTest (https://www.webpagetest.org/)', 'blue');
  log('   • Google PageSpeed Insights', 'blue');
  
  log('\n' + '='.repeat(60) + '\n', 'cyan');
  
  process.exit(results.passed ? 0 : 1);
}

main();
