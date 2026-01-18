import { useTranslation } from "react-i18next";
import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight, TrendingUp } from 'lucide-react';
import { BlogCard } from './BlogCard';
import { Button } from '@/components/ui/button';
import { blogPosts } from '@/data/blogPosts';

const BlogSection = () => {
  const { t } = useTranslation();

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
    <section className="py-xl sm:py-2xl lg:py-3xl xl:py-4xl bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl">
        {/* Заголовок секции */}
        <div className="text-center mb-xl sm:mb-2xl lg:mb-3xl">
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4 lg:mb-6">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase">
              {t("common.blog_section.title")}
            </h2>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            {t("common.blog_section.subtitle")}
          </p>
        </div>

        {/* Рекомендуемые статьи */}
        {featuredPosts.length > 0 && (
          <div className="mb-xl sm:mb-2xl lg:mb-3xl">
            <div className="flex items-center gap-2 mb-lg sm:mb-xl lg:mb-2xl">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold">{t("common.blog_section.featured_title")}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md sm:gap-lg md:gap-xl lg:gap-2xl mb-xl sm:mb-2xl lg:mb-3xl">
              {featuredPosts.map(post => (
                <BlogCard key={post.id} post={post} variant="featured" />
              ))}
            </div>
          </div>
        )}

        {/* Последние статьи */}
        <div className="mb-xl sm:mb-2xl lg:mb-3xl">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-lg sm:mb-xl lg:mb-2xl">{t("common.blog_section.latest_title")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md sm:gap-lg md:gap-xl lg:gap-2xl">
            {latestPosts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Кнопка "Все статьи" */}
        <div className="text-center">
          <Button asChild size="lg" className="group min-h-[44px]">
            <Link to="/blog">
              {t("common.blog_section.all_posts_button")}
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Статистика блога */}
        <div className="mt-xl sm:mt-2xl lg:mt-3xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-md sm:gap-lg lg:gap-xl">
          <div className="text-center p-md sm:p-lg bg-card rounded-xl border">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-2">
              {blogPosts.filter(p => p.isPublished).length}
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">{t("common.blog_section.stats.published")}</div>
          </div>
          <div className="text-center p-md sm:p-lg bg-card rounded-xl border">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-2">
              {blogPosts.filter(p => p.isPublished && p.isFeatured).length}
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">{t("common.blog_section.stats.featured")}</div>
          </div>
          <div className="text-center p-md sm:p-lg bg-card rounded-xl border sm:col-span-2 md:col-span-1">
            <div className="text-xl sm:text-2xl font-bold text-primary mb-2">
              {Math.round(
                blogPosts
                  .filter(p => p.isPublished)
                  .reduce((sum, post) => sum + post.readingTime, 0) /
                blogPosts.filter(p => p.isPublished).length
              )}
            </div>
            <div className="text-sm sm:text-base text-muted-foreground">{t("common.blog_section.stats.reading_time")}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;