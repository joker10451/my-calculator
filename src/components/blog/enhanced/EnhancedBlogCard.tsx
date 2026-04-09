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
      imageHeight: 'h-48 sm:h-52',
      padding: 'p-4 sm:p-5',
      borderRadius: 'rounded-xl',
      border: '',
      titleSize: 'min-h-[3.5rem]',
    },
    featured: {
      imageHeight: 'h-52 sm:h-64',
      padding: 'p-5 sm:p-6',
      borderRadius: 'rounded-xl sm:rounded-2xl',
      border: 'border-2',
      titleSize: 'min-h-[4rem]',
    },
    hero: {
      imageHeight: 'h-64 sm:h-80',
      padding: 'p-6 sm:p-8',
      borderRadius: 'rounded-xl sm:rounded-2xl',
      border: 'border-2',
      titleSize: 'min-h-[4rem]',
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
      className="h-full relative group"
      style={willChangeStyles.transform}
    >
      {/* Эффект свечения для рекомендуемых статей */}
      {post.isFeatured && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />
      )}

      <Card
        className={`
          h-full overflow-hidden relative
          ${config.borderRadius}
          ${config.border}
          bg-white/95 dark:bg-gray-900/85 backdrop-blur-sm
          border-white/20 dark:border-white/10
          shadow-[0_8px_20px_0_rgba(15,23,42,0.08)]
          hover:shadow-[0_12px_28px_0_rgba(15,23,42,0.14)]
          transition-all duration-500
        `}
      >
        {/* Эффект блика при наведении */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none overflow-hidden transition-opacity duration-700">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-br from-white/10 via-transparent to-transparent rotate-12 -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
        </div>

          <div className={`relative overflow-hidden ${config.imageHeight}`}>
            {/* Изображение с эффектом зума при наведении */}
            <motion.div
              className="w-full h-full"
              variants={imageZoom}
              initial="initial"
              whileHover="hover"
            >
              <OptimizedImage
                src={post.featuredImage?.url || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=420&fit=crop&q=80'}
                alt={post.featuredImage?.alt || post.title}
                width={post.featuredImage?.width || 800}
                height={post.featuredImage?.height || 420}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                priority={variant === 'featured' || variant === 'hero'}
              />
            </motion.div>

            {/* Градиентный оверлей */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

            {/* Бейдж "Рекомендуем" */}
            {post.isFeatured && (
              <Badge
                className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 shadow-xl text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full"
                role="status"
                aria-label="Рекомендуемая статья"
              >
                ⭐ Рекомендуем
              </Badge>
            )}

            {/* Бейдж категории с иконкой (справа сверху) */}
            <Badge
              className="absolute top-3 right-3 flex items-center gap-1.5 text-white border-0 shadow-lg font-bold px-3 py-1.5 text-xs sm:text-sm rounded-full backdrop-blur-md opacity-90 hover:opacity-100 transition-opacity"
              style={{ backgroundColor: `${categoryColor}CC` }}
              role="status"
              aria-label={`Категория: ${post.category.name}`}
            >
              <CategoryIcon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{post.category.name}</span>
            </Badge>

          </div>
        <CardHeader className={`${config.padding} pt-6 pb-2`}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <div className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            </div>
            {showReadingTime && (
              <div className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{post.readingTime} мин</span>
              </div>
            )}
          </div>
          <h3 className={`text-xl md:text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 ${config.titleSize}`}>
            <Link
              to={`/blog/${post.slug}`}
              className="line-clamp-2"
              onMouseEnter={() => prefetchOnHover(post.slug)}
              aria-label={`Читать статью: ${post.title}`}
            >
              {post.title}
            </Link>
          </h3>
        </CardHeader>

        {showExcerpt && (
          <CardContent className={`${config.padding} py-2`}>
            <p className="text-sm md:text-base leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
              {post.excerpt}
            </p>

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2" role="list">
                {post.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-800 px-2 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        )}

        <CardFooter className={`${config.padding} mt-auto pt-4 pb-6`}>
          <div className="flex items-center justify-between w-full">
            {showAuthor && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-gray-800 shadow-sm transition-transform duration-300 group-hover:scale-110">
                  {post.author.avatar ? (
                    <img 
                      src={post.author.avatar} 
                      alt={post.author.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                    {post.author.name}
                  </span>
                  {post.author.specialization && (
                    <span className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {post.author.specialization}
                    </span>
                  )}
                </div>
              </div>
            )}

            <Link
              to={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:gap-2 transition-all duration-300"
              aria-label={`Читать далее: ${post.title}`}
            >
              <span>Читать</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
