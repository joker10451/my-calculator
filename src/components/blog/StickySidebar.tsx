import React from 'react';
import { Star, Shield, ArrowRight, TrendingUp } from 'lucide-react';

interface StickyOffer {
  title: string;
  subtitle: string;
  rating: number;
  href: string;
  cta: string;
  badge?: string;
}

interface StickySidebarProps {
  offer: StickyOffer;
  relatedCalcs?: Array<{ title: string; href: string }>;
}

/**
 * Плавающая боковая панель «Предложение месяца» для десктопных пользователей.
 * Видна на экранах >= 1280px, фиксируется при скролле.
 */
export function StickySidebar({ offer, relatedCalcs }: StickySidebarProps) {
  return (
    <aside className="sticky-sidebar-wrapper">
      {/* Главный оффер */}
      <div className="sticky-sidebar-card">
        {offer.badge && (
          <div className="sticky-sidebar-badge">
            <TrendingUp size={12} />
            {offer.badge}
          </div>
        )}

        <h4 className="sticky-sidebar-title">{offer.title}</h4>
        <p className="sticky-sidebar-subtitle">{offer.subtitle}</p>

        <div className="sticky-sidebar-rating">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              size={16}
              className={star <= offer.rating ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}
              fill={star <= offer.rating ? 'currentColor' : 'none'}
            />
          ))}
          <span className="sticky-sidebar-rating-text">{offer.rating.toFixed(1)}</span>
        </div>

        <a
          href={offer.href}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="sticky-sidebar-cta"
        >
          {offer.cta}
          <ArrowRight size={16} />
        </a>

        <div className="sticky-sidebar-trust">
          <Shield size={14} />
          <span>Проверенный партнер Считай.RU</span>
        </div>
      </div>

      {/* Быстрые ссылки на калькуляторы */}
      {relatedCalcs && relatedCalcs.length > 0 && (
        <div className="sticky-sidebar-calcs">
          <h5 className="sticky-sidebar-calcs-title">Рассчитайте онлайн</h5>
          {relatedCalcs.map((calc, i) => (
            <a key={i} href={calc.href} className="sticky-sidebar-calc-link">
              <span>{calc.title}</span>
              <ArrowRight size={14} />
            </a>
          ))}
        </div>
      )}
    </aside>
  );
}

export default StickySidebar;
