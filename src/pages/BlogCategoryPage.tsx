import { useParams, Navigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Filter } from 'lucide-react';
import { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BlogCard } from '@/components/blog/BlogCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { blogPosts } from '@/data/blogPosts';
import { blogCategories } from '@/data/blogCategories';

const BlogCategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  
  const category = blogCategories.find(cat => cat.slug === slug);
  
  if (!category) {
    return <Navigate to="/blog" replace />;
  }

  // Фильтруем посты по категории
  const categoryPosts = useMemo(() => {
    let posts = blogPosts.filter(post => 
      post.isPublished && post.category.id === category.id
    );

    if (showFeaturedOnly) {
      posts = posts.filter(post => post.isFeatured);
    }

    // Сортируем: сначала рекомендуемые, потом по дате
    return posts.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [category.id, showFeaturedOnly]);

  // Получаем все теги для этой категории
  const categoryTags = useMemo(() => {
    const tags = new Set<string>();
    blogPosts
      .filter(post => post.isPublished && post.category.id === category.id)
      .forEach(post => post.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [category.id]);

  const featuredCount = categoryPosts.filter(post => post.isFeatured).length;

  return (
    <>
      <Helmet>
        <title>{category.seo.metaTitle || `${category.name} | Блог Считай.RU`}</title>
        <meta 
          name="description" 
          content={category.seo.metaDescription || category.description} 
        />
        <link rel="canonical" href={`/blog/category/${category.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={category.name} />
        <meta property="og:description" content={category.description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`/blog/category/${category.slug}`} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        
        <main className="container mx-auto px-4 py-8">
          {/* Навигация */}
          <div className="mb-8">
            <Link 
              to="/blog" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Вернуться к блогу
            </Link>
          </div>

          {/* Заголовок категории */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: category.color }}
              >
                <Calendar className="w-6 h-6" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold">
                {category.name}
              </h1>
            </div>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              {category.description}
            </p>

            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>{categoryPosts.length} статей</span>
              {featuredCount > 0 && (
                <span>{featuredCount} рекомендуемых</span>
              )}
            </div>
          </div>

          {/* Теги категории */}
          {categoryTags.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Популярные темы:</h2>
              <div className="flex flex-wrap gap-2">
                {categoryTags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Фильтры */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <span className="text-lg font-semibold">
                {showFeaturedOnly ? 'Рекомендуемые статьи' : 'Все статьи'}
              </span>
              <span className="text-muted-foreground">({categoryPosts.length})</span>
            </div>

            {featuredCount > 0 && (
              <Button
                variant={showFeaturedOnly ? 'default' : 'outline'}
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                {showFeaturedOnly ? 'Показать все' : 'Только рекомендуемые'}
              </Button>
            )}
          </div>

          {/* Список статей */}
          {categoryPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryPosts.map(post => (
                <BlogCard 
                  key={post.id} 
                  post={post} 
                  variant={post.isFeatured ? 'featured' : 'default'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: `${category.color}20` }}
              >
                <Calendar className="w-8 h-8" style={{ color: category.color }} />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {showFeaturedOnly ? 'Нет рекомендуемых статей' : 'Статьи не найдены'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {showFeaturedOnly 
                  ? 'В этой категории пока нет рекомендуемых статей'
                  : 'В этой категории пока нет опубликованных статей'
                }
              </p>
              {showFeaturedOnly && featuredCount === 0 && (
                <Button onClick={() => setShowFeaturedOnly(false)}>
                  Показать все статьи
                </Button>
              )}
            </div>
          )}

          {/* Информация о категории */}
          <div className="mt-16 bg-card rounded-xl p-8 border">
            <div className="max-w-3xl mx-auto text-center">
              <div 
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: category.color }}
              >
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-4">О категории "{category.name}"</h2>
              <p className="text-muted-foreground leading-relaxed">
                {category.description} Здесь вы найдете экспертные статьи, 
                актуальную информацию и практические советы от наших специалистов.
              </p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogCategoryPage;