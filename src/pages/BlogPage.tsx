import { useState, useMemo, Suspense, lazy } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Calendar, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BlogCard } from '@/components/blog/BlogCard';
import { EnhancedBlogCard } from '@/components/blog/enhanced/EnhancedBlogCard';
import { BlogResourcePreloader } from '@/components/blog/BlogResourcePreloader';
import { HeroSection } from '@/components/blog/HeroSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { blogPosts } from '@/data/blogPosts';
import { blogCategories } from '@/data/blogCategories';
import type { BlogFilters } from '@/types/blog';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations';

// Lazy load GlassCard component for better performance
const GlassCard = lazy(() => import('@/components/ui/glass-card').then(module => ({ default: module.GlassCard })));

const BlogPage = () => {
  const [filters, setFilters] = useState<BlogFilters>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Получаем все уникальные теги
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    blogPosts.forEach(post => post.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, []);

  // Фильтрация постов
  const filteredPosts = useMemo(() => {
    return blogPosts.filter(post => {
      if (!post.isPublished) return false;
      
      // Поиск по заголовку и описанию
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!post.title.toLowerCase().includes(query) && 
            !post.excerpt.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Фильтр по категории
      if (filters.category && post.category.slug !== filters.category) {
        return false;
      }

      // Фильтр по тегам
      if (filters.tags && filters.tags.length > 0) {
        if (!filters.tags.some(tag => post.tags.includes(tag))) {
          return false;
        }
      }

      // Фильтр по рекомендуемым
      if (filters.featured && !post.isFeatured) {
        return false;
      }

      return true;
    });
  }, [searchQuery, filters]);

  // Сортировка постов (сначала рекомендуемые, потом по дате)
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [filteredPosts]);

  const featuredPosts = blogPosts.filter(post => post.isFeatured && post.isPublished);
  const recentPosts = blogPosts
    .filter(post => post.isPublished)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
  };

  return (
    <>
      <BlogResourcePreloader />
      <Helmet>
        <title>Блог о финансах и калькуляторах | Считай.RU</title>
        <meta 
          name="description" 
          content="Экспертные статьи о финансах, налогах, ипотеке, ЖКХ. Актуальная информация 2026 года, советы по экономии, расчеты и примеры." 
        />
        <meta name="keywords" content="финансовый блог, налоги 2026, ипотека, ЖКХ, калькуляторы, экономия" />
        <link rel="canonical" href="/blog" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        
        <main id="main-content">
          {/* Hero секция с анимацией */}
          <HeroSection
            title="Лучшие"
            highlightedText="финансовые"
            titleSuffix="калькуляторы России"
            description="Экспертные статьи о финансах, налогах, ипотеке и экономии. Актуальная информация и практические советы для 2026 года."
            height="large"
          />
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-lg sm:py-xl lg:py-2xl xl:py-3xl max-w-7xl">

          {/* Рекомендуемые статьи */}
          {featuredPosts.length > 0 && (
            <FadeInUp delay={0.2}>
              <section className="mb-2xl sm:mb-3xl lg:mb-4xl xl:mb-5xl" aria-labelledby="featured-posts-heading">
                <div className="flex items-center gap-2 sm:gap-3 mb-xl sm:mb-2xl lg:mb-3xl">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-primary" aria-hidden="true" />
                  <h2 id="featured-posts-heading" className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white">Рекомендуемые статьи</h2>
                </div>
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12" role="list">
                  {featuredPosts.map(post => (
                    <StaggerItem key={post.id} role="listitem">
                      <EnhancedBlogCard post={post} variant="featured" />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </section>
            </FadeInUp>
          )}

          {/* Поиск и фильтры */}
          <FadeInUp delay={0.3}>
            <Suspense fallback={
              <div className="p-md sm:p-lg lg:p-3xl xl:p-4xl mb-2xl sm:mb-3xl lg:mb-3xl xl:mb-4xl bg-background/50 backdrop-blur-sm rounded-2xl border">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                  <div className="flex-1 h-12 bg-muted/50 rounded animate-pulse" />
                  <div className="flex gap-3 sm:gap-4">
                    <div className="w-52 h-12 bg-muted/50 rounded animate-pulse" />
                    <div className="w-32 h-12 bg-muted/50 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            }>
              <GlassCard className="p-md sm:p-lg lg:p-3xl xl:p-4xl mb-2xl sm:mb-3xl lg:mb-3xl xl:mb-4xl" role="search" aria-label="Поиск и фильтры статей">
            <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
              {/* Поиск */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                  <Input
                    placeholder="Поиск по статьям..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 sm:pl-12 h-12 sm:h-14 text-lg bg-background/50 backdrop-blur-sm border-2 focus:border-primary transition-all"
                    aria-label="Поиск по статьям"
                  />
                </div>
              </div>

              {/* Фильтры */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? undefined : value }))}
                >
                  <SelectTrigger className="w-full sm:w-52 h-12 sm:h-14 text-lg bg-background/50 backdrop-blur-sm border-2 hover:border-primary transition-all" aria-label="Фильтр по категории">
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {blogCategories.map(category => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setFilters(prev => ({ ...prev, featured: !prev.featured }))}
                  className={`h-12 sm:h-14 px-5 sm:px-7 text-lg transition-all duration-300 ${
                    filters.featured 
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90 scale-105 shadow-lg' 
                      : 'bg-background/50 backdrop-blur-sm border-2 hover:border-primary hover:scale-105'
                  }`}
                  aria-label={filters.featured ? 'Показать все статьи' : 'Показать только рекомендуемые'}
                  aria-pressed={filters.featured}
                >
                  <Filter className="w-5 h-5 sm:mr-2" aria-hidden="true" />
                  <span className="hidden sm:inline">Рекомендуемые</span>
                </Button>

                {(searchQuery || Object.keys(filters).length > 0) && (
                  <Button 
                    variant="ghost" 
                    onClick={clearFilters} 
                    className="h-12 sm:h-14 px-5 sm:px-7 text-lg hover:bg-destructive/10 hover:text-destructive hover:scale-105 transition-all duration-300"
                    aria-label="Сбросить все фильтры"
                  >
                    Сбросить
                  </Button>
                )}
              </div>
            </div>

            {/* Теги */}
            <div className="flex flex-wrap gap-2 sm:gap-3 mt-lg sm:mt-xl lg:mt-2xl" role="group" aria-label="Фильтр по тегам">
              {allTags.slice(0, 10).map(tag => (
                <Badge
                  key={tag}
                  variant={filters.tags?.includes(tag) ? 'default' : 'secondary'}
                  className="text-sm md:text-base font-medium px-4 sm:px-5 py-2 sm:py-2.5 rounded-full min-h-[44px] min-w-[44px] inline-flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:shadow-md"
                  onClick={() => {
                    const currentTags = filters.tags || [];
                    const newTags = currentTags.includes(tag)
                      ? currentTags.filter(t => t !== tag)
                      : [...currentTags, tag];
                    setFilters(prev => ({ ...prev, tags: newTags.length > 0 ? newTags : undefined }));
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const currentTags = filters.tags || [];
                      const newTags = currentTags.includes(tag)
                        ? currentTags.filter(t => t !== tag)
                        : [...currentTags, tag];
                      setFilters(prev => ({ ...prev, tags: newTags.length > 0 ? newTags : undefined }));
                    }
                  }}
                  aria-label={`Фильтр по тегу ${tag}`}
                  aria-pressed={filters.tags?.includes(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </GlassCard>
            </Suspense>
          </FadeInUp>

          {/* Результаты поиска */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-xl sm:mb-2xl lg:mb-3xl xl:mb-4xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900 dark:text-white">
              {searchQuery || Object.keys(filters).length > 0 
                ? `Найдено статей: ${sortedPosts.length}` 
                : 'Все статьи'
              }
            </h2>
            <div className="flex items-center gap-2 text-base md:text-lg font-medium text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              <span aria-label="Сортировка по дате публикации">Сортировка по дате</span>
            </div>
          </div>

          {/* Список статей */}
          {sortedPosts.length > 0 ? (
            <FadeInUp delay={0.4}>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12" role="list" aria-label="Список статей">
                {sortedPosts.map(post => (
                  <StaggerItem key={post.id} role="listitem">
                    <EnhancedBlogCard post={post} />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </FadeInUp>
          ) : (
            <FadeInUp delay={0.4}>
              <div className="text-center py-2xl sm:py-3xl" role="status" aria-live="polite">
                <Search className="w-16 h-16 sm:w-20 sm:h-20 text-muted-foreground mx-auto mb-lg sm:mb-xl" aria-hidden="true" />
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-extrabold leading-tight text-gray-900 dark:text-white mb-3">Статьи не найдены</h3>
                <p className="text-xl md:text-2xl leading-relaxed text-gray-700 dark:text-gray-300 mb-lg sm:mb-xl px-4 max-w-[65ch] mx-auto">
                  Попробуйте изменить параметры поиска или сбросить фильтры
                </p>
                <Button onClick={clearFilters} className="min-h-[44px] min-w-[44px]" aria-label="Сбросить все фильтры">Сбросить фильтры</Button>
              </div>
            </FadeInUp>
          )}

          {/* Последние статьи */}
          {!searchQuery && Object.keys(filters).length === 0 && (
            <section className="mt-2xl sm:mt-3xl lg:mt-4xl xl:mt-5xl" aria-labelledby="recent-posts-heading">
              <h2 id="recent-posts-heading" className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900 dark:text-white mb-xl sm:mb-2xl lg:mb-3xl xl:mb-4xl">Последние публикации</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12" role="list">
                {recentPosts.map(post => (
                  <div key={post.id} role="listitem">
                    <EnhancedBlogCard post={post} variant="default" />
                  </div>
                ))}
              </div>
            </section>
          )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPage;