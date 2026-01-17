#!/usr/bin/env node

/**
 * Скрипт для тестирования консолидации данных блога
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

// Простая версия консолидации для тестирования
async function testConsolidation() {
  console.log('🧪 Тестируем консолидацию данных блога...');
  
  const result = {
    consolidatedArticles: [],
    removedDuplicates: 0,
    fixedArticles: 0,
    errors: [],
    summary: {
      originalCount: 0,
      finalCount: 0,
      duplicatesRemoved: 0,
      articlesFixed: 0,
      healthScore: 0
    }
  };

  try {
    // Загружаем и анализируем файлы
    const allArticles = await loadAllArticlesSimple();
    result.summary.originalCount = allArticles.length;
    
    console.log(`📊 Загружено ${allArticles.length} статей`);

    // Дедуплицируем
    const uniqueArticles = deduplicateSimple(allArticles);
    result.removedDuplicates = allArticles.length - uniqueArticles.length;
    result.summary.duplicatesRemoved = result.removedDuplicates;
    
    console.log(`🗑️ Удалено ${result.removedDuplicates} дубликатов`);

    // Санитизируем
    const sanitizedArticles = uniqueArticles.map(article => sanitizeSimple(article));
    result.fixedArticles = sanitizedArticles.filter(a => a._wasFixed).length;
    result.summary.articlesFixed = result.fixedArticles;
    
    console.log(`🔧 Исправлено ${result.fixedArticles} статей`);

    // Сортируем по дате
    sanitizedArticles.sort((a, b) => {
      const dateA = new Date(a.publishedAt || '1970-01-01').getTime();
      const dateB = new Date(b.publishedAt || '1970-01-01').getTime();
      return dateB - dateA;
    });

    result.consolidatedArticles = sanitizedArticles;
    result.summary.finalCount = sanitizedArticles.length;
    result.summary.healthScore = calculateHealthScore(result);
    
    console.log(`✅ Консолидация завершена: ${result.summary.finalCount} статей`);
    
  } catch (error) {
    result.errors.push(`Ошибка: ${error.message}`);
    console.error('💥 Ошибка:', error);
  }

  return result;
}

async function loadAllArticlesSimple() {
  const { readFileSync } = await import('fs');
  const allArticles = [];
  
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

  for (const fileName of dataFiles) {
    try {
      const content = readFileSync(fileName, 'utf-8');
      
      // Извлекаем статьи через регулярные выражения
      const articles = extractArticlesFromContent(content, fileName);
      allArticles.push(...articles);
      
    } catch (error) {
      console.warn(`⚠️ Не удалось загрузить ${fileName}:`, error.message);
    }
  }

  return allArticles;
}

function extractArticlesFromContent(content, fileName) {
  const articles = [];
  
  // Ищем объекты статей в коде
  const articleMatches = content.match(/\{[\s\S]*?id:\s*['"`]([^'"`]+)['"`][\s\S]*?\}/g) || [];
  
  for (const match of articleMatches) {
    try {
      const article = parseArticleFromMatch(match);
      if (article.id) {
        article._source = fileName.split('/').pop();
        article._priority = getSourcePriority(fileName);
        articles.push(article);
      }
    } catch (error) {
      console.warn(`Не удалось распарсить статью из ${fileName}`);
    }
  }
  
  return articles;
}

function parseArticleFromMatch(match) {
  const article = {};
  
  // Извлекаем основные поля
  const idMatch = match.match(/id:\s*['"`]([^'"`]+)['"`]/);
  if (idMatch) article.id = idMatch[1];
  
  const slugMatch = match.match(/slug:\s*['"`]([^'"`]+)['"`]/);
  if (slugMatch) article.slug = slugMatch[1];
  
  const titleMatch = match.match(/title:\s*['"`]([^'"`]+)['"`]/);
  if (titleMatch) article.title = titleMatch[1];
  
  const excerptMatch = match.match(/excerpt:\s*['"`]([^'"`]+)['"`]/);
  if (excerptMatch) article.excerpt = excerptMatch[1];
  
  const publishedAtMatch = match.match(/publishedAt:\s*['"`]([^'"`]+)['"`]/);
  if (publishedAtMatch) article.publishedAt = publishedAtMatch[1];
  
  return article;
}

function getSourcePriority(fileName) {
  const priorities = {
    'blogPosts.ts': 10,
    'blogPostsNew5.ts': 9,
    'blogPostsNew4.ts': 8,
    'blogPostsNew3.ts': 7,
    'blogPostsNew2.ts': 6,
    'blogPostsNew.ts': 5,
    'blogArticlesGenerated2.ts': 4,
    'blogArticlesGenerated.ts': 3
  };
  
  const name = fileName.split('/').pop();
  return priorities[name] || 1;
}

function deduplicateSimple(articles) {
  const uniqueMap = new Map();
  
  for (const article of articles) {
    if (!article.id || !article.slug) continue;
    
    const key = `${article.id}-${article.slug}`;
    const existing = uniqueMap.get(key);
    
    if (!existing || article._priority > existing._priority) {
      uniqueMap.set(key, article);
    }
  }
  
  return Array.from(uniqueMap.values());
}

function sanitizeSimple(article) {
  const sanitized = { ...article };
  let wasFixed = false;
  
  if (!sanitized.title) {
    sanitized.title = 'Без названия';
    wasFixed = true;
  }
  
  if (!sanitized.excerpt) {
    sanitized.excerpt = 'Краткое описание статьи';
    wasFixed = true;
  }
  
  if (!sanitized.publishedAt) {
    sanitized.publishedAt = new Date().toISOString();
    wasFixed = true;
  }
  
  if (!sanitized.author) {
    sanitized.author = { name: 'Автор не указан' };
    wasFixed = true;
  }
  
  sanitized._wasFixed = wasFixed;
  return sanitized;
}

function calculateHealthScore(result) {
  const { originalCount, finalCount, duplicatesRemoved, articlesFixed } = result.summary;
  
  if (originalCount === 0) return 0;
  
  const successRate = (finalCount / originalCount) * 100;
  const duplicatePenalty = (duplicatesRemoved / originalCount) * 20;
  const fixPenalty = (articlesFixed / originalCount) * 10;
  
  return Math.max(0, Math.min(100, Math.round(successRate - duplicatePenalty - fixPenalty)));
}

function formatConsolidationReport(result) {
  const report = [];
  
  report.push('# 📊 Отчет о тестовой консолидации данных блога');
  report.push('');
  report.push(`**Дата тестирования:** ${new Date().toLocaleString('ru-RU')}`);
  report.push('');
  
  report.push('## 📈 Результаты тестирования');
  report.push('');
  report.push(`- **Исходное количество статей:** ${result.summary.originalCount}`);
  report.push(`- **Итоговое количество статей:** ${result.summary.finalCount}`);
  report.push(`- **Удалено дубликатов:** ${result.summary.duplicatesRemoved}`);
  report.push(`- **Исправлено статей:** ${result.summary.articlesFixed}`);
  report.push(`- **Ошибок обработки:** ${result.errors.length}`);
  report.push(`- **Оценка качества:** ${result.summary.healthScore}/100`);
  report.push('');
  
  if (result.errors.length > 0) {
    report.push('## ❌ Ошибки');
    report.push('');
    result.errors.forEach((error, i) => {
      report.push(`${i + 1}. ${error}`);
    });
    report.push('');
  }
  
  // Примеры консолидированных статей
  if (result.consolidatedArticles.length > 0) {
    report.push('## 📝 Примеры консолидированных статей');
    report.push('');
    
    const examples = result.consolidatedArticles.slice(0, 5);
    for (const article of examples) {
      report.push(`### ${article.title || 'Без названия'}`);
      report.push(`- **ID:** ${article.id}`);
      report.push(`- **Slug:** ${article.slug}`);
      report.push(`- **Источник:** ${article._source}`);
      report.push(`- **Приоритет:** ${article._priority}`);
      if (article._wasFixed) {
        report.push(`- **Статус:** ✅ Исправлена`);
      }
      report.push('');
    }
  }
  
  report.push('## 🎯 Заключение');
  report.push('');
  
  if (result.summary.healthScore >= 90) {
    report.push('✅ **Тестирование прошло отлично!** Консолидация готова к запуску.');
  } else if (result.summary.healthScore >= 70) {
    report.push('⚠️ **Тестирование прошло хорошо.** Есть незначительные проблемы.');
  } else {
    report.push('❌ **Тестирование выявило проблемы.** Требуется доработка.');
  }
  
  report.push('');
  report.push('---');
  report.push('*Отчет сгенерирован автоматически утилитой тестирования консолидации*');
  
  return report.join('\n');
}

async function main() {
  console.log('🚀 Запускаем тестирование консолидации...\n');
  
  try {
    const result = await testConsolidation();
    
    // Создаем отчет
    const report = formatConsolidationReport(result);
    const reportPath = join(process.cwd(), 'BLOG_CONSOLIDATION_TEST_REPORT.md');
    writeFileSync(reportPath, report, 'utf-8');
    
    console.log('\n📋 Результаты тестирования:');
    console.log(`├─ Исходных статей: ${result.summary.originalCount}`);
    console.log(`├─ Итоговых статей: ${result.summary.finalCount}`);
    console.log(`├─ Удалено дубликатов: ${result.summary.duplicatesRemoved}`);
    console.log(`├─ Исправлено статей: ${result.summary.articlesFixed}`);
    console.log(`├─ Ошибок: ${result.errors.length}`);
    console.log(`└─ Оценка качества: ${result.summary.healthScore}/100`);
    
    console.log(`\n📄 Детальный отчет: ${reportPath}`);
    
    if (result.summary.healthScore >= 70) {
      console.log('\n✅ Тестирование прошло успешно! Можно переходить к реальной консолидации.');
    } else {
      console.log('\n⚠️ Тестирование выявило проблемы. Рекомендуется доработка.');
    }
    
  } catch (error) {
    console.error('💥 Ошибка тестирования:', error);
    process.exit(1);
  }
}

// Запускаем
main();