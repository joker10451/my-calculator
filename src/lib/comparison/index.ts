/**
 * Comparison Engine Module
 * Экспорт всех компонентов системы сравнения
 */

export { ComparisonEngine } from './ComparisonEngine';
export type {
  ComparisonResult,
  ProductHighlights,
  ProductFilters
} from './ComparisonEngine';

export { MatchingAlgorithm } from './MatchingAlgorithm';
export type {
  UserRequirements,
  UserPreferences,
  Constraint,
  OptimalSolution,
  RankedProduct,
  OptimizationReasoning,
  RiskLevel,
  ActionStep,
  EligibilityResult,
  RankingCriteria,
  Alternative,
  DetailedComparison,
  ProductComparison,
  ComparisonDifference,
  ProductCombination,
  MarketConditions,
  DynamicUpdate,
  ProductChange
} from './MatchingAlgorithm';
