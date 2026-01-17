#!/usr/bin/env node

/**
 * Скрипт для реальной консолидации данных блога
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

async function consolidateBlogData() {
  console.log('🔄 Начинаем реальную консолидацию данных блога...');
  
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
    // Загружаем все статьи
    const allArticles = await loadAllArticles();
    result.summary.originalCount = allArticles.length;
    
    console.log(`📊 Загружено ${allArticles.length} статей из файлов`);

    // Дедуплицируем
    const uniqueArticles = deduplicateArticles(allArticles);
    result.removedDuplicates = allArticles.length - uniqueArticles.length;
    result.summary.duplicatesRemoved = result.removedDuplicates;
    
    console.log(`🗑️ Удалено ${result.removedDuplicates} дубликатов`);

    // Санитизируем и валидируем
    const sanitizedArticles = [];
    
    for (const article of uniqueArticles) {
      try {
        const sanitized = sanitizeArticle(article);
        sanitizedArticles.push(sanitized);
        
        if (sanitized._wasFixed) {
          result.fixedArticles++;
        }
      } catch (error) {
        result.errors.push(`Ошибка при обработке статьи ${article.id}: ${error.message}`);
      }
    }
    
    result.summary.articlesFixed = result.fixedArticles;
    console.log(`🔧 Исправлено ${result.fixedArticles} статей`);

    // Сортируем по дате публикации (новые первыми)
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
    result.errors.push(`Критическая ошибка: ${error.message}`);
    console.error('💥 Ошибка:', error);
  }

  return result;
}

async function loadAllArticles() {
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
      console.log(`📄 Обрабатываем ${fileName}...`);
      const content = readFileSync(fileName, 'utf-8');
      const articles = extractArticlesFromFile(content, fileName);
      allArticles.push(...articles);
    } catch (error) {
      console.warn(`⚠️ Не удалось загрузить ${fileName}:`, error.message);
    }
  }

  return allArticles;
}

function extractArticlesFromFile(content, fileName) {
  const articles = [];
  const sourceFileName = fileName.split('/').pop();
  const priority = getSourcePriority(sourceFileName);
  
  // Более точное извлечение статей из TypeScript файлов
  // Ищем объекты с id и другими полями
  const objectPattern = /\{[\s\S]*?id:\s*['"`]([^'"`]+)['"`][\s\S]*?\}/g;
  let match;
  
  while ((match = objectPattern.exec(content)) !== null) {
    try {
      const articleText = match[0];
      const article = parseArticleFromText(articleText);
      
      if (article.id) {
        article._source = sourceFileName;
        article._priority = priority;
        articles.push(article);
      }
    } catch (error) {
      console.warn(`Не удалось распарсить статью в ${fileName}`);
    }
  }
  
  return articles;
}

function parseArticleFromText(text) {
  const article = {};
  
  // Извлекаем поля с помощью регулярных выражений
  const extractField = (fieldName, isString = true) => {
    const pattern = isString 
      ? new RegExp(`${fieldName}:\\s*['"\`]([^'"\`]+)['"\`]`, 'i')
      : new RegExp(`${fieldName}:\\s*([^,\\n}]+)`, 'i');
    
    const match = text.match(pattern);
    return match ? (isString ? match[1] : match[1].trim()) : null;
  };
  
  // Основные поля
  article.id = extractField('id');
  article.slug = extractField('slug');
  article.title = extractField('title');
  article.excerpt = extractField('excerpt');
  article.publishedAt = extractField('publishedAt');
  
  // Автор
  const authorMatch = text.match(/author:\s*\{[\s\S]*?name:\s*['"`]([^'"`]+)['"`][\s\S]*?\}/);
  if (authorMatch) {
    article.author = { name: authorMatch[1] };
    
    const bioMatch = text.match(/bio:\s*['"`]([^'"`]+)['"`]/);
    if (bioMatch) {
      article.author.bio = bioMatch[1];
    }
  }
  
  // Теги
  const tagsMatch = text.match(/tags:\s*\[([^\]]+)\]/);
  if (tagsMatch) {
    const tagsStr = tagsMatch[1];
    article.tags = tagsStr.split(',').map(tag => 
      tag.replace(/['"`]/g, '').trim()
    ).filter(tag => tag.length > 0);
  }
  
  // Время чтения
  const readingTimeMatch = text.match(/readingTime:\s*(\d+)/);
  if (readingTimeMatch) {
    article.readingTime = parseInt(readingTimeMatch[1]);
  }
  
  // Булевы поля
  article.isPublished = text.includes('isPublished: true');
  article.isFeatured = text.includes('isFeatured: true');
  
  // Изображение
  const imageMatch = text.match(/featuredImage:\s*\{[\s\S]*?url:\s*['"`]([^'"`]+)['"`][\s\S]*?\}/);
  if (imageMatch) {
    article.featuredImage = {
      url: imageMatch[1],
      alt: article.title || 'Изображение статьи',
      width: 1200,
      height: 630
    };
  }
  
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
  
  return priorities[fileName] || 1;
}

function deduplicateArticles(articles) {
  const uniqueMap = new Map();
  
  for (const article of articles) {
    if (!article.id || !article.slug) continue;
    
    const key = `${article.id}-${article.slug}`;
    const existing = uniqueMap.get(key);
    
    if (!existing) {
      uniqueMap.set(key, article);
    } else {
      // Выбираем статью с более высоким приоритетом
      if (article._priority > existing._priority) {
        uniqueMap.set(key, article);
      } else if (article._priority === existing._priority) {
        // При равном приоритете выбираем более новую
        const existingDate = new Date(existing.publishedAt || '1970-01-01');
        const currentDate = new Date(article.publishedAt || '1970-01-01');
        
        if (currentDate > existingDate) {
          uniqueMap.set(key, article);
        }
      }
    }
  }
  
  return Array.from(uniqueMap.values());
}

function sanitizeArticle(article) {
  const sanitized = { ...article };
  let wasFixed = false;
  
  // Исправляем обязательные поля
  if (!sanitized.id) {
    sanitized.id = generateUniqueId();
    wasFixed = true;
  }
  
  if (!sanitized.slug) {
    sanitized.slug = slugify(sanitized.title || 'untitled');
    wasFixed = true;
  }
  
  if (!sanitized.title) {
    sanitized.title = 'Без названия';
    wasFixed = true;
  }
  
  if (!sanitized.excerpt) {
    sanitized.excerpt = 'Краткое описание статьи';
    wasFixed = true;
  }
  
  if (!sanitized.content) {
    sanitized.content = sanitized.excerpt || 'Содержание статьи';
    wasFixed = true;
  }
  
  if (!sanitized.author || !sanitized.author.name) {
    sanitized.author = { name: 'Автор не указан' };
    wasFixed = true;
  }
  
  if (!sanitized.publishedAt) {
    sanitized.publishedAt = new Date().toISOString();
    wasFixed = true;
  }
  
  if (!sanitized.category) {
    sanitized.category = {
      id: 'general',
      name: 'Общее',
      slug: 'general',
      description: 'Общие статьи'
    };
    wasFixed = true;
  }
  
  if (!sanitized.tags || !Array.isArray(sanitized.tags)) {
    sanitized.tags = [];
    wasFixed = true;
  }
  
  if (!sanitized.readingTime || typeof sanitized.readingTime !== 'number') {
    sanitized.readingTime = calculateReadingTime(sanitized.content);
    wasFixed = true;
  }
  
  if (sanitized.isPublished === undefined) {
    sanitized.isPublished = true;
    wasFixed = true;
  }
  
  if (sanitized.isFeatured === undefined) {
    sanitized.isFeatured = false;
    wasFixed = true;
  }
  
  if (!sanitized.language) {
    sanitized.language = 'ru';
    wasFixed = true;
  }
  
  // SEO данные
  if (!sanitized.seo) {
    sanitized.seo = {
      metaTitle: sanitized.title + ' | Считай.RU',
      metaDescription: sanitized.excerpt,
      keywords: sanitized.tags.slice(0, 5),
      canonical: '/' + sanitized.slug
    };
    wasFixed = true;
  }
  
  sanitized._wasFixed = wasFixed;
  return sanitized;
}

function generateUniqueId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9а-я]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = (content || '').split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

function calculateHealthScore(result) {
  const { originalCount, finalCount, duplicatesRemoved, articlesFixed } = result.summary;
  
  if (originalCount === 0) return 0;
  
  const successRate = (finalCount / originalCount) * 100;
  const duplicatePenalty = (duplicatesRemoved / originalCount) * 20;
  const fixPenalty = (articlesFixed / originalCount) * 10;
  const errorPenalty = result.errors.length * 5;
  
  return Math.max(0, Math.min(100, Math.round(successRate - duplicatePenalty - fixPenalty - errorPenalty)));
}

function createConsolidatedDataStructure(articles) {
  return {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    totalArticles: articles.length,
    articles: articles.map(article => {
      // Убираем служебные поля
      const { _source, _priority, _wasFixed, ...cleanArticle } = article;
      return cleanArticle;
    })
  };
}

async function main() {
  console.log('🚀 Запускаем консолидацию данных блога...\n');
  
  try {
    // Выполняем консолидацию
    const result = await consolidateBlogData();
    
    if (result.summary.finalCount === 0) {
      throw new Error('Не удалось консолидировать статьи');
    }
    
    // Создаем JSON файл с консолидированными данными
    const consolidatedData = createConsolidatedDataStructure(result.consolidatedArticles);
    const jsonPath = join(process.cwd(), 'src/data/blog/articles.json');
    writeFileSync(jsonPath, JSON.stringify(consolidatedData, null, 2), 'utf-8');
    
    console.log(`💾 Сохранено ${consolidatedData.totalArticles} статей в ${jsonPath}`);
    
    // Создаем TypeScript модуль экспорта
    const tsContent = generateTypeScriptModule(result.consolidatedArticles);
    const tsPath = join(process.cwd(), 'src/data/blog/index.ts');
    writeFileSync(tsPath, tsContent, 'utf-8');
    
    console.log(`📝 Создан TypeScript модуль: ${tsPath}`);
    
    // Создаем отчет
    const report = formatConsolidationReport(result);
    const reportPath = join(process.cwd(), 'BLOG_CONSOLIDATION_REPORT.md');
    writeFileSync(reportPath, report, 'utf-8');
    
    console.log('\n📋 Результаты консолидации:');
    console.log(`├─ Исходных статей: ${result.summary.originalCount}`);
    console.log(`├─ Итоговых статей: ${result.summary.finalCount}`);
    console.log(`├─ Удалено дубликатов: ${result.summary.duplicatesRemoved}`);
    console.log(`├─ Исправлено статей: ${result.summary.articlesFixed}`);
    console.log(`├─ Ошибок: ${result.errors.length}`);
    console.log(`└─ Оценка качества: ${result.summary.healthScore}/100`);
    
    console.log(`\n📄 Детальный отчет: ${reportPath}`);
    
    if (result.summary.healthScore >= 80) {
      console.log('\n✅ Консолидация прошла успешно!');
    } else {
      console.log('\n⚠️ Консолидация завершена с предупреждениями.');
    }
    
  } catch (error) {
    console.error('💥 Ошибка консолидации:', error);
    process.exit(1);
  }
}

function generateTypeScriptModule(articles) {
  return `import type { BlogPost } from '@/types/blog';
import articlesData from './articles.json';

/**
 * Консолидированные данные блога
 * Автоматически сгенерировано ${new Date().toLocaleString('ru-RU')}
 */

// Преобразуем JSON данные в типизированный массив
const consolidatedArticles: BlogPost[] = articlesData.articles.map(article => ({
  ...article,
  // Преобразуем даты из строк в объекты Date при необходимости
  publishedAt: article.publishedAt,
  updatedAt: article.updatedAt || undefined,
  // Обеспечиваем корректную типизацию
  category: article.category,
  author: article.author,
  tags: article.tags || [],
  featuredImage: article.featuredImage || undefined,
  seo: article.seo || {},
  relatedCalculators: article.relatedCalculators || [],
  structuredData: article.structuredData || undefined,
  translations: article.translations || undefined
}));

// Сортируем по дате публикации (новые первыми)
export const blogPosts: BlogPost[] = consolidatedArticles
  .filter(post => post.isPublished)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

// Экспорт для обратной совместимости
export default blogPosts;

// Дополнительные экспорты
export const featuredPosts = blogPosts.filter(post => post.isFeatured);
export const totalPosts = blogPosts.length;
export const lastUpdated = articlesData.lastUpdated;

// Статистика
export const stats = {
  total: totalPosts,
  featured: featuredPosts.length,
  published: blogPosts.length,
  lastUpdated: articlesData.lastUpdated,
  version: articlesData.version
};
`;
}

function formatConsolidationReport(result) {
  const report = [];
  
  report.push('# 📊 Отчет о консолидации данных блога');
  report.push('');
  report.push(`**Дата консолидации:** ${new Date().toLocaleString('ru-RU')}`);
  report.push('');
  
  report.push('## 📈 Результаты консолидации');
  report.push('');
  report.push(`- **Исходное количество статей:** ${result.summary.originalCount}`);
  report.push(`- **Итоговое количество статей:** ${result.summary.finalCount}`);
  report.push(`- **Удалено дубликатов:** ${result.summary.duplicatesRemoved}`);
  report.push(`- **Исправлено статей:** ${result.summary.articlesFixed}`);
  report.push(`- **Ошибок обработки:** ${result.errors.length}`);
  report.push(`- **Оценка качества:** ${result.summary.healthScore}/100`);
  report.push('');
  
  if (result.errors.length > 0) {
    report.push('## ❌ Ошибки обработки');
    report.push('');
    result.errors.forEach((error, i) => {
      report.push(`${i + 1}. ${error}`);
    });
    report.push('');
  }
  
  report.push('## 📁 Созданные файлы');
  report.push('');
  report.push('- `src/data/blog/articles.json` - JSON файл с консолидированными данными');
  report.push('- `src/data/blog/index.ts` - TypeScript модуль для импорта');
  report.push('');
  
  report.push('## 🎯 Заключение');
  report.push('');
  
  if (result.summary.healthScore >= 90) {
    report.push('✅ **Консолидация прошла отлично!** Данные успешно объединены.');
  } else if (result.summary.healthScore >= 70) {
    report.push('⚠️ **Консолидация прошла хорошо.** Есть незначительные проблемы.');
  } else {
    report.push('❌ **Консолидация прошла с проблемами.** Требуется дополнительная проверка.');
  }
  
  report.push('');
  report.push(`Все ${result.summary.finalCount} статей готовы к использованию в новой структуре данных.`);
  report.push('');
  
  report.push('## 🔄 Следующие шаги');
  report.push('');
  report.push('1. Обновить импорты в основном файле `src/data/blogPosts.ts`');
  report.push('2. Проверить работу компонентов блога');
  report.push('3. Запустить тесты');
  report.push('4. Создать резервные копии старых файлов');
  report.push('5. Удалить дублирующиеся файлы данных');
  report.push('');
  
  report.push('---');
  report.push('*Отчет сгенерирован автоматически утилитой консолидации данных блога*');
  
  return report.join('\n');
}

// Запускаем
main();