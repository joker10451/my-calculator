/**
 * Маппинг SVG-заглушек блога на реальные фотографии с Unsplash.
 * Используется компонентом OptimizedImage для подмены placeholder'ов
 * на качественные тематические изображения.
 */
export const blogImageMap: Record<string, string> = {
  // Финансы и инвестиции
  '/blog/investicii-2026.svg':
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=420&fit=crop&q=80',
  '/blog/vklady-2026.svg':
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=420&fit=crop&q=80',
  '/blog/kreditnye-karty-2026.svg':
    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=420&fit=crop&q=80',
  '/blog/refinansirovanie-2026.svg':
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=420&fit=crop&q=80',

  // Налоги и зарплата
  '/blog/gosposhliny-2026.svg':
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=420&fit=crop&q=80',

  // Страхование
  '/blog/osago-2026.svg':
    'https://images.unsplash.com/photo-1449965408869-ebd13bc9e5e8?w=800&h=420&fit=crop&q=80',
  '/blog/kasko-2026.svg':
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=420&fit=crop&q=80',

  // Семья и дети
  '/blog/alimenty-2026.svg':
    'https://images.unsplash.com/photo-1536046155390-ab7a1c2fac87?w=800&h=420&fit=crop&q=80',
  '/blog/materinskij-kapital-2026.svg':
    'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=800&h=420&fit=crop&q=80',
  '/blog/matkapital-2026.svg':
    'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=800&h=420&fit=crop&q=80',

  // Здоровье
  '/blog/imt-2026.svg':
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=420&fit=crop&q=80',
  '/blog/raschet-kalorij-2026.svg':
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=420&fit=crop&q=80',
  '/blog/kak-pohudet-2026.svg':
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=420&fit=crop&q=80',

  // Трудовое право
  '/blog/otpusknye-2026.svg':
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=420&fit=crop&q=80',
  '/blog/bolnichnyj-2026.svg':
    'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&h=420&fit=crop&q=80',
};

/**
 * Возвращает реальный URL фотографии, если текущий URL является SVG-заглушкой.
 * Если URL не является заглушкой, возвращает исходный URL без изменений.
 */
export function resolveImageUrl(url: string): string {
  return blogImageMap[url] ?? url;
}
