/**
 * Recommendation System Module
 * Экспорт всех компонентов системы рекомендаций
 */

export { UserProfileManager } from './UserProfileManager';
export type {
  CalculationData,
  UserBehaviorAnalysis,
  ProfileUpdateOptions
} from './UserProfileManager';

export { RecommendationSystem } from './RecommendationSystem';
export type {
  RecommendationContext,
  RecommendationTag,
  RecommendationResult,
  RecommendationExplanation,
  CrossCalculatorRecommendation,
  RecommendationExplanationDetailed
} from './RecommendationSystem';
