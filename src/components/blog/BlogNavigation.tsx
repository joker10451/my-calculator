import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/data/blogPosts';
import type { BlogPost } from '@/types/blog';
import { prefetchOnHover } from '@/utils/prefetch';

interface BlogNavigationProps {
  currentPost: BlogPost;
}

/**
 * Компонент навигации между статьями
 * Показывает предыдущую и следующую статью с prefetch
 */
export const BlogNavigation = ({ currentPost }: BlogNavigationProps) => {
  const publishedPosts = blogPosts
    .filter(p => p.isPublished)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const currentIndex = publishedPosts.findIndex(p => p.id === currentPost.id);
  const prevPost = currentIndex > 0 ? publishedPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < publishedPosts.length - 1 ? publishedPosts[currentIndex + 1] : null;

  // Prefetch соседних статей при монтировании
  useEffect(() => {
    if (prevPost) {
      prefetchOnHover(prevPost.slug);
    }
    if (nextPost) {
      prefetchOnHover(nextPost.slug);
    }
  }, [prevPost, nextPost]);

  if (!prevPost && !nextPost) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between gap-4 py-8 border-t border-b">
      {/* Предыдущая статья */}
      {prevPost ? (
        <Link
          to={`/blog/${prevPost.slug}`}
          className="flex items-center gap-3 p-4 rounded-lg hover:bg-muted transition-colors flex-1 group"
          onMouseEnter={() => prefetchOnHover(prevPost.slug)}
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
          <div className="flex-1 text-left">
            <div className="text-sm text-muted-foreground mb-1">Предыдущая статья</div>
            <div className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
              {prevPost.title}
            </div>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {/* Следующая статья */}
      {nextPost ? (
        <Link
          to={`/blog/${nextPost.slug}`}
          className="flex items-center gap-3 p-4 rounded-lg hover:bg-muted transition-colors flex-1 group"
          onMouseEnter={() => prefetchOnHover(nextPost.slug)}
        >
          <div className="flex-1 text-right">
            <div className="text-sm text-muted-foreground mb-1">Следующая статья</div>
            <div className="font-semibold group-hover:text-primary transition-colors line-clamp-2">
              {nextPost.title}
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </nav>
  );
};
