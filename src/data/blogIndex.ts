/**
 * Лёгкий индекс блога — только метаданные без контента
 * Используется для отображения карточек на главной и в навигации
 * Полный контент загружается лениво при открытии статьи
 */

import type { BlogPost } from '@/types/blog';

export interface BlogPostMeta {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime: number;
  isPublished: boolean;
  isFeatured?: boolean;
  coverImage?: string;
  author?: string;
}

/**
 * Получить метаданные постов (без контента) — лёгкая загрузка
 */
export async function getBlogPostsMeta(): Promise<BlogPostMeta[]> {
  const { blogPosts } = await import('@/data/blogPosts');
  return blogPosts
    .filter((p): p is BlogPost & { isPublished: true } => p.isPublished)
    .map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      category: p.category,
      publishedAt: p.publishedAt,
      readTime: p.readTime,
      isPublished: p.isPublished,
      isFeatured: p.isFeatured,
      coverImage: p.coverImage,
      author: p.author,
    }));
}

/**
 * Получить полный пост по slug — загружает весь контент
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  const { blogPosts } = await import('@/data/blogPosts');
  return blogPosts.find(p => p.slug === slug);
}
