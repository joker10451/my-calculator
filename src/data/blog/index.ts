import type { BlogPost } from '@/types/blog';
import articlesData from './articles.json';

/**
 * Консолидированные данные блога
 * Автоматически сгенерировано 17.01.2026, 16:03:47
 */

// Преобразуем JSON данные в типизированный массив
const consolidatedArticles: BlogPost[] = articlesData.articles.map(article => ({
  ...article,
  // Преобразуем даты из строк в объекты Date при необходимости
  publishedAt: article.publishedAt,
  updatedAt: article.updatedAt || undefined,
  // Обеспечиваем корректную типизацию
  category: article.category,
  author: article.author,
  tags: article.tags || [],
  featuredImage: article.featuredImage || undefined,
  seo: article.seo || {},
  relatedCalculators: article.relatedCalculators || [],
  structuredData: article.structuredData || undefined,
  translations: article.translations || undefined
}));

// Сортируем по дате публикации (новые первыми)
export const blogPosts: BlogPost[] = consolidatedArticles
  .filter(post => post.isPublished)
  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

// Экспорт для обратной совместимости
export default blogPosts;

// Дополнительные экспорты
export const featuredPosts = blogPosts.filter(post => post.isFeatured);
export const totalPosts = blogPosts.length;
export const lastUpdated = articlesData.lastUpdated;

// Статистика
export const stats = {
  total: totalPosts,
  featured: featuredPosts.length,
  published: blogPosts.length,
  lastUpdated: articlesData.lastUpdated,
  version: articlesData.version
};
