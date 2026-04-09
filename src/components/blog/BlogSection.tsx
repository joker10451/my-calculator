import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, TrendingUp } from 'lucide-react';
import { BlogCard } from './BlogCard';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/data/blogPosts';

const BlogSection = () => {
  // Получаем последние 3 опубликованные статьи
  const latestPosts = blogPosts
    .filter(post => post.isPublished)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 3);

  // Получаем рекомендуемые статьи
  const featuredPosts = blogPosts
    .filter(post => post.isPublished && post.isFeatured)
    .slice(0, 2);

  if (latestPosts.length === 0) {
    return null;
  }

  return (
    <section className="py-10 md:py-14 bg-slate-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl">
        {/* Заголовок секции */}
        <div className="text-center mb-10 md:mb-14">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase">
              Финансовый блог
            </h2>
          </div>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Экспертные статьи о финансах, налогах и экономии. Актуальная информация для принятия правильных решений.
          </p>
        </div>

        {/* Рекомендуемые статьи */}
        {featuredPosts.length > 0 && (
          <div className="mb-10 md:mb-14">
            <div className="flex items-center gap-2 mb-5 md:mb-8">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold">Рекомендуем к прочтению</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-10 md:mb-14">
              {featuredPosts.map(post => (
                <BlogCard key={post.id} post={post} variant="featured" />
              ))}
            </div>
          </div>
        )}

        {/* Последние статьи */}
        <div className="mb-10 md:mb-14">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-5 md:mb-8">Последние публикации</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {latestPosts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Кнопка "Все статьи" */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="group min-h-[44px]">
              <Link to="/blog">
                Все статьи блога
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="group min-h-[44px]">
              <Link to="/offers">
                Подобрать предложения
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Статистика блога */}
        <div className="mt-10 md:mt-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
          <div className="text-center p-4 md:p-5 surface-card rounded-2xl">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-2">
              {blogPosts.filter(p => p.isPublished).length}
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">Статей опубликовано</div>
          </div>
          <div className="text-center p-4 md:p-5 surface-card rounded-2xl">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-2">
              {blogPosts.filter(p => p.isPublished && p.isFeatured).length}
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">Рекомендуемых статей</div>
          </div>
          <div className="text-center p-4 md:p-5 surface-card rounded-2xl sm:col-span-2 md:col-span-1">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-2">
              {Math.round(
                blogPosts
                  .filter(p => p.isPublished)
                  .reduce((sum, post) => sum + post.readingTime, 0) /
                blogPosts.filter(p => p.isPublished).length
              )}
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">Минут среднее время чтения</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;