import { useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface RangeSliderProps {
  id?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  label?: string;
  className?: string;
}

/**
 * Мобильно-оптимизированный слайдер с тач-поддержкой
 * Показывает текущее значение над ползунком
 */
export function RangeSlider({
  id,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  label,
  className,
}: RangeSliderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const progress = ((value - min) / (max - min)) * 100;

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  }, [onChange]);

  const displayValue = formatValue ? formatValue(value) : value.toLocaleString('ru-RU');

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="text-xs font-medium text-muted-foreground">{label}</label>
          <span className="text-sm font-bold text-foreground tabular-nums">{displayValue}</span>
        </div>
      )}
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5
            [&::-webkit-slider-thumb]:h-5
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary
            [&::-webkit-slider-thumb]:shadow-lg
            [&::-webkit-slider-thumb]:shadow-primary/30
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-background
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:active:scale-125
            [&::-moz-range-thumb]:w-5
            [&::-moz-range-thumb]:h-5
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-background
            [&::-moz-range-thumb]:shadow-lg
            touch-action-none"
          style={{
            background: `linear-gradient(to right, hsl(var(--primary)) 0%, hsl(var(--primary)) ${progress}%, hsl(var(--muted)) ${progress}%, hsl(var(--muted)) 100%)`,
          }}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={displayValue}
        />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{formatValue ? formatValue(min) : min.toLocaleString('ru-RU')}</span>
        <span>{formatValue ? formatValue(max) : max.toLocaleString('ru-RU')}</span>
      </div>
    </div>
  );
}
