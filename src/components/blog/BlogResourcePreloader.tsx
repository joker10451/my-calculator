import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Компонент для preload критических ресурсов
 * Оптимизирует загрузку шрифтов и CSS для блога
 */
export const BlogResourcePreloader = () => {
  useEffect(() => {
    // Preload критических ресурсов при монтировании
    const preloadResources = () => {
      // Preload изображений для блога (если есть)
      const criticalImages = [
        '/blog/hero-bg.webp',
        '/blog/default-thumbnail.webp',
      ];

      criticalImages.forEach(imageUrl => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = imageUrl;
        link.type = 'image/webp';
        document.head.appendChild(link);
      });
    };

    preloadResources();
  }, []);

  return (
    <Helmet>
      {/* Preload шрифтов */}
      <link
        rel="preload"
        href="/fonts/inter-var.woff2"
        as="font"
        type="font/woff2"
        crossOrigin="anonymous"
      />
      
      {/* Preconnect к внешним ресурсам */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS prefetch для аналитики */}
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://mc.yandex.ru" />
    </Helmet>
  );
};
