import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

/**
 * Компонент для плавных переходов между страницами блога
 * Добавляет fade-in/fade-out анимацию при навигации
 */
export const BlogTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (isTransitioning) {
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsTransitioning(false);
      }, 150); // Длительность fade-out

      return () => clearTimeout(timer);
    }
  }, [isTransitioning, location]);

  return (
    <div
      className={cn(
        'transition-opacity duration-150',
        isTransitioning ? 'opacity-0' : 'opacity-100'
      )}
    >
      {children}
    </div>
  );
};
