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
    <section className="py-16 bg-gradient-to-br from-muted/30 via-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Заголовок секции */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Финансовый блог
            </h2>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Экспертные статьи о финансах, налогах и экономии. 
            Актуальная информация для принятия правильных решений.
          </p>
        </div>

        {/* Рекомендуемые статьи */}
        {featuredPosts.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold">Рекомендуем к прочтению</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {featuredPosts.map(post => (
                <BlogCard key={post.id} post={post} variant="featured" />
              ))}
            </div>
          </div>
        )}

        {/* Последние статьи */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6">Последние публикации</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPosts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        {/* Кнопка "Все статьи" */}
        <div className="text-center">
          <Button asChild size="lg" className="group">
            <Link to="/blog">
              Все статьи блога
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>

        {/* Статистика блога */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-card rounded-xl border">
            <div className="text-2xl font-bold text-primary mb-2">
              {blogPosts.filter(p => p.isPublished).length}
            </div>
            <div className="text-muted-foreground">Статей опубликовано</div>
          </div>
          <div className="text-center p-6 bg-card rounded-xl border">
            <div className="text-2xl font-bold text-primary mb-2">
              {blogPosts.filter(p => p.isPublished && p.isFeatured).length}
            </div>
            <div className="text-muted-foreground">Рекомендуемых статей</div>
          </div>
          <div className="text-center p-6 bg-card rounded-xl border">
            <div className="text-2xl font-bold text-primary mb-2">
              {Math.round(
                blogPosts
                  .filter(p => p.isPublished)
                  .reduce((sum, post) => sum + post.readingTime, 0) / 
                blogPosts.filter(p => p.isPublished).length
              )}
            </div>
            <div className="text-muted-foreground">Минут среднее время чтения</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;