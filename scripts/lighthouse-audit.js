/**
 * Lighthouse аудит для блога
 * Проверяет производительность, доступность, SEO и best practices
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'fs';
import path from 'path';

const URLS_TO_TEST = [
  'http://localhost:5173/blog',
  'http://localhost:5173/blog/ipoteka-2026',
];

const THRESHOLDS = {
  performance: 90,
  accessibility: 90,
  'best-practices': 90,
  seo: 90,
};

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  const runnerResult = await lighthouse(url, options);

  await chrome.kill();

  return runnerResult;
}

async function main() {
  console.log('🚀 Запуск Lighthouse аудита...\n');

  const results = [];
  let allPassed = true;

  for (const url of URLS_TO_TEST) {
    console.log(`📊 Тестирование: ${url}`);

    try {
      const result = await runLighthouse(url);
      const { lhr } = result;

      const scores = {
        performance: lhr.categories.performance.score * 100,
        accessibility: lhr.categories.accessibility.score * 100,
        'best-practices': lhr.categories['best-practices'].score * 100,
        seo: lhr.categories.seo.score * 100,
      };

      console.log('\n📈 Результаты:');
      console.log(`  Performance: ${scores.performance.toFixed(0)}/100 ${scores.performance >= THRESHOLDS.performance ? '✅' : '❌'}`);
      console.log(`  Accessibility: ${scores.accessibility.toFixed(0)}/100 ${scores.accessibility >= THRESHOLDS.accessibility ? '✅' : '❌'}`);
      console.log(`  Best Practices: ${scores['best-practices'].toFixed(0)}/100 ${scores['best-practices'] >= THRESHOLDS['best-practices'] ? '✅' : '❌'}`);
      console.log(`  SEO: ${scores.seo.toFixed(0)}/100 ${scores.seo >= THRESHOLDS.seo ? '✅' : '❌'}`);

      // Проверяем пороги
      const passed = Object.keys(scores).every(
        (key) => scores[key] >= THRESHOLDS[key]
      );

      if (!passed) {
        allPassed = false;
        console.log('\n⚠️  Некоторые метрики ниже порога!');
      }

      // Сохраняем HTML отчет
      const reportPath = path.join(
        'lighthouse-reports',
        `${url.replace(/[^a-z0-9]/gi, '_')}.html`
      );
      
      if (!fs.existsSync('lighthouse-reports')) {
        fs.mkdirSync('lighthouse-reports', { recursive: true });
      }

      fs.writeFileSync(reportPath, result.report);
      console.log(`\n📄 Отчет сохранен: ${reportPath}`);

      results.push({ url, scores, passed });
    } catch (error) {
      console.error(`\n❌ Ошибка при тестировании ${url}:`, error.message);
      allPassed = false;
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }

  // Итоговый отчет
  console.log('📊 ИТОГОВЫЙ ОТЧЕТ\n');
  results.forEach(({ url, scores, passed }) => {
    console.log(`${passed ? '✅' : '❌'} ${url}`);
    console.log(`   Средний балл: ${Object.values(scores).reduce((a, b) => a + b, 0) / 4}/100\n`);
  });

  if (allPassed) {
    console.log('✅ Все тесты пройдены успешно!');
    process.exit(0);
  } else {
    console.log('❌ Некоторые тесты не прошли. Проверьте отчеты.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Критическая ошибка:', error);
  process.exit(1);
});
