/**
 * Маппинг SVG-заглушек и PNG-ссылок блога на реальные фотографии с Unsplash.
 * Решает проблему 404 для статей, чьи изображения указаны как несуществующие локальные файлы.
 */
export const blogImageMap: Record<string, string> = {
  // ===== Финансы и инвестиции =====
  '/blog/investicii-2026.svg': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=420&fit=crop&q=80',
  '/blog/vklady-2026.svg': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=420&fit=crop&q=80',
  '/blog/kreditnye-karty-2026.svg': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=420&fit=crop&q=80',
  '/blog/refinansirovanie-2026.svg': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=420&fit=crop&q=80',
  '/blog/investments-2026.png': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=630&fit=crop&q=80',

  // ===== Налоги и зарплата =====
  '/blog/gosposhliny-2026.svg': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=420&fit=crop&q=80',
  '/blog/taxes-2026.png': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop&q=80',
  '/blog/ndfl-calculator-2026.png': 'https://images.unsplash.com/photo-1554224155-8f4e4e7e6ccf?w=1200&h=630&fit=crop&q=80',

  // ===== Страхование =====
  '/blog/osago-2026.svg': 'https://images.unsplash.com/photo-1449965408869-ebd13bc9e5e8?w=800&h=420&fit=crop&q=80',
  '/blog/kasko-2026.svg': 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=420&fit=crop&q=80',
  '/blog/osago-2026.png': 'https://images.unsplash.com/photo-1449965408869-ebd13bc9e5e8?w=1200&h=630&fit=crop&q=80',

  // ===== Семья и дети =====
  '/blog/alimenty-2026.svg': 'https://images.unsplash.com/photo-1536046155390-ab7a1c2fac87?w=800&h=420&fit=crop&q=80',
  '/blog/materinskij-kapital-2026.svg': 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=800&h=420&fit=crop&q=80',
  '/blog/matkapital-2026.svg': 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=800&h=420&fit=crop&q=80',
  '/blog/alimony-2026.png': 'https://images.unsplash.com/photo-1536046155390-ab7a1c2fac87?w=1200&h=630&fit=crop&q=80',
  '/blog/maternity-capital-2026.png': 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=1200&h=630&fit=crop&q=80',

  // ===== Здоровье =====
  '/blog/imt-2026.svg': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=420&fit=crop&q=80',
  '/blog/raschet-kalorij-2026.svg': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=420&fit=crop&q=80',
  '/blog/kak-pohudet-2026.svg': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=420&fit=crop&q=80',
  '/blog/bmi-hero.png': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=630&fit=crop&q=80',

  // ===== Трудовое право =====
  '/blog/otpusknye-2026.svg': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=420&fit=crop&q=80',
  '/blog/bolnichnyj-2026.svg': 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?w=800&h=420&fit=crop&q=80',
  '/blog/vacation-pay-2026.png': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=630&fit=crop&q=80',

  // ===== Кредиты =====
  '/blog/credit-hero.png': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&h=630&fit=crop&q=80',
  '/blog/credit-cards-2026.png': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&h=630&fit=crop&q=80',
  '/blog/early-repayment-2026.png': 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=630&fit=crop&q=80',

  // ===== Ипотека =====
  '/blog/mortgage-hero.png': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=630&fit=crop&q=80',
  '/blog/refinancing-guide-2026.png': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=630&fit=crop&q=80',

  // ===== Пенсия =====
  '/blog/pension-calculator-2026.png': 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&h=630&fit=crop&q=80',

  // ===== Инфляция =====
  '/blog/inflation-calculator-2026.png': 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&h=630&fit=crop&q=80',

  // ===== ЖКХ =====
  '/blog/utilities-2026.png': 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&h=630&fit=crop&q=80',

  // ===== Юридические =====
  '/blog/court-fee-hero.png': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=630&fit=crop&q=80',
  '/blog/alimony-hero.png': 'https://images.unsplash.com/photo-1536046155390-ab7a1c2fac87?w=1200&h=630&fit=crop&q=80',

  // ===== Топливо =====
  '/blog/fuel-hero.png': 'https://images.unsplash.com/photo-1545262810-77515befe149?w=1200&h=630&fit=crop&q=80',
};

/**
 * Безопасное получение URL статического файла (с поддержкой Vite base path).
 */
export function getAssetUrl(path: string | undefined): string | undefined {
  if (!path) return undefined;

  // Сначала проверяем маппинг — если путь ведет на несуществующий файл, подставляем стоковое фото
  const mapped = blogImageMap[path];
  if (mapped) return mapped;

  if (path.startsWith('http')) return path;
  
  if (path.startsWith('/')) {
    const base = import.meta.env.BASE_URL || '/';
    // Избегаем двойных слэшей, если base = '/'
    return base === '/' ? path : `${base}${path.slice(1)}`;
  }
  
  return path;
}

/**
 * Возвращает реальный URL фотографии, если текущий URL является SVG-заглушкой.
 */
export function resolveImageUrl(url: string): string {
  const mappedUrl = blogImageMap[url] ?? url;
  return getAssetUrl(mappedUrl) || url;
}
