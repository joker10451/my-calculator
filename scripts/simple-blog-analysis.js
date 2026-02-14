#!/usr/bin/env node

/**
 * Простой анализ данных блога через чтение файлов
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

function analyzeBlogFiles() {
  console.log('🔍 Анализируем файлы данных блога...');
  
  const analysis = {
    totalFiles: 0,
    totalArticles: 0,
    uniqueArticles: 0,
    duplicates: [],
    fileStats: [],
    summary: {
      healthScore: 0,
      criticalIssues: 0,
      warnings: 0,
      recommendations: []
    }
  };

  // Список файлов для анализа
  const dataFiles = [
    'src/data/blogPosts.ts',
    'src/data/blogPostsNew.ts',
    'src/data/blogPostsNew2.ts',
    'src/data/blogPostsNew3.ts',
    'src/data/blogPostsNew4.ts',
    'src/data/blogPostsNew5.ts',
    'src/data/blogArticlesGenerated.ts',
    'src/data/blogArticlesGenerated2.ts'
  ];

  const allIds = new Set();
  const allSlugs = new Set();
  const idCounts = new Map();
  const slugCounts = new Map();
  
  // Анализируем каждый файл
  for (const fileName of dataFiles) {
    try {
      console.log(`📄 Анализируем файл: ${fileName}`);
      
      const filePath = join(process.cwd(), fileName);
      const content = readFileSync(filePath, 'utf-8');
      
      // Подсчитываем статьи по id: в файле
      const idMatches = content.match(/id:\s*['"`]([^'"`]+)['"`]/g) || [];
      const slugMatches = content.match(/slug:\s*['"`]([^'"`]+)['"`]/g) || [];
      
      const fileIds = idMatches.map(match => match.match(/['"`]([^'"`]+)['"`]/)[1]);
      const fileSlugs = slugMatches.map(match => match.match(/['"`]([^'"`]+)['"`]/)[1]);
      
      // Подсчитываем статьи в файле
      const articleCount = Math.max(fileIds.length, fileSlugs.length);
      
      if (articleCount > 0) {
        analysis.totalFiles++;
        analysis.fileStats.push({
          fileName: fileName.replace('src/data/', ''),
          articleCount,
          hasErrors: false,
          errorCount: 0
        });
        
        analysis.totalArticles += articleCount;
        
        // Собираем все ID и slug для анализа дубликатов
        fileIds.forEach(id => {
          allIds.add(id);
          idCounts.set(id, (idCounts.get(id) || 0) + 1);
        });
        
        fileSlugs.forEach(slug => {
          allSlugs.add(slug);
          slugCounts.set(slug, (slugCounts.get(slug) || 0) + 1);
        });
      }
      
    } catch (error) {
      console.warn(`⚠️ Не удалось проанализировать файл ${fileName}:`, error.message);
      analysis.fileStats.push({
        fileName: fileName.replace('src/data/', ''),
        articleCount: 0,
        hasErrors: true,
        errorCount: 1
      });
    }
  }

  console.log(`📊 Найдено ${analysis.totalArticles} статей в ${analysis.totalFiles} файлах`);

  // Анализируем дубликаты по ID
  for (const [id, count] of idCounts) {
    if (count > 1) {
      analysis.duplicates.push({
        id,
        slug: 'unknown',
        title: `Статья с ID ${id}`,
        duplicateCount: count,
        sources: ['multiple files']
      });
    }
  }
  
  // Анализируем дубликаты по slug
  for (const [slug, count] of slugCounts) {
    if (count > 1 && !analysis.duplicates.find(d => d.slug === slug)) {
      analysis.duplicates.push({
        id: 'unknown',
        slug,
        title: `Статья со slug ${slug}`,
        duplicateCount: count,
        sources: ['multiple files']
      });
    }
  }
  
  console.log(`🔄 Найдено ${analysis.duplicates.length} групп дубликатов`);

  // Подсчитываем уникальные статьи
  analysis.uniqueArticles = Math.max(allIds.size, allSlugs.size);

  // Генерируем итоговую оценку
  analysis.summary.criticalIssues = analysis.duplicates.length;
  analysis.summary.warnings = 0;
  
  const duplicateRatio = analysis.duplicates.length / analysis.uniqueArticles;
  analysis.summary.healthScore = Math.max(0, Math.round(100 - (duplicateRatio * 100)));
  
  // Генерируем рекомендации
  if (analysis.duplicates.length > 0) {
    analysis.summary.recommendations.push(`Удалить ${analysis.duplicates.length} групп дубликатов статей`);
  }
  
  if (analysis.totalFiles > 3) {
    analysis.summary.recommendations.push(`Консолидировать ${analysis.totalFiles} файлов в единую структуру`);
  }
  
  if (analysis.totalArticles > analysis.uniqueArticles) {
    analysis.summary.recommendations.push('Высокий уровень дублирования - требуется срочная консолидация');
  }

  console.log('✅ Анализ завершен');
  return analysis;
}

function formatAnalysisReport(analysis) {
  const report = [];
  
  report.push('# 📊 Отчет об анализе данных блога');
  report.push('');
  report.push(`**Дата анализа:** ${new Date().toLocaleString('ru-RU')}`);
  report.push('');
  
  // Общая статистика
  report.push('## 📈 Общая статистика');
  report.push('');
  report.push(`- **Всего файлов:** ${analysis.totalFiles}`);
  report.push(`- **Всего статей:** ${analysis.totalArticles}`);
  report.push(`- **Уникальных статей:** ${analysis.uniqueArticles}`);
  report.push(`- **Коэффициент дублирования:** ${((analysis.totalArticles - analysis.uniqueArticles) / analysis.totalArticles * 100).toFixed(1)}%`);
  report.push(`- **Оценка здоровья:** ${analysis.summary.healthScore}/100`);
  report.push('');
  
  // Статистика по файлам
  report.push('## 📁 Статистика по файлам');
  report.push('');
  report.push('| Файл | Статей | Ошибки | Статус |');
  report.push('|------|--------|--------|--------|');
  
  for (const fileStat of analysis.fileStats) {
    const status = fileStat.hasErrors ? '❌ Есть ошибки' : '✅ OK';
    report.push(`| ${fileStat.fileName} | ${fileStat.articleCount} | ${fileStat.errorCount} | ${status} |`);
  }
  report.push('');
  
  // Дубликаты
  if (analysis.duplicates.length > 0) {
    report.push('## 🔄 Дубликаты статей');
    report.push('');
    report.push(`Найдено **${analysis.duplicates.length}** групп дубликатов:`);
    report.push('');
    
    for (const duplicate of analysis.duplicates) {
      report.push(`### ${duplicate.title}`);
      report.push(`- **ID:** ${duplicate.id}`);
      report.push(`- **Slug:** ${duplicate.slug}`);
      report.push(`- **Количество дубликатов:** ${duplicate.duplicateCount}`);
      report.push('');
    }
  }
  
  // Рекомендации
  if (analysis.summary.recommendations.length > 0) {
    report.push('## 💡 Рекомендации');
    report.push('');
    
    for (let i = 0; i < analysis.summary.recommendations.length; i++) {
      report.push(`${i + 1}. ${analysis.summary.recommendations[i]}`);
    }
    report.push('');
  }
  
  // Заключение
  report.push('## 🎯 Заключение');
  report.push('');
  
  if (analysis.summary.healthScore >= 80) {
    report.push('✅ **Состояние данных хорошее.** Требуются минимальные исправления.');
  } else if (analysis.summary.healthScore >= 60) {
    report.push('⚠️ **Состояние данных удовлетворительное.** Рекомендуется консолидация и исправление ошибок.');
  } else {
    report.push('❌ **Состояние данных критическое.** Требуется срочная консолидация и исправление ошибок.');
  }
  
  report.push('');
  
  // Детальная статистика
  report.push('## 📋 Детальная статистика');
  report.push('');
  report.push(`- Общее количество статей во всех файлах: **${analysis.totalArticles}**`);
  report.push(`- Уникальных статей (по ID/slug): **${analysis.uniqueArticles}**`);
  report.push(`- Дублированных статей: **${analysis.totalArticles - analysis.uniqueArticles}**`);
  report.push(`- Файлов с данными: **${analysis.totalFiles}**`);
  report.push(`- Критических проблем: **${analysis.summary.criticalIssues}**`);
  report.push('');
  
  report.push('---');
  report.push('*Отчет сгенерирован автоматически утилитой анализа данных блога*');
  
  return report.join('\n');
}

async function main() {
  console.log('🚀 Запускаем простой анализ данных блога...\n');
  
  try {
    // Выполняем анализ
    const analysis = analyzeBlogFiles();
    
    // Форматируем отчет
    const report = formatAnalysisReport(analysis);
    
    // Сохраняем отчет в файл
    const reportPath = join(process.cwd(), 'BLOG_DATA_ANALYSIS_REPORT.md');
    writeFileSync(reportPath, report, 'utf-8');
    
    console.log('\n📋 Краткая сводка:');
    console.log(`├─ Всего файлов: ${analysis.totalFiles}`);
    console.log(`├─ Всего статей: ${analysis.totalArticles}`);
    console.log(`├─ Уникальных статей: ${analysis.uniqueArticles}`);
    console.log(`├─ Дублированных статей: ${analysis.totalArticles - analysis.uniqueArticles}`);
    console.log(`├─ Дубликатов: ${analysis.duplicates.length} групп`);
    console.log(`└─ Оценка здоровья: ${analysis.summary.healthScore}/100`);
    
    console.log('\n💡 Основные рекомендации:');
    for (let i = 0; i < analysis.summary.recommendations.length; i++) {
      console.log(`${i + 1}. ${analysis.summary.recommendations[i]}`);
    }
    
    console.log(`\n📄 Детальный отчет сохранен в: ${reportPath}`);
    
    // Определяем статус завершения
    if (analysis.summary.criticalIssues > 0) {
      console.log('\n❌ Обнаружены критические проблемы! Требуется консолидация данных.');
    } else if (analysis.summary.warnings > 0) {
      console.log('\n⚠️ Обнаружены предупреждения. Рекомендуется исправление.');
    } else {
      console.log('\n✅ Данные в хорошем состоянии!');
    }
    
  } catch (error) {
    console.error('💥 Ошибка при анализе данных:', error);
    process.exit(1);
  }
}

// Запускаем
main();