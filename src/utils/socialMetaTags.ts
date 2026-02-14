import type { BlogPost } from '@/types/blog';

export interface OpenGraphTags {
  'og:title': string;
  'og:description': string;
  'og:type': string;
  'og:url': string;
  'og:image'?: string;
  'og:site_name': string;
  'og:locale': string;
}

export interface TwitterCardTags {
  'twitter:card': string;
  'twitter:title': string;
  'twitter:description': string;
  'twitter:image'?: string;
  'twitter:site'?: string;
}

/**
 * Генерирует Open Graph meta tags для статьи блога
 * @param article - Статья блога
 * @param baseUrl - Базовый URL сайта (по умолчанию window.location.origin)
 * @returns Объект с Open Graph тегами
 */
export const generateOpenGraphTags = (
  article: BlogPost,
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://schitai.ru'
): OpenGraphTags => {
  const url = `${baseUrl}/blog/${article.slug}`;
  const title = article.seo.metaTitle || article.title;
  const description = article.seo.metaDescription || article.excerpt;
  const image = article.seo.ogImage || article.featuredImage?.url;

  const tags: OpenGraphTags = {
    'og:title': title,
    'og:description': description,
    'og:type': 'article',
    'og:url': url,
    'og:site_name': 'Считай.RU',
    'og:locale': 'ru_RU',
  };

  if (image) {
    // Ensure image URL is absolute
    tags['og:image'] = image.startsWith('http') ? image : `${baseUrl}${image}`;
  }

  return tags;
};

/**
 * Генерирует Twitter Card meta tags для статьи блога
 * @param article - Статья блога
 * @param baseUrl - Базовый URL сайта (по умолчанию window.location.origin)
 * @returns Объект с Twitter Card тегами
 */
export const generateTwitterCardTags = (
  article: BlogPost,
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://schitai.ru'
): TwitterCardTags => {
  const title = article.seo.metaTitle || article.title;
  const description = article.seo.metaDescription || article.excerpt;
  const image = article.seo.ogImage || article.featuredImage?.url;

  const tags: TwitterCardTags = {
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
  };

  if (image) {
    // Ensure image URL is absolute
    tags['twitter:image'] = image.startsWith('http') ? image : `${baseUrl}${image}`;
  }

  return tags;
};

/**
 * Применяет meta tags к документу
 * @param tags - Объект с meta тегами
 */
export const applyMetaTags = (tags: Record<string, string>) => {
  Object.entries(tags).forEach(([property, content]) => {
    // Remove existing tag if present
    const existingTag = document.querySelector(`meta[property="${property}"]`) ||
                       document.querySelector(`meta[name="${property}"]`);
    if (existingTag) {
      existingTag.remove();
    }

    // Create new tag
    const meta = document.createElement('meta');
    
    // Use 'property' for Open Graph tags, 'name' for Twitter tags
    if (property.startsWith('og:')) {
      meta.setAttribute('property', property);
    } else {
      meta.setAttribute('name', property);
    }
    
    meta.setAttribute('content', content);
    document.head.appendChild(meta);
  });
};

/**
 * Применяет все социальные meta tags для статьи
 * @param article - Статья блога
 * @param baseUrl - Базовый URL сайта
 */
export const applySocialMetaTags = (article: BlogPost, baseUrl?: string) => {
  const ogTags = generateOpenGraphTags(article, baseUrl);
  const twitterTags = generateTwitterCardTags(article, baseUrl);

  applyMetaTags(ogTags);
  applyMetaTags(twitterTags);
};

/**
 * Удаляет все социальные meta tags
 */
export const removeSocialMetaTags = () => {
  const selectors = [
    'meta[property^="og:"]',
    'meta[name^="twitter:"]',
  ];

  selectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(tag => tag.remove());
  });
};
