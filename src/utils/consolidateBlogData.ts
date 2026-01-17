import type { BlogPost } from '@/types/blog';
import { blogCategories } from '@/data/blogCategories';

/**
 * Интерфейс для результатов консолидации
 */
export interface ConsolidationResult {
  consolidatedArticles: BlogPost[];
  removedDuplicates: number;
  fixedArticles: number;
  errors: string[];
  summary: {
    originalCount: number;
    finalCount: number;
    duplicatesRemoved: number;
    articlesFixed: number;
    healthScore: number;
  };
}

/**
 * Интерфейс для статьи с информацией об источнике
 */
interface ArticleWithSource extends Partial<BlogPost> {
  _source: string;
  _priority: number; // Приоритет источника (чем больше, тем важнее)
}

/**
 * Приоритеты источников данных (чем больше число, тем выше приоритет)
 */
const SOURCE_PRIORITIES: Record<string, number> = {
  'blogPosts.ts': 10, // Основной файл - высший приоритет
  'blogPostsNew5.ts': 9, // Самые новые данные
  'blogPostsNew4.ts': 8,
  'blogPostsNew3.ts': 7,
  'blogPostsNew2.ts': 6,
  'blogPostsNew.ts': 5,
  'blogArticlesGenerated2.ts': 4,
  'blogArticlesGenerated.ts': 3,
  'blogPostsRemaining.ts': 2
};

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
 * Консолидирует все данные блога в единую структуру
 */
export async function consolidateBlogData(): Promise<ConsolidationResult> {
  console.log('🔄 Начинаем консолидацию данных блога...');
  
  const result: ConsolidationResult = {
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
    // Загружаем все статьи из файлов
    const allArticles = await loadAllArticles();
    result.summary.originalCount = allArticles.length;
    
    console.log(`📊 Загружено ${allArticles.length} статей из ${getUniqueSourcesCount(allArticles)} файлов`);

    // Дедуплицируем статьи
    const deduplicatedArticles = deduplicateArticles(allArticles);
    result.removedDuplicates = allArticles.length - deduplicatedArticles.length;
    result.summary.duplicatesRemoved = result.removedDuplicates;
    
    console.log(`🗑️ Удалено ${result.removedDuplicates} дубликатов`);

    // Санитизируем и валидируем данные
    const sanitizedArticles: BlogPost[] = [];
    
    for (const article of deduplicatedArticles) {
      try {
        const sanitized = sanitizeArticle(article);
        sanitizedArticles.push(sanitized);
        
        // Подсчитываем исправленные статьи
        if (hasBeenFixed(article, sanitized)) {
          result.fixedArticles++;
        }
      } catch (error) {
        result.errors.push(`Ошибка при санитизации статьи ${article.id || 'unknown'}: ${error.message}`);
      }
    }
    
    result.summary.articlesFixed = result.fixedArticles;
    console.log(`🔧 Исправлено ${result.fixedArticles} статей`);

    // Сортируем по дате публикации (новые первыми)
    sanitizedArticles.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return dateB - dateA;
    });

    result.consolidatedArticles = sanitizedArticles;
    result.summary.finalCount = sanitizedArticles.length;
    
    // Рассчитываем оценку здоровья
    result.summary.healthScore = calculateHealthScore(result);
    
    console.log(`✅ Консолидация завершена: ${result.summary.finalCount} статей`);
    
  } catch (error) {
    result.errors.push(`Критическая ошибка консолидации: ${error.message}`);
    console.error('💥 Ошибка консолидации:', error);
  }

  return result;
}

/**
 * Загружает все статьи из файлов данных
 */
async function loadAllArticles(): Promise<ArticleWithSource[]> {
  const allArticles: ArticleWithSource[] = [];
  
  // Список файлов для загрузки
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
      const fileArticles = await loadArticlesFromFile(fileName);
      allArticles.push(...fileArticles);
    } catch (error) {
      console.warn(`⚠️ Не удалось загрузить файл ${fileName}:`, error.message);
    }
  }

  return allArticles;
}

/**
 * Загружает статьи из конкретного файла
 */
async function loadArticlesFromFile(fileName: string): Promise<ArticleWithSource[]> {
  try {
    // Динамический импорт файла
    const module = await import(`@/${fileName.replace('src/', '')}`);
    const articles: ArticleWithSource[] = [];
    const sourceFileName = fileName.split('/').pop() || fileName;
    const priority = SOURCE_PRIORITIES[sourceFileName] || 1;
    
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
          _source: sourceFileName,
          _priority: priority
        }));
        articles.push(...exportArticles);
      }
    }
    
    // Если это основной файл blogPosts.ts, извлекаем из legacyBlogPosts
    if (fileName.includes('blogPosts.ts') && module.legacyBlogPosts) {
      const legacyArticles = module.legacyBlogPosts.map((article: Partial<BlogPost>) => ({
        ...article,
        _source: sourceFileName + ' (legacy)',
        _priority: priority + 1 // Legacy данные имеют чуть выше приоритет
      }));
      articles.push(...legacyArticles);
    }
    
    return articles;
  } catch (error) {
    throw new Error(`Не удалось загрузить файл ${fileName}: ${error.message}`);
  }
}

/**
 * Удаляет дубликаты статей, оставляя версии с наивысшим приоритетом
 */
function deduplicateArticles(articles: ArticleWithSource[]): ArticleWithSource[] {
  const uniqueArticles = new Map<string, ArticleWithSource>();
  
  for (const article of articles) {
    if (!article.id || !article.slug) {
      continue; // Пропускаем статьи без ID или slug
    }
    
    const key = `${article.id}-${article.slug}`;
    const existing = uniqueArticles.get(key);
    
    if (!existing) {
      uniqueArticles.set(key, article);
    } else {
      // Выбираем статью с более высоким приоритетом
      if (article._priority > existing._priority) {
        uniqueArticles.set(key, article);
      } else if (article._priority === existing._priority) {
        // При равном приоритете выбираем более новую по дате обновления
        const existingDate = new Date(existing.updatedAt || existing.publishedAt || '1970-01-01');
        const currentDate = new Date(article.updatedAt || article.publishedAt || '1970-01-01');
        
        if (currentDate > existingDate) {
          uniqueArticles.set(key, article);
        }
      }
    }
  }
  
  return Array.from(uniqueArticles.values());
}

/**
 * Санитизирует статью, заполняя отсутствующие поля значениями по умолчанию
 */
function sanitizeArticle(article: ArticleWithSource): BlogPost {
  const sanitized: BlogPost = {
    id: article.id || generateUniqueId(),
    slug: article.slug || slugify(article.title || 'untitled'),
    title: article.title || 'Без названия',
    excerpt: article.excerpt || generateExcerpt(article.content || ''),
    content: article.content || '',
    author: article.author || { name: 'Автор не указан' },
    publishedAt: article.publishedAt || new Date().toISOString(),
    updatedAt: article.updatedAt,
    category: article.category || getDefaultCategory(),
    tags: article.tags || [],
    featuredImage: article.featuredImage,
    seo: article.seo || generateDefaultSEO(article.title || ''),
    readingTime: article.readingTime || calculateReadingTime(article.content || ''),
    wordCount: article.wordCount || calculateWordCount(article.content || ''),
    isPublished: article.isPublished ?? true,
    isFeatured: article.isFeatured ?? false,
    relatedCalculators: article.relatedCalculators || [],
    structuredData: article.structuredData,
    shareCount: article.shareCount || 0,
    language: article.language || 'ru',
    translations: article.translations
  };
  
  // Валидируем и исправляем данные
  validateAndFixArticle(sanitized);
  
  return sanitized;
}

/**
 * Валидирует и исправляет данные статьи
 */
function validateAndFixArticle(article: BlogPost): void {
  // Исправляем slug
  if (!/^[a-z0-9-]+$/.test(article.slug)) {
    article.slug = slugify(article.title);
  }
  
  // Исправляем дату публикации
  const publishedDate = new Date(article.publishedAt);
  if (isNaN(publishedDate.getTime())) {
    article.publishedAt = new Date().toISOString();
  }
  
  // Исправляем автора
  if (!article.author.name) {
    article.author.name = 'Автор не указан';
  }
  
  // Исправляем категорию
  if (!blogCategories.find(cat => cat.id === article.category.id)) {
    article.category = getDefaultCategory();
  }
  
  // Исправляем теги
  if (!Array.isArray(article.tags)) {
    article.tags = [];
  }
  article.tags = article.tags.filter(tag => typeof tag === 'string' && tag.length > 0);
  
  // Исправляем время чтения
  if (typeof article.readingTime !== 'number' || article.readingTime <= 0) {
    article.readingTime = calculateReadingTime(article.content);
  }
}

/**
 * Проверяет, была ли статья исправлена в процессе санитизации
 */
function hasBeenFixed(original: ArticleWithSource, sanitized: BlogPost): boolean {
  return (
    !original.id ||
    !original.slug ||
    !original.title ||
    !original.excerpt ||
    !original.content ||
    !original.author?.name ||
    !original.publishedAt ||
    !original.category ||
    !original.tags ||
    typeof original.readingTime !== 'number'
  );
}

/**
 * Генерирует уникальный ID для статьи
 */
function generateUniqueId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * Создает slug из заголовка
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9а-я]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Генерирует краткое описание из контента
 */
function generateExcerpt(content: string): string {
  const plainText = content.replace(/[#*`]/g, '').replace(/\n+/g, ' ');
  const words = plainText.split(' ').slice(0, 30);
  return words.join(' ') + (words.length >= 30 ? '...' : '');
}

/**
 * Возвращает категорию по умолчанию
 */
function getDefaultCategory() {
  return blogCategories[0]; // Первая категория как дефолтная
}

/**
 * Генерирует базовые SEO данные
 */
function generateDefaultSEO(title: string) {
  return {
    metaTitle: title + ' | Считай.RU',
    metaDescription: 'Полезная статья на сайте Считай.RU - универсальный помощник для расчетов.',
    keywords: ['калькулятор', 'расчет', 'считай.ру'],
    canonical: '/' + slugify(title)
  };
}

/**
 * Рассчитывает время чтения статьи
 */
function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = calculateWordCount(content);
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

/**
 * Подсчитывает количество слов в тексте
 */
function calculateWordCount(content: string): number {
  const plainText = content.replace(/[#*`]/g, '').replace(/\n+/g, ' ');
  return plainText.split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Подсчитывает количество уникальных источников
 */
function getUniqueSourcesCount(articles: ArticleWithSource[]): number {
  const sources = new Set(articles.map(a => a._source));
  return sources.size;
}

/**
 * Рассчитывает оценку здоровья консолидации
 */
function calculateHealthScore(result: ConsolidationResult): number {
  const { originalCount, finalCount, duplicatesRemoved, articlesFixed } = result.summary;
  
  if (originalCount === 0) return 0;
  
  // Базовая оценка - процент успешно обработанных статей
  const successRate = (finalCount / originalCount) * 100;
  
  // Штрафы за проблемы
  const duplicatePenalty = (duplicatesRemoved / originalCount) * 20;
  const fixPenalty = (articlesFixed / originalCount) * 10;
  const errorPenalty = result.errors.length * 5;
  
  const score = Math.max(0, Math.min(100, successRate - duplicatePenalty - fixPenalty - errorPenalty));
  
  return Math.round(score);
}

/**
 * Форматирует отчет о консолидации
 */
export function formatConsolidationReport(result: ConsolidationResult): string {
  const report = [];
  
  report.push('# 📊 Отчет о консолидации данных блога');
  report.push('');
  report.push(`**Дата консолидации:** ${new Date().toLocaleString('ru-RU')}`);
  report.push('');
  
  // Общая статистика
  report.push('## 📈 Результаты консолидации');
  report.push('');
  report.push(`- **Исходное количество статей:** ${result.summary.originalCount}`);
  report.push(`- **Итоговое количество статей:** ${result.summary.finalCount}`);
  report.push(`- **Удалено дубликатов:** ${result.summary.duplicatesRemoved}`);
  report.push(`- **Исправлено статей:** ${result.summary.articlesFixed}`);
  report.push(`- **Ошибок обработки:** ${result.errors.length}`);
  report.push(`- **Оценка качества:** ${result.summary.healthScore}/100`);
  report.push('');
  
  // Ошибки
  if (result.errors.length > 0) {
    report.push('## ❌ Ошибки обработки');
    report.push('');
    
    for (let i = 0; i < result.errors.length; i++) {
      report.push(`${i + 1}. ${result.errors[i]}`);
    }
    report.push('');
  }
  
  // Заключение
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
  
  report.push('---');
  report.push('*Отчет сгенерирован автоматически утилитой консолидации данных блога*');
  
  return report.join('\n');
}