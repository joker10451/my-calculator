import { ReactNode } from 'react';
import { Calculator, Scale, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultItem {
  label: string;
  value: string | number;
  icon?: ReactNode;
  highlight?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

interface CalculatorResultsProps {
  title?: string;
  mainResult?: {
    label: string;
    value: string | number;
  };
  results: ResultItem[];
  onCompare?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  className?: string;
}

export const CalculatorResults = ({
  title = 'Результаты',
  mainResult,
  results,
  onCompare,
  onDownload,
  onShare,
  className = '',
}: CalculatorResultsProps) => {
  const getVariantColor = (variant?: string) => {
    switch (variant) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'warning':
        return 'text-orange-600 dark:text-orange-400';
      case 'danger':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className={`glass-card p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-primary" />
        {title}
      </h3>

      {/* Главный результат */}
      {mainResult && (
        <div className="mb-6">
          <div className="text-sm text-muted-foreground mb-1">
            {mainResult.label}
          </div>
          <div className="calc-result animate-count-up">
            {mainResult.value}
          </div>
        </div>
      )}

      {/* Детальные результаты */}
      <div className="space-y-4 py-4 border-t border-border">
        {results.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-2 text-sm">
              {item.icon}
              {item.label}
            </span>
            <span className={`font-semibold ${getVariantColor(item.variant)}`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {/* Действия */}
      {(onCompare || onDownload || onShare) && (
        <div className="space-y-3 pt-4 border-t border-border">
          {onDownload && (
            <Button variant="hero" className="w-full gap-2" onClick={onDownload}>
              <Download className="w-5 h-5" />
              Скачать отчет
            </Button>
          )}
          <div className="grid grid-cols-2 gap-2">
            {onShare && (
              <Button variant="outline" className="gap-2" onClick={onShare}>
                <Share2 className="w-4 h-4" />
                Поделиться
              </Button>
            )}
            {onCompare && (
              <Button variant="secondary" className="gap-2" onClick={onCompare}>
                <Scale className="w-4 h-4" />
                Сравнить
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
