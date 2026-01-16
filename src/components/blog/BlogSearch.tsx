import { useState, useEffect, useMemo } from 'react';
import { Search, X, TrendingUp, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { search, getPopularArticles, suggestAlternatives } from '@/services/searchService';
import type { SearchResult } from '@/services/searchService';
import type { BlogPost } from '@/types/blog';

interface BlogSearchProps {
  articles: BlogPost[];
  onResultClick?: (article: BlogPost) => void;
  placeholder?: string;
  showPopularOnEmpty?: boolean;
}

export const BlogSearch = ({
  articles,
  onResultClick,
  placeholder = 'Поиск по статьям...',
  showPopularOnEmpty = true
}: BlogSearchProps) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debouncing: обновляем debouncedQuery через 300ms после последнего изменения
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Выполняем поиск
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!debouncedQuery.trim()) {
      return [];
    }
    return search(articles, debouncedQuery);
  }, [articles, debouncedQuery]);

  // Получаем популярные статьи
  const popularArticles = useMemo(() => {
    return getPopularArticles(articles, 5);
  }, [articles]);

  // Получаем альтернативные запросы
  const alternatives = useMemo(() => {
    if (searchResults.length === 0 && debouncedQuery.trim()) {
      return suggestAlternatives(debouncedQuery, articles);
    }
    return [];
  }, [searchResults, debouncedQuery, articles]);

  // Обработчик изменения поискового запроса
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setShowResults(true);
  };

  // Обработчик очистки поиска
  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    setShowResults(false);
  };

  // Обработчик клика на результат
  const handleResultClick = (article: BlogPost) => {
    setShowResults(false);
    onResultClick?.(article);
  };

  // Обработчик клика на альтернативный запрос
  const handleAlternativeClick = (alternative: string) => {
    setQuery(alternative);
    setDebouncedQuery(alternative);
  };

  // Показываем ли результаты
  const shouldShowResults = showResults && (query.trim() !== '' || showPopularOnEmpty);

  return (
    <div className="relative w-full">
      {/* Поле поиска */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={handleQueryChange}
          onFocus={() => setShowResults(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Результаты поиска */}
      {shouldShowResults && (
        <Card className="absolute top-full mt-2 w-full z-50 max-h-[500px] overflow-y-auto shadow-lg">
          <CardContent className="p-4">
            {/* Индикатор загрузки */}
            {isSearching && (
              <div className="text-center py-4 text-muted-foreground">
                Поиск...
              </div>
            )}

            {/* Результаты поиска */}
            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Search className="w-4 h-4" />
                  <span>Найдено результатов: {searchResults.length}</span>
                </div>

                {searchResults.map((result) => (
                  <Link
                    key={result.article.id}
                    to={`/blog/${result.article.slug}`}
                    onClick={() => handleResultClick(result.article)}
                    className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Изображение статьи */}
                      {result.article.featuredImage && (
                        <img
                          src={result.article.featuredImage.url}
                          alt={result.article.featuredImage.alt}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}

                      <div className="flex-1 min-w-0">
                        {/* Заголовок */}
                        <h4 className="font-semibold text-sm mb-1 line-clamp-1">
                          {result.article.title}
                        </h4>

                        {/* Подсвеченный excerpt */}
                        <p
                          className="text-xs text-muted-foreground line-clamp-2 mb-2"
                          dangerouslySetInnerHTML={{ __html: result.highlightedExcerpt }}
                        />

                        {/* Метаданные */}
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <Badge variant="secondary" className="text-xs">
                            {result.article.category.name}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{result.article.readingTime} мин</span>
                          </div>
                          {result.matchedFields.length > 0 && (
                            <span className="text-xs">
                              Совпадения: {result.matchedFields.join(', ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Нет результатов */}
            {!isSearching && debouncedQuery.trim() && searchResults.length === 0 && (
              <div className="py-6 text-center">
                <p className="text-muted-foreground mb-4">
                  По запросу "{debouncedQuery}" ничего не найдено
                </p>

                {/* Альтернативные запросы */}
                {alternatives.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Попробуйте поискать:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {alternatives.map((alt) => (
                        <Button
                          key={alt}
                          variant="outline"
                          size="sm"
                          onClick={() => handleAlternativeClick(alt)}
                        >
                          {alt}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Популярные статьи */}
                {showPopularOnEmpty && popularArticles.length > 0 && (
                  <div className="mt-6">
                    <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                      <TrendingUp className="w-4 h-4" />
                      <span>Популярные статьи</span>
                    </div>
                    <div className="space-y-2">
                      {popularArticles.map((article) => (
                        <Link
                          key={article.id}
                          to={`/blog/${article.slug}`}
                          onClick={() => handleResultClick(article)}
                          className="block p-2 rounded hover:bg-muted/50 transition-colors text-left"
                        >
                          <p className="text-sm font-medium line-clamp-1">
                            {article.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {article.category.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {article.readingTime} мин
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Популярные статьи при пустом запросе */}
            {!isSearching && !debouncedQuery.trim() && showPopularOnEmpty && popularArticles.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <TrendingUp className="w-4 h-4" />
                  <span>Популярные статьи</span>
                </div>
                <div className="space-y-2">
                  {popularArticles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/blog/${article.slug}`}
                      onClick={() => handleResultClick(article)}
                      className="block p-2 rounded hover:bg-muted/50 transition-colors text-left"
                    >
                      <p className="text-sm font-medium line-clamp-1">
                        {article.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {article.category.name}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {article.readingTime} мин
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Overlay для закрытия результатов при клике вне */}
      {shouldShowResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};
