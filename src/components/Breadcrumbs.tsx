/**
 * Компонент хлебных крошек (Breadcrumbs)
 * Улучшает навигацию и SEO
 */

import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  // Генерируем структурированные данные для хлебных крошек
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Главная',
        'item': 'https://schitay-online.ru/'
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        'position': index + 2,
        'name': item.label,
        ...(item.href && { 'item': `https://schitay-online.ru${item.href}` })
      }))
    ]
  };

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center gap-2 text-sm text-muted-foreground mb-6 ${className}`}
      >
        <Link 
          to="/" 
          className="flex items-center gap-1 hover:text-foreground transition-colors"
          aria-label="Перейти на главную страницу"
        >
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Главная</span>
        </Link>

        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            {item.href ? (
              <Link 
                to={item.href} 
                className="hover:text-foreground transition-colors truncate"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium truncate">
                {item.label}
              </span>
            )}
          </div>
        ))}
      </nav>
    </>
  );
}
