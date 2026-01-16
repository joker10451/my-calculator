import { useEffect, useState } from 'react';
import { Type } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type FontSize = 'small' | 'medium' | 'large';

const FONT_SIZE_KEY = 'blog-font-size';

const fontSizeClasses: Record<FontSize, string> = {
  small: 'text-sm',
  medium: 'text-base',
  large: 'text-lg',
};

const fontSizeLabels: Record<FontSize, string> = {
  small: 'Маленький (S)',
  medium: 'Средний (M)',
  large: 'Большой (L)',
};

export const BlogReadabilitySettings = () => {
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  // Загружаем настройки из localStorage при монтировании
  useEffect(() => {
    const savedFontSize = localStorage.getItem(FONT_SIZE_KEY) as FontSize | null;
    if (savedFontSize && (savedFontSize === 'small' || savedFontSize === 'medium' || savedFontSize === 'large')) {
      setFontSize(savedFontSize);
      applyFontSize(savedFontSize);
    }
  }, []);

  const applyFontSize = (size: FontSize) => {
    // Применяем размер шрифта ко всем статьям блога
    const blogContent = document.querySelectorAll('.blog-content');
    blogContent.forEach((element) => {
      // Удаляем все классы размеров шрифта
      element.classList.remove('text-sm', 'text-base', 'text-lg');
      // Добавляем новый класс
      element.classList.add(fontSizeClasses[size]);
    });
  };

  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem(FONT_SIZE_KEY, size);
    applyFontSize(size);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Type className="w-4 h-4" />
          <span className="hidden sm:inline">Размер текста</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Размер шрифта</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleFontSizeChange('small')}
          className={fontSize === 'small' ? 'bg-accent' : ''}
        >
          {fontSizeLabels.small}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFontSizeChange('medium')}
          className={fontSize === 'medium' ? 'bg-accent' : ''}
        >
          {fontSizeLabels.medium}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleFontSizeChange('large')}
          className={fontSize === 'large' ? 'bg-accent' : ''}
        >
          {fontSizeLabels.large}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
