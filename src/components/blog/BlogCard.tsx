import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/types/blog';
import { prefetchOnHover } from '@/utils/prefetch';
import { OptimizedImage } from './OptimizedImage';

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showReadingTime?: boolean;
}

export const BlogCard = ({ 
  post, 
  variant = 'default',
  showExcerpt = true,
  showAuthor = true,
  showReadingTime = true
}: BlogCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const cardClasses = {
    default: 'h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1',
    featured: 'h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-2 border-primary/20',
    compact: 'transition-all duration-300 hover:shadow-md'
  };

  return (
    <Card className={cardClasses[variant]}>
      {post.featuredImage && (
        <div className="relative overflow-hidden rounded-t-lg">
          <OptimizedImage
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            width={400}
            height={192}
            className="w-full h-48"
            priority={variant === 'featured'}
          />
          {post.isFeatured && (
            <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground" role="status" aria-label="Рекомендуемая статья">
              Рекомендуем
            </Badge>
          )}
          <Badge 
            className="absolute top-3 right-3"
            style={{ backgroundColor: post.category.color }}
            role="status"
            aria-label={`Категория: ${post.category.name}`}
          >
            {post.category.name}
          </Badge>
        </div>
      )}
      
      <CardHeader className={variant === 'compact' ? 'pb-2' : ''}>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          </div>
          
          {showReadingTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" aria-hidden="true" />
              <span>{post.readingTime} мин</span>
            </div>
          )}
        </div>
        
        <h3 className={`font-bold leading-tight hover:text-primary transition-colors ${
          variant === 'featured' ? 'text-xl' : variant === 'compact' ? 'text-base' : 'text-lg'
        }`}>
          <Link 
            to={`/blog/${post.slug}`} 
            className="block"
            onMouseEnter={() => prefetchOnHover(post.slug)}
            aria-label={`Читать статью: ${post.title}`}
          >
            {post.title}
          </Link>
        </h3>
      </CardHeader>

      {showExcerpt && variant !== 'compact' && (
        <CardContent>
          <p className="text-muted-foreground line-clamp-3">
            {post.excerpt}
          </p>
          
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3" role="list" aria-label="Теги статьи">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs" role="listitem">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs" role="listitem">
                  +{post.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      )}

      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          {showAuthor && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="w-4 h-4" aria-hidden="true" />
              <span>{post.author.name}</span>
            </div>
          )}
          
          <Link 
            to={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors ml-auto"
            onMouseEnter={() => prefetchOnHover(post.slug)}
            aria-label={`Читать далее: ${post.title}`}
          >
            Читать далее
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};