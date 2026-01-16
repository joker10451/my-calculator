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

/**
 * Генератор структурированных данных для калькулятора
 */
export function generateCalculatorSchema(
  name: string,
  description: string,
  url: string,
  category: 'FinanceApplication' | 'HealthApplication' | 'UtilityApplication' = 'FinanceApplication'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': name,
    'description': description,
    'url': url,
    'applicationCategory': category,
    'operatingSystem': 'Web Browser',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'RUB'
    },
    'inLanguage': 'ru',
    'isAccessibleForFree': true,
    'browserRequirements': 'Requires JavaScript. Requires HTML5.',
    'softwareVersion': '1.0',
    'author': {
      '@type': 'Organization',
      'name': 'Считай.RU',
      'url': 'https://schitay-online.ru'
    }
  };
}

/**
 * Генератор FAQ структурированных данных
 */
export function generateFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}

/**
 * Генератор структурированных данных для статьи
 */
export function generateArticleSchema(
  title: string,
  description: string,
  url: string,
  datePublished: string,
  dateModified?: string,
  imageUrl?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': title,
    'description': description,
    'url': url,
    'datePublished': datePublished,
    'dateModified': dateModified || datePublished,
    'author': {
      '@type': 'Organization',
      'name': 'Считай.RU',
      'url': 'https://schitay-online.ru'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Считай.RU',
      'url': 'https://schitay-online.ru',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://schitay-online.ru/icon.svg'
      }
    },
    ...(imageUrl && {
      'image': {
        '@type': 'ImageObject',
        'url': imageUrl
      }
    }),
    'inLanguage': 'ru'
  };
}
