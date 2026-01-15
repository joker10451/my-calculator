import type { BlogPost } from '@/types/blog';

/**
 * Content Validator Utilities
 * Утилиты для валидации и анализа контента блога
 */

/**
 * Подсчитывает количество слов в тексте
 * @param content - Текст контента
 * @returns Количество слов
 */
export function countWords(content: string): number {
  // Удаляем HTML теги
  const cleanContent = content.replace(/<[^>]*>/g, ' ');
  
  // Разбиваем на слова и фильтруем:
  // - пустые строки
  // - строки только из специальных символов или цифр
  const words = cleanContent
    .split(/\s+/)
    .filter(word => {
      // Проверяем, что слово не пустое и содержит хотя бы одну букву (не только цифры)
      return word.length > 0 && /[a-zA-Zа-яА-ЯёЁ]/.test(word);
    });
  
  return words.length;
}

/**
 * Рассчитывает качество контента (Content Quality Score)
 * @param article - Статья блога
 * @returns Оценка качества от 0 до 100
 */
export function calculateQualityScore(article: BlogPost): number {
  let score = 0;
  
  // 1. Длина контента (максимум 30 баллов)
  const wordCount = countWords(article.content);
  if (wordCount >= 2000) {
    score += 30;
  } else if (wordCount >= 1500) {
    score += 20;
  } else if (wordCount >= 1000) {
    score += 10;
  }
  
  // 2. Наличие featured image (10 баллов)
  if (article.featuredImage) {
    score += 10;
  }
  
  // 3. Наличие связанных калькуляторов (15 баллов)
  if (article.relatedCalculators && article.relatedCalculators.length > 0) {
    score += 15;
  }
  
  // 4. Наличие тегов (10 баллов)
  if (article.tags && article.tags.length >= 3) {
    score += 10;
  } else if (article.tags && article.tags.length > 0) {
    score += 5;
  }
  
  // 5. SEO оптимизация (15 баллов)
  if (article.seo.metaTitle && article.seo.metaDescription) {
    score += 10;
  }
  if (article.seo.keywords && article.seo.keywords.length >= 5) {
    score += 5;
  }
  
  // 6. Наличие excerpt (10 баллов)
  if (article.excerpt && article.excerpt.length >= 100) {
    score += 10;
  }
  
  // 7. Structured data (10 баллов)
  if (article.structuredData) {
    score += 10;
  }
  
  return Math.min(score, 100);
}

/**
 * Генерирует URL-friendly slug из заголовка
 * @param title - Заголовок статьи
 * @returns Slug (lowercase, дефисы, alphanumeric)
 */
export function generateSlug(title: string): string {
  // Таблица транслитерации русских букв
  const translitMap: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };
  
  // Приводим к lowercase
  let slug = title.toLowerCase();
  
  // Транслитерация русских букв (посимвольно, чтобы правильно обработать 'ь' и 'ъ')
  slug = slug.split('').map(char => {
    if (translitMap.hasOwnProperty(char)) {
      return translitMap[char];
    }
    return char;
  }).join('');
  
  // Заменяем пробелы и специальные символы на дефисы
  slug = slug.replace(/[^a-z0-9]+/g, '-');
  
  // Удаляем дефисы в начале и конце
  slug = slug.replace(/^-+|-+$/g, '');
  
  // Заменяем множественные дефисы на один
  slug = slug.replace(/-+/g, '-');
  
  return slug;
}

/**
 * Рассчитывает время чтения статьи
 * @param wordCount - Количество слов в статье
 * @param wordsPerMinute - Скорость чтения (слов в минуту), по умолчанию 200
 * @returns Время чтения в минутах (округлено вверх)
 */
export function calculateReadingTime(wordCount: number, wordsPerMinute: number = 200): number {
  if (wordCount <= 0) {
    return 0;
  }
  
  const minutes = wordCount / wordsPerMinute;
  return Math.ceil(minutes);
}

/**
 * Валидирует H1 теги в контенте
 * @param content - Текст контента (может содержать HTML или Markdown)
 * @param primaryKeyword - Основное ключевое слово
 * @returns true, если есть ровно один H1 с ключевым словом
 */
export function validateH1Tag(content: string, primaryKeyword: string): boolean {
  // Ищем H1 теги в HTML формате
  const htmlH1Regex = /<h1[^>]*>(.*?)<\/h1>/gi;
  const htmlH1Matches = content.match(htmlH1Regex);
  
  // Ищем H1 теги в Markdown формате
  const markdownH1Regex = /^#\s+(.+)$/gm;
  const markdownH1Matches = content.match(markdownH1Regex);
  
  // Объединяем все найденные H1
  const allH1: string[] = [];
  
  if (htmlH1Matches) {
    htmlH1Matches.forEach(match => {
      const text = match.replace(/<[^>]*>/g, '');
      allH1.push(text);
    });
  }
  
  if (markdownH1Matches) {
    markdownH1Matches.forEach(match => {
      const text = match.replace(/^#\s+/, '');
      allH1.push(text);
    });
  }
  
  // Проверяем, что есть ровно один H1
  if (allH1.length !== 1) {
    return false;
  }
  
  // Проверяем, что H1 содержит ключевое слово (case-insensitive)
  const h1Text = allH1[0].toLowerCase();
  const keyword = primaryKeyword.toLowerCase();
  
  return h1Text.includes(keyword);
}

/**
 * Валидирует статью на соответствие требованиям
 * @param article - Статья блога
 * @returns Результат валидации
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  qualityScore: number;
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  field?: string;
}

export function validateArticle(article: BlogPost): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // Проверка минимальной длины контента (2000 слов)
  const wordCount = countWords(article.content);
  if (wordCount < 2000) {
    errors.push({
      code: 'INSUFFICIENT_WORD_COUNT',
      message: `Article must have at least 2000 words (current: ${wordCount})`,
      field: 'content',
    });
  }
  
  // Проверка наличия связанных калькуляторов
  if (article.isPublished && (!article.relatedCalculators || article.relatedCalculators.length === 0)) {
    errors.push({
      code: 'NO_RELATED_CALCULATORS',
      message: 'Article must link to at least one calculator',
      field: 'relatedCalculators',
    });
  }
  
  // Проверка качества контента
  const qualityScore = calculateQualityScore(article);
  if (qualityScore < 80) {
    errors.push({
      code: 'LOW_QUALITY_SCORE',
      message: `Article quality score must be above 80 (current: ${qualityScore})`,
      field: 'content',
    });
  }
  
  // Проверка slug
  const slugRegex = /^[a-z0-9-]+$/;
  if (!slugRegex.test(article.slug)) {
    errors.push({
      code: 'INVALID_SLUG',
      message: 'Article slug contains invalid characters',
      field: 'slug',
    });
  }
  
  // Предупреждения
  if (!article.featuredImage) {
    warnings.push({
      code: 'NO_FEATURED_IMAGE',
      message: 'Article should have a featured image',
      field: 'featuredImage',
    });
  }
  
  if (!article.tags || article.tags.length < 3) {
    warnings.push({
      code: 'INSUFFICIENT_TAGS',
      message: 'Article should have at least 3 tags',
      field: 'tags',
    });
  }
  
  if (!article.seo.metaTitle || !article.seo.metaDescription) {
    warnings.push({
      code: 'INCOMPLETE_SEO',
      message: 'Article should have meta title and description',
      field: 'seo',
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    qualityScore,
  };
}
