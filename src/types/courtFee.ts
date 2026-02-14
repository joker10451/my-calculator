/**
 * Типы данных для калькулятора госпошлины в суд
 * Основано на НК РФ статьи 333.19, 333.21, 333.36, 333.37
 */

// Основные типы судов
export type CourtType = 'general' | 'arbitration';

// Типы льгот
export type DiscountType = 'percentage' | 'fixed' | 'exempt';

// Типы правил расчета пошлины
export type FeeType = 'percentage' | 'fixed' | 'progressive';

/**
 * Категория льготников
 */
export interface ExemptionCategory {
  id: string;
  name: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  applicableCourts: CourtType[];
  legalBasis: string;
}

/**
 * Правило расчета госпошлины
 */
export interface FeeRule {
  minAmount: number;
  maxAmount: number | null;
  feeType: FeeType;
  feeValue: number;
  minimumFee?: number;
  maximumFee?: number;
  formula: string;
  legalBasis: string;
}

/**
 * Расписание госпошлин для типа суда
 */
export interface FeeSchedule {
  courtType: CourtType;
  version: string;
  lastUpdated: Date;
  rules: FeeRule[];
}

/**
 * Элемент детализации расчета
 */
export interface FeeBreakdownItem {
  description: string;
  amount: number;
  formula?: string;
  legalBasis: string;
}

/**
 * Правовая ссылка
 */
export interface LegalReference {
  article: string;
  paragraph?: string;
  description: string;
  url: string;
  lastVerified: Date;
}

/**
 * Результат расчета госпошлины
 */
export interface CalculationResult {
  baseFee: number;
  exemptionDiscount: number;
  finalFee: number;
  effectiveRate: number;
  breakdown: FeeBreakdownItem[];
  legalReferences: LegalReference[];
}

/**
 * Входные данные для расчета
 */
export interface CalculationInput {
  claimAmount: number;
  courtType: CourtType;
  exemptionCategory?: ExemptionCategory;
}

/**
 * Полный расчет госпошлины
 */
export interface CourtFeeCalculation {
  id: string;
  timestamp: Date;
  input: CalculationInput;
  result: CalculationResult;
}

/**
 * Промежуточный результат расчета (до применения льгот)
 */
export interface FeeCalculation {
  amount: number;
  formula: string;
  breakdown: FeeBreakdownItem[];
  applicableArticle: string;
}

/**
 * Конфигурация тарифных сеток
 */
export interface FeeScheduleConfig {
  general: {
    rules: Array<{
      min: number;
      max: number | null;
      rate?: number;
      minFee?: number;
      fixedFee?: number;
      fixedPart?: number;
    }>;
  };
  arbitration: {
    rules: Array<{
      min: number;
      max: number | null;
      rate?: number;
      minFee?: number;
      fixedFee?: number;
      fixedPart?: number;
    }>;
  };
}

/**
 * Состояние калькулятора
 */
export interface CourtFeeCalculatorState {
  claimAmount: number;
  courtType: CourtType;
  exemptionCategory: ExemptionCategory | null;
  calculationResult: CalculationResult | null;
  isCalculating: boolean;
  error: string | null;
}

/**
 * Интерфейс для движка расчетов
 */
export interface FeeCalculationEngine {
  calculateGeneralJurisdictionFee(amount: number): FeeCalculation;
  calculateArbitrationFee(amount: number): FeeCalculation;
  applyExemptions(calculation: FeeCalculation, exemption: ExemptionCategory): FeeCalculation;
}

/**
 * Интерфейс для менеджера льгот
 */
export interface ExemptionManager {
  getAvailableExemptions(courtType: CourtType): ExemptionCategory[];
  validateExemption(exemption: ExemptionCategory, courtType: CourtType): boolean;
  calculateDiscount(baseFee: number, exemption: ExemptionCategory): number;
}

/**
 * Статус актуальности данных
 */
export interface DataFreshnessStatus {
  isUpToDate: boolean;
  lastUpdateDate: Date;
  daysSinceUpdate: number;
  warningMessage?: string;
}

/**
 * Метаданные о версии данных
 */
export interface DataVersionInfo {
  version: string;
  releaseDate: Date;
  source: string;
  checksum?: string;
}

/**
 * Интерфейс для сервиса данных о пошлинах
 */
export interface FeeDataService {
  getCurrentSchedule(courtType: CourtType): Promise<FeeSchedule>;
  checkForUpdates(): Promise<boolean>;
  updateSchedule(courtType: CourtType): Promise<FeeSchedule>;
  getLastUpdateDate(): Date;
  checkDataFreshness(): DataFreshnessStatus;
  getDataVersionInfo(): DataVersionInfo;
  validateDataIntegrity(): boolean;
}