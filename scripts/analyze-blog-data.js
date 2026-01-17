#!/usr/bin/env node

/**
 * Скрипт для анализа данных блога (JavaScript версия)
 * Запуск: npm run analyze:blog-data
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// Простая версия анализа данных блога
async function analyzeBlogData() {
  console.log('🔍 Начинаем анализ данных блога...');
  
  const analysis = {
    totalFiles: 0,
    totalArticles: 0,
    uniqueArticles: 0,
    duplicates: [],
    missingFields: [],
    invalidArticles: [],
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
    '../src/data/blogPosts.ts',
    '../src/data/blogPostsNew.ts',
    '../src/data/blogPostsNew2.ts',
    '../src/data/blogPostsNew3.ts',
    '../src/data/blogPostsNew4.ts',
    '../src/data/blogPostsNew5.ts',
    '../src/data/blogArticlesGenerated.ts',
    '../src/data/blogArticlesGenerated2.ts'
  ];

  const allArticles = [];
  
  // Анализируем каждый файл
  for (const fileName of dataFiles) {
    try {
      console.log(`📄 Анализируем файл: ${fileName}`);
      
      // Пытаемся импортировать файл
      const module = await import(fileName).catch(() => null);
      
      if (module) {
        let fileArticles = [];
        
        // Извлекаем статьи из различных экспортов
        const possibleExports = [
          'blogPosts',
          'newBlogPosts',
          'newBlogPosts2',
          'additionalBlogPosts',
          'moreBlogPosts',
          'generatedArticles',
          'allGeneratedArticles',
          'remainingPosts',
          'default'
        ];
        
        for (const exportName of possibleExports) {
          if (module[exportName] && Array.isArray(module[exportName])) {
            fileArticles.push(...module[exportName]);
          }
        }
        
        if (fileArticles.length > 0) {
          analysis.totalFiles++;
          analysis.fileStats.push({
            fileName: fileName.replace('../src/data/', ''),
            articleCount: fileArticles.length,
            hasErrors: false,
            errorCount: 0
          });
          
          allArticles.push(...fileArticles.map(article => ({
            ...article,
            _source: fileName
          })));
          analysis.totalArticles += fileArticles.length;
        }
      }
    } catch (error) {
      console.warn(`⚠️ Не удалось проанализировать файл ${fileName}:`, error.message);
      analysis.fileStats.push({
        fileName: fileName.replace('../src/data/', ''),
        articleCount: 0,
        hasErrors: true,
        errorCount: 1
      });
    }
  }

  console.log(`📊 Найдено ${analysis.totalArticles} статей в ${analysis.totalFiles} файлах`);

  // Анализируем дубликаты
  const idMap = new Map();
  const slugMap = new Map();
  
  for (const article of allArticles) {
    if (article.id) {
      if (!idMap.has(article.id)) {
        idMap.set(article.id, []);
      }
      idMap.get(article.id).push(article);
    }
    
    if (article.slug) {
      if (!slugMap.has(article.slug)) {
        slugMap.set(article.slug, []);
      }
      slugMap.get(article.slug).push(article);
    }
  }
  
  // Находим дубликаты по ID
  for (const [id, articleGroup] of idMap) {
    if (articleGroup.length > 1) {
      analysis.duplicates.push({
        id,
        slug: articleGroup[0].slug || 'unknown',
        title: articleGroup[0].title || 'Без названия',
        duplicateCount: articleGroup.length,
        sources: articleGroup.map(a => a._source.replace('../src/data/', ''))
      });
    }
  }
  
  console.log(`🔄 Найдено ${analysis.duplicates.length} групп дубликатов`);

  // Анализируем отсутствующие поля
  const requiredFields = ['id', 'slug', 'title', 'excerpt', 'content', 'author', 'publishedAt', 'category', 'tags'];
  
  for (const article of allArticles) {
    const missing = [];
    
    for (const field of requiredFields) {
      if (!article[field] || (Array.isArray(article[field]) && article[field].length === 0)) {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      analysis.missingFields.push({
        articleId: article.id || 'unknown',
        articleTitle: article.title || 'Без названия',
        missingFields: missing,
        source: article._source.replace('../src/data/', '')
      });
    }
  }
  
  console.log(`❌ Найдено ${analysis.missingFields.length} статей с отсутствующими полями`);

  // Подсчитываем уникальные статьи
  const uniqueIds = new Set();
  const uniqueSlugs = new Set();
  
  for (const article of allArticles) {
    if (article.id) uniqueIds.add(article.id);
    if (article.slug) uniqueSlugs.add(article.slug);
  }
  
  analysis.uniqueArticles = Math.max(uniqueIds.size, uniqueSlugs.size);

  // Генерируем итоговую оценку
  analysis.summary.criticalIssues = analysis.duplicates.length + analysis.invalidArticles.length;
  analysis.summary.warnings = analysis.missingFields.length;
  
  const totalIssues = analysis.summary.criticalIssues + analysis.summary.warnings;
  const maxPossibleIssues = analysis.totalArticles * 2;
  analysis.summary.healthScore = Math.max(0, Math.round(100 - (totalIssues / maxPossibleIssues) * 100));
  
  // Генерируем рекомендации
  if (analysis.duplicates.length > 0) {
    analysis.summary.recommendations.push(`Удалить ${analysis.duplicates.length} групп дубликатов статей`);
  }
  
  if (analysis.missingFields.length > 0) {
    analysis.summary.recommendations.push(`Заполнить отсутствующие поля в ${analysis.missingFields.length} статьях`);
  }
  
  if (analysis.totalFiles > 3) {
    analysis.summary.recommendations.push(`Консолидировать ${analysis.totalFiles} файлов в единую структуру`);
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
      report.push(`- **Источники:** ${duplicate.sources.join(', ')}`);
      report.push('');
    }
  }
  
  // Отсутствующие поля
  if (analysis.missingFields.length > 0) {
    report.push('## ❌ Статьи с отсутствующими полями');
    report.push('');
    report.push(`Найдено **${analysis.missingFields.length}** статей с отсутствующими полями:`);
    report.push('');
    
    for (const missing of analysis.missingFields.slice(0, 10)) {
      report.push(`### ${missing.articleTitle}`);
      report.push(`- **ID:** ${missing.articleId}`);
      report.push(`- **Источник:** ${missing.source}`);
      report.push(`- **Отсутствующие поля:** ${missing.missingFields.join(', ')}`);
      report.push('');
    }
    
    if (analysis.missingFields.length > 10) {
      report.push(`*... и еще ${analysis.missingFields.length - 10} статей*`);
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
  report.push('---');
  report.push('*Отчет сгенерирован автоматически утилитой анализа данных блога*');
  
  return report.join('\n');
}

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
if (process.argv[1].endsWith('analyze-blog-data.js')) {
  main();
}