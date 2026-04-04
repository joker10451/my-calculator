import React, { lazy, Suspense, useMemo } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  ChevronRight,
  MessageSquare,
  ArrowLeft,
  ChevronUp,
  Copy,
  Share2,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/data/blogPosts';
import { generatedArticles } from '@/data/blogArticlesGenerated';
import { allGeneratedArticles } from '@/data/blogArticlesGenerated2';
import { parseMarkdown } from '@/utils/markdown';
import DOMPurify from 'dompurify';
import { AuthorBio } from '@/components/blog/AuthorBio';
import BlogRecommendations from '@/components/blog/BlogRecommendations';
import BlogShare from '@/components/blog/BlogShare';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { generateArticleSchema, generateFAQSchema } from '@/utils/seoSchemas';
import { countApprovedComments } from '@/services/commentService';
import '@/styles/blog.css';

// Lazy load комментариев
const BlogComments = lazy(() => import('@/components/blog/BlogComments'));

// Объединяем все статьи для поиска
const allPosts = [...blogPosts, ...generatedArticles, ...allGeneratedArticles];

const SITE_URL = 'https://schitay-online.ru';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = allPosts.find((p) => p.slug === slug);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [showScrollTop, setShowScrollTop] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const [commentCount, setCommentCount] = React.useState(0);
  const [showShareDialog, setShowShareDialog] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (post) {
      const count = countApprovedComments(post.id);
      setCommentCount(count);
    }
  }, [post]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const currentIndex = useMemo(() => allPosts.findIndex(p => p.slug === slug), [slug]);
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

  const articleSchema = useMemo(() => {
    if (!post) return null;
    return generateArticleSchema(
      post.title,
      post.excerpt,
      `${SITE_URL}/blog/${post.slug}`,
      post.publishedAt,
      post.updatedAt,
      post.featuredImage?.url
    );
  }, [post]);

  const faqSchema = useMemo(() => {
    if (!post) return null;
    const faqs: Array<{ question: string; answer: string }> = [];
    const content = post.content;
    const faqRegex = /### (Вопрос[:\s]+.*?)\n([\s\S]*?)(?=###|$)/g;
    let match;
    while ((match = faqRegex.exec(content)) !== null) {
      faqs.push({ question: match[1].trim(), answer: match[2].trim() });
    }
    return faqs.length > 0 ? generateFAQSchema(faqs) : null;
  }, [post]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      {/* SEO */}
      <script type="application/ld+json">
        {JSON.stringify(articleSchema)}
      </script>
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}

      {/* Прогресс-бар чтения */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 bg-blue-600 z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Кнопка наверх */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-4 bg-blue-600 text-white rounded-full shadow-2xl z-50 hover:bg-blue-700 transition-colors"
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Share Dialog */}
      {showShareDialog && (
        <BlogShare post={post} shareCount={commentCount} />
      )}

      {/* Имерсивный Hero Header */}
      <div className="relative h-[60vh] min-h-[450px] overflow-hidden">
        <div className="absolute inset-0 bg-slate-900">
          <img
            src={post.featuredImage?.url || '/blog/default-hero.png'}
            alt={post.featuredImage?.alt || post.title}
            className="w-full h-full object-cover opacity-60 scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = '/blog/default-hero.png'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 opacity-90" />
        </div>

        <div className="container mx-auto px-4 h-full relative flex flex-col justify-end pb-24">
          <Link to="/blog" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-12 group">
            <div className="bg-white/10 p-2 rounded-full backdrop-blur-md group-hover:bg-white/20">
              <ArrowLeft size={18} />
            </div>
            <span className="font-medium">Вернуться к списку статей</span>
          </Link>

          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-wrap gap-4 mb-8">
                <span className="px-5 py-2 bg-blue-600 text-white text-sm font-bold rounded-full tracking-wider uppercase">
                  {post.category.name}
                </span>
                <div className="flex items-center gap-4 text-white/80 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span>{new Date(post.publishedAt).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} />
                    <span>{post.readingTime} мин на чтение</span>
                  </div>
                </div>
              </div>

              <h1 className="text-4xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                {post.title}
              </h1>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl bg-white/10">
                    <img
                      src={post.author.avatar || '/authors/default.png'}
                      alt={post.author.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/authors/default.png'; }}
                    />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{post.author.name}</div>
                    <div className="text-white/60 text-sm font-medium">{post.author.specialization || 'Эксперт'}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <main id="main-content" className="container mx-auto px-4 -mt-16 md:-mt-24 relative z-20 pb-24">
        {/* Одноколоночный макет по центру */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden">
            {/* Тулбар */}
            <div className="px-8 md:px-14 pt-12 pb-8 border-b border-slate-50 flex flex-wrap justify-between items-center gap-6">
              <nav className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                <Link to="/blog" className="hover:text-blue-600 transition-colors">Блог</Link>
                <ChevronRight size={14} />
                <span className="text-slate-600">{post.category.name}</span>
              </nav>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareDialog(true)}
                  className="rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Share2 size={18} className="mr-2" />
                  Поделиться
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 relative"
                >
                  <Copy size={18} className="mr-2" />
                  {isCopied ? "Скопировано" : "Копировать ссылку"}
                </Button>
              </div>
            </div>

            {/* Основной контент */}
            <article className="blog-content px-8 md:px-14 py-12 md:py-20 max-w-none">
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(parseMarkdown(post.content)) }} />
            </article>

            {/* Теги */}
            <div className="px-8 md:px-14 py-10 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-3">
              {post.tags.map(tag => (
                <Link key={tag} to={`/blog?tag=${tag}`}>
                  <span className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-all font-semibold shadow-sm">
                    #{tag}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Блок автора */}
          <div className="mt-16">
            <AuthorBio author={post.author} />
          </div>

          {/* Рекомендации */}
          <div className="mt-16">
            <BlogRecommendations
              relatedArticles={allPosts.filter(p => p.slug !== slug && p.category.id === post.category.id).slice(0, 3)}
              articlesTitle="Читайте также"
            />
          </div>

          {/* Навигация prev/next */}
          {(prevPost || nextPost) && (
            <div className="mt-16 grid md:grid-cols-2 gap-6">
              {prevPost ? (
                <Link to={`/blog/${prevPost.slug}`} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all group">
                  <div className="flex items-center gap-2 text-slate-400 text-sm mb-2">
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Предыдущая статья
                  </div>
                  <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">{prevPost.title}</div>
                </Link>
              ) : <div />}
              {nextPost ? (
                <Link to={`/blog/${nextPost.slug}`} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-slate-300 transition-all group text-right">
                  <div className="flex items-center justify-end gap-2 text-slate-400 text-sm mb-2">
                    Следующая статья
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">{nextPost.title}</div>
                </Link>
              ) : <div />}
            </div>
          )}

          {/* Секция комментариев */}
          <div className="mt-16 bg-white rounded-[2.5rem] shadow-xl border border-slate-100 p-8 md:p-14">
            <div className="flex items-center gap-4 mb-12">
              <div className="bg-blue-600 p-4 rounded-3xl text-white shadow-xl shadow-blue-200">
                <MessageSquare size={28} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Комментарии <span className="text-slate-400 font-normal ml-2">({commentCount})</span></h2>
            </div>
            <Suspense fallback={<div className="h-64 animate-pulse bg-slate-50 rounded-3xl" />}>
              <BlogComments articleId={post.id} />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
