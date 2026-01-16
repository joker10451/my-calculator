/**
 * BlogCardSkeleton Component
 * 
 * Loading skeleton for BlogCard with shimmer effect.
 * Displays placeholder content while blog posts are loading.
 */

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface BlogCardSkeletonProps {
  variant?: 'default' | 'featured' | 'compact';
  showExcerpt?: boolean;
  showAuthor?: boolean;
  showReadingTime?: boolean;
}

export const BlogCardSkeleton = ({ 
  variant = 'default',
  showExcerpt = true,
  showAuthor = true,
  showReadingTime = true
}: BlogCardSkeletonProps) => {
  const cardClasses = {
    default: 'h-full p-lg',
    featured: 'h-full border-2 border-muted p-2xl',
    compact: 'p-md'
  };

  return (
    <Card className={cardClasses[variant]}>
      {/* Image Skeleton */}
      <Skeleton className="w-full h-48 rounded-t-lg mb-4" />
      
      <CardHeader className={variant === 'compact' ? 'pb-2 p-0' : 'pb-4 p-0'}>
        {/* Date and Reading Time */}
        <div className="flex items-center gap-4 mb-3">
          <Skeleton className="h-4 w-24" />
          {showReadingTime && <Skeleton className="h-4 w-16" />}
        </div>
        
        {/* Title */}
        <Skeleton className={`${
          variant === 'featured' ? 'h-8' : 'h-6'
        } w-full mb-2`} />
        <Skeleton className={`${
          variant === 'featured' ? 'h-8' : 'h-6'
        } w-3/4`} />
      </CardHeader>

      {showExcerpt && variant !== 'compact' && (
        <CardContent className="p-0">
          {/* Excerpt */}
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-14" />
          </div>
        </CardContent>
      )}

      <CardFooter className="pt-0 p-0">
        <div className="flex items-center justify-between w-full">
          {showAuthor && <Skeleton className="h-4 w-24" />}
          <Skeleton className="h-4 w-20 ml-auto" />
        </div>
      </CardFooter>
    </Card>
  );
};
