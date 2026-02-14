// Типы для блога
export type SupportedLanguage = 'ru' | 'en';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  publishedAt: string;
  updatedAt?: string;
  category: BlogCategory;
  tags: string[];
  featuredImage?: {
    url: string;
    alt: string;
    width: number;
    height: number;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonical?: string;
    ogImage?: string;
  };
  readingTime: number; // в минутах
  wordCount?: number; // количество слов в статье
  isPublished: boolean;
  isFeatured: boolean;
  relatedCalculators?: string[]; // ID калькуляторов
  structuredData?: Record<string, unknown>;
  shareCount?: number; // количество шерингов статьи
  language: SupportedLanguage; // язык статьи
  translations?: Record<SupportedLanguage, string>; // ID переводов статьи
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon?: string;
  seo: {
    metaTitle?: string;
    metaDescription?: string;
  };
  language: SupportedLanguage; // язык категории
  translations?: Record<SupportedLanguage, string>; // ID переводов категории
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export interface BlogAuthor {
  id: string;
  name: string;
  slug: string;
  bio: string;
  avatar?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    email?: string;
  };
  expertise: string[];
}

export interface BlogSearchResult {
  posts: BlogPost[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface BlogFilters {
  category?: string;
  tags?: string[];
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  featured?: boolean;
}

export interface RelatedPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  category: BlogCategory;
  readingTime: number;
  featuredImage?: {
    url: string;
    alt: string;
  };
}