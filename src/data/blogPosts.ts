import type { BlogPost } from '@/types/blog';
import { blogPosts as consolidatedBlogPosts } from './blog/index';

/**
 * Консолидированные данные блога
 * 
 * Все статьи теперь хранятся в единой структуре:
 * - src/data/blog/articles.json - JSON данные
 * - src/data/blog/index.ts - TypeScript модуль
 * 
 * Этот файл обеспечивает обратную совместимость
 * 
 * Дата консолидации: 17.01.2026
 * Консолидировано статей: 19
 * Удалено дубликатов: 1
 * Исправлено статей: 19
 */

// Экспортируем консолидированные данные
export const blogPosts: BlogPost[] = consolidatedBlogPosts;

// Экспорт по умолчанию для обратной совместимости
export default blogPosts;