import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { useCalculatorHistory } from '@/hooks/useCalculatorHistory';
import { blogPosts } from '@/data/blogPosts';
import { generatedArticles } from '@/data/blogArticlesGenerated';
import { allGeneratedArticles } from '@/data/blogArticlesGenerated2';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const allPosts = [...blogPosts, ...generatedArticles, ...allGeneratedArticles];

const CALCULATOR_TO_CATEGORY: Record<string, string[]> = {
  mortgage: ['mortgage-credit'],
  credit: ['mortgage-credit'],
  refinancing: ['mortgage-credit'],
  overpayment: ['mortgage-credit'],
  salary: ['taxes-salary'],
  'self-employed': ['taxes-salary'],
  vacation: ['taxes-salary'],
  'sick-leave': ['taxes-salary'],
  pension: ['taxes-salary'],
  'deposit-tax': ['taxes-salary'],
  'tax-deduction': ['taxes-salary'],
  deposit: ['investments-deposits'],
  investment: ['investments-deposits'],
  currency: ['investments-deposits'],
  utilities: ['utilities-housing'],
  water: ['utilities-housing'],
  bmi: ['health-fitness'],
  calorie: ['health-fitness'],
  alimony: ['family-law'],
  'maternity-capital': ['family-law'],
  osago: ['auto-transport'],
  kasko: ['auto-transport'],
  fuel: ['auto-transport'],
  'tire-size': ['auto-transport'],
  'court-fee': ['legal-court'],
};

export default function PersonalizedRecommendations() {
  const { history } = useCalculatorHistory();

  const recommendations = useMemo(() => {
    const usedTypes = [...new Set(history.map(h => h.calculatorType))];
    if (usedTypes.length === 0) return [];

    const relevantCategories = new Set<string>();
    usedTypes.forEach(type => {
      const cats = CALCULATOR_TO_CATEGORY[type];
      if (cats) cats.forEach(c => relevantCategories.add(c));
    });

    const matchedPosts = allPosts
      .filter(post => post.isPublished && post.category?.id && relevantCategories.has(post.category.id))
      .filter(post => {
        const hasRelatedCalc = post.relatedCalculators?.some(rc => usedTypes.includes(rc));
        return hasRelatedCalc || relevantCategories.has(post.category?.id ?? '');
      });

    const unique = new Map<string, typeof post>();
    matchedPosts.forEach(post => {
      if (!unique.has(post.slug)) unique.set(post.slug, post);
    });

    return [...unique.values()]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 4);
  }, [history]);

  if (recommendations.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-slate-950">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-100">Рекомендуем для вас</h2>
            <p className="text-sm text-slate-400">На основе ваших расчётов</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((post, idx) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                to={`/blog/${post.slug}`}
                className="group surface-card surface-card-hover p-4 flex flex-col h-full"
              >
                {post.category && (
                  <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider mb-2">
                    {post.category.name}
                  </span>
                )}
                <h3 className="text-sm font-semibold text-slate-200 group-hover:text-primary transition-colors line-clamp-3 mb-3 flex-1">
                  {post.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <BookOpen className="w-3 h-3" />
                  <span>{post.readingTime} мин</span>
                  {post.tags.length > 0 && (
                    <>
                      <span className="text-slate-700">·</span>
                      <span className="text-slate-400 truncate">{post.tags[0]}</span>
                    </>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-primary transition-colors"
          >
            Все статьи
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
