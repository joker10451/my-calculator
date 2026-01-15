/**
 * Компонент для управления SEO метаданными
 * Использует react-helmet-async для динамического обновления head
 */

import { Helmet } from 'react-helmet-async';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  noindex?: boolean;
  structuredData?: object;
}

export function SEO({
  title,
  description,
  keywords,
  canonical,
  ogImage = 'https://schitay-online.ru/og-image.svg',
  ogType = 'website',
  noindex = false,
  structuredData
}: SEOProps) {
  const fullTitle = title.includes('Считай.RU') ? title : `${title} — Считай.RU`;
  const url = canonical || `https://schitay-online.ru${window.location.pathname}`;

  return (
    <Helmet>
      {/* Основные метатеги */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Считай.RU" />
      <meta property="og:locale" content="ru_RU" />
      
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
