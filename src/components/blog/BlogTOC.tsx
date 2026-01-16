import { useEffect, useState, useMemo } from 'react';
import { List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TOCItem {
  id: string;
  level: number;
  title: string;
  anchor: string;
}

interface BlogTOCProps {
  content: string;
  minHeadings?: number;
}

export const BlogTOC = ({ content, minHeadings = 5 }: BlogTOCProps) => {
  const [activeId, setActiveId] = useState<string>('');

  // Извлекаем заголовки H2 из контента
  const tocItems = useMemo(() => {
    const items: TOCItem[] = [];
    
    // Создаем временный элемент для парсинга HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Находим все H2 заголовки
    const headings = tempDiv.querySelectorAll('h2');
    
    headings.forEach((heading, index) => {
      const title = heading.textContent || '';
      const anchor = `heading-${index}`;
      
      items.push({
        id: anchor,
        level: 2,
        title: title.trim(),
        anchor: anchor,
      });
    });
    
    return items;
  }, [content]);

  // Не показываем TOC если заголовков меньше минимума
  const shouldShowTOC = tocItems.length >= minHeadings;

  useEffect(() => {
    if (!shouldShowTOC) return;
    
    // Добавляем ID к заголовкам в DOM
    const headings = document.querySelectorAll('h2');
    headings.forEach((heading, index) => {
      heading.id = `heading-${index}`;
    });

    // Отслеживаем активный раздел при скролле
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px',
      }
    );

    headings.forEach((heading) => {
      observer.observe(heading);
    });

    return () => {
      headings.forEach((heading) => {
        observer.unobserve(heading);
      });
    };
  }, [tocItems, minHeadings, shouldShowTOC]);

  if (!shouldShowTOC) {
    return null;
  }

  const handleClick = (anchor: string) => {
    const element = document.getElementById(anchor);
    if (element) {
      const offset = 100; // Отступ для sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Card className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <List className="w-5 h-5" />
          Содержание
        </CardTitle>
      </CardHeader>
      <CardContent>
        <nav aria-label="Оглавление статьи">
          <ul className="space-y-2">
            {tocItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleClick(item.anchor)}
                  className={`text-left w-full px-3 py-2 rounded-md text-sm transition-colors hover:bg-muted ${
                    activeId === item.id
                      ? 'bg-primary/10 text-primary font-medium border-l-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </CardContent>
    </Card>
  );
};
