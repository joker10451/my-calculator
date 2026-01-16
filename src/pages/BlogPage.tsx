import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Calendar, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogResourcePreloader } from '@/components/blog/BlogResourcePreloader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { blogPosts } from '@/data/blogPosts';
import { blogCategories } from '@/data/blogCategories';
import type { BlogFilters } from '@/types/blog';

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
        
        <main id="main-content" className="container mx-auto px-4 py-8">
          {/* Hero секция */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Финансовый блог
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Экспертные статьи о финансах, налогах, ипотеке и экономии. 
              Актуальная информация и практические советы для 2026 года.
            </p>
          </div>

          {/* Рекомендуемые статьи */}
          {featuredPosts.length > 0 && (
            <section className="mb-12" aria-labelledby="featured-posts-heading">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-6 h-6 text-primary" aria-hidden="true" />
                <h2 id="featured-posts-heading" className="text-2xl font-bold">Рекомендуемые статьи</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                {featuredPosts.map(post => (
                  <div key={post.id} role="listitem">
                    <BlogCard post={post} variant="featured" />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Поиск и фильтры */}
          <div className="bg-card rounded-xl p-6 mb-8 border" role="search" aria-label="Поиск и фильтры статей">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Поиск */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                  <Input
                    placeholder="Поиск по статьям..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    aria-label="Поиск по статьям"
                  />
                </div>
              </div>

              {/* Фильтры */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Select
                  value={filters.category || 'all'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value === 'all' ? undefined : value }))}
                >
                  <SelectTrigger className="w-full sm:w-48" aria-label="Фильтр по категории">
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
                  className={filters.featured ? 'bg-primary text-primary-foreground' : ''}
                  aria-label={filters.featured ? 'Показать все статьи' : 'Показать только рекомендуемые'}
                  aria-pressed={filters.featured}
                >
                  <Filter className="w-4 h-4 mr-2" aria-hidden="true" />
                  Рекомендуемые
                </Button>

                {(searchQuery || Object.keys(filters).length > 0) && (
                  <Button variant="ghost" onClick={clearFilters} aria-label="Сбросить все фильтры">
                    Сбросить
                  </Button>
                )}
              </div>
            </div>

            {/* Теги */}
            <div className="flex flex-wrap gap-2 mt-4" role="group" aria-label="Фильтр по тегам">
              {allTags.slice(0, 10).map(tag => (
                <Badge
                  key={tag}
                  variant={filters.tags?.includes(tag) ? 'default' : 'secondary'}
                  className="cursor-pointer hover:bg-primary/80"
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
          </div>

          {/* Результаты поиска */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              {searchQuery || Object.keys(filters).length > 0 
                ? `Найдено статей: ${sortedPosts.length}` 
                : 'Все статьи'
              }
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span aria-label="Сортировка по дате публикации">Сортировка по дате</span>
            </div>
          </div>

          {/* Список статей */}
          {sortedPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list" aria-label="Список статей">
              {sortedPosts.map(post => (
                <div key={post.id} role="listitem">
                  <BlogCard post={post} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12" role="status" aria-live="polite">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" aria-hidden="true" />
              <h3 className="text-xl font-semibold mb-2">Статьи не найдены</h3>
              <p className="text-muted-foreground mb-4">
                Попробуйте изменить параметры поиска или сбросить фильтры
              </p>
              <Button onClick={clearFilters} aria-label="Сбросить все фильтры">Сбросить фильтры</Button>
            </div>
          )}

          {/* Последние статьи */}
          {!searchQuery && Object.keys(filters).length === 0 && (
            <section className="mt-16" aria-labelledby="recent-posts-heading">
              <h2 id="recent-posts-heading" className="text-2xl font-bold mb-6">Последние публикации</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6" role="list">
                {recentPosts.map(post => (
                  <div key={post.id} role="listitem">
                    <BlogCard post={post} variant="compact" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPage;