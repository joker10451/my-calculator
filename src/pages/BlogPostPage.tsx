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
import { FadeInUp, StaggerContainer, StaggerItem } from '@/components/animations';

// Lazy load комментариев
const BlogComments = lazy(() => import('@/components/blog/BlogComments'));

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
                <FadeInUp>
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

                    <h1 className="text-h1 md:text-hero font-extrabold leading-tight mb-8">
                      {post.title}
                    </h1>

                    <p className="text-body md:text-body-lg text-muted-foreground mb-8 leading-relaxed">
                      {post.excerpt}
                    </p>

                    {/* Мета-информация */}
                    <div className="flex flex-wrap items-center gap-6 text-base text-muted-foreground mb-8">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5" aria-hidden="true" />
                        <span>{post.author.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" aria-hidden="true" />
                        <time dateTime={post.publishedAt}>
                          {formatDate(post.publishedAt)}
                        </time>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5" aria-hidden="true" />
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
                          <Share2 className="w-5 h-5 mr-2" aria-hidden="true" />
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
                </FadeInUp>

                {/* Содержание статьи */}
                <FadeInUp delay={0.2}>
                  <div className="prose prose-lg max-w-none mb-16 
              prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-12 prose-headings:mb-6
              prose-h1:text-h1 prose-h2:text-h2 prose-h3:text-h3 prose-h4:text-xl
              prose-p:text-body prose-p:leading-relaxed prose-p:mb-6
              prose-strong:text-foreground prose-strong:font-bold
              prose-li:text-body prose-li:my-3 prose-li:leading-relaxed
              prose-ul:my-8 prose-ul:list-disc prose-ul:pl-8 prose-ul:space-y-3
              prose-ol:my-8 prose-ol:list-decimal prose-ol:pl-8 prose-ol:space-y-3
              prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:my-8 prose-blockquote:text-body
              prose-code:bg-muted prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-base
              prose-pre:bg-muted prose-pre:p-6 prose-pre:rounded-lg prose-pre:overflow-x-auto prose-pre:my-8
              prose-a:text-primary prose-a:underline prose-a:hover:text-primary/80 prose-a:font-medium
              prose-img:rounded-lg prose-img:my-8
              prose-hr:my-12 prose-hr:border-border
              prose-table:my-8 prose-table:border-collapse
              prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-4 prose-th:font-bold prose-th:text-base
              prose-td:border prose-td:border-border prose-td:p-4 prose-td:text-base
            ">
                    <div
                      className="blog-content break-words"
                      style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                      dangerouslySetInnerHTML={{ __html: getMarkdownContent(post.content) }}
                    />
                  </div>
                </FadeInUp>

                {/* Теги */}
                <FadeInUp delay={0.3}>
                  <div className="mb-12">
                    <h2 className="text-h3 font-bold mb-6">Теги статьи:</h2>
                    <div className="flex flex-wrap gap-3" role="list" aria-label="Теги статьи">
                      {post.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-base px-4 py-2" role="listitem">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </FadeInUp>

                <Separator className="my-12" />

                {/* Информация об авторе */}
                <FadeInUp delay={0.4}>
                  <div className="bg-muted/50 rounded-xl p-8 mb-12">
                    <div className="flex items-start gap-6">
                      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center" aria-hidden="true">
                        <User className="w-10 h-10 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-h3 font-bold mb-3">{post.author.name}</h2>
                        <p className="text-body text-muted-foreground leading-relaxed">{post.author.bio}</p>
                      </div>
                    </div>
                  </div>
                </FadeInUp>
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
            <FadeInUp delay={0.5}>
              <section className="max-w-4xl mx-auto mb-16" aria-labelledby="related-calculators-heading">
                <div className="flex items-center gap-3 mb-8">
                  <Calculator className="w-7 h-7 text-primary" aria-hidden="true" />
                  <h2 id="related-calculators-heading" className="text-h2 font-bold">Полезные калькуляторы</h2>
                </div>
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" role="list">
                  {relatedCalculators.map(calc => (
                    <StaggerItem key={calc.href}>
                      <Link
                        to={calc.href}
                        className="p-6 border rounded-xl hover:shadow-md transition-all duration-300 hover:-translate-y-1 bg-card block"
                        role="listitem"
                      >
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center" aria-hidden="true">
                            <Calculator className="w-6 h-6 text-primary" />
                          </div>
                          <h3 className="text-body-lg font-bold">{calc.name}</h3>
                        </div>
                        <p className="text-base text-muted-foreground">
                          Перейти к расчету
                        </p>
                      </Link>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </section>
            </FadeInUp>
          )}

          {/* Похожие статьи */}
          {relatedPosts.length > 0 && (
            <FadeInUp delay={0.6}>
              <section className="max-w-6xl mx-auto mb-16" aria-labelledby="related-posts-heading">
                <div className="flex items-center gap-3 mb-8">
                  <BookOpen className="w-7 h-7 text-primary" aria-hidden="true" />
                  <h2 id="related-posts-heading" className="text-h2 font-bold">Похожие статьи</h2>
                </div>
                <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="list">
                  {relatedPosts.map(relatedPost => (
                    <StaggerItem key={relatedPost.id} role="listitem">
                      <BlogCard post={relatedPost} />
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              </section>
            </FadeInUp>
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