/**
 * Типы данных для системы сравнения банковских продуктов
 * Основано на схеме базы данных PostgreSQL
 */

// Базовые типы
export type ProductType = 'mortgage' | 'deposit' | 'credit' | 'insurance' | 'debit';
export type RiskTolerance = 'low' | 'medium' | 'high';
export type EmploymentType = 'employee' | 'self_employed' | 'unemployed' | 'retired' | 'student';
export type RecommendationType = 'automatic' | 'manual' | 'promoted';
export type RecommendationSource = 'calculator' | 'comparison' | 'profile' | 'blog';
export type EventType = 'click' | 'view' | 'apply' | 'approve' | 'fund';
export type CommissionStatus = 'pending' | 'confirmed' | 'paid' | 'cancelled';

/**
 * Интерфейс банка
 */
export interface Bank {
  id: string;
  name: string;
  short_name: string;
  logo_url?: string;
  website_url?: string;
  
  // Рейтинги (0-5)
  overall_rating?: number;
  customer_service_rating?: number;
  reliability_rating?: number;
  processing_speed_rating?: number;
  
  // Контактная информация
  phone?: string;
  email?: string;
  address?: string;
  
  // Лицензии и регулирование
  license_number?: string;
  central_bank_code?: string;
  
  // Партнерство
  is_partner: boolean;
  commission_rate?: number; // процент комиссии (0-100)
  referral_terms?: string;
  
  created_at: string;
  updated_at: string;
}

/**
 * Данные для создания банка
 */
export interface BankCreateData {
  name: string;
  short_name: string;
  logo_url?: string;
  website_url?: string;
  overall_rating?: number;
  customer_service_rating?: number;
  reliability_rating?: number;
  processing_speed_rating?: number;
  phone?: string;
  email?: string;
  address?: string;
  license_number?: string;
  central_bank_code?: string;
  is_partner?: boolean;
  commission_rate?: number;
  referral_terms?: string;
}

/**
 * Данные для обновления банка
 */
export interface BankUpdateData extends Partial<BankCreateData> {
  id?: never; // ID нельзя обновлять
}

/**
 * Комиссии и сборы продукта
 */
export interface ProductFees {
  application?: number; // комиссия за рассмотрение заявки
  monthly?: number; // ежемесячная комиссия
  early_repayment?: number; // комиссия за досрочное погашение
  cash_withdrawal?: number; // комиссия за снятие наличных
  account_maintenance?: number; // комиссия за ведение счета
  [key: string]: number | undefined;
}

/**
 * Требования к заемщику/вкладчику
 */
export interface ProductRequirements {
  min_income?: number; // минимальный доход
  min_age?: number; // минимальный возраст
  max_age?: number; // максимальный возраст
  min_credit_score?: number; // минимальный кредитный рейтинг
  employment_experience?: number; // стаж работы в месяцах
  citizenship?: string[]; // гражданство
  regions?: string[]; // доступные регионы
  [key: string]: string[] | number | undefined;
}

/**
 * Особенности и возможности продукта
 */
export interface ProductFeatures {
  early_repayment?: boolean; // досрочное погашение
  grace_period?: boolean | number; // льготный период
  capitalization?: boolean; // капитализация процентов
  replenishment?: boolean; // возможность пополнения
  partial_withdrawal?: boolean; // частичное снятие
  online_application?: boolean; // онлайн заявка
  fast_approval?: boolean; // быстрое одобрение
  insurance_included?: boolean; // включена страховка
  cashback?: boolean | {
    welcome?: string;
    regular?: string;
    maxMonthly?: number;
  }; // кешбэк для дебетовых карт
  [key: string]: boolean | { welcome?: string; regular?: string; maxMonthly?: number } | string | number | undefined;
}

/**
 * Интерфейс банковского продукта
 */
export interface BankProduct {
  id: string;
  bank_id: string;
  product_type: ProductType;
  name: string;
  description?: string;
  
  // Основные параметры
  interest_rate: number; // процентная ставка
  min_amount?: number; // минимальная сумма
  max_amount?: number; // максимальная сумма
  min_term?: number; // минимальный срок в месяцах
  max_term?: number; // максимальный срок в месяцах
  
  // Структурированные данные
  fees: ProductFees;
  requirements: ProductRequirements;
  features: ProductFeatures;
  
  // Промо-условия
  promotional_rate?: number;
  promo_valid_until?: string;
  promo_conditions?: string;
  
  // Региональность
  available_regions: string[];
  
  // Метаданные
  is_active: boolean;
  is_featured: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
  
  // Связанные данные (заполняются при запросах с JOIN)
  bank?: Bank;
}

/**
 * Данные для создания продукта
 */
export interface BankProductCreateData {
  bank_id: string;
  product_type: ProductType;
  name: string;
  description?: string;
  interest_rate: number;
  min_amount?: number;
  max_amount?: number;
  min_term?: number;
  max_term?: number;
  fees?: ProductFees;
  requirements?: ProductRequirements;
  features?: ProductFeatures;
  promotional_rate?: number;
  promo_valid_until?: string;
  promo_conditions?: string;
  available_regions?: string[];
  is_active?: boolean;
  is_featured?: boolean;
  priority?: number;
}

/**
 * Данные для обновления продукта
 */
export interface BankProductUpdateData extends Partial<BankProductCreateData> {
  id?: never; // ID нельзя обновлять
}

/**
 * Фильтры для поиска продуктов
 */
export interface ProductFilters {
  product_type?: ProductType;
  bank_id?: string;
  min_rate?: number;
  max_rate?: number;
  min_amount?: number;
  max_amount?: number;
  min_term?: number;
  max_term?: number;
  region?: string;
  is_active?: boolean;
  is_featured?: boolean;
  has_promotion?: boolean;
  search_query?: string; // поиск по названию и описанию
}

/**
 * Параметры сортировки продуктов
 */
export interface ProductSortOptions {
  field: 'interest_rate' | 'min_amount' | 'max_amount' | 'priority' | 'created_at' | 'updated_at';
  direction: 'asc' | 'desc';
}

/**
 * Результат поиска продуктов с пагинацией
 */
export interface ProductSearchResult {
  products: BankProduct[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

/**
 * Профиль пользователя
 */
export interface UserProfile {
  id: string;
  user_id: string;
  
  // Финансовая информация
  monthly_income?: number;
  credit_score?: number;
  employment_type?: EmploymentType;
  region?: string;
  age_range?: string;
  
  // Предпочтения
  risk_tolerance?: RiskTolerance;
  preferred_banks: string[];
  blacklisted_banks: string[];
  
  // История и интересы
  calculation_history: CalculationHistoryItem[];
  product_interests: ProductType[];
  
  // Поведенческие данные
  last_active: string;
  session_count: number;
  conversion_count: number;
  
  created_at: string;
  updated_at: string;
}

/**
 * Элемент истории расчетов
 */
export interface CalculationHistoryItem {
  calculator_type: string;
  parameters: Record<string, unknown>;
  result: Record<string, unknown>;
  timestamp: string;
  session_id?: string;
}

/**
 * Данные для создания/обновления профиля
 */
export interface UserProfileData {
  user_id: string;
  monthly_income?: number;
  credit_score?: number;
  employment_type?: EmploymentType;
  region?: string;
  age_range?: string;
  risk_tolerance?: RiskTolerance;
  preferred_banks?: string[];
  blacklisted_banks?: string[];
  calculation_history?: CalculationHistoryItem[];
  product_interests?: ProductType[];
}

/**
 * Рекомендация продукта
 */
export interface Recommendation {
  id: string;
  user_id: string;
  product_id: string;
  
  // Параметры рекомендации
  score: number; // 0-100
  reasoning: string[];
  context: Record<string, unknown>;
  
  // Взаимодействие пользователя
  shown_at: string;
  clicked_at?: string;
  dismissed_at?: string;
  applied_at?: string;
  
  // Реферальная информация
  referral_link?: string;
  referral_id?: string;
  commission_potential?: number;
  
  // Метаданные
  recommendation_type: RecommendationType;
  source?: RecommendationSource;
  
  created_at: string;
  
  // Связанные данные
  product?: BankProduct;
}

/**
 * Данные для создания рекомендации
 */
export interface RecommendationCreateData {
  user_id: string;
  product_id: string;
  score: number;
  reasoning?: string[];
  context?: Record<string, unknown>;
  referral_link?: string;
  referral_id?: string;
  commission_potential?: number;
  recommendation_type?: RecommendationType;
  source?: RecommendationSource;
}

/**
 * Сравнение продуктов
 */
export interface Comparison {
  id: string;
  user_id?: string;
  
  // Сравниваемые продукты
  product_ids: string[];
  comparison_criteria: ComparisonCriteria;
  
  // Результаты
  comparison_matrix?: ComparisonMatrix;
  highlighted_products: string[];
  
  // Взаимодействие
  saved_at?: string;
  shared_at?: string;
  bookmark_id?: string;
  
  created_at: string;
  updated_at: string;
  
  // Связанные данные
  products?: BankProduct[];
}

/**
 * Критерии сравнения
 */
export interface ComparisonCriteria {
  sort_by: 'rate' | 'total_cost' | 'monthly_payment' | 'rating';
  include_promotions: boolean;
  user_location?: string;
  user_profile?: UserFinancialProfile;
  weight_factors?: WeightFactors;
}

/**
 * Весовые коэффициенты для сравнения
 */
export interface WeightFactors {
  interest_rate: number; // 0-1
  fees: number; // 0-1
  bank_rating: number; // 0-1
  processing_speed: number; // 0-1
  features: number; // 0-1
}

/**
 * Финансовый профиль пользователя для расчетов
 */
export interface UserFinancialProfile {
  income: number;
  credit_score?: number;
  loan_amount?: number;
  loan_term?: number;
  down_payment?: number;
  risk_tolerance: RiskTolerance;
}

/**
 * Матрица сравнения продуктов
 */
export interface ComparisonMatrix {
  headers: ComparisonHeader[];
  rows: ComparisonRow[];
  best_in_category: Record<string, string>; // category -> productId
  summary: ComparisonSummary;
}

/**
 * Заголовок столбца сравнения
 */
export interface ComparisonHeader {
  key: string;
  label: string;
  type: 'number' | 'currency' | 'percent' | 'text' | 'boolean';
  format?: string;
  sortable: boolean;
  weight?: number;
}

/**
 * Строка сравнения
 */
export interface ComparisonRow {
  product_id: string;
  bank_name: string;
  product_name: string;
  values: Record<string, ComparisonValue>;
  total_score: number;
  is_best_overall: boolean;
  highlights: string[];
}

/**
 * Значение в сравнении
 */
export interface ComparisonValue {
  raw: string | number | boolean | null;
  formatted: string;
  is_best: boolean;
  is_worst: boolean;
  score: number; // 0-100
  note?: string;
}

/**
 * Сводка сравнения
 */
export interface ComparisonSummary {
  total_products: number;
  best_overall: string; // product_id
  best_rate: string; // product_id
  lowest_fees: string; // product_id
  highest_rating: string; // product_id
  recommendations: string[];
}

/**
 * Аналитика реферальных ссылок
 */
export interface ReferralAnalytics {
  id: string;
  referral_id: string;
  user_id?: string;
  product_id: string;
  bank_id: string;
  
  // События
  event_type: EventType;
  event_timestamp: string;
  
  // Контекст
  source?: string;
  campaign?: string;
  user_agent?: string;
  ip_address?: string;
  
  // Финансовые данные
  potential_commission?: number;
  actual_commission?: number;
  commission_status: CommissionStatus;
  
  // Метаданные
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Данные для отслеживания события
 */
export interface ReferralEventData {
  referral_id: string;
  user_id?: string;
  product_id: string;
  bank_id: string;
  event_type: EventType;
  source?: string;
  campaign?: string;
  user_agent?: string;
  ip_address?: string;
  potential_commission?: number;
  actual_commission?: number;
  commission_status?: CommissionStatus;
  metadata?: Record<string, unknown>;
}

/**
 * Ошибки валидации
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

/**
 * Результат валидации
 */
export interface ValidationResult {
  is_valid: boolean;
  errors: ValidationError[];
}

/**
 * Опции для запросов к API
 */
export interface QueryOptions {
  page?: number;
  page_size?: number;
  sort?: ProductSortOptions;
  include_inactive?: boolean;
  include_related?: boolean;
}

/**
 * Статистика по банкам и продуктам
 */
export interface BankStatistics {
  total_banks: number;
  partner_banks: number;
  total_products: number;
  active_products: number;
  products_by_type: Record<ProductType, number>;
  average_rates: Record<ProductType, number>;
  top_rated_banks: Bank[];
}

/**
 * Конфигурация источника данных
 */
export interface DataSourceConfig {
  type: 'supabase' | 'local' | 'api';
  url?: string;
  api_key?: string;
  fallback_enabled: boolean;
  cache_ttl: number; // время жизни кэша в секундах
  retry_attempts: number;
  timeout: number; // таймаут запроса в миллисекундах
}

/**
 * Статус синхронизации данных
 */
export interface SyncStatus {
  last_sync: string;
  is_syncing: boolean;
  sync_progress: number; // 0-100
  errors: string[];
  next_sync?: string;
}