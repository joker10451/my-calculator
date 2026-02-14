import { Link } from 'react-router-dom';
import { ArrowRight, Calculator, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { BlogPost } from '@/types/blog';
import type { Calculator as RecCalculator } from '@/services/recommendationService';

interface BlogRecommendationsProps {
  /**
   * Похожие статьи для отображения
   */
  relatedArticles: BlogPost[];

  /**
   * Связанные калькуляторы для отображения
   */
  relatedCalculators?: RecCalculator[];

  /**
   * Заголовок секции похожих статей
   */
  articlesTitle?: string;

  /**
   * Заголовок секции калькуляторов
   */
  calculatorsTitle?: string;

  /**
   * Показывать ли секцию калькуляторов
   */
  showCalculators?: boolean;
}

/**
 * Компонент для отображения рекомендаций похожих статей и связанных калькуляторов
 * 
 * Requirements: 4.1, 4.3
 */
const BlogRecommendations = ({
  relatedArticles,
  relatedCalculators = [],
  articlesTitle = 'Похожие статьи',
  calculatorsTitle = 'Полезные калькуляторы',
  showCalculators = true
}: BlogRecommendationsProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8 mt-12">
      {/* Секция похожих статей */}
      {relatedArticles.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">{articlesTitle}</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {relatedArticles.map((article) => (
              <Card
                key={article.id}
                className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {article.featuredImage && (
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={article.featuredImage.url}
                      alt={article.featuredImage.alt}
                      className="w-full h-40 object-cover transition-transform duration-300 hover:scale-105"
                      loading="lazy"
                    />
                    <Badge
                      className="absolute top-2 right-2 text-xs"
                      style={{ backgroundColor: article.category.color }}
                    >
                      {article.category.name}
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="text-xs text-muted-foreground mb-2">
                    {formatDate(article.publishedAt)} · {article.readingTime} мин
                  </div>

                  <Link to={`/blog/${article.slug}`}>
                    <h3 className="text-base font-semibold leading-tight hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                  </Link>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>

                  <Link
                    to={`/blog/${article.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Читать далее
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Секция связанных калькуляторов */}
      {showCalculators && relatedCalculators.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">{calculatorsTitle}</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {relatedCalculators.map((calculator) => (
              <Card
                key={calculator.id || calculator.href}
                className="transition-all duration-300 hover:shadow-md hover:border-primary/50"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 text-base">
                        {calculator.name}
                      </h3>

                      {calculator.category && (
                        <Badge variant="secondary" className="text-xs mb-3">
                          {calculator.category}
                        </Badge>
                      )}
                    </div>

                    <Calculator className="w-5 h-5 text-primary flex-shrink-0" />
                  </div>

                  <Link to={calculator.href}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 group"
                    >
                      Рассчитать
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Пустое состояние */}
      {relatedArticles.length === 0 && (!showCalculators || relatedCalculators.length === 0) && (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Рекомендации пока недоступны. Продолжайте читать наши статьи!
          </p>
          <Link to="/blog">
            <Button variant="outline" className="mt-4">
              Вернуться к блогу
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default BlogRecommendations;