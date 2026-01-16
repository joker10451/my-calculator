/**
 * Компонент для управления SEO метаданными
 * Использует react-helmet-async для динамического обновления head
 */

import { Helmet } from 'react-helmet-async';
import type { HreflangTag } from '@/utils/multilingualSeo';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  structuredData?: object;
  hreflangTags?: HreflangTag[];
  language?: string;
}

export function SEO({
  title,
  description,
  keywords,
  canonical,
  ogImage = 'https://schitay-online.ru/og-image.svg',
  ogType = 'website',
  noindex = false,
  structuredData,
  hreflangTags,
  language = 'ru'
}: SEOProps) {
  const fullTitle = title.includes('Считай.RU') ? title : `${title} — Считай.RU`;
  const url = canonical || `https://schitay-online.ru${window.location.pathname}`;
  const locale = language === 'en' ? 'en_US' : 'ru_RU';

  return (
    <Helmet>
      {/* Основные метатеги */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      <html lang={language} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Hreflang теги для мультиязычности */}
      {hreflangTags && hreflangTags.map((tag, index) => (
        <link key={index} rel="alternate" hreflang={tag.lang} href={tag.href} />
      ))}
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Считай.RU" />
      <meta property="og:locale" content={locale} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Структурированные данные */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}

// Re-export schema generators from utils
export { 
  generateCalculatorSchema, 
  generateFAQSchema, 
  generateArticleSchema 
} from '@/utils/seoSchemas';
