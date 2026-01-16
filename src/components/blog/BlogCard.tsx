import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/types/blog';
import { prefetchOnHover } from '@/utils/prefetch';
import { OptimizedImage } from './OptimizedImage';
import { BlogCardSkeleton } from './BlogCardSkeleton';
import { cardHoverVariants, imageZoomVariants, getAnimationVariants } from '@/lib/motion-config';

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'compact';
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showReadingTime?: boolean;
  isLoading?: boolean;
}

export const BlogCard = ({ 
  post, 
  variant = 'default',
  showExcerpt = true,
  showAuthor = true,
  showReadingTime = true,
  isLoading = false
}: BlogCardProps) => {
  // Show skeleton if loading
  if (isLoading) {
    return (
      <BlogCardSkeleton
        variant={variant}
        showExcerpt={showExcerpt}
        showAuthor={showAuthor}
        showReadingTime={showReadingTime}
      />
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Получаем варианты анимаций с поддержкой prefers-reduced-motion
  const cardHover = getAnimationVariants(cardHoverVariants);
  const imageZoom = getAnimationVariants(imageZoomVariants);

  const cardClasses = {
    default: 'h-full transition-shadow duration-300 p-lg',
    featured: 'h-full transition-shadow duration-300 border-2 border-primary/20 p-2xl',
    compact: 'transition-shadow duration-300 p-md'
  };

  return (
    <motion.div
      variants={cardHover}
      initial="initial"
      whileHover="hover"
      className="h-full"
    >
      <Card className={cardClasses[variant]}>
      {post.featuredImage && (
        <div className="relative overflow-hidden rounded-t-lg">
          <motion.div
            variants={imageZoom}
            initial="initial"
            whileHover="hover"
            className="w-full h-48"
          >
            <OptimizedImage
              src={post.featuredImage.url}
              alt={post.featuredImage.alt}
              width={400}
              height={192}
              className="w-full h-full object-cover"
              priority={variant === 'featured'}
            />
          </motion.div>
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
      
      <CardHeader className={variant === 'compact' ? 'pb-2 p-0' : 'pb-4 p-0'}>
        <div className="flex items-center gap-4 text-base text-muted-foreground mb-3">
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
          variant === 'featured' ? 'text-h3' : variant === 'compact' ? 'text-body-lg' : 'text-body-lg'
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
        <CardContent className="p-0">
          <p className="text-body text-muted-foreground line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
          
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4" role="list" aria-label="Теги статьи">
              {post.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm" role="listitem">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="secondary" className="text-sm" role="listitem">
                  +{post.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      )}

      <CardFooter className="pt-0 p-0">
        <div className="flex items-center justify-between w-full">
          {showAuthor && (
            <div className="flex items-center gap-2 text-base text-muted-foreground">
              <User className="w-4 h-4" aria-hidden="true" />
              <span>{post.author.name}</span>
            </div>
          )}
          
          <Link 
            to={`/blog/${post.slug}`}
            className="inline-flex items-center gap-1 text-base font-semibold text-primary hover:text-primary/80 transition-colors ml-auto"
            onMouseEnter={() => prefetchOnHover(post.slug)}
            aria-label={`Читать далее: ${post.title}`}
          >
            Читать далее
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </CardFooter>
    </Card>
    </motion.div>
  );
};