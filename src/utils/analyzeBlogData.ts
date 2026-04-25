import type { BlogPost } from '@/types/blog';
import { blogCategories } from '@/data/blogCategories';

/**
 * Интерфейс для результатов анализа данных блога
 */
export interface BlogDataAnalysis {
  totalFiles: number;
  totalArticles: number;
  uniqueArticles: number;
  duplicates: Array<{
    id: string;
    slug: string;
    title: string;
    duplicateCount: number;
    sources: string[];
  }>;
  missingFields: Array<{
    articleId: string;
    articleTitle: string;
    missingFields: string[];
    source: string;
  }>;
  invalidArticles: Array<{
    articleId: string;
    articleTitle: string;
    errors: string[];
    source: string;
  }>;
  fileStats: Array<{
    fileName: string;
    articleCount: number;
    hasErrors: boolean;
    errorCount: number;
  }>;
  summary: {
    healthScore: number; // 0-100
    criticalIssues: number;
    warnings: number;
    recommendations: string[];
  };
}

/**
 * Интерфейс для статьи с информацией об источнике
 */
interface ArticleWithSource extends Partial<BlogPost> {
  _source: string;
}

/**
 * Обязательные поля для статьи блога
 */
const REQUIRED_FIELDS: (keyof BlogPost)[] = [
  'id',
  'slug',
  'title',
  'excerpt',
  'content',
  'author',
  'publishedAt',
  'category',
  'tags',
  'readingTime',
  'isPublished',
  'isFeatured',
  'language'
];

/**
 * Анализирует все данные блога и возвращает детальный отчет
 */
export async function analyzeBlogData(): Promise<BlogDataAnalysis> {
  console.log('🔍 Начинаем анализ данных блога...');
  
  const analysis: BlogDataAnalysis = {
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
    'src/data/blogPosts.ts',
    'src/data/blogPostsNew.ts',
    'src/data/blogPostsNew2.ts',
    'src/data/blogPostsNew3.ts',
    'src/data/blogPostsNew4.ts',
    'src/data/blogPostsNew5.ts',
    'src/data/blogPostsRemaining.ts'
  ];

  const allArticles: ArticleWithSource[] = [];
  
  // Анализируем каждый файл
  for (const fileName of dataFiles) {
    try {
      console.log(`📄 Анализируем файл: ${fileName}`);
      const fileArticles = await analyzeFile(fileName);
      
      if (fileArticles.length > 0) {
        analysis.totalFiles++;
        analysis.fileStats.push({
          fileName,
          articleCount: fileArticles.length,
          hasErrors: false,
          errorCount: 0
        });
        
        allArticles.push(...fileArticles);
        analysis.totalArticles += fileArticles.length;
      }
    } catch (error) {
      console.warn(`⚠️ Не удалось проанализировать файл ${fileName}:`, error);
      analysis.fileStats.push({
        fileName,
        articleCount: 0,
        hasErrors: true,
        errorCount: 1
      });
    }
  }

  console.log(`📊 Найдено ${analysis.totalArticles} статей в ${analysis.totalFiles} файлах`);

  // Анализируем дубликаты
  analysis.duplicates = findDuplicates(allArticles);
  console.log(`🔄 Найдено ${analysis.duplicates.length} групп дубликатов`);

  // Анализируем отсутствующие поля
  analysis.missingFields = findMissingFields(allArticles);
  console.log(`❌ Найдено ${analysis.missingFields.length} статей с отсутствующими полями`);

  // Анализируем невалидные статьи
  analysis.invalidArticles = findInvalidArticles(allArticles);
  console.log(`🚫 Найдено ${analysis.invalidArticles.length} невалидных статей`);

  // Подсчитываем уникальные статьи
  const uniqueIds = new Set();
  const uniqueSlugs = new Set();
  
  for (const article of allArticles) {
    if (article.id) uniqueIds.add(article.id);
    if (article.slug) uniqueSlugs.add(article.slug);
  }
  
  analysis.uniqueArticles = Math.max(uniqueIds.size, uniqueSlugs.size);

  // Обновляем статистику файлов с ошибками
  for (const fileStat of analysis.fileStats) {
    const fileArticles = allArticles.filter(a => a._source === fileStat.fileName);
    const fileErrors = [
      ...analysis.missingFields.filter(m => m.source === fileStat.fileName),
      ...analysis.invalidArticles.filter(i => i.source === fileStat.fileName)
    ];
    
    fileStat.hasErrors = fileErrors.length > 0;
    fileStat.errorCount = fileErrors.length;
  }

  // Генерируем итоговую оценку
  analysis.summary = generateSummary(analysis);

  console.log('✅ Анализ завершен');
  return analysis;
}

/**
 * Анализирует отдельный файл с данными
 */
async function analyzeFile(fileName: string): Promise<ArticleWithSource[]> {
  try {
    // Динамический импорт файла
    const module = await import(`@/${fileName.replace('src/', '')}`);
    const articles: ArticleWithSource[] = [];
    
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
        const exportArticles = module[exportName].map((article: Partial<BlogPost>) => ({
          ...article,
          _source: fileName
        }));
        articles.push(...exportArticles);
      }
    }
    
    // Если это основной файл blogPosts.ts, извлекаем из legacyBlogPosts
    if (fileName.includes('blogPosts.ts') && module.legacyBlogPosts) {
      const legacyArticles = module.legacyBlogPosts.map((article: Partial<BlogPost>) => ({
        ...article,
        _source: fileName + ' (legacy)'
      }));
      articles.push(...legacyArticles);
    }
    
    return articles;
  } catch (error) {
    console.warn(`Не удалось загрузить файл ${fileName}:`, error);
    return [];
  }
}

/**
 * Находит дубликаты статей по ID и slug
 */
function findDuplicates(articles: ArticleWithSource[]): BlogDataAnalysis['duplicates'] {
  const duplicates: BlogDataAnalysis['duplicates'] = [];
  const idMap = new Map<string, ArticleWithSource[]>();
  const slugMap = new Map<string, ArticleWithSource[]>();
  
  // Группируем по ID
  for (const article of articles) {
    if (article.id) {
      if (!idMap.has(article.id)) {
        idMap.set(article.id, []);
      }
      idMap.get(article.id)!.push(article);
    }
  }
  
  // Группируем по slug
  for (const article of articles) {
    if (article.slug) {
      if (!slugMap.has(article.slug)) {
        slugMap.set(article.slug, []);
      }
      slugMap.get(article.slug)!.push(article);
    }
  }
  
  // Находим дубликаты по ID
  for (const [id, articleGroup] of idMap) {
    if (articleGroup.length > 1) {
      duplicates.push({
        id,
        slug: articleGroup[0].slug || 'unknown',
        title: articleGroup[0].title || 'Без названия',
        duplicateCount: articleGroup.length,
        sources: articleGroup.map(a => a._source)
      });
    }
  }
  
  // Находим дубликаты по slug (если еще не найдены по ID)
  for (const [slug, articleGroup] of slugMap) {
    if (articleGroup.length > 1) {
      const existingDuplicate = duplicates.find(d => d.slug === slug);
      if (!existingDuplicate) {
        duplicates.push({
          id: articleGroup[0].id || 'unknown',
          slug,
          title: articleGroup[0].title || 'Без названия',
          duplicateCount: articleGroup.length,
          sources: articleGroup.map(a => a._source)
        });
      }
    }
  }
  
  return duplicates;
}

/**
 * Находит статьи с отсутствующими обязательными полями
 */
function findMissingFields(articles: ArticleWithSource[]): BlogDataAnalysis['missingFields'] {
  const missingFields: BlogDataAnalysis['missingFields'] = [];
  
  for (const article of articles) {
    const missing: string[] = [];
    
    for (const field of REQUIRED_FIELDS) {
      if (!article[field] || (Array.isArray(article[field]) && article[field].length === 0)) {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      missingFields.push({
        articleId: article.id || 'unknown',
        articleTitle: article.title || 'Без названия',
        missingFields: missing,
        source: article._source
      });
    }
  }
  
  return missingFields;
}

/**
 * Находит статьи с невалидными данными
 */
function findInvalidArticles(articles: ArticleWithSource[]): BlogDataAnalysis['invalidArticles'] {
  const invalidArticles: BlogDataAnalysis['invalidArticles'] = [];
  
  for (const article of articles) {
    const errors: string[] = [];
    
    // Проверяем ID
    if (article.id && typeof article.id !== 'string') {
      errors.push('ID должен быть строкой');
    }
    
    // Проверяем slug
    if (article.slug && (typeof article.slug !== 'string' || !/^[a-z0-9-]+$/.test(article.slug))) {
      errors.push('Slug должен содержать только строчные буквы, цифры и дефисы');
    }
    
    // Проверяем дату публикации
    if (article.publishedAt && typeof article.publishedAt === 'string') {
      const date = new Date(article.publishedAt);
      if (isNaN(date.getTime())) {
        errors.push('Некорректная дата публикации');
      }
    }
    
    // Проверяем автора
    if (article.author && (!article.author.name || typeof article.author.name !== 'string')) {
      errors.push('Отсутствует или некорректное имя автора');
    }
    
    // Проверяем категорию
    if (article.category && !blogCategories.find(cat => cat.id === article.category?.id)) {
      errors.push('Некорректная категория');
    }
    
    // Проверяем теги
    if (article.tags && (!Array.isArray(article.tags) || article.tags.some(tag => typeof tag !== 'string'))) {
      errors.push('Теги должны быть массивом строк');
    }
    
    // Проверяем время чтения
    if (article.readingTime && (typeof article.readingTime !== 'number' || article.readingTime <= 0)) {
      errors.push('Время чтения должно быть положительным числом');
    }
    
    if (errors.length > 0) {
      invalidArticles.push({
        articleId: article.id || 'unknown',
        articleTitle: article.title || 'Без названия',
        errors,
        source: article._source
      });
    }
  }
  
  return invalidArticles;
}

/**
 * Генерирует итоговую оценку состояния данных
 */
function generateSummary(analysis: BlogDataAnalysis): BlogDataAnalysis['summary'] {
  const summary: BlogDataAnalysis['summary'] = {
    healthScore: 0,
    criticalIssues: 0,
    warnings: 0,
    recommendations: []
  };
  
  // Подсчитываем критические проблемы
  summary.criticalIssues = analysis.duplicates.length + analysis.invalidArticles.length;
  
  // Подсчитываем предупреждения
  summary.warnings = analysis.missingFields.length;
  
  // Рассчитываем оценку здоровья (0-100)
  const totalIssues = summary.criticalIssues + summary.warnings;
  const maxPossibleIssues = analysis.totalArticles * 2; // Примерная оценка
  summary.healthScore = Math.max(0, Math.round(100 - (totalIssues / maxPossibleIssues) * 100));
  
  // Генерируем рекомендации
  if (analysis.duplicates.length > 0) {
    summary.recommendations.push(`Удалить ${analysis.duplicates.length} групп дубликатов статей`);
  }
  
  if (analysis.missingFields.length > 0) {
    summary.recommendations.push(`Заполнить отсутствующие поля в ${analysis.missingFields.length} статьях`);
  }
  
  if (analysis.invalidArticles.length > 0) {
    summary.recommendations.push(`Исправить ошибки в ${analysis.invalidArticles.length} статьях`);
  }
  
  if (analysis.totalFiles > 3) {
    summary.recommendations.push(`Консолидировать ${analysis.totalFiles} файлов в единую структуру`);
  }
  
  const duplicateRatio = analysis.duplicates.length / analysis.uniqueArticles;
  if (duplicateRatio > 0.1) {
    summary.recommendations.push('Высокий уровень дублирования - требуется срочная консолидация');
  }
  
  return summary;
}

/**
 * Форматирует результаты анализа в читаемый отчет
 */
export function formatAnalysisReport(analysis: BlogDataAnalysis): string {
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
    const fileName = fileStat.fileName.replace('src/data/', '');
    report.push(`| ${fileName} | ${fileStat.articleCount} | ${fileStat.errorCount} | ${status} |`);
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
    
    for (const missing of analysis.missingFields.slice(0, 10)) { // Показываем только первые 10
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
  
  // Невалидные статьи
  if (analysis.invalidArticles.length > 0) {
    report.push('## 🚫 Невалидные статьи');
    report.push('');
    report.push(`Найдено **${analysis.invalidArticles.length}** статей с ошибками:`);
    report.push('');
    
    for (const invalid of analysis.invalidArticles.slice(0, 5)) { // Показываем только первые 5
      report.push(`### ${invalid.articleTitle}`);
      report.push(`- **ID:** ${invalid.articleId}`);
      report.push(`- **Источник:** ${invalid.source}`);
      report.push(`- **Ошибки:** ${invalid.errors.join(', ')}`);
      report.push('');
    }
    
    if (analysis.invalidArticles.length > 5) {
      report.push(`*... и еще ${analysis.invalidArticles.length - 5} статей*`);
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