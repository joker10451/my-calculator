import type { BlogPost } from '@/types/blog';

/**
 * Утилиты для оптимизации существующих статей блога
 * Автоматическое улучшение SEO метаданных и structured data
 */

/**
 * Оптимизировать SEO метаданные статьи
 */
export function optimizeSEO(article: BlogPost): BlogPost {
  const optimized = { ...article };
  
  // Если нет metaTitle, генерируем из title
  if (!optimized.seo.metaTitle) {
    optimized.seo.metaTitle = `${article.title} | Считай.RU`;
  }
  
  // Если нет metaDescription, используем excerpt
  if (!optimized.seo.metaDescription) {
    optimized.seo.metaDescription = article.excerpt;
  }
  
  // Если нет keywords, генерируем из tags
  if (!optimized.seo.keywords || optimized.seo.keywords.length < 5) {
    optimized.seo.keywords = article.tags;
  }
  
  // Если нет canonical, генерируем из slug
  if (!optimized.seo.canonical) {
    optimized.seo.canonical = `/blog/${article.slug}`;
  }
  
  return optimized;
}

/**
 * Добавить structured data если отсутствует
 */
export function ensureStructuredData(article: BlogPost): BlogPost {
  const optimized = { ...article };
  
  if (!optimized.structuredData) {
    optimized.structuredData = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": article.title,
      "author": {
        "@type": "Person",
        "name": article.author.name
      },
      "datePublished": article.publishedAt,
      "publisher": {
        "@type": "Organization",
        "name": "Считай.RU"
      }
    };
    
    // Добавляем изображение если есть
    if (article.featuredImage) {
      optimized.structuredData.image = article.featuredImage.url;
    }
  }
  
  return optimized;
}

/**
 * Добавить внутренние ссылки между статьями
 */
export function addInternalLinks(article: BlogPost, allArticles: BlogPost[]): string {
  let content = article.content;
  
  // Находим статьи той же категории
  const relatedArticles = allArticles.filter(a => 
    a.id !== article.id && 
    a.category.id === article.category.id &&
    a.isPublished
  ).slice(0, 3);
  
  // Если есть связанные статьи, добавляем секцию в конец
  if (relatedArticles.length > 0) {
    const linksSection = `\n\n## Читайте также\n\n${relatedArticles.map(a => 
      `- [${a.title}](#/blog/${a.slug})`
    ).join('\n')}`;
    
    // Добавляем перед заключением если оно есть
    if (content.includes('## Заключение')) {
      content = content.replace('## Заключение', linksSection + '\n\n## Заключение');
    } else {
      content += linksSection;
    }
  }
  
  return content;
}

/**
 * Оптимизировать изображения в контенте
 */
export function optimizeImages(content: string): string {
  // Заменяем обычные изображения на WebP с lazy loading
  let optimized = content;
  
  // Паттерн для markdown изображений: ![alt](url)
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  
  optimized = optimized.replace(imageRegex, (match, alt, url) => {
    // Если URL не заканчивается на .webp, добавляем атрибуты
    if (!url.endsWith('.webp')) {
      // В markdown нельзя добавить атрибуты, но можно использовать HTML
      return `<img src="${url}" alt="${alt}" loading="lazy" />`;
    }
    return match;
  });
  
  return optimized;
}

/**
 * Полная оптимизация статьи
 */
export function optimizeArticle(article: BlogPost, allArticles: BlogPost[]): BlogPost {
  let optimized = { ...article };
  
  // 1. Оптимизируем SEO
  optimized = optimizeSEO(optimized);
  
  // 2. Добавляем structured data
  optimized = ensureStructuredData(optimized);
  
  // 3. Добавляем внутренние ссылки
  optimized.content = addInternalLinks(optimized, allArticles);
  
  // 4. Оптимизируем изображения
  optimized.content = optimizeImages(optimized.content);
  
  return optimized;
}

/**
 * Валидация статьи
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateArticle(article: BlogPost): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Проверка обязательных полей
  if (!article.id) errors.push('Missing article ID');
  if (!article.slug) errors.push('Missing article slug');
  if (!article.title) errors.push('Missing article title');
  if (!article.content) errors.push('Missing article content');
  
  // Проверка SEO
  if (!article.seo.metaTitle) warnings.push('Missing SEO meta title');
  if (!article.seo.metaDescription) warnings.push('Missing SEO meta description');
  if (!article.seo.keywords || article.seo.keywords.length < 5) {
    warnings.push('Less than 5 keywords');
  }
  
  // Проверка structured data
  if (!article.structuredData) warnings.push('Missing structured data');
  
  // Проверка связанных калькуляторов
  if (!article.relatedCalculators || article.relatedCalculators.length === 0) {
    errors.push('No related calculators');
  }
  
  // Проверка длины контента (минимум 2000 слов)
  const wordCount = article.content.split(/\s+/).length;
  if (wordCount < 2000) {
    warnings.push(`Content too short: ${wordCount} words (minimum 2000)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
