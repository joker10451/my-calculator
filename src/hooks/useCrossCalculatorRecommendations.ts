/**
 * React hook для работы с кросс-калькуляторными рекомендациями
 * Requirements 2.4: comprehensive recommendations across multiple calculators
 * Requirements 2.5: explain why each product was suggested
 */

import { useState, useEffect, useCallback } from 'react';
import { RecommendationSystem, type CrossCalculatorRecommendation } from '@/lib/recommendation/RecommendationSystem';

interface UseCrossCalculatorRecommendationsOptions {
  userId: string;
  limit?: number;
  autoLoad?: boolean;
}

interface UseCrossCalculatorRecommendationsReturn {
  recommendations: CrossCalculatorRecommendation[];
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  hasMultipleCalculators: boolean;
}

/**
 * Hook для получения кросс-калькуляторных рекомендаций
 */
export function useCrossCalculatorRecommendations(
  options: UseCrossCalculatorRecommendationsOptions
): UseCrossCalculatorRecommendationsReturn {
  const { userId, limit = 10, autoLoad = true } = options;
  
  const [recommendations, setRecommendations] = useState<CrossCalculatorRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMultipleCalculators, setHasMultipleCalculators] = useState(false);

  const recommendationSystem = new RecommendationSystem();

  const loadRecommendations = useCallback(async () => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await recommendationSystem.getCrossCalculatorRecommendations(userId, limit);
      setRecommendations(results);
      setHasMultipleCalculators(results.length > 0);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load recommendations'));
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    if (autoLoad) {
      loadRecommendations();
    }
  }, [autoLoad, loadRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    refresh: loadRecommendations,
    hasMultipleCalculators
  };
}
