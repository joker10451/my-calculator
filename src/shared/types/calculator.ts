// Общие типы для калькуляторов
export interface BaseCalculatorProps {
  className?: string;
}

export interface CalculatorResult {
  value: number;
  formatted: string;
  metadata?: Record<string, unknown>;
}

export interface CalculatorState<T = Record<string, unknown>> {
  values: T;
  results: Record<string, CalculatorResult>;
  isValid: boolean;
  errors: Record<string, string>;
}

export interface ValidationRule<T = unknown> {
  field: keyof T;
  validator: (value: unknown) => boolean | string;
  message?: string;
}

export interface CalculatorConfig<T = Record<string, unknown>> {
  storagePrefix: string;
  defaultValues: T;
  validationRules: ValidationRule<T>[];
  calculations: (values: T) => Record<string, CalculatorResult>;
}

// Типы для сравнения калькуляторов
export interface ComparisonItem {
  id: string;
  title: string;
  calculatorId: string;
  data: Record<string, unknown>;
  params: Record<string, unknown>;
  timestamp: number;
}

// Типы для экспорта
export interface ExportOptions {
  format: 'pdf' | 'json' | 'csv';
  filename?: string;
  includeCharts?: boolean;
  includeMetadata?: boolean;
}

// Типы для графиков
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: ChartDataPoint[];
  xAxisKey?: string;
  yAxisKey?: string;
  colors?: string[];
  title?: string;
  subtitle?: string;
}

// Типы для слайдеров
export interface SliderConfig {
  min: number;
  max: number;
  step: number;
  defaultValue: number;
  formatValue?: (value: number) => string;
  label: string;
  description?: string;
}

// Типы для форматирования
export type FormatType = 'currency' | 'percent' | 'number' | 'date';

export interface FormatOptions {
  type: FormatType;
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Типы для валидации
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Типы для хранения данных
export interface StorageAdapter {
  get<T>(key: string, defaultValue: T): T;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}

// Типы для аналитики
export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, unknown>;
}

// Типы для SEO
export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  structuredData?: Record<string, unknown>;
}