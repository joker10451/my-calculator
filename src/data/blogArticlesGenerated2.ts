import { createArticle } from '@/utils/blogArticleGenerator';
import { blogCategories } from './blogCategories';

// Место для будущих статей
export const allGeneratedArticles: ReturnType<typeof createArticle>[] = [];
