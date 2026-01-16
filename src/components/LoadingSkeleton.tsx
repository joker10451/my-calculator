import { Skeleton } from "@/components/ui/skeleton";

export const CalculatorLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Input Form Skeleton */}
          <div className="lg:col-span-3 space-y-8">
            <div className="glass-card p-6 space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Results Skeleton */}
          <div className="lg:col-span-2">
            <div className="glass-card p-6 space-y-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="pt-4 space-y-3">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const PageLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-12 w-96 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
      </div>
    </div>
  );
};

export const BlogLoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Skeleton */}
        <div className="mb-12">
          <Skeleton className="h-16 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2" />
        </div>

        {/* Search Bar Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-12 w-full max-w-2xl" />
        </div>

        {/* Blog Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
      <p className="text-sm text-muted-foreground">Загрузка...</p>
    </div>
  </div>
);
