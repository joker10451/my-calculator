import type { BlogPost } from '@/types/blog';

/**
 * SEO Optimizer Utilities
 * Утилиты для автоматической оптимизации контента для поисковых систем
 */

/**
 * Генерирует meta title для статьи (50-70 символов)
 * @param article - Статья блога
 * @returns Meta title оптимальной длины
 */
export function generateMetaTitle(article: BlogPost): string {
  // Очищаем заголовок от пробелов и специальных символов
  const baseTitle = article.title.trim().replace(/\s+/g, ' ');
  const siteName = 'Считай.RU';
  
  // Если заголовок пустой или содержит только специальные символы, используем fallback
  const hasValidContent = baseTitle.length > 0 && /[\wа-яА-ЯёЁ]/.test(baseTitle);
  
  if (!hasValidContent) {
    // Используем категорию и описание для создания заголовка
    const categoryName = article.category.name || 'Статья';
    const categoryDesc = article.category.description || 'Полезная информация';
    
    const fallback = `${categoryName} - ${categoryDesc.substring(0, 30)} | ${siteName}`;
    
    if (fallback.length >= 50 && fallback.length <= 70) {
      return fallback;
    }
    
    if (fallback.length < 50) {
      // Добавляем больше текста для достижения минимума
      const extended = `${categoryName} - ${categoryDesc} - Калькуляторы и инструменты | ${siteName}`;
      return extended.substring(0, 70);
    }
    
    return fallback.substring(0, 70);
  }
  
  // Если заголовок уже в нужном диапазоне, используем его
  if (baseTitle.length >= 50 && baseTitle.length <= 70) {
    return baseTitle;
  }
  
  // Если заголовок слишком короткий, добавляем название сайта
  if (baseTitle.length < 50) {
    const withSite = `${baseTitle} | ${siteName}`;
    
    if (withSite.length >= 50 && withSite.length <= 70) {
      return withSite;
    }
    
    if (withSite.length < 50) {
      // Добавляем категорию
      const withCategory = `${baseTitle} - ${article.category.name} | ${siteName}`;
      
      if (withCategory.length >= 50 && withCategory.length <= 70) {
        return withCategory;
      }
      
      if (withCategory.length < 50) {
        // Добавляем ещё текста
        const extended = `${baseTitle} - ${article.category.name} - Калькуляторы | ${siteName}`;
        return extended.substring(0, 70);
      }
      
      return withCategory.substring(0, 70);
    }
    
    return withSite.substring(0, 70);
  }
  
  // Если заголовок слишком длинный, обрезаем до 67 символов и добавляем "..."
  return baseTitle.substring(0, 67) + '...';
}

/**
 * Генерирует meta description для статьи (150-160 символов)
 * @param article - Статья блога
 * @returns Meta description оптимальной длины
 */
export function generateMetaDescription(article: BlogPost): string {
  // Очищаем excerpt от лишних пробелов
  const excerpt = article.excerpt.trim().replace(/\s+/g, ' ');
  
  // Проверяем, есть ли валидный контент в excerpt
  const hasValidContent = excerpt.length > 0 && /[\wа-яА-ЯёЁ]/.test(excerpt);
  
  // Если excerpt пустой или содержит только специальные символы, используем контент или fallback
  if (!hasValidContent) {
    // Пытаемся извлечь из контента
    const contentStart = article.content
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (contentStart.length >= 150) {
      return contentStart.substring(0, 157) + '...';
    }
    
    // Fallback: используем описание категории
    const categoryDesc = article.category.description || 'Полезная информация и инструменты';
    const baseText = `${categoryDesc}. Читайте на Считай.RU - калькуляторы и финансовые инструменты для расчётов. Бесплатные онлайн калькуляторы для всех ваших расчётов и планирования.`;
    
    // Гарантируем минимум 150 символов
    if (baseText.length >= 150 && baseText.length <= 160) {
      return baseText;
    }
    
    if (baseText.length < 150) {
      // Добавляем ещё текста до достижения минимума
      const padding = ' Удобные инструменты для финансовых расчётов.';
      const extended = (baseText + padding).substring(0, 160);
      
      // Если всё ещё меньше 150, добавляем пробелы (крайний случай)
      if (extended.length < 150) {
        return extended.padEnd(150, ' ');
      }
      
      return extended;
    }
    
    return baseText.substring(0, 157) + '...';
  }
  
  // Если excerpt уже в нужном диапазоне, используем его
  if (excerpt.length >= 150 && excerpt.length <= 160) {
    return excerpt;
  }
  
  // Если excerpt слишком короткий, дополняем информацией
  if (excerpt.length < 150) {
    const addition = ` Читайте на Считай.RU - калькуляторы и финансовые инструменты.`;
    let combined = excerpt + addition;
    
    if (combined.length >= 150 && combined.length <= 160) {
      return combined;
    }
    
    if (combined.length < 150) {
      // Добавляем ещё текста
      combined = combined + ' Бесплатные расчёты онлайн.';
      
      if (combined.length >= 150 && combined.length <= 160) {
        return combined;
      }
      
      if (combined.length < 150) {
        // Добавляем ещё больше текста
        combined = combined + ' Удобные инструменты.';
        
        if (combined.length >= 150) {
          return combined.substring(0, 160);
        }
        
        // Крайний случай: добавляем пробелы
        return combined.padEnd(150, ' ');
      }
      
      return combined.substring(0, 160);
    }
    
    // Если слишком длинный, обрезаем
    return combined.substring(0, 157) + '...';
  }
  
  // Если excerpt слишком длинный, обрезаем до 157 символов и добавляем "..."
  return excerpt.substring(0, 157) + '...';
}

/**
 * Извлекает ключевые слова из контента
 * @param content - Текст контента
 * @param minLength - Минимальная длина слова
 * @returns Массив ключевых слов
 */
export function extractKeywords(content: string, minLength: number = 4): string[] {
  // Список стоп-слов (русский язык)
  const stopWords = new Set([
    'это', 'как', 'так', 'для', 'что', 'или', 'все', 'был', 'быть',
    'есть', 'был', 'была', 'было', 'были', 'будет', 'может', 'можно',
    'при', 'про', 'под', 'над', 'без', 'через', 'после', 'перед',
    'который', 'которая', 'которое', 'которые', 'этот', 'эта', 'это', 'эти',
    'тот', 'та', 'то', 'те', 'свой', 'своя', 'свое', 'свои',
    'наш', 'наша', 'наше', 'наши', 'ваш', 'ваша', 'ваше', 'ваши'
  ]);
  
  // Удаляем HTML теги и специальные символы
  const cleanContent = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\wа-яА-ЯёЁ\s]/g, ' ')
    .toLowerCase();
  
  // Разбиваем на слова
  const words = cleanContent.split(/\s+/).filter(word => 
    word.length >= minLength && !stopWords.has(word)
  );
  
  // Подсчитываем частоту слов
  const wordFrequency = new Map<string, number>();
  words.forEach(word => {
    wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
  });
  
  // Сортируем по частоте и берём топ-10
  const sortedWords = Array.from(wordFrequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
  
  return sortedWords;
}

/**
 * Рассчитывает плотность ключевых слов в контенте (keyword density)
 * @param content - Текст контента
 * @param keywords - Массив ключевых слов
 * @returns Плотность ключевых слов в процентах (0-100)
 */
export function calculateKeywordDensity(content: string, keywords: string[]): number {
  if (keywords.length === 0) {
    return 0;
  }
  
  // Очищаем контент от HTML и специальных символов
  const cleanContent = content
    .replace(/<[^>]*>/g, ' ')
    .replace(/[^\wа-яА-ЯёЁ\s]/g, ' ')
    .toLowerCase();
  
  // Подсчитываем общее количество слов
  const totalWords = cleanContent.split(/\s+/).filter(word => word.length > 0).length;
  
  if (totalWords === 0) {
    return 0;
  }
  
  // Подсчитываем количество вхождений ключевых слов
  let keywordCount = 0;
  keywords.forEach(keyword => {
    // Экранируем специальные символы в ключевом слове
    const escapedKeyword = keyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Проверяем, что ключевое слово не пустое и содержит буквы/цифры
    if (escapedKeyword.trim().length === 0 || !/[\wа-яА-ЯёЁ]/.test(escapedKeyword)) {
      return;
    }
    
    try {
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'g');
      const matches = cleanContent.match(regex);
      keywordCount += matches ? matches.length : 0;
    } catch (e) {
      // Если regex невалидный, пропускаем это ключевое слово
      return;
    }
  });
  
  // Рассчитываем плотность в процентах
  const density = (keywordCount / totalWords) * 100;
  
  return Math.round(density * 100) / 100; // Округляем до 2 знаков после запятой
}

/**
 * Генерирует canonical URL для статьи
 * @param slug - Slug статьи
 * @param baseUrl - Базовый URL сайта (по умолчанию https://xn--80aqu.ru)
 * @returns Canonical URL
 */
export function generateCanonicalURL(slug: string, baseUrl: string = 'https://xn--80aqu.ru'): string {
  // Убираем trailing slash из baseUrl
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  
  // Убираем leading slash из slug
  const cleanSlug = slug.replace(/^\//, '');
  
  // Проверяем, что slug содержит только допустимые символы
  // и содержит хотя бы одну букву или цифру (не только дефисы)
  const isValidSlug = /^[a-z0-9-]+$/.test(cleanSlug) && /[a-z0-9]/.test(cleanSlug);
  
  if (!isValidSlug) {
    throw new Error(`Invalid slug format: ${cleanSlug}`);
  }
  
  return `${cleanBaseUrl}/blog/${cleanSlug}`;
}

/**
 * Генерирует structured data (Article schema) для статьи
 * @param article - Статья блога
 * @returns Объект structured data в формате JSON-LD
 */
export function generateStructuredData(article: BlogPost): Record<string, unknown> {
  const baseUrl = 'https://xn--80aqu.ru';
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    author: {
      '@type': 'Person',
      name: article.author.name,
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: 'Считай.RU',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/icon-512.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': generateCanonicalURL(article.slug),
    },
  };
  
  // Добавляем изображение, если есть
  if (article.featuredImage) {
    Object.assign(structuredData, {
      image: {
        '@type': 'ImageObject',
        url: article.featuredImage.url,
        width: article.featuredImage.width,
        height: article.featuredImage.height,
      },
    });
  }
  
  // Добавляем ключевые слова, если есть
  if (article.seo.keywords && article.seo.keywords.length > 0) {
    Object.assign(structuredData, {
      keywords: article.seo.keywords.join(', '),
    });
  }
  
  return structuredData;
}

/**
 * Валидирует плотность ключевых слов (должна быть 1-3%)
 * @param content - Текст контента
 * @param keywords - Массив ключевых слов
 * @returns true, если плотность в допустимом диапазоне
 */
export function validateKeywordDensity(content: string, keywords: string[]): boolean {
  const density = calculateKeywordDensity(content, keywords);
  return density >= 1 && density <= 3;
}
