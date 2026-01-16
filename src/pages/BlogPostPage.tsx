import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Calendar, Clock, User, ArrowLeft, Share2, BookOpen, Calculator } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Suspense, lazy, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BlogCard } from '@/components/blog/BlogCard';
import { BlogProgress } from '@/components/blog/BlogProgress';
import { BlogTOC } from '@/components/blog/BlogTOC';
import { BlogReadabilitySettings } from '@/components/blog/BlogReadabilitySettings';
import { BlogAnalytics } from '@/components/blog/BlogAnalytics';
import { BlogResourcePreloader } from '@/components/blog/BlogResourcePreloader';
import { BlogNavigation } from '@/components/blog/BlogNavigation';
import { OptimizedImage } from '@/components/blog/OptimizedImage';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { blogPosts } from '@/data/blogPosts';
import { categories } from '@/lib/data';
import { parseMarkdown } from '@/utils/markdown';

// Lazy load комментариев
const BlogComments = lazy(() => import('@/components/blog/BlogComments').then(module => ({ default: module.BlogComments })));

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const post = blogPosts.find(p => p.slug === slug && p.isPublished);
  
  // Scroll to top при загрузке страницы
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);
  
  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  // Конвертируем Markdown в HTML и очищаем от потенциально опасного кода
  const getMarkdownContent = (content: string) => {
    try {
      const rawMarkup = parseMarkdown(content);
      return DOMPurify.sanitize(rawMarkup);
    } catch (error) {
      console.error('Error parsing markdown:', error);
      return content.replace(/\n/g, '<br />');
    }
  };

  // Находим связанные калькуляторы
  const allCalculators = categories.flatMap(cat => cat.calculators);
  const relatedCalculators = post.relatedCalculators
    ? allCalculators.filter(calc => {
        // Ищем по href, так как у нас нет id в структуре калькуляторов
        return post.relatedCalculators?.some(relatedId => 
          calc.href.includes(relatedId)
        );
      })
    : [];

  // Находим похожие статьи (из той же категории, исключая текущую)
  const relatedPosts = blogPosts
    .filter(p => p.isPublished && p.id !== post.id && p.category.id === post.category.id)
    .slice(0, 3);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Ошибка при попытке поделиться:', err);
      }
    } else {
      // Fallback: копируем ссылку в буфер обмена
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <>
      <BlogResourcePreloader />
      <Helmet>
        <title>{post.seo.metaTitle || post.title}</title>
        <meta name="description" content={post.seo.metaDescription || post.excerpt} />
        {post.seo.keywords && (
          <meta name="keywords" content={post.seo.keywords.join(', ')} />
        )}
        <link rel="canonical" href={`/blog/${post.slug}`} />
        
        {/* Open Graph */}
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`/blog/${post.slug}`} />
        {post.featuredImage && (
          <meta property="og:image" content={post.featuredImage.url} />
        )}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        {post.featuredImage && (
          <meta name="twitter:image" content={post.featuredImage.url} />
        )}
        
        {/* Structured Data */}
        {post.structuredData && (
          <script type="application/ld+json">
            {JSON.stringify(post.structuredData)}
          </script>
        )}
      </Helmet>

      {/* Компонент прогресса чтения */}
      <BlogProgress 
        articleTitle={post.title}
        wordCount={post.wordCount || 0}
      />

      {/* Компонент аналитики */}
      <BlogAnalytics 
        articleId={post.id}
        articleTitle={post.title}
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Header />
        
        <main id="main-content" className="container mx-auto px-4 py-8">
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

          {/* Основной контент с TOC */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
              {/* Основная статья */}
              <article className="max-w-4xl">
                {/* Заголовок статьи */}
                <header className="mb-8">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <Badge 
                  className="text-sm"
                  style={{ backgroundColor: post.category.color }}
                  role="status"
                  aria-label={`Категория: ${post.category.name}`}
                >
                  {post.category.name}
                </Badge>
                {post.isFeatured && (
                  <Badge variant="secondary" role="status" aria-label="Рекомендуемая статья">
                    Рекомендуем
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6">
                {post.title}
              </h1>

              <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                {post.excerpt}
              </p>

              {/* Мета-информация */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" aria-hidden="true" />
                  <span>{post.author.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <time dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" aria-hidden="true" />
                  <span>{post.readingTime} мин чтения</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <BlogReadabilitySettings />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    aria-label="Поделиться статьей"
                  >
                    <Share2 className="w-4 h-4 mr-2" aria-hidden="true" />
                    Поделиться
                  </Button>
                </div>
              </div>

              {/* Изображение */}
              {post.featuredImage && (
                <div className="rounded-xl overflow-hidden mb-8">
                  <OptimizedImage
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt}
                    width={1200}
                    height={600}
                    className="w-full h-64 md:h-96"
                    priority={true}
                    sizes="(max-width: 768px) 100vw, 1200px"
                  />
                </div>
              )}
            </header>

            {/* Содержание статьи */}
            <div className="prose prose-lg max-w-none mb-12 
              prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-8 prose-headings:mb-4
              prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl
              prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
              prose-strong:text-foreground prose-strong:font-semibold
              prose-li:text-foreground prose-li:my-2
              prose-ul:my-6 prose-ul:list-disc prose-ul:pl-6
              prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-6
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:my-6
              prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
              prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-6
              prose-a:text-primary prose-a:underline prose-a:hover:text-primary/80
              prose-img:rounded-lg prose-img:my-6
              prose-hr:my-8 prose-hr:border-border
              prose-table:my-6 prose-table:border-collapse
              prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-3 prose-th:font-semibold
              prose-td:border prose-td:border-border prose-td:p-3
            ">
              <div 
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: getMarkdownContent(post.content) }}
              />
            </div>

            {/* Теги */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Теги статьи:</h2>
              <div className="flex flex-wrap gap-2" role="list" aria-label="Теги статьи">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary" role="listitem">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className="my-8" />

            {/* Информация об авторе */}
            <div className="bg-muted/50 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center" aria-hidden="true">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold mb-2">{post.author.name}</h2>
                  <p className="text-muted-foreground">{post.author.bio}</p>
                </div>
              </div>
            </div>
          </article>

          {/* Оглавление (Table of Contents) */}
          <aside className="hidden lg:block">
            <BlogTOC content={getMarkdownContent(post.content)} />
          </aside>
        </div>
      </div>

          {/* Навигация между статьями */}
          <div className="max-w-4xl mx-auto mb-12">
            <BlogNavigation currentPost={post} />
          </div>

          {/* Связанные калькуляторы */}
          {relatedCalculators.length > 0 && (
            <section className="max-w-4xl mx-auto mb-12" aria-labelledby="related-calculators-heading">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-6 h-6 text-primary" aria-hidden="true" />
                <h2 id="related-calculators-heading" className="text-2xl font-bold">Полезные калькуляторы</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" role="list">
                {relatedCalculators.map(calc => (
                  <Link
                    key={calc.href}
                    to={calc.href}
                    className="p-4 border rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-card"
                    role="listitem"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center" aria-hidden="true">
                        <Calculator className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold">{calc.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Перейти к расчету
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Похожие статьи */}
          {relatedPosts.length > 0 && (
            <section className="max-w-6xl mx-auto mb-12" aria-labelledby="related-posts-heading">
              <div className="flex items-center gap-2 mb-6">
                <BookOpen className="w-6 h-6 text-primary" aria-hidden="true" />
                <h2 id="related-posts-heading" className="text-2xl font-bold">Похожие статьи</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                {relatedPosts.map(relatedPost => (
                  <div key={relatedPost.id} role="listitem">
                    <BlogCard post={relatedPost} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Комментарии (lazy loaded) */}
          <section className="max-w-4xl mx-auto" aria-labelledby="comments-heading">
            <Suspense fallback={
              <div className="bg-card rounded-xl p-6 border">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-muted rounded w-1/4"></div>
                  <div className="h-32 bg-muted rounded"></div>
                </div>
              </div>
            }>
              <BlogComments articleId={post.id} />
            </Suspense>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default BlogPostPage;