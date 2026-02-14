/**
 * Утилиты для prefetching ресурсов
 * Оптимизирует загрузку связанных статей и критических ресурсов
 */

import { blogPosts } from '@/data/blogPosts';

/**
 * Prefetch статьи по slug
 * Загружает данные статьи заранее для быстрой навигации
 */
export const prefetchArticle = (slug: string): void => {
  const article = blogPosts.find(p => p.slug === slug);
  if (!article) return;

  // Prefetch изображения статьи
  if (article.featuredImage) {
    const img = new Image();
    img.src = article.featuredImage.url;
  }

  // Prefetch связанных статей
  if (article.relatedCalculators) {
    article.relatedCalculators.forEach(calcId => {
      // Prefetch будет выполнен браузером автоматически
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = `/calculator/${calcId}`;
      document.head.appendChild(link);
    });
  }
};

/**
 * Prefetch критических ресурсов (шрифты, CSS)
 */
export const preloadCriticalResources = (): void => {
  // Preload шрифтов
  const fonts = [
    '/fonts/inter-var.woff2',
    '/fonts/inter-var-latin.woff2',
  ];

  fonts.forEach(fontUrl => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    link.href = fontUrl;
    document.head.appendChild(link);
  });

  // Preload критического CSS
  const criticalCSS = document.createElement('link');
  criticalCSS.rel = 'preload';
  criticalCSS.as = 'style';
  criticalCSS.href = '/styles/critical.css';
  document.head.appendChild(criticalCSS);
};

/**
 * Prefetch статей при hover на ссылках
 */
export const setupArticlePrefetch = (): void => {
  // Используем IntersectionObserver для prefetch видимых ссылок
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target as HTMLAnchorElement;
          const href = link.getAttribute('href');
          
          if (href && href.startsWith('/blog/')) {
            const slug = href.replace('/blog/', '');
            prefetchArticle(slug);
          }
        }
      });
    },
    {
      rootMargin: '50px', // Начинаем prefetch за 50px до видимости
    }
  );

  // Наблюдаем за всеми ссылками на статьи
  document.querySelectorAll('a[href^="/blog/"]').forEach(link => {
    observer.observe(link);
  });
};

/**
 * Prefetch при hover на ссылке
 */
export const prefetchOnHover = (slug: string): void => {
  // Используем requestIdleCallback для оптимизации
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => prefetchArticle(slug));
  } else {
    setTimeout(() => prefetchArticle(slug), 1);
  }
};
