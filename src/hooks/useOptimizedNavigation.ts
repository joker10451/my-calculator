import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getCachedArticle, setCachedArticle } from '@/utils/articleCache';
import { blogPosts } from '@/data/blogPosts';

/**
 * Хук для оптимизированной навигации между статьями
 * - Использует client-side routing
 * - Кеширует статьи в localStorage
 * - Prefetch связанных статей
 */
export const useOptimizedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // При загрузке страницы статьи, кешируем её
    if (location.pathname.startsWith('/blog/')) {
      const slug = location.pathname.replace('/blog/', '');
      const article = blogPosts.find(p => p.slug === slug);
      
      if (article) {
        setCachedArticle(article);
      }
    }
  }, [location]);

  /**
   * Навигация к статье с оптимизацией
   */
  const navigateToArticle = (slug: string) => {
    // Проверяем кеш
    const cached = getCachedArticle(slug);
    
    if (cached) {
      // Статья в кеше, навигация будет мгновенной
      navigate(`/blog/${slug}`);
    } else {
      // Статьи нет в кеше, но навигация все равно быстрая благодаря client-side routing
      navigate(`/blog/${slug}`);
      
      // Кешируем после навигации
      const article = blogPosts.find(p => p.slug === slug);
      if (article) {
        setCachedArticle(article);
      }
    }
  };

  /**
   * Prefetch статьи
   */
  const prefetchArticle = (slug: string) => {
    const article = blogPosts.find(p => p.slug === slug);
    if (article) {
      setCachedArticle(article);
    }
  };

  return {
    navigateToArticle,
    prefetchArticle,
  };
};
