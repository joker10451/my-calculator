import React, { lazy, Suspense } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  ChevronRight, 
  Share2, 
  Bookmark, 
  MessageSquare, 
  ArrowLeft,
  ChevronUp,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Eye,
  Heart,
  User,
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { blogPosts } from '@/data/blogPosts';
import { generatedArticles } from '@/data/blogArticlesGenerated';
import { allGeneratedArticles } from '@/data/blogArticlesGenerated2';
import { parseMarkdown } from '@/utils/markdown';
import { AuthorBio } from '@/components/blog/AuthorBio';
import { BlogCard } from '@/components/blog/BlogCard';
import '@/styles/blog.css';

// Lazy load комментариев
const BlogComments = lazy(() => import('@/components/blog/BlogComments'));

// Объединяем все статьи для поиска
const allPosts = [...blogPosts, ...generatedArticles, ...allGeneratedArticles];

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
  const [isLiked, setIsLiked] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const shareUrl = window.location.href;
  const shareTitle = post.title;

  return (
    <div className="blog-post-container min-h-screen bg-slate-50">
      {/* Прогресс-бар чтения */}
      <motion.div
        className="reading-progress-bar"
        style={{ scaleX }}
      />

      {/* Иммерсивная шапка (Hero) */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={post.featuredImage?.url || '/blog/default-hero.png'}
            alt={post.featuredImage?.alt || post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        </div>

        <div className="absolute inset-0 z-10 flex flex-col justify-end">
          <div className="container mx-auto px-4 pb-12 md:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl"
            >
              <div className="flex flex-wrap gap-3 mb-6">
                <Link to={`/blog?category=${post.category.slug}`}>
                  <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none py-1.5 px-4 text-sm font-semibold rounded-full shadow-lg shadow-blue-900/20">
                    {post.category.name}
                  </Badge>
                </Link>
                {post.isFeatured && (
                  <Badge variant="outline" className="text-amber-400 border-amber-400/50 bg-amber-400/10 backdrop-blur-md py-1.5 px-4 text-sm font-semibold rounded-full">
                    🔥 Рекомендовано экспертами
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-[1.1] tracking-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center gap-6 text-slate-300 text-sm md:text-base font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden">
                    <img src={post.author.avatar || '/authors/default.png'} alt={post.author.name} className="w-full h-full object-cover" />
                  </div>
                  <span>{post.author.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-blue-400" />
                  <span>{new Date(post.publishedAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={18} className="text-blue-400" />
                  <span>{post.readingTime} мин. чтения</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 -mt-12 md:-mt-20 relative z-20 pb-24">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Левая колонка: Контент */}
          <div className="flex-1 max-w-4xl">
            <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
              {/* Хлебные крошки и тулбар внутри контента */}
              <div className="px-6 md:px-12 pt-10 pb-6 border-b border-slate-50 flex flex-wrap justify-between items-center gap-4">
                <nav className="flex items-center gap-2 text-sm text-slate-400">
                  <Link to="/blog" className="hover:text-blue-600 transition-colors">Блог</Link>
                  <ChevronRight size={14} />
                  <span className="text-slate-600 truncate max-w-[200px]">{post.category.name}</span>
                </nav>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsLiked(!isLiked)}
                    className={`p-2.5 rounded-full border transition-all ${isLiked ? 'bg-red-50 border-red-100 text-red-500' : 'bg-white border-slate-200 text-slate-400 hover:border-red-200 hover:text-red-500'}`}
                  >
                    <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-2.5 rounded-full border transition-all ${isBookmarked ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-white border-slate-200 text-slate-400 hover:border-blue-200 hover:text-blue-600'}`}
                  >
                    <Bookmark size={20} fill={isBookmarked ? "currentColor" : "none"} />
                  </button>
                  <div className="h-6 w-px bg-slate-200 mx-1" />
                  <button 
                    onClick={copyToClipboard}
                    className="p-2.5 rounded-full border bg-white border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all relative"
                  >
                    <Copy size={20} />
                    {isCopied && <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded">Скопировано!</span>}
                  </button>
                </div>
              </div>

              {/* Основной текст статьи */}
              <article className="blog-content px-6 md:px-12 py-12 prose prose-slate prose-lg max-w-none">
                <div dangerouslySetInnerHTML={{ __html: parseMarkdown(post.content) }} />
              </article>

              {/* Теги */}
              <div className="px-6 md:px-12 py-8 bg-slate-50/50 border-t border-slate-100 flex flex-wrap gap-2">
                {post.tags.map(tag => (
                  <Link key={tag} to={`/blog?tag=${tag}`}>
                    <span className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all font-medium">
                      #{tag}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Блок автора */}
            <div className="mt-12">
              <AuthorBio author={post.author} />
            </div>

            {/* Секция комментариев */}
            <div className="mt-12 bg-white rounded-3xl shadow-xl border border-slate-100 p-8 md:p-12">
              <div className="flex items-center gap-3 mb-10">
                <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shadow-blue-200">
                  <MessageSquare size={24} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Обсуждение <span className="text-slate-400 font-normal">({post.shareCount || 0})</span></h2>
              </div>
              <Suspense fallback={<div className="h-40 animate-pulse bg-slate-100 rounded-2xl" />}>
                <BlogComments articleId={post.id} />
              </Suspense>
            </div>
          </div>

          {/* Правая колонка: Сайдбар */}
          <aside className="lg:w-96 flex flex-col gap-10">
            {/* Оглавление - Липкое */}
            <div className="sticky top-24 bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Info size={20} className="text-blue-600" />
                Содержание
              </h3>
              <nav className="space-y-4">
                {/* Оглавление генерируется автоматически из заголовков (упрощенная версия) */}
                <ul className="space-y-3">
                  <li className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-3 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 group-hover:scale-150 transition-all" />
                    <span>Основные положения</span>
                  </li>
                  <li className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-3 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 group-hover:scale-150 transition-all" />
                    <span>Изменения в 2026 году</span>
                  </li>
                  <li className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-3 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 group-hover:scale-150 transition-all" />
                    <span>Как сэкономить</span>
                  </li>
                  <li className="text-slate-600 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-3 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-600 group-hover:scale-150 transition-all" />
                    <span>Частые вопросы</span>
                  </li>
                </ul>
              </nav>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <h4 className="font-bold text-slate-900 mb-4">Поделиться опытом</h4>
                <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                  Сталкивались с трудностями при оформлении? Расскажите об этом в комментариях.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={copyToClipboard}>
                    <Share2 size={16} className="mr-2" />
                    Ссылка
                  </Button>
                </div>
              </div>
            </div>

            {/* Карточка калькулятора */}
            {post.relatedCalculators && post.relatedCalculators.length > 0 && (
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl shadow-blue-200/50 p-8 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white/10 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150" />
                <Zap size={48} className="text-amber-400 mb-6 relative z-10" />
                <h3 className="text-2xl font-bold mb-4 relative z-10">Рассчитать онлайн</h3>
                <p className="text-blue-100 mb-8 relative z-10">
                  Используйте наш профессиональный калькулятор для точного расчета за 1 минуту.
                </p>
                <Link to={`/calculator/${post.relatedCalculators[0]}`}>
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold py-6 rounded-2xl relative z-10 shadow-lg shadow-black/10">
                    Перейти к расчету
                    <ChevronRight size={18} className="ml-2" />
                  </Button>
                </Link>
              </div>
            )}

            {/* Читайте также */}
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8">
              <h3 className="text-xl font-bold text-slate-900 mb-8">Популярное сейчас</h3>
              <div className="space-y-8">
                {allPosts.slice(0, 3).map((item, idx) => (
                  <Link key={idx} to={`/blog/${item.slug}`} className="flex gap-4 group">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                      <img src={item.featuredImage?.url} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2 text-slate-400 text-xs">
                        <Clock size={12} />
                        <span>{item.readingTime} мин</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Секция похожих статей внизу */}
        <div className="mt-24">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold text-slate-900 leading-tight">Вам также может быть <br /> интересно</h2>
            <Link to="/blog">
              <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-bold px-6 rounded-full border border-blue-100">
                Все статьи
                <ArrowLeft size={18} className="ml-2 rotate-180" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {allPosts.filter(p => p.id !== post.id).slice(0, 3).map(p => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        </div>
      </main>

      {/* Кнопка наверх */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-10 right-10 z-50 p-4 bg-white border border-slate-200 text-blue-600 rounded-full shadow-2xl shadow-blue-200/50 hover:bg-blue-50 transition-all"
          >
            <ChevronUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <footer className="bg-slate-900 py-24 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 text-blue-400 mb-6 px-4 py-2 rounded-full border border-blue-400/30 bg-blue-400/5">
              <ShieldCheck size={20} />
              <span className="text-sm font-bold uppercase tracking-wider">Expert Verified Content</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Остались вопросы?</h2>
            <p className="text-slate-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
              Наши финансовые эксперты всегда готовы помочь с расчетами любой сложности. Подписывайтесь на нашу рассылку, чтобы быть в курсе изменений.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <input 
                type="email" 
                placeholder="Ваш email" 
                className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white w-full md:w-80 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 py-4 px-10 rounded-2xl font-bold shadow-xl shadow-blue-900/40">
                Подписаться
              </Button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}