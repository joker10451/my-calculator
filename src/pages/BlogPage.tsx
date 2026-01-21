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

          <div className="container mx-auto px-4 py-12 md:py-16">

            {/* Рекомендуемые статьи */}
            {featuredPosts.length > 0 && (
              <FadeInUp delay={0.2}>
                <section className="mb-16 md:mb-24" aria-labelledby="featured-posts-heading">
                  <div className="flex items-center gap-3 mb-8">
                    <TrendingUp className="w-6 h-6 text-primary" aria-hidden="true" />
                    <h2 id="featured-posts-heading" className="text-3xl md:text-4xl font-bold leading-tight text-gray-900 dark:text-white">Рекомендуемые статьи</h2>
                  </div>
                  <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" role="list">
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
                <div className="p-6 md:p-8 mb-12 bg-background/50 backdrop-blur-sm rounded-2xl border">
                  <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 h-12 bg-muted/50 rounded animate-pulse" />
                    <div className="flex gap-4">
                      <div className="w-52 h-12 bg-muted/50 rounded animate-pulse" />
                      <div className="w-32 h-12 bg-muted/50 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              }>
                <GlassCard className="p-6 md:p-8 mb-12 md:mb-16" role="search" aria-label="Поиск и фильтры статей">
                  <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
                    {/* Поиск */}
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" aria-hidden="true" />
                        <Input
                          placeholder="Поиск по статьям..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 h-12 text-base bg-background/50 backdrop-blur-sm border-2 focus:border-primary transition-all"
                          aria-label="Поиск по статьям"
                        />
                      </div>
                    </div>

                    {/* Фильтры */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Select
                        value={filters.category || 'all'}
                        onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? undefined : value }))}
                      >
                        <SelectTrigger className="w-full sm:w-52 h-12 text-base bg-background/50 backdrop-blur-sm border-2 hover:border-primary transition-all" aria-label="Фильтр по категории">
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
                        className={`h-12 px-6 text-base transition-all duration-300 ${filters.featured
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                          : 'bg-background/50 backdrop-blur-sm border-2 hover:border-primary'
                          }`}
                        aria-label={filters.featured ? 'Показать все статьи' : 'Показать только рекомендуемые'}
                        aria-pressed={filters.featured}
                      >
                        <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
                        <span className="hidden sm:inline">Рекомендуемые</span>
                      </Button>

                      {(searchQuery || Object.keys(filters).length > 0) && (
                        <Button
                          variant="ghost"
                          onClick={clearFilters}
                          className="h-12 px-6 text-base hover:bg-destructive/10 hover:text-destructive transition-all duration-300"
                          aria-label="Сбросить все фильтры"
                        >
                          Сбросить
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Теги */}
                  <div className="flex flex-wrap gap-2 mt-6" role="group" aria-label="Фильтр по тегам">
                    {allTags.slice(0, 10).map(tag => (
                      <Badge
                        key={tag}
                        variant={filters.tags?.includes(tag) ? 'default' : 'secondary'}
                        className="text-sm font-medium px-4 py-2 rounded-full cursor-pointer transition-all duration-300 hover:scale-105"
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <h2 className="text-2xl md:text-3xl font-bold leading-tight text-gray-900 dark:text-white">
                {searchQuery || Object.keys(filters).length > 0
                  ? `Найдено статей: ${sortedPosts.length}`
                  : 'Все статьи'
                }
              </h2>
              <div className="flex items-center gap-2 text-base font-medium text-muted-foreground">
                <Calendar className="w-4 h-4" aria-hidden="true" />
                <span aria-label="Сортировка по дате публикации">Сортировка по дате</span>
              </div>
            </div>

            {/* Список статей */}
            {sortedPosts.length > 0 ? (
              <FadeInUp delay={0.4}>
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8" role="list" aria-label="Список статей">
                  {sortedPosts.map(post => (
                    <StaggerItem key={post.id} role="listitem">
                      <EnhancedBlogCard post={post} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </FadeInUp>
            ) : (
              <FadeInUp delay={0.4}>
                <div className="text-center py-16" role="status" aria-live="polite">
                  <Search className="w-16 h-16 text-muted-foreground mx-auto mb-6" aria-hidden="true" />
                  <h3 className="text-2xl font-bold leading-tight text-gray-900 dark:text-white mb-2">Статьи не найдены</h3>
                  <p className="text-lg text-muted-foreground mb-8 px-4 max-w-[65ch] mx-auto">
                    Попробуйте изменить параметры поиска или сбросить фильтры
                  </p>
                  <Button onClick={clearFilters} aria-label="Сбросить все фильтры">Сбросить фильтры</Button>
                </div>
              </FadeInUp>
            )}

            {/* Последние статьи */}
            {!searchQuery && Object.keys(filters).length === 0 && (
              <section className="mt-24" aria-labelledby="recent-posts-heading">
                <h2 id="recent-posts-heading" className="text-3xl md:text-4xl font-bold leading-tight text-gray-900 dark:text-white mb-12">Последние публикации</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8" role="list">
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