#!/usr/bin/env tsx

/**
 * Скрипт для анализа данных блога
 * Запуск: npm run analyze-blog-data
 */

import { analyzeBlogData, formatAnalysisReport } from '../src/utils/analyzeBlogData';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  console.log('🚀 Запускаем анализ данных блога...\n');
  
  try {
    // Выполняем анализ
    const analysis = await analyzeBlogData();
    
    // Форматируем отчет
    const report = formatAnalysisReport(analysis);
    
    // Сохраняем отчет в файл
    const reportPath = join(process.cwd(), 'BLOG_DATA_ANALYSIS_REPORT.md');
    writeFileSync(reportPath, report, 'utf-8');
    
    console.log('\n📋 Краткая сводка:');
    console.log(`├─ Всего файлов: ${analysis.totalFiles}`);
    console.log(`├─ Всего статей: ${analysis.totalArticles}`);
    console.log(`├─ Уникальных статей: ${analysis.uniqueArticles}`);
    console.log(`├─ Дубликатов: ${analysis.duplicates.length} групп`);
    console.log(`├─ Статей с отсутствующими полями: ${analysis.missingFields.length}`);
    console.log(`├─ Невалидных статей: ${analysis.invalidArticles.length}`);
    console.log(`└─ Оценка здоровья: ${analysis.summary.healthScore}/100`);
    
    console.log('\n💡 Основные рекомендации:');
    for (let i = 0; i < analysis.summary.recommendations.length; i++) {
      console.log(`${i + 1}. ${analysis.summary.recommendations[i]}`);
    }
    
    console.log(`\n📄 Детальный отчет сохранен в: ${reportPath}`);
    
    // Определяем статус завершения
    if (analysis.summary.criticalIssues > 0) {
      console.log('\n❌ Обнаружены критические проблемы! Требуется консолидация данных.');
      process.exit(1);
    } else if (analysis.summary.warnings > 0) {
      console.log('\n⚠️ Обнаружены предупреждения. Рекомендуется исправление.');
      process.exit(0);
    } else {
      console.log('\n✅ Данные в хорошем состоянии!');
      process.exit(0);
    }
    
  } catch (error) {
    console.error('💥 Ошибка при анализе данных:', error);
    process.exit(1);
  }
}

// Запускаем только если скрипт вызван напрямую
if (require.main === module) {
  main();
}

export { main as analyzeBlogDataScript };