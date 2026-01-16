import type { BlogPost } from '@/types/blog';

/**
 * Добавляет поля language и translations к существующим постам блога
 * Используется для миграции старых данных к новой структуре
 */
export function migrateBlogPost(post: Partial<BlogPost>): BlogPost {
  return {
    ...post,
    language: post.language || 'ru',
    translations: post.translations || {},
  } as BlogPost;
}

/**
 * Мигрирует массив постов блога
 */
export function migrateBlogPosts(posts: Partial<BlogPost>[]): BlogPost[] {
  return posts.map(migrateBlogPost);
}
