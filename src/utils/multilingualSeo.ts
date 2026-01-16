import type { BlogPost, SupportedLanguage } from '@/types/blog';
import { buildLocalizedUrl } from './i18n';

/**
 * Интерфейс для hreflang тега
 */
export interface HreflangTag {
  lang: string;
  href: string;
}

/**
 * Генерирует hreflang теги для статьи блога
 * @param post - Статья блога
 * @param baseUrl - Базовый URL сайта (например, 'https://schitai.ru')
 * @returns Массив hreflang тегов
 */
export function generateHreflangTags(
  post: BlogPost,
  baseUrl: string = 'https://schitai.ru'
): HreflangTag[] {
  const tags: HreflangTag[] = [];
  
  // Добавляем тег для текущего языка статьи
  const currentLangPath = buildLocalizedUrl(`/blog/${post.slug}`, post.language);
  tags.push({
    lang: post.language,
    href: `${baseUrl}${currentLangPath}`,
  });
  
  // Добавляем теги для переводов
  if (post.translations) {
    Object.entries(post.translations).forEach(([lang, translatedPostId]) => {
      const langCode = lang as SupportedLanguage;
      // Предполагаем, что slug переведенной статьи можно получить по ID
      // В реальном приложении нужно будет получить полный объект статьи
      const translatedPath = buildLocalizedUrl(`/blog/${translatedPostId}`, langCode);
      tags.push({
        lang: langCode,
        href: `${baseUrl}${translatedPath}`,
      });
    });
  }
  
  // Добавляем x-default для основного языка (русский)
  const defaultLangPath = buildLocalizedUrl(`/blog/${post.slug}`, 'ru');
  tags.push({
    lang: 'x-default',
    href: `${baseUrl}${defaultLangPath}`,
  });
  
  return tags;
}

/**
 * Генерирует HTML для hreflang тегов
 * @param tags - Массив hreflang тегов
 * @returns HTML строка с link тегами
 */
export function renderHreflangTags(tags: HreflangTag[]): string {
  return tags
    .map(tag => `<link rel="alternate" hreflang="${tag.lang}" href="${tag.href}" />`)
    .join('\n');
}

/**
 * Получает SEO метаданные для конкретного языка
 * @param post - Статья блога
 * @param language - Язык для получения метаданных
 * @returns SEO метаданные для указанного языка
 */
export function getLanguageSpecificSeo(
  post: BlogPost,
  language: SupportedLanguage
): BlogPost['seo'] {
  // Если запрашиваемый язык совпадает с языком статьи, возвращаем текущие SEO данные
  if (post.language === language) {
    return post.seo;
  }
  
  // Если есть перевод, нужно получить SEO данные переведенной статьи
  // В реальном приложении здесь нужно будет загрузить переведенную статью
  // Пока возвращаем текущие SEO данные как fallback
  return post.seo;
}

/**
 * Генерирует canonical URL с учетом языка
 * @param slug - Slug статьи
 * @param language - Язык статьи
 * @param baseUrl - Базовый URL сайта
 * @returns Canonical URL
 */
export function generateCanonicalUrl(
  slug: string,
  language: SupportedLanguage,
  baseUrl: string = 'https://schitai.ru'
): string {
  const path = buildLocalizedUrl(`/blog/${slug}`, language);
  return `${baseUrl}${path}`;
}

/**
 * Проверяет, есть ли у статьи переводы
 * @param post - Статья блога
 * @returns true, если есть хотя бы один перевод
 */
export function hasTranslations(post: BlogPost): boolean {
  return post.translations !== undefined && Object.keys(post.translations).length > 0;
}

/**
 * Получает список доступных языков для статьи
 * @param post - Статья блога
 * @returns Массив доступных языков
 */
export function getAvailableLanguages(post: BlogPost): SupportedLanguage[] {
  const languages: SupportedLanguage[] = [post.language];
  
  if (post.translations) {
    Object.keys(post.translations).forEach(lang => {
      languages.push(lang as SupportedLanguage);
    });
  }
  
  return languages;
}
