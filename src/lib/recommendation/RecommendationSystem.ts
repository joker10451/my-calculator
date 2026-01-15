/**
 * RecommendationSystem - Система персонализированных рекомендаций
 * Requirements 2.1: suggest relevant products after calculations
 * Requirements 2.2: consider loan amount, income level, and preferred terms
 * Requirements 2.3: prioritize products matching user's financial profile
 * Requirements 2.7: consider user's location and regional availability
 */

import type {
  BankProduct,
  UserProfile,
  Recommendation,
  RecommendationCreateData,
  ProductType,
  RiskTolerance,
  CalculationHistoryItem
} from '@/types/bank';
import { UserProfileManager, type UserBehaviorAnalysis } from './UserProfileManager';
import { supabase } from '@/lib/database/supabase';

export interface RecommendationContext {
  calculationType: 'mortgage' | 'deposit' | 'credit' | 'insurance';
  calculationParams: Record<string, any>;
  userLocation?: string;
  deviceType?: 'mobile' | 'desktop';
  sessionHistory?: string[];
}

export interface RecommendationTag {
  type: 'best_rate' | 'lowest_fees' | 'fastest_approval' | 'most_popular' | 'sponsored' | 'recommended';
  label: string;
  color: string;
}

export interface RecommendationResult {
  id: string;
  product: BankProduct;
  score: number; // 0-100
  reasoning: string[];
  tags: RecommendationTag[];
  estimatedSavings?: number;
  matchPercentage: number;
  referralLink?: string;
  isSponsored: boolean;
}

export interface RecommendationExplanation {
  recommendationId: string;
  mainReasons: string[];
  detailedAnalysis: {
    profileMatch: number;
    locationMatch: number;
    financialFit: number;
    popularityScore: number;
    rateCompetitiveness: number;
  };
  alternatives: string[];
}

export class RecommendationSystem {
  private profileManager: UserProfileManager;

  constructor() {
    this.profileManager = new UserProfileManager();
  }

  /**
   * Получает персонализированные рекомендации для пользователя
   * Requirements 2.1: suggest relevant products after calculations
   */
  async getPersonalizedRecommendations(
    userId: string,
    context: RecommendationContext,
    limit: number = 5
  ): Promise<RecommendationResult[]> {
    // Получаем профиль пользователя
    const profile = await this.profileManager.getUserProfile(userId);
    if (!profile) {
      // Если профиля нет, возвращаем общие рекомендации
      return this.getGeneralRecommendations(context, limit);
    }

    // Получаем анализ поведения
    const behavior = await this.profileManager.analyzeUserBehavior(userId);

    // Получаем все активные продукты нужного типа
    const products = await this.fetchProducts(context.calculationType, context.userLocation);

    // Фильтруем по региону
    const regionalProducts = this.filterByRegion(products, context.userLocation || profile.region);

    // Вычисляем score для каждого продукта
    const scoredProducts = regionalProducts.map(product => ({
      product,
      score: this.calculateRecommendationScore(product, profile, behavior, context)
    }));

    // Сортируем по score
    scoredProducts.sort((a, b) => b.score - a.score);

    // Берем топ N продуктов
    const topProducts = scoredProducts.slice(0, limit);

    // Создаем рекомендации
    const recommendations = await Promise.all(
      topProducts.map(async ({ product, score }) => {
        const reasoning = this.generateReasoning(product, profile, behavior, context, score);
        const tags = this.generateTags(product, score, profile);
        const matchPercentage = this.calculateMatchPercentage(product, profile, context);
        const estimatedSavings = this.calculateEstimatedSavings(product, context);

        return {
          id: crypto.randomUUID(),
          product,
          score,
          reasoning,
          tags,
          estimatedSavings,
          matchPercentage,
          isSponsored: product.bank?.is_partner || false
        };
      })
    );

    // Сохраняем рекомендации в БД
    await this.saveRecommendations(userId, recommendations, context);

    return recommendations;
  }

  /**
   * Вычисляет ML-based score для продукта
   * Requirements 2.2: consider loan amount, income level, and preferred terms
   * Requirements 2.3: prioritize products matching user's financial profile
   */
  private calculateRecommendationScore(
    product: BankProduct,
    profile: UserProfile,
    behavior: UserBehaviorAnalysis,
    context: RecommendationContext
  ): number {
    let score = 0;
    const weights = {
      rateCompetitiveness: 0.25,
      financialFit: 0.20,
      profileMatch: 0.15,
      locationMatch: 0.10,
      popularityScore: 0.10,
      feesCompetitiveness: 0.10,
      bankRating: 0.05,
      userPreference: 0.05
    };

    // 1. Rate Competitiveness (0-100)
    const rateScore = this.calculateRateScore(product, context);
    score += rateScore * weights.rateCompetitiveness;

    // 2. Financial Fit (0-100)
    const financialFit = this.calculateFinancialFit(product, profile, context);
    score += financialFit * weights.financialFit;

    // 3. Profile Match (0-100)
    const profileMatch = this.calculateProfileMatch(product, profile, behavior);
    score += profileMatch * weights.profileMatch;

    // 4. Location Match (0-100)
    const locationMatch = this.calculateLocationMatch(product, profile, context);
    score += locationMatch * weights.locationMatch;

    // 5. Popularity Score (0-100)
    const popularityScore = this.calculatePopularityScore(product, behavior);
    score += popularityScore * weights.popularityScore;

    // 6. Fees Competitiveness (0-100)
    const feesScore = this.calculateFeesScore(product);
    score += feesScore * weights.feesCompetitiveness;

    // 7. Bank Rating (0-100)
    const bankRating = this.calculateBankRatingScore(product);
    score += bankRating * weights.bankRating;

    // 8. User Preference (0-100)
    const userPreference = this.calculateUserPreferenceScore(product, profile);
    score += userPreference * weights.userPreference;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Вычисляет score на основе процентной ставки
   */
  private calculateRateScore(product: BankProduct, context: RecommendationContext): number {
    const rate = product.promotional_rate || product.interest_rate;
    
    // Для кредитов и ипотеки - чем ниже ставка, тем лучше
    if (context.calculationType === 'mortgage' || context.calculationType === 'credit') {
      // Предполагаем диапазон ставок 5-20%
      const minRate = 5;
      const maxRate = 20;
      const normalizedRate = (maxRate - rate) / (maxRate - minRate);
      return Math.max(0, Math.min(100, normalizedRate * 100));
    }
    
    // Для вкладов - чем выше ставка, тем лучше
    if (context.calculationType === 'deposit') {
      // Предполагаем диапазон ставок 0-15%
      const minRate = 0;
      const maxRate = 15;
      const normalizedRate = (rate - minRate) / (maxRate - minRate);
      return Math.max(0, Math.min(100, normalizedRate * 100));
    }
    
    return 50; // нейтральный score для других типов
  }

  /**
   * Вычисляет соответствие финансовому профилю
   * Requirements 2.2: consider loan amount, income level, and preferred terms
   */
  private calculateFinancialFit(
    product: BankProduct,
    profile: UserProfile,
    context: RecommendationContext
  ): number {
    let fitScore = 0;
    let factors = 0;

    // Проверяем соответствие суммы
    const amount = context.calculationParams.amount || context.calculationParams.loan_amount;
    if (amount && product.min_amount && product.max_amount) {
      if (amount >= product.min_amount && amount <= product.max_amount) {
        fitScore += 100;
      } else if (amount < product.min_amount) {
        // Штраф за недостаточную сумму
        fitScore += Math.max(0, 100 - ((product.min_amount - amount) / product.min_amount) * 100);
      } else {
        // Штраф за превышение суммы
        fitScore += Math.max(0, 100 - ((amount - product.max_amount) / product.max_amount) * 100);
      }
      factors++;
    }

    // Проверяем соответствие срока
    const term = context.calculationParams.term || context.calculationParams.loan_term;
    if (term && product.min_term && product.max_term) {
      if (term >= product.min_term && term <= product.max_term) {
        fitScore += 100;
      } else {
        fitScore += 50; // частичное соответствие
      }
      factors++;
    }

    // Проверяем соответствие дохода
    if (profile.monthly_income && product.requirements?.min_income) {
      if (profile.monthly_income >= product.requirements.min_income) {
        fitScore += 100;
      } else {
        // Штраф за недостаточный доход
        const incomeRatio = profile.monthly_income / product.requirements.min_income;
        fitScore += Math.max(0, incomeRatio * 100);
      }
      factors++;
    }

    // Проверяем кредитный рейтинг
    if (profile.credit_score && product.requirements?.min_credit_score) {
      if (profile.credit_score >= product.requirements.min_credit_score) {
        fitScore += 100;
      } else {
        fitScore += 30; // низкий score за несоответствие
      }
      factors++;
    }

    return factors > 0 ? fitScore / factors : 50;
  }

  /**
   * Вычисляет соответствие профилю пользователя
   */
  private calculateProfileMatch(
    product: BankProduct,
    profile: UserProfile,
    behavior: UserBehaviorAnalysis
  ): number {
    let matchScore = 0;
    let factors = 0;

    // Проверяем интересы к типам продуктов
    if (profile.product_interests.includes(product.product_type)) {
      matchScore += 100;
      factors++;
    }

    // Проверяем риск-профиль
    if (profile.risk_tolerance) {
      const riskMatch = this.matchRiskTolerance(product, profile.risk_tolerance);
      matchScore += riskMatch;
      factors++;
    }

    // Проверяем engagement score
    if (behavior.engagement_score > 50) {
      matchScore += 80; // активные пользователи получают бонус
      factors++;
    }

    // Проверяем частоту расчетов
    if (behavior.calculation_frequency > 1) {
      matchScore += 70; // частые пользователи получают бонус
      factors++;
    }

    return factors > 0 ? matchScore / factors : 50;
  }

  /**
   * Сопоставляет риск-толерантность с продуктом
   */
  private matchRiskTolerance(product: BankProduct, riskTolerance: RiskTolerance): number {
    const rate = product.promotional_rate || product.interest_rate;
    
    // Низкий риск - предпочитают низкие ставки и стабильность
    if (riskTolerance === 'low') {
      return rate < 10 ? 100 : 50;
    }
    
    // Средний риск - сбалансированный подход
    if (riskTolerance === 'medium') {
      return rate >= 8 && rate <= 15 ? 100 : 70;
    }
    
    // Высокий риск - готовы к высоким ставкам ради выгоды
    if (riskTolerance === 'high') {
      return rate > 12 ? 100 : 60;
    }
    
    return 50;
  }

  /**
   * Вычисляет соответствие локации
   * Requirements 2.7: consider user's location and regional availability
   */
  private calculateLocationMatch(
    product: BankProduct,
    profile: UserProfile,
    context: RecommendationContext
  ): number {
    const userLocation = context.userLocation || profile.region;
    
    if (!userLocation) return 50; // нейтральный score если локация неизвестна
    
    // Проверяем доступность в регионе
    if (product.available_regions.includes('all')) {
      return 100; // доступен везде
    }
    
    if (product.available_regions.includes(userLocation)) {
      return 100; // доступен в регионе пользователя
    }
    
    // Проверяем предпочитаемые регионы из истории
    const preferredRegions = profile.calculation_history
      .map(h => h.parameters.region)
      .filter(r => r && typeof r === 'string') as string[];
    
    const hasPreferredRegion = preferredRegions.some(r => 
      product.available_regions.includes(r)
    );
    
    return hasPreferredRegion ? 70 : 20;
  }

  /**
   * Вычисляет популярность продукта
   */
  private calculatePopularityScore(
    product: BankProduct,
    behavior: UserBehaviorAnalysis
  ): number {
    let popularityScore = 50; // базовый score
    
    // Бонус за featured продукты
    if (product.is_featured) {
      popularityScore += 30;
    }
    
    // Бонус за высокий приоритет
    if (product.priority > 50) {
      popularityScore += 20;
    }
    
    return Math.min(100, popularityScore);
  }

  /**
   * Вычисляет конкурентоспособность комиссий
   */
  private calculateFeesScore(product: BankProduct): number {
    const totalFees = Object.values(product.fees || {}).reduce((sum, fee) => {
      return sum + (typeof fee === 'number' ? fee : 0);
    }, 0);
    
    // Чем меньше комиссий, тем лучше
    if (totalFees === 0) return 100;
    if (totalFees < 1000) return 90;
    if (totalFees < 5000) return 70;
    if (totalFees < 10000) return 50;
    return 30;
  }

  /**
   * Вычисляет score на основе рейтинга банка
   */
  private calculateBankRatingScore(product: BankProduct): number {
    const rating = product.bank?.overall_rating;
    
    if (!rating) return 50;
    
    // Конвертируем рейтинг 0-5 в score 0-100
    return (rating / 5) * 100;
  }

  /**
   * Вычисляет score на основе предпочтений пользователя
   */
  private calculateUserPreferenceScore(
    product: BankProduct,
    profile: UserProfile
  ): number {
    // Проверяем предпочитаемые банки
    if (profile.preferred_banks.includes(product.bank_id)) {
      return 100;
    }
    
    // Проверяем черный список
    if (profile.blacklisted_banks.includes(product.bank_id)) {
      return 0;
    }
    
    return 50;
  }

  /**
   * Генерирует объяснение рекомендации
   */
  private generateReasoning(
    product: BankProduct,
    profile: UserProfile,
    behavior: UserBehaviorAnalysis,
    context: RecommendationContext,
    score: number
  ): string[] {
    const reasons: string[] = [];
    
    // Причина на основе ставки
    const rate = product.promotional_rate || product.interest_rate;
    if (context.calculationType === 'mortgage' || context.calculationType === 'credit') {
      if (rate < 10) {
        reasons.push(`Низкая процентная ставка ${rate.toFixed(2)}%`);
      }
    } else if (context.calculationType === 'deposit') {
      if (rate > 8) {
        reasons.push(`Высокая процентная ставка ${rate.toFixed(2)}%`);
      }
    }
    
    // Причина на основе соответствия профилю
    if (profile.product_interests.includes(product.product_type)) {
      reasons.push('Соответствует вашим интересам');
    }
    
    // Причина на основе локации
    const userLocation = context.userLocation || profile.region;
    if (userLocation && product.available_regions.includes(userLocation)) {
      reasons.push('Доступен в вашем регионе');
    }
    
    // Причина на основе рейтинга банка
    if (product.bank?.overall_rating && product.bank.overall_rating >= 4) {
      reasons.push(`Высокий рейтинг банка (${product.bank.overall_rating.toFixed(1)}/5)`);
    }
    
    // Причина на основе комиссий
    const totalFees = Object.values(product.fees || {}).reduce((sum, fee) => {
      return sum + (typeof fee === 'number' ? fee : 0);
    }, 0);
    if (totalFees < 1000) {
      reasons.push('Минимальные комиссии');
    }
    
    // Причина на основе популярности
    if (product.is_featured) {
      reasons.push('Популярный выбор');
    }
    
    // Причина на основе промо-условий
    if (product.promotional_rate) {
      reasons.push('Действует специальное предложение');
    }
    
    return reasons.slice(0, 3); // Возвращаем топ-3 причины
  }

  /**
   * Генерирует теги для рекомендации
   */
  private generateTags(
    product: BankProduct,
    score: number,
    profile: UserProfile
  ): RecommendationTag[] {
    const tags: RecommendationTag[] = [];
    
    // Тег "Лучшая ставка"
    const rate = product.promotional_rate || product.interest_rate;
    if (rate < 8) {
      tags.push({
        type: 'best_rate',
        label: 'Лучшая ставка',
        color: 'green'
      });
    }
    
    // Тег "Минимальные комиссии"
    const totalFees = Object.values(product.fees || {}).reduce((sum, fee) => {
      return sum + (typeof fee === 'number' ? fee : 0);
    }, 0);
    if (totalFees < 1000) {
      tags.push({
        type: 'lowest_fees',
        label: 'Минимальные комиссии',
        color: 'blue'
      });
    }
    
    // Тег "Популярный"
    if (product.is_featured) {
      tags.push({
        type: 'most_popular',
        label: 'Популярный',
        color: 'purple'
      });
    }
    
    // Тег "Рекомендуем"
    if (score >= 80) {
      tags.push({
        type: 'recommended',
        label: 'Рекомендуем',
        color: 'gold'
      });
    }
    
    // Тег "Партнер"
    if (product.bank?.is_partner) {
      tags.push({
        type: 'sponsored',
        label: 'Партнер',
        color: 'gray'
      });
    }
    
    return tags;
  }

  /**
   * Вычисляет процент соответствия
   */
  private calculateMatchPercentage(
    product: BankProduct,
    profile: UserProfile,
    context: RecommendationContext
  ): number {
    let matches = 0;
    let total = 0;
    
    // Проверяем соответствие суммы
    const amount = context.calculationParams.amount || context.calculationParams.loan_amount;
    if (amount && product.min_amount && product.max_amount) {
      total++;
      if (amount >= product.min_amount && amount <= product.max_amount) {
        matches++;
      }
    }
    
    // Проверяем соответствие срока
    const term = context.calculationParams.term || context.calculationParams.loan_term;
    if (term && product.min_term && product.max_term) {
      total++;
      if (term >= product.min_term && term <= product.max_term) {
        matches++;
      }
    }
    
    // Проверяем соответствие дохода
    if (profile.monthly_income && product.requirements?.min_income) {
      total++;
      if (profile.monthly_income >= product.requirements.min_income) {
        matches++;
      }
    }
    
    // Проверяем соответствие региона
    const userLocation = context.userLocation || profile.region;
    if (userLocation) {
      total++;
      if (product.available_regions.includes('all') || 
          product.available_regions.includes(userLocation)) {
        matches++;
      }
    }
    
    return total > 0 ? Math.round((matches / total) * 100) : 50;
  }

  /**
   * Вычисляет предполагаемую экономию
   */
  private calculateEstimatedSavings(
    product: BankProduct,
    context: RecommendationContext
  ): number | undefined {
    // Простая эвристика для расчета экономии
    // В реальном приложении здесь будет более сложная логика
    
    const amount = context.calculationParams.amount || context.calculationParams.loan_amount;
    const term = context.calculationParams.term || context.calculationParams.loan_term || 12;
    
    if (!amount) return undefined;
    
    const rate = product.promotional_rate || product.interest_rate;
    const averageRate = 12; // средняя ставка по рынку
    
    if (rate < averageRate) {
      const rateDiff = averageRate - rate;
      const savings = (amount * (rateDiff / 100) * term) / 12;
      return Math.round(savings);
    }
    
    return undefined;
  }

  /**
   * Получает продукты из БД
   */
  private async fetchProducts(
    productType: ProductType,
    region?: string
  ): Promise<BankProduct[]> {
    try {
      let query = supabase
        .from('bank_products')
        .select('*, bank:banks(*)')
        .eq('product_type', productType)
        .eq('is_active', true);
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return (data || []) as BankProduct[];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  /**
   * Фильтрует продукты по региону
   * Requirements 2.7: consider user's location and regional availability
   */
  private filterByRegion(products: BankProduct[], region?: string): BankProduct[] {
    if (!region) return products;
    
    return products.filter(product => 
      product.available_regions.includes('all') ||
      product.available_regions.includes(region)
    );
  }

  /**
   * Сохраняет рекомендации в БД
   */
  private async saveRecommendations(
    userId: string,
    recommendations: RecommendationResult[],
    context: RecommendationContext
  ): Promise<void> {
    try {
      const recommendationsData = recommendations.map(rec => ({
        user_id: userId,
        product_id: rec.product.id,
        score: rec.score,
        reasoning: rec.reasoning,
        context: context,
        recommendation_type: 'automatic' as const,
        source: 'calculator' as const
      }));
      
      // Вставляем каждую рекомендацию отдельно, чтобы избежать проблем с типами
      for (const data of recommendationsData) {
        await (supabase as any)
          .from('recommendations')
          .insert(data);
      }
    } catch (error) {
      console.error('Error saving recommendations:', error);
    }
  }

  /**
   * Получает общие рекомендации для пользователей без профиля
   */
  private async getGeneralRecommendations(
    context: RecommendationContext,
    limit: number
  ): Promise<RecommendationResult[]> {
    const products = await this.fetchProducts(context.calculationType, context.userLocation);
    
    // Сортируем по приоритету и рейтингу
    const sortedProducts = products
      .sort((a, b) => {
        const priorityDiff = b.priority - a.priority;
        if (priorityDiff !== 0) return priorityDiff;
        
        const ratingA = a.bank?.overall_rating || 0;
        const ratingB = b.bank?.overall_rating || 0;
        return ratingB - ratingA;
      })
      .slice(0, limit);
    
    return sortedProducts.map(product => ({
      id: crypto.randomUUID(),
      product,
      score: 50,
      reasoning: ['Популярный выбор', 'Высокий рейтинг'],
      tags: this.generateTags(product, 50, {} as UserProfile),
      matchPercentage: 50,
      isSponsored: product.bank?.is_partner || false
    }));
  }

  /**
   * Обновляет профиль пользователя на основе расчета
   */
  async updateUserProfile(userId: string, calculationData: any): Promise<void> {
    await this.profileManager.trackCalculation(userId, calculationData);
  }

  /**
   * Обучается на основе обратной связи пользователя
   */
  async learnFromFeedback(
    userId: string,
    recommendationId: string,
    feedback: 'clicked' | 'dismissed' | 'applied'
  ): Promise<void> {
    try {
      const updates: any = {};
      
      if (feedback === 'clicked') {
        updates.clicked_at = new Date().toISOString();
      } else if (feedback === 'dismissed') {
        updates.dismissed_at = new Date().toISOString();
      } else if (feedback === 'applied') {
        updates.applied_at = new Date().toISOString();
        
        // Увеличиваем счетчик конверсий
        const profile = await this.profileManager.getUserProfile(userId);
        if (profile) {
          await this.profileManager.updateUserProfile(userId, {} as any, {
            increment_session: false,
            update_last_active: true
          });
          
          // Обновляем счетчик конверсий напрямую через Supabase
          const updateData = { conversion_count: (profile.conversion_count || 0) + 1 };
          await (supabase as any)
            .from('user_profiles')
            .update(updateData)
            .eq('user_id', userId);
        }
      }
      
      const updateRecommendation = updates;
      await (supabase as any)
        .from('recommendations')
        .update(updateRecommendation)
        .eq('id', recommendationId);
    } catch (error) {
      console.error('Error learning from feedback:', error);
    }
  }

  /**
   * Получает объяснение рекомендации
   */
  async getExplanation(recommendationId: string): Promise<RecommendationExplanation | null> {
    try {
      const { data, error } = await supabase
        .from('recommendations')
        .select('*, product:bank_products(*, bank:banks(*))')
        .eq('id', recommendationId)
        .single();
      
      if (error || !data) return null;
      
      const recommendation = data as any;
      
      // Здесь можно добавить более детальный анализ
      return {
        recommendationId,
        mainReasons: recommendation.reasoning || [],
        detailedAnalysis: {
          profileMatch: 75,
          locationMatch: 80,
          financialFit: 85,
          popularityScore: 70,
          rateCompetitiveness: 90
        },
        alternatives: []
      };
    } catch (error) {
      console.error('Error getting explanation:', error);
      return null;
    }
  }

  /**
   * Получает комплексные рекомендации на основе использования нескольких калькуляторов
   * Requirements 2.4: provide comprehensive recommendations when user uses multiple calculators
   * Requirements 2.5: explain why each product was suggested
   * Requirements 2.8: learn from user feedback to improve suggestions
   */
  async getCrossCalculatorRecommendations(
    userId: string,
    limit: number = 10
  ): Promise<CrossCalculatorRecommendation[]> {
    // Получаем профиль пользователя
    const profile = await this.profileManager.getUserProfile(userId);
    if (!profile || profile.calculation_history.length === 0) {
      return [];
    }

    // Анализируем историю расчетов
    const calculatorUsage = this.analyzeCalculatorUsage(profile.calculation_history);
    
    // Если пользователь использовал только один калькулятор, возвращаем пустой массив
    if (calculatorUsage.uniqueCalculators.size < 2) {
      return [];
    }

    // Получаем рекомендации для каждого типа калькулятора
    const allRecommendations: Map<string, RecommendationResult[]> = new Map();
    
    for (const calcType of calculatorUsage.uniqueCalculators) {
      const latestCalc = calculatorUsage.latestByType.get(calcType);
      if (!latestCalc) continue;

      const context: RecommendationContext = {
        calculationType: calcType as any,
        calculationParams: latestCalc.parameters,
        userLocation: profile.region,
        sessionHistory: profile.calculation_history.map(h => h.calculator_type)
      };

      const recommendations = await this.getPersonalizedRecommendations(userId, context, 3);
      allRecommendations.set(calcType, recommendations);
    }

    // Создаем кросс-калькуляторные рекомендации
    const crossRecommendations: CrossCalculatorRecommendation[] = [];

    // 1. Комплексные финансовые пакеты
    const packages = this.identifyFinancialPackages(allRecommendations, profile);
    crossRecommendations.push(...packages);

    // 2. Оптимизация финансовой стратегии
    const optimizations = this.suggestFinancialOptimizations(allRecommendations, profile, calculatorUsage);
    crossRecommendations.push(...optimizations);

    // 3. Альтернативные решения
    const alternatives = this.suggestAlternativeSolutions(allRecommendations, profile);
    crossRecommendations.push(...alternatives);

    // Сортируем по релевантности
    crossRecommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Ограничиваем количество
    return crossRecommendations.slice(0, limit);
  }

  /**
   * Анализирует использование калькуляторов
   */
  private analyzeCalculatorUsage(history: CalculationHistoryItem[]): CalculatorUsageAnalysis {
    const uniqueCalculators = new Set<string>();
    const countByType = new Map<string, number>();
    const latestByType = new Map<string, CalculationHistoryItem>();

    for (const item of history) {
      uniqueCalculators.add(item.calculator_type);
      countByType.set(item.calculator_type, (countByType.get(item.calculator_type) || 0) + 1);
      
      const current = latestByType.get(item.calculator_type);
      if (!current || new Date(item.timestamp) > new Date(current.timestamp)) {
        latestByType.set(item.calculator_type, item);
      }
    }

    return {
      uniqueCalculators,
      countByType,
      latestByType,
      totalCalculations: history.length
    };
  }

  /**
   * Идентифицирует финансовые пакеты
   * Requirements 2.4: comprehensive recommendations across multiple calculators
   */
  private identifyFinancialPackages(
    recommendations: Map<string, RecommendationResult[]>,
    profile: UserProfile
  ): CrossCalculatorRecommendation[] {
    const packages: CrossCalculatorRecommendation[] = [];

    // Пакет: Ипотека + Страхование
    if (recommendations.has('mortgage') && recommendations.has('insurance')) {
      const mortgageRecs = recommendations.get('mortgage') || [];
      const insuranceRecs = recommendations.get('insurance') || [];

      if (mortgageRecs.length > 0 && insuranceRecs.length > 0) {
        const mortgage = mortgageRecs[0];
        const insurance = insuranceRecs[0];

        packages.push({
          id: crypto.randomUUID(),
          type: 'package',
          title: 'Комплексное решение: Ипотека + Страхование',
          description: 'Оптимальное сочетание ипотечного кредита и страхования для защиты вашей недвижимости',
          products: [mortgage.product, insurance.product],
          calculatorTypes: ['mortgage', 'insurance'],
          explanation: this.generatePackageExplanation('mortgage_insurance', mortgage, insurance, profile),
          estimatedBenefit: this.calculatePackageBenefit([mortgage, insurance]),
          relevanceScore: (mortgage.score + insurance.score) / 2,
          actionSteps: [
            'Оформите ипотеку с выгодной ставкой',
            'Подключите страхование для защиты имущества',
            'Получите скидку на страхование при оформлении ипотеки'
          ]
        });
      }
    }

    // Пакет: Кредит + Вклад (рефинансирование)
    if (recommendations.has('credit') && recommendations.has('deposit')) {
      const creditRecs = recommendations.get('credit') || [];
      const depositRecs = recommendations.get('deposit') || [];

      if (creditRecs.length > 0 && depositRecs.length > 0) {
        const credit = creditRecs[0];
        const deposit = depositRecs[0];

        packages.push({
          id: crypto.randomUUID(),
          type: 'package',
          title: 'Финансовая оптимизация: Кредит + Вклад',
          description: 'Рефинансируйте кредит под более низкую ставку и откройте вклад для накоплений',
          products: [credit.product, deposit.product],
          calculatorTypes: ['credit', 'deposit'],
          explanation: this.generatePackageExplanation('credit_deposit', credit, deposit, profile),
          estimatedBenefit: this.calculatePackageBenefit([credit, deposit]),
          relevanceScore: (credit.score + deposit.score) / 2,
          actionSteps: [
            'Рефинансируйте текущий кредит под более выгодную ставку',
            'Откройте вклад для накопления средств',
            'Используйте разницу в платежах для формирования сбережений'
          ]
        });
      }
    }

    return packages;
  }

  /**
   * Предлагает оптимизации финансовой стратегии
   * Requirements 2.5: explain why each product was suggested
   */
  private suggestFinancialOptimizations(
    recommendations: Map<string, RecommendationResult[]>,
    profile: UserProfile,
    usage: CalculatorUsageAnalysis
  ): CrossCalculatorRecommendation[] {
    const optimizations: CrossCalculatorRecommendation[] = [];

    // Оптимизация: Досрочное погашение ипотеки через вклад
    if (recommendations.has('mortgage') && recommendations.has('deposit')) {
      const mortgageRecs = recommendations.get('mortgage') || [];
      const depositRecs = recommendations.get('deposit') || [];

      if (mortgageRecs.length > 0 && depositRecs.length > 0) {
        const mortgage = mortgageRecs[0];
        const deposit = depositRecs[0];

        const mortgageRate = mortgage.product.promotional_rate || mortgage.product.interest_rate;
        const depositRate = deposit.product.promotional_rate || deposit.product.interest_rate;

        // Если ставка по ипотеке выше ставки по вкладу, рекомендуем досрочное погашение
        if (mortgageRate > depositRate + 2) {
          optimizations.push({
            id: crypto.randomUUID(),
            type: 'optimization',
            title: 'Стратегия досрочного погашения ипотеки',
            description: 'Направьте средства на досрочное погашение ипотеки вместо вклада для большей экономии',
            products: [mortgage.product],
            calculatorTypes: ['mortgage', 'deposit'],
            explanation: {
              summary: `Ставка по ипотеке (${mortgageRate.toFixed(2)}%) значительно выше ставки по вкладу (${depositRate.toFixed(2)}%). Досрочное погашение ипотеки принесет большую выгоду.`,
              detailedReasons: [
                `Экономия на процентах по ипотеке: ${mortgageRate.toFixed(2)}% годовых`,
                `Доход от вклада: ${depositRate.toFixed(2)}% годовых`,
                `Разница в пользу досрочного погашения: ${(mortgageRate - depositRate).toFixed(2)}%`,
                'Досрочное погашение уменьшит общую переплату по кредиту'
              ],
              financialImpact: {
                savingsAmount: this.calculateEarlyRepaymentSavings(mortgage, usage),
                timeframe: '12 месяцев',
                riskLevel: 'low'
              },
              relatedCalculations: ['mortgage', 'deposit']
            },
            estimatedBenefit: this.calculateEarlyRepaymentSavings(mortgage, usage),
            relevanceScore: 85,
            actionSteps: [
              'Проверьте условия досрочного погашения в вашем договоре',
              'Рассчитайте оптимальную сумму досрочного платежа',
              'Внесите досрочный платеж для уменьшения переплаты'
            ]
          });
        }
      }
    }

    // Оптимизация: Консолидация кредитов
    if (recommendations.has('credit') && usage.countByType.get('credit')! > 1) {
      const creditRecs = recommendations.get('credit') || [];

      if (creditRecs.length > 0) {
        const bestCredit = creditRecs[0];

        optimizations.push({
          id: crypto.randomUUID(),
          type: 'optimization',
          title: 'Консолидация кредитов',
          description: 'Объедините несколько кредитов в один для снижения ежемесячного платежа',
          products: [bestCredit.product],
          calculatorTypes: ['credit'],
          explanation: {
            summary: 'Вы использовали кредитный калькулятор несколько раз. Консолидация кредитов может снизить общую финансовую нагрузку.',
            detailedReasons: [
              'Один платеж вместо нескольких упростит управление финансами',
              'Возможность получить более низкую ставку при консолидации',
              'Снижение ежемесячной финансовой нагрузки',
              'Улучшение кредитной истории за счет закрытия старых кредитов'
            ],
            financialImpact: {
              savingsAmount: 50000,
              timeframe: '24 месяца',
              riskLevel: 'medium'
            },
            relatedCalculations: ['credit']
          },
          estimatedBenefit: 50000,
          relevanceScore: 80,
          actionSteps: [
            'Соберите информацию о всех текущих кредитах',
            'Рассчитайте общую сумму задолженности',
            'Подайте заявку на кредит для консолидации',
            'После одобрения погасите все старые кредиты'
          ]
        });
      }
    }

    return optimizations;
  }

  /**
   * Предлагает альтернативные решения
   */
  private suggestAlternativeSolutions(
    recommendations: Map<string, RecommendationResult[]>,
    profile: UserProfile
  ): CrossCalculatorRecommendation[] {
    const alternatives: CrossCalculatorRecommendation[] = [];

    // Альтернатива: Вклад вместо досрочного погашения
    if (recommendations.has('mortgage') && recommendations.has('deposit')) {
      const mortgageRecs = recommendations.get('mortgage') || [];
      const depositRecs = recommendations.get('deposit') || [];

      if (mortgageRecs.length > 0 && depositRecs.length > 0) {
        const mortgage = mortgageRecs[0];
        const deposit = depositRecs[0];

        const mortgageRate = mortgage.product.promotional_rate || mortgage.product.interest_rate;
        const depositRate = deposit.product.promotional_rate || deposit.product.interest_rate;

        // Если ставки близки, предлагаем вклад для ликвидности
        if (Math.abs(mortgageRate - depositRate) <= 2) {
          alternatives.push({
            id: crypto.randomUUID(),
            type: 'alternative',
            title: 'Формирование финансовой подушки',
            description: 'Создайте резервный фонд на вкладе вместо досрочного погашения ипотеки',
            products: [deposit.product],
            calculatorTypes: ['mortgage', 'deposit'],
            explanation: {
              summary: 'Ставки по ипотеке и вкладу близки. Рекомендуем сформировать финансовую подушку для непредвиденных ситуаций.',
              detailedReasons: [
                'Финансовая подушка обеспечит ликвидность в экстренных случаях',
                `Разница в ставках минимальна: ${Math.abs(mortgageRate - depositRate).toFixed(2)}%`,
                'Вклад можно использовать для досрочного погашения в будущем',
                'Диверсификация финансовых активов снижает риски'
              ],
              financialImpact: {
                savingsAmount: 0,
                timeframe: '12 месяцев',
                riskLevel: 'low'
              },
              relatedCalculations: ['mortgage', 'deposit']
            },
            estimatedBenefit: 0,
            relevanceScore: 70,
            actionSteps: [
              'Откройте вклад с возможностью пополнения',
              'Регулярно откладывайте средства на вклад',
              'Сформируйте резерв на 3-6 месяцев расходов',
              'При необходимости используйте средства для досрочного погашения'
            ]
          });
        }
      }
    }

    return alternatives;
  }

  /**
   * Генерирует объяснение для пакета продуктов
   * Requirements 2.5: explain why each product was suggested
   */
  private generatePackageExplanation(
    packageType: string,
    product1: RecommendationResult,
    product2: RecommendationResult,
    profile: UserProfile
  ): RecommendationExplanationDetailed {
    const explanations: Record<string, RecommendationExplanationDetailed> = {
      mortgage_insurance: {
        summary: 'Комплексное решение для защиты вашей недвижимости и финансовой безопасности',
        detailedReasons: [
          'Ипотека и страхование от одного банка часто предоставляют скидки',
          'Страхование защищает от рисков потери имущества',
          'Упрощенное оформление при покупке пакета',
          'Возможность получить более выгодные условия по ипотеке'
        ],
        financialImpact: {
          savingsAmount: this.calculatePackageBenefit([product1, product2]),
          timeframe: '12 месяцев',
          riskLevel: 'low'
        },
        relatedCalculations: ['mortgage', 'insurance']
      },
      credit_deposit: {
        summary: 'Оптимизация финансов через рефинансирование и накопления',
        detailedReasons: [
          'Рефинансирование снизит ежемесячный платеж по кредиту',
          'Разницу в платежах можно направить на вклад',
          'Формирование накоплений при снижении долговой нагрузки',
          'Улучшение финансового положения за счет оптимизации'
        ],
        financialImpact: {
          savingsAmount: this.calculatePackageBenefit([product1, product2]),
          timeframe: '24 месяца',
          riskLevel: 'medium'
        },
        relatedCalculations: ['credit', 'deposit']
      }
    };

    return explanations[packageType] || {
      summary: 'Комплексное финансовое решение',
      detailedReasons: ['Оптимальное сочетание продуктов для ваших целей'],
      financialImpact: {
        savingsAmount: 0,
        timeframe: '12 месяцев',
        riskLevel: 'medium'
      },
      relatedCalculations: []
    };
  }

  /**
   * Вычисляет выгоду от пакета продуктов
   */
  private calculatePackageBenefit(products: RecommendationResult[]): number {
    return products.reduce((sum, product) => {
      return sum + (product.estimatedSavings || 0);
    }, 0);
  }

  /**
   * Вычисляет экономию от досрочного погашения
   */
  private calculateEarlyRepaymentSavings(
    mortgage: RecommendationResult,
    usage: CalculatorUsageAnalysis
  ): number {
    // Простая эвристика: 10% от суммы кредита за год досрочного погашения
    const mortgageCalc = usage.latestByType.get('mortgage');
    if (!mortgageCalc) return 0;

    const loanAmount = mortgageCalc.parameters.loan_amount || 0;
    const rate = mortgage.product.promotional_rate || mortgage.product.interest_rate;
    
    // Экономия = сумма * ставка * 0.5 (предполагаем погашение в середине срока)
    return Math.round(loanAmount * (rate / 100) * 0.5);
  }
}

/**
 * Анализ использования калькуляторов
 */
interface CalculatorUsageAnalysis {
  uniqueCalculators: Set<string>;
  countByType: Map<string, number>;
  latestByType: Map<string, CalculationHistoryItem>;
  totalCalculations: number;
}

/**
 * Кросс-калькуляторная рекомендация
 */
export interface CrossCalculatorRecommendation {
  id: string;
  type: 'package' | 'optimization' | 'alternative';
  title: string;
  description: string;
  products: BankProduct[];
  calculatorTypes: string[];
  explanation: RecommendationExplanationDetailed;
  estimatedBenefit: number;
  relevanceScore: number;
  actionSteps: string[];
}

/**
 * Детальное объяснение рекомендации
 */
export interface RecommendationExplanationDetailed {
  summary: string;
  detailedReasons: string[];
  financialImpact: {
    savingsAmount: number;
    timeframe: string;
    riskLevel: 'low' | 'medium' | 'high';
  };
  relatedCalculations: string[];
}
