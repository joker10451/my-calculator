/**
 * MatchingAlgorithm - Алгоритм подбора оптимальных решений
 * Реализует Requirements 4.1, 4.2, 4.4
 */

import type {
  BankProduct,
  UserFinancialProfile,
  ProductType,
  RiskTolerance
} from '@/types/bank';

export interface UserRequirements {
  productType: ProductType;
  amount: number;
  term: number; // в месяцах
  income?: number;
  creditScore?: number;
  region: string;
  preferences: UserPreferences;
  constraints: Constraint[];
}

export interface UserPreferences {
  prioritizeRate: boolean; // приоритет низкой ставки
  prioritizeFees: boolean; // приоритет низких комиссий
  prioritizeSpeed: boolean; // приоритет быстрого одобрения
  prioritizeRating: boolean; // приоритет рейтинга банка
  acceptPromotions: boolean; // принимать промо-предложения
  preferredBanks?: string[]; // предпочитаемые банки
  avoidBanks?: string[]; // банки для исключения
}

export interface Constraint {
  type: 'max_rate' | 'min_amount' | 'max_amount' | 'min_term' | 'max_term' | 'required_feature' | 'max_fees';
  value: string | number | boolean;
  strict: boolean; // строгое ограничение или предпочтение
}

export interface OptimalSolution {
  primaryRecommendation: RankedProduct;
  alternatives: RankedProduct[];
  reasoning: OptimizationReasoning;
  totalSavings: number;
  riskAssessment: RiskLevel;
  nextSteps: ActionStep[];
}

export interface RankedProduct {
  product: BankProduct;
  rank: number;
  score: number; // 0-100
  pros: string[];
  cons: string[];
  eligibilityScore: number; // 0-100
  referralValue: number;
}

export interface OptimizationReasoning {
  primaryFactors: string[]; // основные факторы выбора
  tradeoffs: string[]; // компромиссы
  warnings: string[]; // предупреждения
  assumptions: string[]; // допущения
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high';

export interface ActionStep {
  step: number;
  title: string;
  description: string;
  url?: string;
  estimated_time?: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  score: number; // 0-100
  reasons: string[];
  missingRequirements: string[];
  recommendations: string[];
}

export interface RankingCriteria {
  weights: {
    rate: number; // 0-1
    fees: number; // 0-1
    eligibility: number; // 0-1
    bankRating: number; // 0-1
    features: number; // 0-1
    processingSpeed: number; // 0-1
  };
  userProfile?: UserFinancialProfile;
  preferences?: UserPreferences;
}

export interface Alternative {
  product: BankProduct;
  reason: string;
  adjustments: string[];
  score: number;
}

/**
 * Класс для подбора оптимальных банковских продуктов
 */
export class MatchingAlgorithm {
  /**
   * Находит оптимальные продукты на основе требований пользователя
   * Requirements 4.1: analyze all available products
   * Requirements 4.2: consider total cost, monthly payments, and user preferences
   */
  async findOptimalProducts(
    requirements: UserRequirements,
    availableProducts: BankProduct[]
  ): Promise<OptimalSolution> {
    // Фильтруем продукты по базовым критериям
    const eligibleProducts = this.filterByBasicCriteria(availableProducts, requirements);
    
    // Проверяем, есть ли подходящие продукты
    if (eligibleProducts.length === 0) {
      return this.createNoSolutionResponse(requirements, availableProducts);
    }
    
    // Создаем критерии ранжирования на основе предпочтений
    const rankingCriteria = this.createRankingCriteria(requirements);
    
    // Ранжируем продукты
    const rankedProducts = this.rankProducts(eligibleProducts, rankingCriteria);
    
    // Выбираем лучший продукт
    const primaryRecommendation = rankedProducts[0];
    
    // Выбираем альтернативы (топ 3-5)
    const alternatives = rankedProducts.slice(1, 5);
    
    // Генерируем обоснование выбора
    const reasoning = this.generateReasoning(
      primaryRecommendation,
      alternatives,
      requirements,
      rankingCriteria
    );
    
    // Вычисляем потенциальную экономию
    const totalSavings = this.calculateSavings(
      primaryRecommendation,
      rankedProducts,
      requirements
    );
    
    // Оцениваем риски
    const riskAssessment = this.assessRisk(primaryRecommendation, requirements);
    
    // Генерируем следующие шаги
    const nextSteps = this.generateNextSteps(primaryRecommendation);
    
    return {
      primaryRecommendation,
      alternatives,
      reasoning,
      totalSavings,
      riskAssessment,
      nextSteps
    };
  }

  /**
   * Фильтрует продукты по базовым критериям и ограничениям
   */
  private filterByBasicCriteria(
    products: BankProduct[],
    requirements: UserRequirements
  ): BankProduct[] {
    return products.filter(product => {
      // Проверка типа продукта
      if (product.product_type !== requirements.productType) {
        return false;
      }
      
      // Проверка активности
      if (!product.is_active) {
        return false;
      }
      
      // Проверка региона
      if (!product.available_regions.includes(requirements.region) && 
          !product.available_regions.includes('all')) {
        return false;
      }
      
      // Проверка суммы
      if (product.min_amount && requirements.amount < product.min_amount) {
        return false;
      }
      if (product.max_amount && requirements.amount > product.max_amount) {
        return false;
      }
      
      // Проверка срока
      if (product.min_term && requirements.term < product.min_term) {
        return false;
      }
      if (product.max_term && requirements.term > product.max_term) {
        return false;
      }
      
      // Проверка строгих ограничений
      const strictConstraints = requirements.constraints.filter(c => c.strict);
      for (const constraint of strictConstraints) {
        if (!this.checkConstraint(product, constraint)) {
          return false;
        }
      }
      
      // Проверка исключенных банков
      if (requirements.preferences.avoidBanks?.includes(product.bank_id)) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Проверяет, удовлетворяет ли продукт ограничению
   * Requirements 4.4: constraint handling
   */
  private checkConstraint(product: BankProduct, constraint: Constraint): boolean {
    switch (constraint.type) {
      case 'max_rate':
        return product.interest_rate <= constraint.value;
      
      case 'min_amount':
        return !product.min_amount || product.min_amount <= constraint.value;
      
      case 'max_amount':
        return !product.max_amount || product.max_amount >= constraint.value;
      
      case 'min_term':
        return !product.min_term || product.min_term <= constraint.value;
      
      case 'max_term':
        return !product.max_term || product.max_term >= constraint.value;
      
      case 'required_feature':
        return !!product.features?.[constraint.value as string];
      
      case 'max_fees': {
        const totalFees = this.calculateTotalFees(product.fees);
        return totalFees <= (constraint.value as number);
      }
      
      default:
        return true;
    }
  }
  
  /**
   * Вычисляет общую сумму комиссий
   */
  private calculateTotalFees(fees: Record<string, unknown>): number {
    if (!fees || typeof fees !== 'object') return 0;
    
    return Object.values(fees).reduce((sum, fee) => {
      const feeValue = typeof fee === 'number' ? fee : 0;
      return sum + feeValue;
    }, 0);
  }

  /**
   * Создает критерии ранжирования на основе требований
   */
  private createRankingCriteria(requirements: UserRequirements): RankingCriteria {
    const prefs = requirements.preferences;
    
    // Базовые веса
    const weights = {
      rate: 0.3,
      fees: 0.2,
      eligibility: 0.2,
      bankRating: 0.15,
      features: 0.1,
      processingSpeed: 0.05
    };
    
    // Корректируем веса на основе предпочтений
    if (prefs.prioritizeRate) {
      weights.rate += 0.15;
      weights.fees -= 0.05;
      weights.features -= 0.05;
      weights.processingSpeed -= 0.05;
    }
    
    if (prefs.prioritizeFees) {
      weights.fees += 0.15;
      weights.rate -= 0.05;
      weights.features -= 0.05;
      weights.processingSpeed -= 0.05;
    }
    
    if (prefs.prioritizeSpeed) {
      weights.processingSpeed += 0.15;
      weights.features -= 0.05;
      weights.bankRating -= 0.05;
      weights.eligibility -= 0.05;
    }
    
    if (prefs.prioritizeRating) {
      weights.bankRating += 0.15;
      weights.processingSpeed -= 0.05;
      weights.features -= 0.05;
      weights.eligibility -= 0.05;
    }
    
    // Нормализуем веса
    const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
    Object.keys(weights).forEach(key => {
      weights[key as keyof typeof weights] /= totalWeight;
    });
    
    return {
      weights,
      preferences: prefs
    };
  }

  /**
   * Ранжирует продукты по множественным критериям
   * Requirements 4.1: ranking system considering multiple criteria
   * Requirements 4.2: consider total cost, monthly payments, and user preferences
   */
  rankProducts(
    products: BankProduct[],
    criteria: RankingCriteria
  ): RankedProduct[] {
    const rankedProducts = products.map((product, index) => {
      // Вычисляем баллы по каждому критерию
      const rateScore = this.calculateRateScore(product, products);
      const feesScore = this.calculateFeesScore(product, products);
      const eligibilityScore = this.calculateEligibilityScore(product, criteria);
      const bankRatingScore = this.calculateBankRatingScore(product);
      const featuresScore = this.calculateFeaturesScore(product);
      const speedScore = this.calculateProcessingSpeedScore(product);
      
      // Вычисляем взвешенный общий балл
      const totalScore = 
        rateScore * criteria.weights.rate +
        feesScore * criteria.weights.fees +
        eligibilityScore * criteria.weights.eligibility +
        bankRatingScore * criteria.weights.bankRating +
        featuresScore * criteria.weights.features +
        speedScore * criteria.weights.processingSpeed;
      
      // Бонус для предпочитаемых банков
      let finalScore = totalScore;
      if (criteria.preferences?.preferredBanks?.includes(product.bank_id)) {
        finalScore += 5; // бонус 5 баллов
      }
      
      // Генерируем плюсы и минусы
      const pros = this.generatePros(product, {
        rateScore,
        feesScore,
        bankRatingScore,
        featuresScore
      });
      
      const cons = this.generateCons(product, {
        rateScore,
        feesScore,
        bankRatingScore,
        featuresScore
      });
      
      // Вычисляем реферальную ценность
      const referralValue = this.calculateReferralValue(product);
      
      return {
        product,
        rank: 0, // будет установлен после сортировки
        score: Math.min(100, Math.max(0, finalScore)),
        pros,
        cons,
        eligibilityScore,
        referralValue
      };
    });
    
    // Сортируем по баллу
    rankedProducts.sort((a, b) => b.score - a.score);
    
    // Устанавливаем ранги
    rankedProducts.forEach((rp, index) => {
      rp.rank = index + 1;
    });
    
    return rankedProducts;
  }

  /**
   * Вычисляет балл по процентной ставке (0-100)
   */
  private calculateRateScore(product: BankProduct, allProducts: BankProduct[]): number {
    const rates = allProducts.map(p => p.promotional_rate || p.interest_rate);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    
    if (minRate === maxRate) return 50;
    
    const productRate = product.promotional_rate || product.interest_rate;
    
    // Меньше ставка = выше балл
    return 100 - ((productRate - minRate) / (maxRate - minRate)) * 100;
  }
  
  /**
   * Вычисляет балл по комиссиям (0-100)
   */
  private calculateFeesScore(product: BankProduct, allProducts: BankProduct[]): number {
    const allFees = allProducts.map(p => this.calculateTotalFees(p.fees));
    const minFees = Math.min(...allFees);
    const maxFees = Math.max(...allFees);
    
    if (minFees === maxFees) return 50;
    
    const productFees = this.calculateTotalFees(product.fees);
    
    // Меньше комиссии = выше балл
    return 100 - ((productFees - minFees) / (maxFees - minFees)) * 100;
  }
  
  /**
   * Вычисляет балл соответствия требованиям (0-100)
   * Requirements 4.4: eligibility validation
   */
  private calculateEligibilityScore(
    product: BankProduct,
    criteria: RankingCriteria
  ): number {
    let score = 100;
    const requirements = product.requirements;
    
    if (!requirements) return score;
    
    // Проверяем требования к доходу
    if (requirements.min_income && criteria.preferences) {
      // Если доход не указан, снижаем балл
      score -= 10;
    }
    
    // Проверяем требования к кредитному рейтингу
    if (requirements.min_credit_score) {
      score -= 5;
    }
    
    // Проверяем требования к стажу
    if (requirements.employment_experience) {
      score -= 5;
    }
    
    return Math.max(0, score);
  }

  /**
   * Вычисляет балл рейтинга банка (0-100)
   */
  private calculateBankRatingScore(product: BankProduct): number {
    if (!product.bank?.overall_rating) return 50;
    
    // Рейтинг от 0 до 5, конвертируем в 0-100
    return (product.bank.overall_rating / 5) * 100;
  }
  
  /**
   * Вычисляет балл по функциям (0-100)
   */
  private calculateFeaturesScore(product: BankProduct): number {
    if (!product.features) return 0;
    
    const desirableFeatures = [
      'early_repayment',
      'online_application',
      'fast_approval',
      'capitalization',
      'replenishment',
      'partial_withdrawal'
    ];
    
    let score = 0;
    desirableFeatures.forEach(feature => {
      if (product.features?.[feature]) {
        score += 100 / desirableFeatures.length;
      }
    });
    
    return score;
  }
  
  /**
   * Вычисляет балл скорости обработки (0-100)
   */
  private calculateProcessingSpeedScore(product: BankProduct): number {
    let score = 50; // базовый балл
    
    if (product.features?.fast_approval) {
      score += 30;
    }
    
    if (product.features?.online_application) {
      score += 20;
    }
    
    if (product.bank?.processing_speed_rating) {
      score += (product.bank.processing_speed_rating / 5) * 50;
    }
    
    return Math.min(100, score);
  }

  /**
   * Генерирует список преимуществ продукта
   */
  private generatePros(
    product: BankProduct,
    scores: { rateScore: number; feesScore: number; bankRatingScore: number; featuresScore: number }
  ): string[] {
    const pros: string[] = [];
    
    if (scores.rateScore >= 80) {
      pros.push('Одна из лучших процентных ставок');
    }
    
    if (scores.feesScore >= 80) {
      pros.push('Минимальные комиссии');
    }
    
    if (scores.bankRatingScore >= 80) {
      pros.push('Высокий рейтинг банка');
    }
    
    if (product.features?.fast_approval) {
      pros.push('Быстрое одобрение');
    }
    
    if (product.features?.online_application) {
      pros.push('Онлайн-заявка');
    }
    
    if (product.features?.early_repayment) {
      pros.push('Досрочное погашение без комиссии');
    }
    
    if (product.promotional_rate) {
      pros.push('Действует промо-ставка');
    }
    
    if (product.is_featured) {
      pros.push('Рекомендуемый продукт');
    }
    
    return pros;
  }
  
  /**
   * Генерирует список недостатков продукта
   */
  private generateCons(
    product: BankProduct,
    scores: { rateScore: number; feesScore: number; bankRatingScore: number; featuresScore: number }
  ): string[] {
    const cons: string[] = [];
    
    if (scores.rateScore < 40) {
      cons.push('Высокая процентная ставка');
    }
    
    if (scores.feesScore < 40) {
      cons.push('Значительные комиссии');
    }
    
    if (scores.bankRatingScore < 40) {
      cons.push('Низкий рейтинг банка');
    }
    
    if (product.requirements?.min_income && product.requirements.min_income > 50000) {
      cons.push('Высокие требования к доходу');
    }
    
    if (!product.features?.early_repayment) {
      cons.push('Комиссия за досрочное погашение');
    }
    
    if (!product.features?.online_application) {
      cons.push('Требуется личное посещение банка');
    }
    
    return cons;
  }

  /**
   * Вычисляет реферальную ценность продукта
   */
  private calculateReferralValue(product: BankProduct): number {
    if (!product.bank?.is_partner) return 0;
    
    const commissionRate = product.bank.commission_rate || 0;
    
    // Базовая ценность зависит от типа продукта
    let baseValue = 0;
    switch (product.product_type) {
      case 'mortgage':
        baseValue = 1000; // высокая комиссия
        break;
      case 'credit':
        baseValue = 500;
        break;
      case 'deposit':
        baseValue = 200;
        break;
      case 'insurance':
        baseValue = 300;
        break;
    }
    
    return baseValue * (commissionRate / 100);
  }
  
  /**
   * Проверяет соответствие продукта требованиям пользователя
   * Requirements 4.4: eligibility validation
   */
  validateEligibility(
    product: BankProduct,
    userProfile: UserFinancialProfile
  ): EligibilityResult {
    const reasons: string[] = [];
    const missingRequirements: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    const requirements = product.requirements;
    
    if (!requirements) {
      return {
        isEligible: true,
        score: 100,
        reasons: ['Нет специальных требований'],
        missingRequirements: [],
        recommendations: []
      };
    }
    
    // Проверка дохода
    if (requirements.min_income) {
      if (userProfile.income && userProfile.income >= requirements.min_income) {
        reasons.push('Доход соответствует требованиям');
      } else {
        score -= 30;
        missingRequirements.push(`Минимальный доход: ${requirements.min_income} ₽`);
        recommendations.push('Рассмотрите продукты с меньшими требованиями к доходу');
      }
    }
    
    // Проверка кредитного рейтинга
    if (requirements.min_credit_score) {
      if (userProfile.credit_score && userProfile.credit_score >= requirements.min_credit_score) {
        reasons.push('Кредитный рейтинг соответствует требованиям');
      } else {
        score -= 25;
        missingRequirements.push(`Минимальный кредитный рейтинг: ${requirements.min_credit_score}`);
        recommendations.push('Улучшите кредитную историю перед подачей заявки');
      }
    }
    
    const isEligible = score >= 50;
    
    return {
      isEligible,
      score: Math.max(0, score),
      reasons,
      missingRequirements,
      recommendations
    };
  }

  /**
   * Генерирует обоснование выбора
   */
  private generateReasoning(
    primary: RankedProduct,
    alternatives: RankedProduct[],
    requirements: UserRequirements,
    criteria: RankingCriteria
  ): OptimizationReasoning {
    const primaryFactors: string[] = [];
    const tradeoffs: string[] = [];
    const warnings: string[] = [];
    const assumptions: string[] = [];
    
    // Основные факторы выбора
    if (criteria.weights.rate > 0.3) {
      primaryFactors.push('Приоритет отдан низкой процентной ставке');
    }
    if (criteria.weights.fees > 0.25) {
      primaryFactors.push('Учтены минимальные комиссии');
    }
    if (criteria.weights.bankRating > 0.2) {
      primaryFactors.push('Важен высокий рейтинг банка');
    }
    
    // Компромиссы
    if (alternatives.length > 0) {
      const altRate = alternatives[0].product.interest_rate;
      const primaryRate = primary.product.interest_rate;
      
      if (primaryRate > altRate) {
        tradeoffs.push(
          `Выбранный продукт имеет чуть более высокую ставку, но лучше по другим параметрам`
        );
      }
    }
    
    // Предупреждения
    if (primary.eligibilityScore < 70) {
      warnings.push('Возможны сложности с одобрением заявки');
    }
    
    if (primary.product.promotional_rate) {
      warnings.push('Промо-ставка действует ограниченное время');
    }
    
    // Допущения
    assumptions.push('Расчеты основаны на текущих условиях банков');
    assumptions.push('Итоговые условия могут отличаться после рассмотрения заявки');
    
    return {
      primaryFactors,
      tradeoffs,
      warnings,
      assumptions
    };
  }

  /**
   * Вычисляет потенциальную экономию
   */
  private calculateSavings(
    primary: RankedProduct,
    allRanked: RankedProduct[],
    requirements: UserRequirements
  ): number {
    if (allRanked.length < 2) return 0;
    
    // Сравниваем с худшим вариантом
    const worst = allRanked[allRanked.length - 1];
    
    const primaryCost = this.calculateTotalCost(
      primary.product,
      requirements.amount,
      requirements.term
    );
    
    const worstCost = this.calculateTotalCost(
      worst.product,
      requirements.amount,
      requirements.term
    );
    
    return Math.max(0, worstCost - primaryCost);
  }
  
  /**
   * Вычисляет общую стоимость продукта
   */
  private calculateTotalCost(
    product: BankProduct,
    amount: number,
    termMonths: number
  ): number {
    const rate = product.promotional_rate || product.interest_rate;
    const monthlyRate = rate / 100 / 12;
    
    // Расчет ежемесячного платежа по аннуитетной схеме
    const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                          (Math.pow(1 + monthlyRate, termMonths) - 1);
    
    // Общая сумма выплат
    const totalPayments = monthlyPayment * termMonths;
    
    // Добавляем комиссии
    const applicationFee = product.fees?.application || 0;
    const monthlyFee = (product.fees?.monthly || 0) * termMonths;
    
    return totalPayments + applicationFee + monthlyFee;
  }

  /**
   * Оценивает риски продукта
   */
  private assessRisk(
    primary: RankedProduct,
    requirements: UserRequirements
  ): RiskLevel {
    let riskScore = 0;
    
    // Высокая процентная ставка
    if (primary.product.interest_rate > 15) {
      riskScore += 2;
    }
    
    // Низкий рейтинг банка
    if (primary.product.bank?.overall_rating && primary.product.bank.overall_rating < 3) {
      riskScore += 2;
    }
    
    // Низкая вероятность одобрения
    if (primary.eligibilityScore < 60) {
      riskScore += 1;
    }
    
    // Высокие комиссии
    const totalFees = this.calculateTotalFees(primary.product.fees);
    if (totalFees > 10000) {
      riskScore += 1;
    }
    
    // Промо-ставка (может измениться)
    if (primary.product.promotional_rate) {
      riskScore += 1;
    }
    
    if (riskScore >= 5) return 'very_high';
    if (riskScore >= 3) return 'high';
    if (riskScore >= 1) return 'medium';
    return 'low';
  }
  
  /**
   * Генерирует следующие шаги для пользователя
   */
  private generateNextSteps(primary: RankedProduct): ActionStep[] {
    const steps: ActionStep[] = [];
    
    steps.push({
      step: 1,
      title: 'Проверьте требования',
      description: 'Убедитесь, что вы соответствуете всем требованиям банка',
      estimated_time: '5 минут'
    });
    
    if (primary.product.features?.online_application) {
      steps.push({
        step: 2,
        title: 'Подайте онлайн-заявку',
        description: 'Заполните заявку на сайте банка',
        url: primary.product.bank?.website_url,
        estimated_time: '15 минут'
      });
    } else {
      steps.push({
        step: 2,
        title: 'Посетите отделение банка',
        description: 'Запишитесь на прием и подготовьте документы',
        estimated_time: '1-2 часа'
      });
    }
    
    steps.push({
      step: 3,
      title: 'Дождитесь решения',
      description: primary.product.features?.fast_approval 
        ? 'Решение обычно принимается в течение 1-2 дней'
        : 'Решение может занять до 5-7 рабочих дней',
      estimated_time: primary.product.features?.fast_approval ? '1-2 дня' : '5-7 дней'
    });
    
    return steps;
  }

  /**
   * Создает ответ когда нет подходящих продуктов
   * Requirements 4.4: explain why none exist when constraints are strict
   */
  private createNoSolutionResponse(
    requirements: UserRequirements,
    allProducts: BankProduct[]
  ): OptimalSolution {
    const reasons: string[] = [];
    
    // Анализируем почему нет подходящих продуктов
    const typeMatches = allProducts.filter(p => p.product_type === requirements.productType);
    if (typeMatches.length === 0) {
      reasons.push(`Нет доступных продуктов типа "${requirements.productType}"`);
    }
    
    const regionMatches = typeMatches.filter(p => 
      p.available_regions.includes(requirements.region) || 
      p.available_regions.includes('all')
    );
    if (regionMatches.length === 0 && typeMatches.length > 0) {
      reasons.push(`Нет продуктов, доступных в регионе "${requirements.region}"`);
    }
    
    const amountMatches = regionMatches.filter(p => 
      (!p.min_amount || requirements.amount >= p.min_amount) &&
      (!p.max_amount || requirements.amount <= p.max_amount)
    );
    if (amountMatches.length === 0 && regionMatches.length > 0) {
      reasons.push(`Запрашиваемая сумма ${requirements.amount} не соответствует лимитам банков`);
    }
    
    const termMatches = amountMatches.filter(p =>
      (!p.min_term || requirements.term >= p.min_term) &&
      (!p.max_term || requirements.term <= p.max_term)
    );
    if (termMatches.length === 0 && amountMatches.length > 0) {
      reasons.push(`Запрашиваемый срок ${requirements.term} месяцев не поддерживается`);
    }
    
    // Проверяем строгие ограничения
    const strictConstraints = requirements.constraints.filter(c => c.strict);
    if (strictConstraints.length > 0) {
      reasons.push('Строгие ограничения слишком жесткие');
      strictConstraints.forEach(constraint => {
        reasons.push(`  - ${constraint.type}: ${constraint.value}`);
      });
    }
    
    return {
      primaryRecommendation: {
        product: {} as BankProduct,
        rank: 0,
        score: 0,
        pros: [],
        cons: [],
        eligibilityScore: 0,
        referralValue: 0
      },
      alternatives: [],
      reasoning: {
        primaryFactors: [],
        tradeoffs: [],
        warnings: reasons,
        assumptions: ['Попробуйте ослабить некоторые ограничения']
      },
      totalSavings: 0,
      riskAssessment: 'low',
      nextSteps: [
        {
          step: 1,
          title: 'Пересмотрите требования',
          description: 'Попробуйте изменить сумму, срок или другие параметры',
          estimated_time: '5 минут'
        },
        {
          step: 2,
          title: 'Обратитесь к консультанту',
          description: 'Свяжитесь с нами для индивидуального подбора',
          estimated_time: '15 минут'
        }
      ]
    };
  }

  /**
   * Предлагает альтернативные продукты с корректировками
   * Requirements 4.3: alternative suggestions
   */
  async suggestAlternatives(
    requirements: UserRequirements,
    availableProducts: BankProduct[]
  ): Promise<Alternative[]> {
    const alternatives: Alternative[] = [];
    
    // Попробуем ослабить ограничения
    const relaxedRequirements = { ...requirements };
    
    // Увеличиваем диапазон суммы на 20%
    const amountAdjustment = requirements.amount * 0.2;
    const productsWithAdjustedAmount = availableProducts.filter(p => {
      if (p.product_type !== requirements.productType) return false;
      if (!p.available_regions.includes(requirements.region) && 
          !p.available_regions.includes('all')) return false;
      
      const adjustedMin = requirements.amount - amountAdjustment;
      const adjustedMax = requirements.amount + amountAdjustment;
      
      return (!p.min_amount || adjustedMax >= p.min_amount) &&
             (!p.max_amount || adjustedMin <= p.max_amount);
    });
    
    if (productsWithAdjustedAmount.length > 0) {
      const best = productsWithAdjustedAmount[0];
      alternatives.push({
        product: best,
        reason: 'Скорректирована сумма',
        adjustments: [`Рекомендуемая сумма: ${best.min_amount || requirements.amount} - ${best.max_amount || requirements.amount}`],
        score: 70
      });
    }
    
    // Попробуем изменить срок
    const productsWithAdjustedTerm = availableProducts.filter(p => {
      if (p.product_type !== requirements.productType) return false;
      if (!p.available_regions.includes(requirements.region) && 
          !p.available_regions.includes('all')) return false;
      
      return (!p.min_amount || requirements.amount >= p.min_amount) &&
             (!p.max_amount || requirements.amount <= p.max_amount);
    });
    
    if (productsWithAdjustedTerm.length > 0 && alternatives.length < 3) {
      const best = productsWithAdjustedTerm[0];
      if (!alternatives.find(a => a.product.id === best.id)) {
        alternatives.push({
          product: best,
          reason: 'Скорректирован срок',
          adjustments: [`Рекомендуемый срок: ${best.min_term || requirements.term} - ${best.max_term || requirements.term} месяцев`],
          score: 65
        });
      }
    }
    
    // Попробуем другой регион (если есть продукты "all")
    const productsAllRegions = availableProducts.filter(p => {
      if (p.product_type !== requirements.productType) return false;
      if (!p.available_regions.includes('all')) return false;
      
      return (!p.min_amount || requirements.amount >= p.min_amount) &&
             (!p.max_amount || requirements.amount <= p.max_amount) &&
             (!p.min_term || requirements.term >= p.min_term) &&
             (!p.max_term || requirements.term <= p.max_term);
    });
    
    if (productsAllRegions.length > 0 && alternatives.length < 3) {
      const best = productsAllRegions[0];
      if (!alternatives.find(a => a.product.id === best.id)) {
        alternatives.push({
          product: best,
          reason: 'Доступен во всех регионах',
          adjustments: ['Продукт доступен по всей России'],
          score: 60
        });
      }
    }
    
    return alternatives.slice(0, 3);
  }

  /**
   * Создает детальное сравнение с альтернативами
   * Requirements 4.6: detailed comparison with alternatives
   */
  async createDetailedComparison(
    primary: RankedProduct,
    alternatives: RankedProduct[],
    requirements: UserRequirements
  ): Promise<DetailedComparison> {
    const comparisons: ProductComparison[] = [];
    
    // Сравниваем каждую альтернативу с первичной рекомендацией
    for (const alternative of alternatives) {
      const comparison = this.compareProducts(
        primary.product,
        alternative.product,
        requirements
      );
      comparisons.push(comparison);
    }
    
    return {
      primary: primary.product,
      alternatives: alternatives.map(a => a.product),
      comparisons,
      summary: this.generateComparisonSummary(primary, alternatives, comparisons)
    };
  }

  /**
   * Сравнивает два продукта
   */
  private compareProducts(
    product1: BankProduct,
    product2: BankProduct,
    requirements: UserRequirements
  ): ProductComparison {
    const differences: ComparisonDifference[] = [];
    
    // Сравниваем процентные ставки
    const rate1 = product1.promotional_rate || product1.interest_rate;
    const rate2 = product2.promotional_rate || product2.interest_rate;
    
    if (rate1 !== rate2) {
      differences.push({
        field: 'interest_rate',
        label: 'Процентная ставка',
        value1: rate1,
        value2: rate2,
        difference: rate2 - rate1,
        impact: this.calculateRateImpact(rate1, rate2, requirements)
      });
    }
    
    // Сравниваем комиссии
    const fees1 = this.calculateTotalFees(product1.fees);
    const fees2 = this.calculateTotalFees(product2.fees);
    
    if (fees1 !== fees2) {
      differences.push({
        field: 'fees',
        label: 'Комиссии',
        value1: fees1,
        value2: fees2,
        difference: fees2 - fees1,
        impact: `${fees2 > fees1 ? 'Дороже' : 'Дешевле'} на ${Math.abs(fees2 - fees1).toFixed(0)} ₽`
      });
    }
    
    // Сравниваем рейтинги банков
    const rating1 = product1.bank?.overall_rating || 0;
    const rating2 = product2.bank?.overall_rating || 0;
    
    if (rating1 !== rating2) {
      differences.push({
        field: 'bank_rating',
        label: 'Рейтинг банка',
        value1: rating1,
        value2: rating2,
        difference: rating2 - rating1,
        impact: rating2 > rating1 ? 'Более надежный банк' : 'Менее надежный банк'
      });
    }
    
    return {
      product1_id: product1.id,
      product2_id: product2.id,
      differences,
      recommendation: this.generateComparisonRecommendation(differences)
    };
  }

  /**
   * Вычисляет влияние разницы в ставках
   */
  private calculateRateImpact(
    rate1: number,
    rate2: number,
    requirements: UserRequirements
  ): string {
    const rateDiff = rate2 - rate1;
    const monthlyRate1 = rate1 / 100 / 12;
    const monthlyRate2 = rate2 / 100 / 12;
    
    const payment1 = requirements.amount * (monthlyRate1 * Math.pow(1 + monthlyRate1, requirements.term)) / 
                    (Math.pow(1 + monthlyRate1, requirements.term) - 1);
    const payment2 = requirements.amount * (monthlyRate2 * Math.pow(1 + monthlyRate2, requirements.term)) / 
                    (Math.pow(1 + monthlyRate2, requirements.term) - 1);
    
    const paymentDiff = payment2 - payment1;
    const totalDiff = paymentDiff * requirements.term;
    
    if (rateDiff > 0) {
      return `Переплата ${totalDiff.toFixed(0)} ₽ за весь срок`;
    } else {
      return `Экономия ${Math.abs(totalDiff).toFixed(0)} ₽ за весь срок`;
    }
  }

  /**
   * Генерирует рекомендацию на основе сравнения
   */
  private generateComparisonRecommendation(differences: ComparisonDifference[]): string {
    if (differences.length === 0) {
      return 'Продукты практически идентичны';
    }
    
    const significantDiffs = differences.filter(d => 
      (d.field === 'interest_rate' && Math.abs(d.difference) > 0.5) ||
      (d.field === 'fees' && Math.abs(d.difference) > 5000) ||
      (d.field === 'bank_rating' && Math.abs(d.difference) > 0.5)
    );
    
    if (significantDiffs.length === 0) {
      return 'Различия незначительны, выбирайте по дополнительным критериям';
    }
    
    return `Основные различия: ${significantDiffs.map(d => d.label.toLowerCase()).join(', ')}`;
  }

  /**
   * Генерирует сводку сравнения
   */
  private generateComparisonSummary(
    primary: RankedProduct,
    alternatives: RankedProduct[],
    comparisons: ProductComparison[]
  ): string {
    const advantages = primary.pros.length;
    const disadvantages = primary.cons.length;
    
    if (advantages > disadvantages) {
      return `Рекомендуемый продукт имеет ${advantages} преимуществ и ${disadvantages} недостатков по сравнению с альтернативами`;
    } else {
      return `Рекомендуемый продукт выбран как оптимальный баланс между преимуществами и недостатками`;
    }
  }

  /**
   * Предлагает комбинации продуктов от разных банков
   * Requirements 4.7: suggest combinations of products from different banks
   */
  async suggestProductCombinations(
    requirements: UserRequirements,
    availableProducts: BankProduct[]
  ): Promise<ProductCombination[]> {
    const combinations: ProductCombination[] = [];
    
    // Для ипотеки можем предложить комбинацию с страхованием
    if (requirements.productType === 'mortgage') {
      const mortgageProducts = availableProducts.filter(p => p.product_type === 'mortgage');
      const insuranceProducts = availableProducts.filter(p => p.product_type === 'insurance');
      
      for (const mortgage of mortgageProducts.slice(0, 3)) {
        for (const insurance of insuranceProducts.slice(0, 2)) {
          const combination = this.createCombination(
            [mortgage, insurance],
            requirements,
            'Ипотека + Страхование'
          );
          combinations.push(combination);
        }
      }
    }
    
    // Для вкладов можем предложить диверсификацию
    if (requirements.productType === 'deposit') {
      const depositProducts = availableProducts.filter(p => p.product_type === 'deposit');
      
      // Предлагаем разделить сумму между несколькими банками
      if (depositProducts.length >= 2) {
        const topDeposits = depositProducts.slice(0, 3);
        const combination = this.createCombination(
          topDeposits,
          requirements,
          'Диверсификация вкладов'
        );
        combinations.push(combination);
      }
    }
    
    return combinations.slice(0, 3); // Возвращаем топ-3 комбинации
  }

  /**
   * Создает комбинацию продуктов
   */
  private createCombination(
    products: BankProduct[],
    requirements: UserRequirements,
    type: string
  ): ProductCombination {
    const totalCost = products.reduce((sum, product) => {
      return sum + this.calculateTotalCost(product, requirements.amount / products.length, requirements.term);
    }, 0);
    
    const benefits = this.calculateCombinationBenefits(products, requirements);
    const risks = this.calculateCombinationRisks(products);
    
    return {
      type,
      products,
      totalCost,
      benefits,
      risks,
      recommendation: this.generateCombinationRecommendation(products, benefits, risks)
    };
  }

  /**
   * Вычисляет преимущества комбинации
   */
  private calculateCombinationBenefits(
    products: BankProduct[],
    requirements: UserRequirements
  ): string[] {
    const benefits: string[] = [];
    
    if (products.length > 1) {
      benefits.push('Диверсификация рисков между несколькими банками');
    }
    
    const hasInsurance = products.some(p => p.product_type === 'insurance');
    if (hasInsurance) {
      benefits.push('Дополнительная защита от рисков');
    }
    
    const avgRating = products.reduce((sum, p) => sum + (p.bank?.overall_rating || 0), 0) / products.length;
    if (avgRating >= 4) {
      benefits.push('Высокий средний рейтинг банков');
    }
    
    return benefits;
  }

  /**
   * Вычисляет риски комбинации
   */
  private calculateCombinationRisks(products: BankProduct[]): string[] {
    const risks: string[] = [];
    
    if (products.length > 2) {
      risks.push('Сложность управления несколькими продуктами');
    }
    
    const hasLowRating = products.some(p => (p.bank?.overall_rating || 0) < 3);
    if (hasLowRating) {
      risks.push('Один или несколько банков имеют низкий рейтинг');
    }
    
    return risks;
  }

  /**
   * Генерирует рекомендацию для комбинации
   */
  private generateCombinationRecommendation(
    products: BankProduct[],
    benefits: string[],
    risks: string[]
  ): string {
    if (benefits.length > risks.length) {
      return `Рекомендуется: ${benefits.length} преимуществ перевешивают ${risks.length} рисков`;
    } else if (risks.length > benefits.length) {
      return `Не рекомендуется: ${risks.length} рисков перевешивают ${benefits.length} преимуществ`;
    } else {
      return 'Нейтральная рекомендация: преимущества и риски сбалансированы';
    }
  }

  /**
   * Обновляет рекомендации на основе изменений рыночных условий
   * Requirements 4.5: market condition updates and dynamic recommendations
   */
  async updateForMarketConditions(
    solution: OptimalSolution,
    marketData: MarketConditions
  ): Promise<OptimalSolution> {
    // Корректируем оценку рисков на основе рыночных условий
    let adjustedRisk = solution.riskAssessment;
    
    if (marketData.centralBankRate > 15) {
      // Высокая ключевая ставка ЦБ - повышаем риск
      adjustedRisk = this.increaseRiskLevel(adjustedRisk);
      solution.reasoning.warnings.push('Высокая ключевая ставка ЦБ увеличивает риски');
    }
    
    if (marketData.inflationRate > 10) {
      // Высокая инфляция
      solution.reasoning.warnings.push('Высокая инфляция может повлиять на реальную доходность');
    }
    
    if (marketData.economicGrowth < 0) {
      // Экономический спад
      adjustedRisk = this.increaseRiskLevel(adjustedRisk);
      solution.reasoning.warnings.push('Экономический спад увеличивает риски невыплат');
    }
    
    // Корректируем рекомендации
    if (marketData.trendingProducts && marketData.trendingProducts.length > 0) {
      const trendingIds = marketData.trendingProducts.map(p => p.id);
      
      if (trendingIds.includes(solution.primaryRecommendation.product.id)) {
        solution.reasoning.primaryFactors.push('Продукт популярен на рынке');
      }
    }
    
    return {
      ...solution,
      riskAssessment: adjustedRisk,
      reasoning: {
        ...solution.reasoning,
        assumptions: [
          ...solution.reasoning.assumptions,
          `Ключевая ставка ЦБ: ${marketData.centralBankRate}%`,
          `Инфляция: ${marketData.inflationRate}%`,
          `Экономический рост: ${marketData.economicGrowth}%`
        ]
      }
    };
  }

  /**
   * Повышает уровень риска
   */
  private increaseRiskLevel(current: RiskLevel): RiskLevel {
    const levels: RiskLevel[] = ['low', 'medium', 'high', 'very_high'];
    const currentIndex = levels.indexOf(current);
    
    if (currentIndex < levels.length - 1) {
      return levels[currentIndex + 1];
    }
    
    return current;
  }

  /**
   * Генерирует динамические рекомендации на основе изменений
   * Requirements 4.5: dynamic recommendations
   */
  async generateDynamicRecommendations(
    previousSolution: OptimalSolution,
    currentProducts: BankProduct[],
    requirements: UserRequirements
  ): Promise<DynamicUpdate> {
    const changes: ProductChange[] = [];
    
    // Проверяем, изменился ли первичный продукт
    const currentPrimary = currentProducts.find(
      p => p.id === previousSolution.primaryRecommendation.product.id
    );
    
    if (!currentPrimary) {
      changes.push({
        type: 'removed',
        productId: previousSolution.primaryRecommendation.product.id,
        productName: previousSolution.primaryRecommendation.product.name,
        impact: 'high',
        message: 'Рекомендованный продукт больше не доступен'
      });
    } else {
      // Проверяем изменения в условиях
      const oldRate = previousSolution.primaryRecommendation.product.interest_rate;
      const newRate = currentPrimary.interest_rate;
      
      if (Math.abs(oldRate - newRate) > 0.1) {
        changes.push({
          type: 'rate_changed',
          productId: currentPrimary.id,
          productName: currentPrimary.name,
          impact: Math.abs(oldRate - newRate) > 1 ? 'high' : 'medium',
          message: `Процентная ставка изменилась с ${oldRate}% на ${newRate}%`,
          oldValue: oldRate,
          newValue: newRate
        });
      }
    }
    
    // Проверяем новые продукты
    const newProducts = currentProducts.filter(p => 
      !previousSolution.alternatives.some(alt => alt.product.id === p.id) &&
      p.id !== previousSolution.primaryRecommendation.product.id
    );
    
    if (newProducts.length > 0) {
      changes.push({
        type: 'new_products',
        productId: '',
        productName: '',
        impact: 'medium',
        message: `Доступно ${newProducts.length} новых продуктов`
      });
    }
    
    // Определяем, нужно ли пересчитывать решение
    const needsRecalculation = changes.some(c => c.impact === 'high');
    
    return {
      changes,
      needsRecalculation,
      recommendation: needsRecalculation 
        ? 'Рекомендуется пересчитать оптимальное решение'
        : 'Текущее решение остается актуальным'
    };
  }
}

// Дополнительные типы для расширенных функций
export interface DetailedComparison {
  primary: BankProduct;
  alternatives: BankProduct[];
  comparisons: ProductComparison[];
  summary: string;
}

export interface ProductComparison {
  product1_id: string;
  product2_id: string;
  differences: ComparisonDifference[];
  recommendation: string;
}

export interface ComparisonDifference {
  field: string;
  label: string;
  value1: string | number | boolean | null;
  value2: string | number | boolean | null;
  difference: number;
  impact: string;
}

export interface ProductCombination {
  type: string;
  products: BankProduct[];
  totalCost: number;
  benefits: string[];
  risks: string[];
  recommendation: string;
}

export interface MarketConditions {
  centralBankRate: number; // ключевая ставка ЦБ
  inflationRate: number; // инфляция
  economicGrowth: number; // рост ВВП
  trendingProducts?: BankProduct[]; // популярные продукты
  lastUpdated: Date;
}

export interface DynamicUpdate {
  changes: ProductChange[];
  needsRecalculation: boolean;
  recommendation: string;
}

export interface ProductChange {
  type: 'removed' | 'rate_changed' | 'fees_changed' | 'new_products' | 'terms_changed';
  productId: string;
  productName: string;
  impact: 'low' | 'medium' | 'high';
  message: string;
  oldValue?: string | number | boolean | null;
  newValue?: string | number | boolean | null;
}
