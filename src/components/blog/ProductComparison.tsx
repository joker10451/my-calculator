import React from 'react';
import { Star, Check, X, ArrowRight } from 'lucide-react';

interface Product {
  name: string;
  badge?: string;
  features: Record<string, string>;
  href?: string;
  rating?: number;
}

interface ProductComparisonProps {
  title: string;
  products: Product[];
}

/**
 * Компонент для визуального сравнения финансовых продуктов (кредиты, карты, вклады).
 * Рендерит горизонтальную таблицу с подсветкой «Лучший выбор».
 */
export function ProductComparison({ title, products }: ProductComparisonProps) {
  if (!products.length) return null;

  const featureKeys = Object.keys(products[0].features);

  return (
    <div className="product-comparison-wrapper">
      <div className="product-comparison-header">
        <div className="product-comparison-icon">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </div>
        <h3 className="product-comparison-title">{title}</h3>
      </div>

      <div className="product-comparison-scroll">
        <table className="product-comparison-table">
          <thead>
            <tr>
              <th className="product-comparison-feature-col">Параметр</th>
              {products.map((product, i) => (
                <th key={i} className={`product-comparison-product-col ${product.badge ? 'is-best' : ''}`}>
                  {product.badge && (
                    <span className="product-comparison-badge">{product.badge}</span>
                  )}
                  <span className="product-comparison-name">{product.name}</span>
                  {product.rating && (
                    <div className="product-comparison-stars">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star
                          key={star}
                          size={14}
                          className={star <= product.rating! ? 'star-filled' : 'star-empty'}
                          fill={star <= product.rating! ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {featureKeys.map((key) => (
              <tr key={key}>
                <td className="product-comparison-feature-label">{key}</td>
                {products.map((product, i) => {
                  const val = product.features[key] || '—';
                  const isPositive = val === 'Да' || val === '✓' || val === 'Есть';
                  const isNegative = val === 'Нет' || val === '✗' || val === 'Нет данных';

                  return (
                    <td key={i} className={`product-comparison-value ${product.badge ? 'is-best-col' : ''}`}>
                      {isPositive ? (
                        <Check size={18} className="text-emerald-500" />
                      ) : isNegative ? (
                        <X size={18} className="text-red-400" />
                      ) : (
                        <span>{val}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA row */}
      {products.some(p => p.href) && (
        <div className="product-comparison-cta-row">
          {products.map((product, i) => (
            <div key={i} className="product-comparison-cta-cell">
              {product.href ? (
                <a
                  href={product.href}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className={`product-comparison-cta ${product.badge ? 'is-primary' : ''}`}
                >
                  Оформить
                  <ArrowRight size={16} />
                </a>
              ) : (
                <span className="product-comparison-cta-placeholder" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductComparison;
