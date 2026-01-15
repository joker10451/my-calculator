/**
 * React хук для работы с пользовательскими профилями
 * Предоставляет удобный интерфейс для отслеживания расчетов и управления профилем
 */

import { useState, useEffect, useCallback } from 'react';
import { UserProfileManager, type CalculationData, type UserBehaviorAnalysis } from '@/lib/recommendation';
import type { UserProfile, UserProfileData } from '@/types/bank';

export interface UseUserProfileResult {
  profile: UserProfile | null;
  behavior: UserBehaviorAnalysis | null;
  isLoading: boolean;
  error: Error | null;
  trackCalculation: (calculationData: CalculationData) => Promise<void>;
  updateProfile: (updates: Partial<UserProfileData>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshBehavior: () => Promise<void>;
}

/**
 * Хук для работы с профилем пользователя
 * @param userId - ID пользователя (если null, используется анонимный профиль)
 * @param autoLoad - автоматически загружать профиль при монтировании
 */
export function useUserProfile(
  userId: string | null = null,
  autoLoad: boolean = true
): UseUserProfileResult {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [behavior, setBehavior] = useState<UserBehaviorAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const profileManager = new UserProfileManager();

  /**
   * Загружает профиль пользователя
   */
  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let userProfile: UserProfile | null;

      if (userId) {
        userProfile = await profileManager.getUserProfile(userId);
        
        // Если профиль не найден, создаем новый
        if (!userProfile) {
          userProfile = await profileManager.createUserProfile({ user_id: userId });
        }
      } else {
        // Используем анонимный профиль
        userProfile = await profileManager.getOrCreateAnonymousProfile();
      }

      setProfile(userProfile);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load profile');
      setError(error);
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  /**
   * Загружает анализ поведения пользователя
   */
  const loadBehavior = useCallback(async () => {
    if (!profile) return;

    try {
      const analysis = await profileManager.analyzeUserBehavior(profile.user_id);
      setBehavior(analysis);
    } catch (err) {
      console.error('Error analyzing user behavior:', err);
    }
  }, [profile]);

  /**
   * Отслеживает расчет пользователя
   */
  const trackCalculation = useCallback(async (calculationData: CalculationData) => {
    if (!profile) {
      console.warn('Cannot track calculation: profile not loaded');
      return;
    }

    try {
      await profileManager.trackCalculation(profile.user_id, calculationData);
      
      // Обновляем профиль и поведение
      await loadProfile();
      await loadBehavior();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to track calculation');
      setError(error);
      console.error('Error tracking calculation:', error);
    }
  }, [profile, loadProfile, loadBehavior]);

  /**
   * Обновляет профиль пользователя
   */
  const updateProfile = useCallback(async (updates: Partial<UserProfileData>) => {
    if (!profile) {
      console.warn('Cannot update profile: profile not loaded');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedProfile = await profileManager.updateUserProfile(
        profile.user_id,
        updates,
        { update_last_active: true }
      );
      
      setProfile(updatedProfile);
      
      // Обновляем анализ поведения
      await loadBehavior();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update profile');
      setError(error);
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [profile, loadBehavior]);

  /**
   * Обновляет профиль из БД
   */
  const refreshProfile = useCallback(async () => {
    await loadProfile();
  }, [loadProfile]);

  /**
   * Обновляет анализ поведения
   */
  const refreshBehavior = useCallback(async () => {
    await loadBehavior();
  }, [loadBehavior]);

  // Автоматическая загрузка профиля при монтировании
  useEffect(() => {
    if (autoLoad) {
      loadProfile();
    }
  }, [autoLoad, loadProfile]);

  // Автоматическая загрузка анализа поведения при изменении профиля
  useEffect(() => {
    if (profile && autoLoad) {
      loadBehavior();
    }
  }, [profile, autoLoad, loadBehavior]);

  return {
    profile,
    behavior,
    isLoading,
    error,
    trackCalculation,
    updateProfile,
    refreshProfile,
    refreshBehavior
  };
}
