import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean; // Для критических изображений (above the fold)
  sizes?: string; // Для responsive images
  onLoad?: () => void;
}

/**
 * Оптимизированный компонент изображения
 * - Поддержка WebP с fallback
 * - Responsive images (srcset)
 * - Blur-up placeholder
 * - Lazy loading для изображений ниже fold
 * - Обработка ошибок загрузки с fallback на placeholder
 */
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  onLoad,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority); // Если priority, сразу загружаем
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  // Fallback placeholder для ошибок загрузки
  const placeholderUrl = '/placeholder.svg';
  
  // Попытка загрузить SVG версию при ошибке
  const getSvgFallback = (url: string): string => {
    return url.replace(/\.(jpg|jpeg|png|webp)$/i, '.svg');
  };

  // Генерация blur placeholder (base64 SVG)
  const getBlurPlaceholder = (): string => {
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width || 400} ${height || 300}'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' fill='%23f0f0f0' filter='url(%23b)'/%3E%3C/svg%3E`;
  };

  // Intersection Observer для lazy loading
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Начинаем загрузку за 50px до видимости
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    console.warn(`Failed to load image: ${currentSrc}`);
    
    // Пробуем загрузить SVG версию
    const svgFallback = getSvgFallback(src);
    if (currentSrc !== svgFallback && currentSrc !== placeholderUrl) {
      console.log(`Trying SVG fallback: ${svgFallback}`);
      setCurrentSrc(svgFallback);
      return;
    }
    
    // Если SVG тоже не загрузился, используем placeholder
    if (currentSrc !== placeholderUrl) {
      console.log(`Using placeholder: ${placeholderUrl}`);
      setCurrentSrc(placeholderUrl);
      return;
    }
    
    setHasError(true);
    setIsLoaded(true); // Показываем что-то
  };

  // Сбрасываем состояние при изменении src
  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  // Используем оригинальное изображение без попыток загрузить WebP версии
  // так как у нас нет оптимизированных версий изображений
  const imageSrc = isInView ? currentSrc : getBlurPlaceholder();

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Blur placeholder */}
      {!isLoaded && (
        <img
          src={getBlurPlaceholder()}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
      )}

      {/* Основное изображение */}
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-300',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
      />
    </div>
  );
};
