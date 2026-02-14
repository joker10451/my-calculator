/**
 * EnhancedBlogCardSkeleton Component
 * 
 * Loading skeleton for EnhancedBlogCard with shimmer effect.
 * Displays placeholder content while blog posts are loading.
 */

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface EnhancedBlogCardSkeletonProps {
  variant?: 'default' | 'featured' | 'hero';
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showReadingTime?: boolean;
}

export const EnhancedBlogCardSkeleton = ({ 
  variant = 'default',
  showExcerpt = true,
  showAuthor = true,
  showReadingTime = true
}: EnhancedBlogCardSkeletonProps) => {
  // Конфигурация для разных вариантов
  const variantConfig = {
    default: {
      imageHeight: 'h-[280px]',
      padding: 'p-lg',
      borderRadius: 'rounded-2xl',
      border: '',
      titleSize: 'h-6',
    },
    featured: {
      imageHeight: 'h-[360px]',
      padding: 'p-2xl',
      borderRadius: 'rounded-3xl',
      border: 'border-2 border-muted',
      titleSize: 'h-8',
    },
    hero: {
      imageHeight: 'h-[500px]',
      padding: 'p-2xl',
      borderRadius: 'rounded-3xl',
      border: 'border-2 border-muted',
      titleSize: 'h-10',
    },
  };

  const config = variantConfig[variant];

  return (
    <Card 
      className={`
        h-full overflow-hidden
        ${config.borderRadius}
        ${config.border}
      `}
    >
      {/* Image Skeleton with Badges */}
      <div className={`relative ${config.imageHeight}`}>
        <Skeleton className="w-full h-full" />
        
        {/* Category Badge Skeleton */}
        <div className="absolute top-4 right-4">
          <Skeleton className="h-7 w-24 rounded-full" />
        </div>
      </div>
      
      <CardHeader className={config.padding}>
        {/* Date and Reading Time */}
        <div className="flex items-center gap-4 mb-3">
          <Skeleton className="h-4 w-28" />
          {showReadingTime && <Skeleton className="h-4 w-16" />}
        </div>
        
        {/* Title */}
        <div className="space-y-2">
          <Skeleton className={`${config.titleSize} w-full`} />
          <Skeleton className={`${config.titleSize} w-4/5`} />
        </div>
      </CardHeader>

      {showExcerpt && (
        <CardContent className={`${config.padding} pt-0`}>
          {/* Excerpt */}
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
          </div>
        </CardContent>
      )}

      <CardFooter className={`${config.padding} pt-0`}>
        <div className="flex items-center justify-between w-full">
          {showAuthor && <Skeleton className="h-4 w-28" />}
          <Skeleton className="h-4 w-24 ml-auto" />
        </div>
      </CardFooter>
    </Card>
  );
};
