/**
 * React хук для работы с системой рекомендаций
 * Предоставляет удобный интерфейс для получения персонализированных рекомендаций
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  RecommendationSystem, 
  type RecommendationContext, 
  type RecommendationResult 
} from '@/lib/recommendation';

export interface UseRecommendationsOptions {
  userId: string | null;
  context: RecommendationContext;
  limit?: number;
  autoLoad?: boolean;
}

export interface UseRecommendationsResult {
  recommendations: RecommendationResult[];
  isLoading: boolean;
  error: Error | null;
  loadRecommendations: () => Promise<void>;
  provideFeedback: (recommendationId: string, feedback: 'clicked' | 'dismissed' | 'applied') => Promise<void>;
  refreshRecommendations: () => Promise<void>;
}

/**
 * Хук для получения персонализированных рекомендаций
 * @param options - опции для получения рекомендаций
 */
export function useRecommendations(options: UseRecommendationsOptions): UseRecommendationsResult {
  const { userId, context, limit = 5, autoLoad = true } = options;
  
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const recommendationSystem = new RecommendationSystem();

  /**
   * Загружает рекомендации
   */
  const loadRecommendations = useCallback(async () => {
    if (!userId) {
      setError(new Error('User ID is required'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await recommendationSystem.getPersonalizedRecommendations(
        userId,
        context,
        limit
      );
      
      setRecommendations(results);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load recommendations');
      setError(error);
      console.error('Error loading recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, context, limit]);

  /**
   * Предоставляет обратную связь по рекомендации
   */
  const provideFeedback = useCallback(async (
    recommendationId: string,
    feedback: 'clicked' | 'dismissed' | 'applied'
  ) => {
    if (!userId) return;

    try {
      await recommendationSystem.learnFromFeedback(userId, recommendationId, feedback);
      
      // Если пользователь применил рекомендацию, обновляем список
      if (feedback === 'applied') {
        await loadRecommendations();
      }
    } catch (err) {
      console.error('Error providing feedback:', err);
    }
  }, [userId, loadRecommendations]);

  /**
   * Обновляет рекомендации
   */
  const refreshRecommendations = useCallback(async () => {
    await loadRecommendations();
  }, [loadRecommendations]);

  // Автоматическая загрузка рекомендаций при монтировании
  useEffect(() => {
    if (autoLoad && userId) {
      loadRecommendations();
    }
  }, [autoLoad, userId, loadRecommendations]);

  return {
    recommendations,
    isLoading,
    error,
    loadRecommendations,
    provideFeedback,
    refreshRecommendations
  };
}
