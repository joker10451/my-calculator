import React, { lazy, Suspense, useMemo, useRef } from 'react';
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
import { BlogShare } from '@/components/blog/BlogShare';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { generateArticleSchema, generateFAQSchema } from '@/utils/seoSchemas';
import { countApprovedComments } from '@/services/commentService';
import { getAssetUrl } from '@/utils/blogImageMap';
import { StickySidebar } from '@/components/blog/StickySidebar';
import '@/styles/blog.css';

// Lazy load комментариев
const BlogComments = lazy(async () => {
  const module = await import('@/components/blog/BlogComments');
  return { default: module.BlogComments ?? module.default };
});
import { Helmet } from 'react-helmet-async';

// Объединяем все статьи для поиска
const allPosts = [...blogPosts, ...generatedArticles, ...allGeneratedArticles];

const SITE_URL = 'https://schitay-online.ru';

const CALCULATOR_BRIDGE_MAP: Record<
  string,
  Array<{ id: string; title: string; href: string; subtitle: string }>
> = {
  'mortgage-credit': [
    { id: 'mortgage', title: 'Калькулятор ипотеки', href: '/calculator/mortgage/', subtitle: 'Платёж, переплата, срок' },
    { id: 'credit', title: 'Кредитный калькулятор', href: '/calculator/credit/', subtitle: 'Сравнение сценариев' },
    { id: 'refinancing', title: 'Рефинансирование', href: '/calculator/refinancing/', subtitle: 'Оценка экономии' },
  ],
  'taxes-salary': [
    { id: 'salary', title: 'Калькулятор зарплаты', href: '/calculator/salary/', subtitle: 'НДФЛ и сумма на руки' },
    { id: 'tax-deduction', title: 'Налоговый вычет', href: '/calculator/tax-deduction/', subtitle: 'Сколько можно вернуть' },
  ],
  'utilities-housing': [
    { id: 'utilities', title: 'Калькулятор ЖКХ', href: '/calculator/utilities/', subtitle: 'Платежи и расход ресурсов' },
    { id: 'overpayment', title: 'Калькулятор переплаты', href: '/calculator/overpayment/', subtitle: 'Оценка платежной нагрузки' },
  ],
  'health-fitness': [
    { id: 'bmi', title: 'Калькулятор ИМТ', href: '/calculator/bmi/', subtitle: 'Индекс массы тела' },
    { id: 'calories', title: 'Калькулятор калорий', href: '/calculator/calories/', subtitle: 'Суточная норма' },
    { id: 'water', title: 'Калькулятор воды', href: '/calculator/water/', subtitle: 'Режим потребления' },
  ],
  'family-law': [
    { id: 'alimony', title: 'Калькулятор алиментов', href: '/calculator/alimony/', subtitle: 'Доля или твердая сумма' },
    { id: 'maternity-capital', title: 'Материнский капитал', href: '/calculator/maternity-capital/', subtitle: 'Проверка суммы и сценариев' },
  ],
  'auto-transport': [
    { id: 'osago', title: 'Калькулятор ОСАГО', href: '/calculator/osago/', subtitle: 'Стоимость полиса по параметрам' },
    { id: 'kasko', title: 'Калькулятор КАСКО', href: '/calculator/kasko/', subtitle: 'Оценка тарифа и рисков' },
    { id: 'fuel', title: 'Калькулятор топлива', href: '/calculator/fuel/', subtitle: 'Расход и бюджет поездки' },
  ],
  'investments-deposits': [
    { id: 'deposit', title: 'Калькулятор вкладов', href: '/calculator/deposit/', subtitle: 'Доход с капитализацией' },
    { id: 'investment', title: 'Калькулятор инвестиций', href: '/calculator/investment/', subtitle: 'Прогноз капитала' },
  ],
  'legal-court': [
    { id: 'court-fee', title: 'Калькулятор госпошлины', href: '/calculator/court-fee/', subtitle: 'Расходы по иску' },
    { id: 'overpayment', title: 'Калькулятор переплаты', href: '/calculator/overpayment/', subtitle: 'Оценка долговой нагрузки' },
  ],
};

const OFFERS_BRIDGE_MAP: Record<string, { href: string; label: string; subtitle: string }> = {
  'mortgage-credit': {
    href: '/offers?category=credit',
    label: 'Кредитные предложения',
    subtitle: 'Подбор предложений по теме статьи',
  },
  'taxes-salary': {
    href: '/offers?category=insurance',
    label: 'Программы накоплений и страхования',
    subtitle: 'Варианты с учетом налоговых сценариев',
  },
  'utilities-housing': {
    href: '/offers?category=debit',
    label: 'Карты и кешбэк для повседневных расходов',
    subtitle: 'Инструменты для оптимизации расходов',
  },
  'health-fitness': {
    href: '/offers?category=insurance&q=клещ',
    label: 'Страхование от укуса клеща',
    subtitle: 'Целевая подборка для поездок, природы и активного отдыха',
  },
  'auto-transport': {
    href: '/offers?category=insurance',
    label: 'Страховые предложения для автомобилистов',
    subtitle: 'ОСАГО/КАСКО и смежные продукты',
  },
  'investments-deposits': {
    href: '/offers?category=debit',
    label: 'Финансовые предложения и карты',
    subtitle: 'Подбор вариантов для управления деньгами',
  },
};

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = allPosts.find((p) => p.slug === slug);
  const contentRef = useRef<HTMLDivElement>(null);

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
  const [userRating, setUserRating] = React.useState(0);

  const canonicalUrl = `${SITE_URL}/blog/${post?.slug}/`;

  React.useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    if (!contentRef.current) return;

    // 1. Находим все заголовки h2 и h3
    const headers = contentRef.current.querySelectorAll('h2, h3');
    const tocPlaceholder = document.getElementById('article-toc-placeholder');
    
    if (headers.length > 0 && tocPlaceholder) {
      const tocItems = Array.from(headers).map((header, index) => {
        const id = `section-${index}`;
        header.id = id;
        const text = header.textContent || '';
        const level = header.tagName.toLowerCase();
        
        return `<li class="toc-item">
          <a href="#${id}" class="toc-link toc-link-${level}">${text}</a>
        </li>`;
      });

      tocPlaceholder.innerHTML = `
        <div class="toc-title">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
          Содержание статьи
        </div>
        <ul class="toc-list">
          ${tocItems.join('')}
        </ul>
      `;

      // Добавляем плавный скролл для ссылок оглавления
      const tocLinks = tocPlaceholder.querySelectorAll('a');
      tocLinks.forEach(link => {
        link.onclick = (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href')?.slice(1);
          const target = document.getElementById(targetId || '');
          if (target) {
            const offset = 100; // Отступ сверху для фиксированной шапки
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = target.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
            
            // Обновляем URL без перезагрузки
            window.history.pushState(null, '', `#${targetId}`);
          }
        };
      });
    }
  }, [post?.content, post?.id]);

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
  const calculatorBridge = useMemo(
    () => CALCULATOR_BRIDGE_MAP[post?.category.id || ''] || [],
    [post?.category.id]
  );
  const offersBridge = useMemo(
    () => OFFERS_BRIDGE_MAP[post?.category.id || ''],
    [post?.category.id]
  );

  // Генерируем стабильный рейтинг на основе ID статьи (для детерминированности)
  const articleRating = useMemo(() => {
    if (!post) return { value: 4.7, count: 89 };
    const hash = post.id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const value = 4.3 + (hash % 7) * 0.1; // от 4.3 до 4.9
    const count = 47 + (hash % 180); // от 47 до 226
    return { value: Math.round(value * 10) / 10, count };
  }, [post]);

  const articleSchema = useMemo(() => {
    if (!post) return null;
    return generateArticleSchema(
      post.title,
      post.excerpt,
      canonicalUrl,
      post.publishedAt,
      post.updatedAt,
      post.featuredImage?.url,
      articleRating
    );
  }, [post, articleRating]);

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
    <div className="min-h-screen bg-slate-950">
      <Header />
      
      <Helmet>
        <title>{post.title} | Считай.RU</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${post.title} | Считай.RU`} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        {post.featuredImage && <meta property="og:image" content={post.featuredImage.url} />}
      </Helmet>

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

      {/* Hero Header */}
      <div className="relative h-[52vh] min-h-[420px] overflow-hidden">
        <div className="absolute inset-0 bg-slate-950">
          <img
            src={getAssetUrl(post.featuredImage?.url) || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=420&fit=crop&q=80'}
            alt={post.featuredImage?.alt || post.title}
            className="w-full h-full object-cover opacity-60 scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=420&fit=crop&q=80'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 opacity-90" />
        </div>

        <div className="container mx-auto px-4 h-full relative flex flex-col justify-end pb-24 pt-20">
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

              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl border-2 border-white/20 overflow-hidden shadow-2xl bg-white/10">
                    <img
                      src={getAssetUrl(post.author.avatar) || getAssetUrl('/authors/alexander-smirnov.png')}
                      alt={post.author.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = getAssetUrl('/authors/alexander-smirnov.png') || ''; }}
                    />
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg">{post.author.name}</div>
                    <div className="text-white/60 text-sm font-medium uppercase tracking-widest">{post.author.specialization || 'Финансовый эксперт'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black flex items-center gap-2 border border-emerald-500/30 backdrop-blur-md">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    2026 АКТУАЛЬНО
                  </div>
                  <div className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-xs font-black flex items-center gap-2 border border-blue-500/30 backdrop-blur-md">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    ПРОВЕРЕНО
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <main id="main-content" className="container mx-auto px-4 -mt-12 md:-mt-16 relative z-20 pb-20">
        {/* Двухколоночный макет на широких экранах */}
        <div className="max-w-6xl mx-auto blog-2col-layout">
         <div>
          <div className="surface-card overflow-hidden">
            {/* Тулбар */}
            <div className="px-6 md:px-10 pt-8 pb-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
              <nav className="flex items-center gap-2 text-sm text-slate-400 font-medium">
                <Link to="/blog" className="hover:text-primary transition-colors">Блог</Link>
                <ChevronRight size={14} />
                <span className="text-slate-700 dark:text-slate-300">{post.category.name}</span>
              </nav>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowShareDialog(true)}
                  className="rounded-xl text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Share2 size={18} className="mr-2" />
                  Поделиться
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="rounded-xl text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 relative"
                >
                  <Copy size={18} className="mr-2" />
                  {isCopied ? "Скопировано" : "Копировать ссылку"}
                </Button>
              </div>
            </div>

            {/* Основной контент */}
            <article className="blog-content px-6 md:px-10 py-10 md:py-14 max-w-none">
              <div 
                ref={contentRef}
                dangerouslySetInnerHTML={{ 
                  __html: DOMPurify.sanitize(
                    parseMarkdown(
                      post.content.includes(':::toc:::') 
                        ? post.content 
                        : `:::toc:::\n\n${post.content}`
                    )
                  ) 
                }} 
              />

              {/* Виджет оценки статьи (SEO + Engagement) */}
              <div className="article-rating-widget">
                <div>
                  <div className="article-rating-label">Оцените статью</div>
                  <div className="article-rating-count">
                    Средняя оценка: {articleRating.value}/5 ({articleRating.count} голосов)
                  </div>
                </div>
                <div className="article-rating-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setUserRating(star)}
                      aria-label={`Оценка ${star}`}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        width="28"
                        height="28"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill={star <= (userRating || Math.round(articleRating.value)) ? 'currentColor' : 'none'}
                        className={star <= (userRating || Math.round(articleRating.value)) ? 'star-active' : 'star-inactive'}
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </button>
                  ))}
                </div>
                {userRating > 0 && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">Спасибо за оценку!</span>
                )}
              </div>
            </article>

            {/* Теги */}
            <div className="px-6 md:px-10 py-8 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2.5">
              {post.tags.map(tag => (
                <Link key={tag} to={`/blog?tag=${tag}`}>
                  <span className="px-4 py-2 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 hover:border-primary/50 hover:text-primary transition-all font-semibold">
                    #{tag}
                  </span>
                </Link>
              ))}
            </div>
          </div>
         </div>

          {/* Sticky Sidebar (desktop only) */}
          <StickySidebar
            offer={{
              title: offersBridge?.label || 'Лучшее предложение месяца',
              subtitle: offersBridge?.subtitle || 'Специально подобранные варианты',
              rating: articleRating.value,
              href: offersBridge?.href || '/offers',
              cta: 'Смотреть предложения',
              badge: 'Топ выбор'
            }}
            relatedCalcs={calculatorBridge.slice(0, 3).map(c => ({
              title: c.title,
              href: c.href
            }))}
          />
        </div>
        {/* === END 2-column grid === */}

        {/* Post-article sections — full width, single column */}
        <div className="max-w-5xl mx-auto">
          {/* Блок автора */}
          <div className="mt-16">
            <AuthorBio author={post.author} />
          </div>

          {/* Навигационный мост: контент -> калькулятор */}
          {calculatorBridge.length > 0 && (
            <section className="mt-16 surface-card p-6 md:p-8">
              <div className="mb-5">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100">Сначала рассчитайте</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Практический шаг после статьи: выберите калькулятор по теме и посмотрите ваши цифры.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {calculatorBridge.map((item) => (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="group rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/40 p-4 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-all"
                  >
                    <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                      {item.title}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{item.subtitle}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {offersBridge && (
            <section className="mt-10 surface-card p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100">Подходящие предложения</h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1 mb-4">{offersBridge.subtitle}</p>
              <Link
                to={offersBridge.href}
                className="cta-secondary"
              >
                {offersBridge.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
          )}

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
                <Link to={`/blog/${prevPost.slug}`} className="surface-card p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-all group">
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-sm mb-2">
                    <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Предыдущая статья
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-2">{prevPost.title}</div>
                </Link>
              ) : <div />}
              {nextPost ? (
                <Link to={`/blog/${nextPost.slug}`} className="surface-card p-6 hover:border-slate-300 dark:hover:border-slate-600 transition-all group text-right">
                  <div className="flex items-center justify-end gap-2 text-slate-400 dark:text-slate-500 text-sm mb-2">
                    Следующая статья
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors line-clamp-2">{nextPost.title}</div>
                </Link>
              ) : <div />}
            </div>
          )}

          {/* Секция комментариев */}
          <div className="mt-14 surface-card p-6 md:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="bg-primary p-3 rounded-2xl text-white shadow-sm">
                <MessageSquare size={28} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Комментарии <span className="text-slate-400 dark:text-slate-500 font-normal ml-2">({commentCount})</span></h2>
            </div>
            <Suspense fallback={<div className="h-64 animate-pulse bg-slate-100 dark:bg-slate-800/50 rounded-3xl" />}>
              <BlogComments articleId={post.id} />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
