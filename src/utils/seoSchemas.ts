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
 * Генератор HowTo структурированных данных
 */
export function generateHowToSchema(
  name: string,
  description: string,
  url: string,
  steps: Array<{ name: string; text: string; url?: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': name,
    'description': description,
    'url': url,
    'step': steps.map((step, i) => ({
      '@type': 'HowToStep',
      'position': i + 1,
      'name': step.name,
      'text': step.text,
      ...(step.url && { 'url': step.url })
    }))
  };
}

/**
 * Генератор Product структурированных данных (для банковских продуктов)
 */
export function generateProductSchema(
  name: string,
  description: string,
  url: string,
  provider: string,
  interestRate: number,
  minAmount: number,
  maxAmount: number
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FinancialProduct',
    'name': name,
    'description': description,
    'url': url,
    'provider': {
      '@type': 'Organization',
      'name': provider
    },
    'interestRate': {
      '@type': 'QuantitativeValue',
      'value': interestRate,
      'unitText': '% годовых'
    },
    'amount': {
      '@type': 'MonetaryAmount',
      'minValue': minAmount,
      'maxValue': maxAmount,
      'currency': 'RUB'
    },
    'inLanguage': 'ru',
    'isAccessibleForFree': true
  };
}

/**
 * Генератор BreadcrumbList структурированных данных
 */
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, i) => ({
      '@type': 'ListItem',
      'position': i + 1,
      'name': item.name,
      'item': item.url
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
