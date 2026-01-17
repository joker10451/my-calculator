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
 * 
 * Performance optimizations:
 * - IntersectionObserver для lazy loading
 * - Blur-up placeholder technique
 * - Responsive images с srcset
 * - Async decoding
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

  // Генерация srcset для responsive images
  const generateSrcSet = (baseSrc: string): string => {
    // Если это SVG или placeholder, не генерируем srcset
    if (baseSrc.endsWith('.svg') || baseSrc.startsWith('data:')) {
      return '';
    }

    // Генерируем srcset для разных размеров
    // Предполагаем, что изображения могут быть доступны в разных размерах
    const sizes = [640, 768, 1024, 1280, 1536];
    const ext = baseSrc.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '';
    const baseWithoutExt = baseSrc.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    
    // Для существующих изображений просто используем оригинал
    // В будущем можно добавить поддержку разных размеров
    return `${baseSrc} ${width || 800}w`;
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
        rootMargin: '100px', // Начинаем загрузку за 100px до видимости (оптимизировано)
        threshold: 0.01, // Триггер при 1% видимости
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
  const srcSet = isInView ? generateSrcSet(currentSrc) : '';

  return (
    <div className={cn('relative overflow-hidden bg-muted', className)}>
      {/* Blur placeholder */}
      {!isLoaded && isInView && (
        <img
          src={getBlurPlaceholder()}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Основное изображение */}
      <img
        ref={imgRef}
        src={imageSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchpriority={priority ? 'high' : 'auto'}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          'w-full h-full object-cover transition-opacity duration-500',
          isLoaded ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          // Предотвращаем layout shift
          aspectRatio: width && height ? `${width} / ${height}` : undefined,
        }}
      />
    </div>
  );
};
