/**
 * UserProfileManager - Управление пользовательскими профилями
 * Requirements 7.1: store calculation parameters and preferences
 * Requirements 7.2: analyze calculation patterns and financial behavior
 */

import type {
  UserProfile,
  UserProfileData,
  CalculationHistoryItem,
  ProductType,
  EmploymentType,
  RiskTolerance
} from '@/types/bank';
import { supabase, handleDatabaseError } from '@/lib/database/supabase';
import { storage } from '@/shared/utils/storage';

export interface CalculationData {
  calculator_type: string;
  parameters: Record<string, any>;
  result: Record<string, any>;
  timestamp?: string;
  session_id?: string;
}

export interface UserBehaviorAnalysis {
  primary_interests: ProductType[];
  average_loan_amount?: number;
  average_term?: number;
  preferred_regions: string[];
  calculation_frequency: number;
  last_calculation_date: string;
  risk_profile: RiskTolerance;
  engagement_score: number; // 0-100
}

export interface ProfileUpdateOptions {
  merge_calculation_history?: boolean;
  update_last_active?: boolean;
  increment_session?: boolean;
}

export class UserProfileManager {
  private static readonly STORAGE_KEY_PREFIX = 'user_profile_';
  private static readonly ANONYMOUS_USER_ID = 'anonymous';
  private static readonly MAX_HISTORY_ITEMS = 100;

  /**
   * Получает профиль пользователя
   * Сначала пытается загрузить из БД, затем из localStorage
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Пытаемся загрузить из Supabase
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Профиль не найден, пытаемся загрузить из localStorage
          return this.getLocalProfile(userId);
        }
        throw error;
      }

      // Сохраняем в localStorage для оффлайн доступа
      if (data) {
        this.saveLocalProfile(data);
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback на localStorage
      return this.getLocalProfile(userId);
    }
  }

  /**
   * Создает новый профиль пользователя
   */
  async createUserProfile(profileData: UserProfileData): Promise<UserProfile> {
    const now = new Date().toISOString();
    
    const newProfileInsert = {
      user_id: profileData.user_id,
      monthly_income: profileData.monthly_income || null,
      credit_score: profileData.credit_score || null,
      employment_type: profileData.employment_type || null,
      region: profileData.region || null,
      age_range: profileData.age_range || null,
      risk_tolerance: profileData.risk_tolerance || null,
      preferred_banks: profileData.preferred_banks || [],
      blacklisted_banks: profileData.blacklisted_banks || [],
      calculation_history: profileData.calculation_history || [],
      product_interests: profileData.product_interests || [],
      last_active: now,
      session_count: 1,
      conversion_count: 0
    };

    try {
      // Пытаемся сохранить в Supabase
      const { data, error } = await supabase
        .from('user_profiles')
        .insert(newProfileInsert as any)
        .select()
        .single();

      if (error) throw error;

      // Сохраняем в localStorage
      this.saveLocalProfile(data);

      return data;
    } catch (error) {
      console.error('Error creating user profile:', error);
      // Fallback: сохраняем только в localStorage
      const fallbackProfile: UserProfile = {
        id: crypto.randomUUID(),
        ...newProfileInsert,
        created_at: now,
        updated_at: now
      };
      this.saveLocalProfile(fallbackProfile);
      return fallbackProfile;
    }
  }

  /**
   * Обновляет профиль пользователя
   */
  async updateUserProfile(
    userId: string,
    updates: Partial<UserProfileData>,
    options: ProfileUpdateOptions = {}
  ): Promise<UserProfile> {
    const {
      merge_calculation_history = true,
      update_last_active = true,
      increment_session = false
    } = options;

    // Получаем текущий профиль
    let currentProfile = await this.getUserProfile(userId);

    // Если профиля нет, создаем новый
    if (!currentProfile) {
      return this.createUserProfile({ user_id: userId, ...updates });
    }

    // Подготавливаем обновления для Supabase (без id, created_at)
    const profileUpdates: Record<string, any> = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    // Обновляем last_active если требуется
    if (update_last_active) {
      profileUpdates.last_active = new Date().toISOString();
    }

    // Увеличиваем счетчик сессий если требуется
    if (increment_session) {
      profileUpdates.session_count = (currentProfile.session_count || 0) + 1;
    }

    // Объединяем историю расчетов если требуется
    if (merge_calculation_history && updates.calculation_history) {
      const existingHistory = currentProfile.calculation_history || [];
      const newHistory = updates.calculation_history;
      
      // Объединяем и ограничиваем количество записей
      profileUpdates.calculation_history = [
        ...newHistory,
        ...existingHistory
      ].slice(0, UserProfileManager.MAX_HISTORY_ITEMS);
    }

    try {
      // Обновляем в Supabase
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileUpdates as any)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Обновляем в localStorage
      this.saveLocalProfile(data);

      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      
      // Fallback: обновляем в localStorage
      const updatedProfile: UserProfile = {
        ...currentProfile,
        ...profileUpdates,
        id: currentProfile.id,
        created_at: currentProfile.created_at
      };
      this.saveLocalProfile(updatedProfile);
      return updatedProfile;
    }
  }

  /**
   * Добавляет расчет в историю пользователя
   * Requirements 7.1: store calculation parameters
   */
  async trackCalculation(
    userId: string,
    calculationData: CalculationData
  ): Promise<void> {
    const historyItem: CalculationHistoryItem = {
      calculator_type: calculationData.calculator_type,
      parameters: calculationData.parameters,
      result: calculationData.result,
      timestamp: calculationData.timestamp || new Date().toISOString(),
      session_id: calculationData.session_id
    };

    // Определяем тип продукта из типа калькулятора
    const productType = this.inferProductType(calculationData.calculator_type);

    // Получаем текущий профиль
    const currentProfile = await this.getUserProfile(userId);

    // Обновляем интересы к продуктам
    const productInterests = currentProfile?.product_interests || [];
    if (productType && !productInterests.includes(productType)) {
      productInterests.push(productType);
    }

    // Обновляем профиль с новым расчетом
    await this.updateUserProfile(
      userId,
      {
        calculation_history: [historyItem],
        product_interests: productInterests
      },
      {
        merge_calculation_history: true,
        update_last_active: true
      }
    );
  }

  /**
   * Анализирует поведение пользователя на основе истории расчетов
   * Requirements 7.2: analyze calculation patterns and financial behavior
   */
  async analyzeUserBehavior(userId: string): Promise<UserBehaviorAnalysis> {
    const profile = await this.getUserProfile(userId);

    if (!profile || !profile.calculation_history || profile.calculation_history.length === 0) {
      // Возвращаем дефолтный анализ для нового пользователя
      return {
        primary_interests: [],
        preferred_regions: [],
        calculation_frequency: 0,
        last_calculation_date: new Date().toISOString(),
        risk_profile: 'medium',
        engagement_score: 0
      };
    }

    const history = profile.calculation_history;

    // Анализируем основные интересы
    const calculatorTypes = history.map(h => h.calculator_type);
    const primaryInterests = this.identifyPrimaryInterests(calculatorTypes);

    // Анализируем средние суммы и сроки
    const { averageAmount, averageTerm } = this.calculateAverages(history);

    // Определяем предпочитаемые регионы
    const preferredRegions = this.extractPreferredRegions(history);

    // Вычисляем частоту расчетов
    const calculationFrequency = this.calculateFrequency(history);

    // Определяем дату последнего расчета
    const lastCalculationDate = history[0]?.timestamp || new Date().toISOString();

    // Определяем риск-профиль
    const riskProfile = this.determineRiskProfile(profile, history);

    // Вычисляем engagement score
    const engagementScore = this.calculateEngagementScore(profile, history);

    return {
      primary_interests: primaryInterests,
      average_loan_amount: averageAmount,
      average_term: averageTerm,
      preferred_regions: preferredRegions,
      calculation_frequency: calculationFrequency,
      last_calculation_date: lastCalculationDate,
      risk_profile: riskProfile,
      engagement_score: engagementScore
    };
  }

  /**
   * Определяет тип продукта из типа калькулятора
   */
  private inferProductType(calculatorType: string): ProductType | null {
    const typeMap: Record<string, ProductType> = {
      'mortgage': 'mortgage',
      'mortgage_calculator': 'mortgage',
      'deposit': 'deposit',
      'deposit_calculator': 'deposit',
      'credit': 'credit',
      'credit_calculator': 'credit',
      'loan': 'credit',
      'insurance': 'insurance'
    };

    const normalized = calculatorType.toLowerCase();
    return typeMap[normalized] || null;
  }

  /**
   * Определяет основные интересы пользователя
   */
  private identifyPrimaryInterests(calculatorTypes: string[]): ProductType[] {
    const typeCounts = new Map<ProductType, number>();

    calculatorTypes.forEach(type => {
      const productType = this.inferProductType(type);
      if (productType) {
        typeCounts.set(productType, (typeCounts.get(productType) || 0) + 1);
      }
    });

    // Сортируем по частоте использования
    return Array.from(typeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([type]) => type);
  }

  /**
   * Вычисляет средние значения из истории расчетов
   */
  private calculateAverages(history: CalculationHistoryItem[]): {
    averageAmount?: number;
    averageTerm?: number;
  } {
    const amounts: number[] = [];
    const terms: number[] = [];

    history.forEach(item => {
      // Извлекаем суммы
      if (item.parameters.amount) {
        amounts.push(Number(item.parameters.amount));
      } else if (item.parameters.loan_amount) {
        amounts.push(Number(item.parameters.loan_amount));
      } else if (item.parameters.property_price) {
        amounts.push(Number(item.parameters.property_price));
      }

      // Извлекаем сроки
      if (item.parameters.term) {
        terms.push(Number(item.parameters.term));
      } else if (item.parameters.loan_term) {
        terms.push(Number(item.parameters.loan_term));
      }
    });

    return {
      averageAmount: amounts.length > 0
        ? amounts.reduce((sum, val) => sum + val, 0) / amounts.length
        : undefined,
      averageTerm: terms.length > 0
        ? terms.reduce((sum, val) => sum + val, 0) / terms.length
        : undefined
    };
  }

  /**
   * Извлекает предпочитаемые регионы из истории
   */
  private extractPreferredRegions(history: CalculationHistoryItem[]): string[] {
    const regionCounts = new Map<string, number>();

    history.forEach(item => {
      const region = item.parameters.region || item.parameters.location;
      if (region && typeof region === 'string') {
        regionCounts.set(region, (regionCounts.get(region) || 0) + 1);
      }
    });

    return Array.from(regionCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([region]) => region);
  }

  /**
   * Вычисляет частоту расчетов (расчетов в день)
   */
  private calculateFrequency(history: CalculationHistoryItem[]): number {
    if (history.length < 2) return 0;

    const timestamps = history
      .map(h => new Date(h.timestamp).getTime())
      .sort((a, b) => a - b);

    const firstDate = timestamps[0];
    const lastDate = timestamps[timestamps.length - 1];
    const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);

    return daysDiff > 0 ? history.length / daysDiff : history.length;
  }

  /**
   * Определяет риск-профиль пользователя
   */
  private determineRiskProfile(
    profile: UserProfile,
    history: CalculationHistoryItem[]
  ): RiskTolerance {
    // Если пользователь явно указал риск-толерантность, используем её
    if (profile.risk_tolerance) {
      return profile.risk_tolerance;
    }

    // Анализируем поведение
    const { averageAmount, averageTerm } = this.calculateAverages(history);

    // Простая эвристика для определения риск-профиля
    if (averageAmount && averageTerm) {
      // Большие суммы и длинные сроки = низкий риск (консервативный)
      if (averageAmount > 5000000 && averageTerm > 180) {
        return 'low';
      }
      // Средние значения = средний риск
      if (averageAmount > 1000000 && averageTerm > 60) {
        return 'medium';
      }
      // Маленькие суммы и короткие сроки = высокий риск (агрессивный)
      return 'high';
    }

    return 'medium'; // дефолт
  }

  /**
   * Вычисляет engagement score (0-100)
   */
  private calculateEngagementScore(
    profile: UserProfile,
    history: CalculationHistoryItem[]
  ): number {
    let score = 0;

    // Количество расчетов (макс 30 баллов)
    score += Math.min(history.length * 3, 30);

    // Количество сессий (макс 20 баллов)
    score += Math.min(profile.session_count * 2, 20);

    // Разнообразие калькуляторов (макс 20 баллов)
    const uniqueCalculators = new Set(history.map(h => h.calculator_type)).size;
    score += Math.min(uniqueCalculators * 5, 20);

    // Недавняя активность (макс 15 баллов)
    const daysSinceLastActive = (Date.now() - new Date(profile.last_active).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLastActive < 1) score += 15;
    else if (daysSinceLastActive < 7) score += 10;
    else if (daysSinceLastActive < 30) score += 5;

    // Конверсии (макс 15 баллов)
    score += Math.min(profile.conversion_count * 5, 15);

    return Math.min(score, 100);
  }

  /**
   * Получает профиль из localStorage
   */
  private getLocalProfile(userId: string): UserProfile | null {
    const key = `${UserProfileManager.STORAGE_KEY_PREFIX}${userId}`;
    return storage.get(key, null);
  }

  /**
   * Сохраняет профиль в localStorage
   */
  private saveLocalProfile(profile: UserProfile): void {
    const key = `${UserProfileManager.STORAGE_KEY_PREFIX}${profile.user_id}`;
    storage.set(key, profile);
  }

  /**
   * Получает или создает анонимный профиль для неавторизованных пользователей
   */
  async getOrCreateAnonymousProfile(): Promise<UserProfile> {
    const anonymousId = UserProfileManager.ANONYMOUS_USER_ID;
    
    let profile = await this.getUserProfile(anonymousId);
    
    if (!profile) {
      profile = await this.createUserProfile({
        user_id: anonymousId
      });
    }

    return profile;
  }

  /**
   * Очищает локальные данные профиля
   */
  clearLocalProfile(userId: string): void {
    const key = `${UserProfileManager.STORAGE_KEY_PREFIX}${userId}`;
    storage.remove(key);
  }

  /**
   * Синхронизирует локальный профиль с сервером
   */
  async syncProfile(userId: string): Promise<UserProfile | null> {
    try {
      // Загружаем из БД
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Обновляем локальную копию
      if (data) {
        this.saveLocalProfile(data);
      }

      return data;
    } catch (error) {
      console.error('Error syncing profile:', error);
      return null;
    }
  }
}
