import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, ArrowRight, Home, Calculator, TrendingUp, Zap, Heart, Users, Car, Scale } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { BlogPost } from '@/types/blog';
import { prefetchOnHover } from '@/utils/prefetch';
import { OptimizedImage } from '../OptimizedImage';
import { EnhancedBlogCardSkeleton } from './EnhancedBlogCardSkeleton';
import { cardHoverVariants, imageZoomVariants, getAnimationVariants, willChangeStyles } from '@/lib/motion-config';

interface EnhancedBlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'featured' | 'hero';
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showReadingTime?: boolean;
  isLoading?: boolean;
}

// Маппинг категорий на иконки
const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'mortgage-credit': Home,
  'taxes-salary': Calculator,
  'utilities-housing': Zap,
  'health-fitness': Heart,
  'family-law': Users,
  'auto-transport': Car,
  'investments-deposits': TrendingUp,
  'legal-court': Scale,
};

// Маппинг категорий на яркие цвета
const categoryColors: Record<string, string> = {
  'mortgage-credit': '#3B82F6',    // Blue
  'taxes-salary': '#10B981',       // Emerald
  'utilities-housing': '#F59E0B',  // Amber
  'health-fitness': '#EF4444',     // Red
  'family-law': '#8B5CF6',         // Purple
  'auto-transport': '#06B6D4',     // Cyan
  'investments-deposits': '#84CC16', // Lime
  'legal-court': '#6B7280',        // Gray
};

export const EnhancedBlogCard = ({ 
  post, 
  variant = 'default',
  showExcerpt = true,
  showAuthor = true,
  showReadingTime = true,
  isLoading = false
}: EnhancedBlogCardProps) => {
  // Show skeleton if loading
  if (isLoading) {
    return (
      <EnhancedBlogCardSkeleton
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

  // Получаем иконку для категории
  const CategoryIcon = categoryIcons[post.category.id] || Calculator;
  const categoryColor = categoryColors[post.category.id] || post.category.color;

  // Конфигурация для разных вариантов
  const variantConfig = {
    default: {
      imageHeight: 'h-[200px] sm:h-[240px] lg:h-[280px]',
      padding: 'p-md sm:p-lg',  // 24px -> 32px
      borderRadius: 'rounded-xl sm:rounded-2xl',
      border: '',
      titleSize: '', // Убираем, используем typography классы
    },
    featured: {
      imageHeight: 'h-[280px] sm:h-[320px] lg:h-[360px]',
      padding: 'p-lg sm:p-xl lg:p-2xl',  // 32px -> 48px -> 64px
      borderRadius: 'rounded-2xl sm:rounded-3xl',
      border: 'border-2',
      titleSize: '', // Убираем, используем typography классы
    },
    hero: {
      imageHeight: 'h-[360px] sm:h-[440px] lg:h-[500px]',
      padding: 'p-lg sm:p-xl lg:p-2xl',  // 32px -> 48px -> 64px
      borderRadius: 'rounded-2xl sm:rounded-3xl',
      border: 'border-2',
      titleSize: '', // Убираем, используем typography классы
    },
  };

  const config = variantConfig[variant];

  // Получаем варианты анимаций с поддержкой prefers-reduced-motion
  const cardHover = getAnimationVariants(cardHoverVariants);
  const imageZoom = getAnimationVariants(imageZoomVariants);

  return (
    <motion.div
      variants={cardHover}
      initial="initial"
      whileHover="hover"
      className="h-full typography-animate-fade-in"
      style={willChangeStyles.transform}
    >
      <Card 
        className={`
          h-full overflow-hidden
          ${config.borderRadius}
          ${config.border}
          shadow-[0_10px_30px_rgba(0,0,0,0.15)]
          hover:shadow-[0_20px_40px_rgba(0,0,0,0.25)]
          transition-shadow duration-300
          group
        `}
        style={variant === 'featured' || variant === 'hero' ? {
          borderImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) 1'
        } : undefined}
      >
        {post.featuredImage && (
          <div className={`relative overflow-hidden ${config.imageHeight}`}>
            {/* Изображение с эффектом зума при наведении */}
            <motion.div
              className="w-full h-full"
              variants={imageZoom}
              initial="initial"
              whileHover="hover"
            >
              <OptimizedImage
                src={post.featuredImage.url}
                alt={post.featuredImage.alt}
                width={post.featuredImage.width}
                height={post.featuredImage.height}
                className="w-full h-full object-cover"
                priority={variant === 'featured' || variant === 'hero'}
              />
            </motion.div>

            {/* Градиентный оверлей */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Бейдж "Рекомендуем" */}
            {post.isFeatured && (
              <Badge 
                className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg text-xs sm:text-sm"
                role="status" 
                aria-label="Рекомендуемая статья"
              >
                ⭐ Рекомендуем
              </Badge>
            )}

            {/* Бейдж категории с иконкой (справа сверху) */}
            <Badge 
              className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1 sm:gap-1.5 text-white border-0 shadow-lg font-semibold px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm"
              style={{ backgroundColor: categoryColor }}
              role="status"
              aria-label={`Категория: ${post.category.name}`}
            >
              <CategoryIcon className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{post.category.name}</span>
            </Badge>
          </div>
        )}
        
        <CardHeader className={`${config.padding} typography-spacing-card-padding`}>
          <div className="flex items-center gap-3 sm:gap-4 typography-metadata mb-2 sm:mb-3">
            <div className="flex items-center gap-1 sm:gap-1.5">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
            </div>
            
            {showReadingTime && (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                <span>{post.readingTime} мин</span>
              </div>
            )}
          </div>
          
          <h3 className="typography-responsive-heading-lg typography-animate-hover font-bold leading-tight hover:text-primary transition-colors">
            <Link 
              to={`/blog/${post.slug}`} 
              className="block min-h-[44px] flex items-center"
              onMouseEnter={() => prefetchOnHover(post.slug)}
              aria-label={`Читать статью: ${post.title}`}
            >
              {post.title}
            </Link>
          </h3>
        </CardHeader>

        {showExcerpt && (
          <CardContent className={`${config.padding} typography-spacing-card-padding pt-0`}>
            <p className="typography-body-lg typography-reading-optimized text-muted-foreground line-clamp-3 leading-relaxed">
              {post.excerpt}
            </p>
            
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 sm:gap-2 typography-spacing-excerpt-to-meta" role="list" aria-label="Теги статьи">
                {post.tags.slice(0, 3).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="typography-tag typography-touch-target"
                    role="listitem"
                  >
                    {tag}
                  </Badge>
                ))}
                {post.tags.length > 3 && (
                  <Badge 
                    variant="secondary" 
                    className="typography-tag typography-touch-target"
                    role="listitem"
                  >
                    +{post.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        )}

        <CardFooter className={`${config.padding} typography-spacing-card-padding pt-0`}>
          <div className="flex items-center justify-between w-full gap-2">
            {showAuthor && (
              <div className="flex items-center gap-1.5 sm:gap-2 typography-metadata">
                <User className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                <span className="truncate">{post.author.name}</span>
              </div>
            )}
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="ml-auto"
            >
              <Link 
                to={`/blog/${post.slug}`}
                className="typography-link typography-touch-target inline-flex items-center gap-1.5 sm:gap-2 font-semibold transition-colors px-2 sm:px-0"
                onMouseEnter={() => prefetchOnHover(post.slug)}
                aria-label={`Читать далее: ${post.title}`}
              >
                <span className="hidden sm:inline">Читать далее</span>
                <span className="sm:hidden">Читать</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
