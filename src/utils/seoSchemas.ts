/**
 * Генераторы структурированных данных для SEO
 */

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
