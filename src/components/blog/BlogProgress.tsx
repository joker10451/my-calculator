import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BlogProgressProps {
  articleTitle: string;
  wordCount: number;
  showProgressBar?: boolean;
}

export const BlogProgress = ({ 
  articleTitle, 
  wordCount,
  showProgressBar = true 
}: BlogProgressProps) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Показываем прогресс только для статей > 1000 слов
  const shouldShowProgress = wordCount > 1000;

  useEffect(() => {
    if (!shouldShowProgress && !showProgressBar) return;

    const handleScroll = () => {
      // Вычисляем прогресс прокрутки
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      // Прогресс от 0 до 100
      const totalScroll = documentHeight - windowHeight;
      const progress = totalScroll > 0 ? (scrollTop / totalScroll) * 100 : 0;
      
      setScrollProgress(Math.min(100, Math.max(0, progress)));
      
      // Показываем sticky navigation после прокрутки 200px
      setIsVisible(scrollTop > 200);
      
      // Показываем кнопку "наверх" после прокрутки 400px
      setShowScrollTop(scrollTop > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Вызываем сразу для инициализации

    return () => window.removeEventListener('scroll', handleScroll);
  }, [shouldShowProgress, showProgressBar]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Не показываем ничего, если статья короткая и не требуется прогресс-бар
  if (!shouldShowProgress && !showProgressBar) {
    return null;
  }

  return (
    <>
      {/* Sticky Navigation с прогрессом */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b shadow-sm transition-transform duration-300 ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* Прогресс-бар */}
        {shouldShowProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all duration-150 ease-out"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>
        )}

        {/* Заголовок статьи */}
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm md:text-base font-semibold truncate flex-1 mr-4">
              {articleTitle}
            </h2>
            
            {shouldShowProgress && (
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {Math.round(scrollProgress)}%
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Кнопка "Наверх" */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          size="icon"
          className={`fixed bottom-8 right-8 z-40 rounded-full shadow-lg transition-all duration-300 ${
            showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          aria-label="Прокрутить наверх"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </>
  );
};
