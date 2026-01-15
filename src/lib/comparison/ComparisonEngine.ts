/**
 * ComparisonEngine - Движок сравнения банковских продуктов
 * Реализует Requirements 1.1, 1.2, 1.3
 */

import type {
  BankProduct,
  ComparisonCriteria,
  ComparisonMatrix,
  ComparisonHeader,
  ComparisonRow,
  ComparisonValue,
  ComparisonSummary,
  ProductType,
  Bank
} from '@/types/bank';

export interface ComparisonResult {
  products: BankProduct[];
  matrix: ComparisonMatrix;
  highlights: ProductHighlights;
  recommendations: string[];
  lastUpdated: Date;
}

export interface ProductHighlights {
  bestRate: string | null;
  lowestFees: string | null;
  highestRating: string | null;
  bestOverall: string | null;
}

export interface ProductFilters {
  productType?: ProductType;
  minRate?: number;
  maxRate?: number;
  minAmount?: number;
  maxAmount?: number;
  region?: string;
  hasPromotion?: boolean;
  bankIds?: string[];
}

export class ComparisonEngine {
  /**
   * Сравнивает банковские продукты и возвращает результат сравнения
   * Requirements 1.1: side-by-side comparison table
   */
  async compareProducts(
    productIds: string[],
    criteria: ComparisonCriteria,
    products?: BankProduct[]
  ): Promise<ComparisonResult> {
    if (productIds.length < 2) {
      throw new Error('Необходимо минимум 2 продукта для сравнения');
    }

    // Если продукты не переданы, загружаем их (в реальном приложении из БД)
    const productsToCompare = products || [];
    
    if (productsToCompare.length === 0) {
      throw new Error('Продукты не найдены');
    }

    // Генерируем матрицу сравнения
    const matrix = this.getComparisonMatrix(productsToCompare, criteria);
    
    // Определяем лучшие опции
    const highlights = this.identifyBestOptions(productsToCompare, matrix);
    
    // Генерируем рекомендации
    const recommendations = this.generateRecommendations(productsToCompare, matrix, criteria);

    return {
      products: productsToCompare,
      matrix,
      highlights,
      recommendations,
      lastUpdated: new Date()
    };
  }

  /**
   * Создает матрицу сравнения продуктов
   * Requirements 1.2: mortgage products comparison
   * Requirements 1.3: deposit products comparison
   */
  getComparisonMatrix(
    products: BankProduct[],
    criteria: ComparisonCriteria
  ): ComparisonMatrix {
    const productType = products[0]?.product_type;
    
    // Определяем заголовки в зависимости от типа продукта
    const headers = this.getHeadersForProductType(productType);
    
    // Создаем строки для каждого продукта
    const rows = products.map(product => 
      this.createComparisonRow(product, headers, products)
    );
    
    // Определяем лучшие в каждой категории
    const bestInCategory = this.findBestInCategories(rows, headers);
    
    // Создаем сводку
    const summary = this.createSummary(products, rows, bestInCategory);

    return {
      headers,
      rows,
      best_in_category: bestInCategory,
      summary
    };
  }

  /**
   * Определяет заголовки таблицы сравнения в зависимости от типа продукта
   */
  private getHeadersForProductType(productType: ProductType): ComparisonHeader[] {
    const commonHeaders: ComparisonHeader[] = [
      {
        key: 'bank_name',
        label: 'Банк',
        type: 'text',
        sortable: true,
        weight: 0.1
      },
      {
        key: 'product_name',
        label: 'Продукт',
        type: 'text',
        sortable: true,
        weight: 0.1
      }
    ];

    switch (productType) {
      case 'mortgage':
        return [
          ...commonHeaders,
          {
            key: 'interest_rate',
            label: 'Процентная ставка',
            type: 'percent',
            sortable: true,
            weight: 0.3
          },
          {
            key: 'min_amount',
            label: 'Мин. сумма',
            type: 'currency',
            sortable: true,
            weight: 0.1
          },
          {
            key: 'max_amount',
            label: 'Макс. сумма',
            type: 'currency',
            sortable: true,
            weight: 0.1
          },
          {
            key: 'min_term',
            label: 'Мин. срок (мес)',
            type: 'number',
            sortable: true,
            weight: 0.05
          },
          {
            key: 'max_term',
            label: 'Макс. срок (мес)',
            type: 'number',
            sortable: true,
            weight: 0.05
          },
          {
            key: 'fees',
            label: 'Комиссии',
            type: 'currency',
            sortable: true,
            weight: 0.15
          },
          {
            key: 'early_repayment',
            label: 'Досрочное погашение',
            type: 'boolean',
            sortable: false,
            weight: 0.05
          }
        ];

      case 'deposit':
        return [
          ...commonHeaders,
          {
            key: 'interest_rate',
            label: 'Процентная ставка',
            type: 'percent',
            sortable: true,
            weight: 0.35
          },
          {
            key: 'min_amount',
            label: 'Мин. сумма',
            type: 'currency',
            sortable: true,
            weight: 0.15
          },
          {
            key: 'min_term',
            label: 'Срок (мес)',
            type: 'number',
            sortable: true,
            weight: 0.1
          },
          {
            key: 'capitalization',
            label: 'Капитализация',
            type: 'boolean',
            sortable: false,
            weight: 0.1
          },
          {
            key: 'replenishment',
            label: 'Пополнение',
            type: 'boolean',
            sortable: false,
            weight: 0.1
          },
          {
            key: 'partial_withdrawal',
            label: 'Частичное снятие',
            type: 'boolean',
            sortable: false,
            weight: 0.1
          }
        ];

      case 'credit':
        return [
          ...commonHeaders,
          {
            key: 'interest_rate',
            label: 'Процентная ставка',
            type: 'percent',
            sortable: true,
            weight: 0.3
          },
          {
            key: 'max_amount',
            label: 'Макс. сумма',
            type: 'currency',
            sortable: true,
            weight: 0.15
          },
          {
            key: 'max_term',
            label: 'Макс. срок (мес)',
            type: 'number',
            sortable: true,
            weight: 0.1
          },
          {
            key: 'grace_period',
            label: 'Льготный период',
            type: 'number',
            sortable: true,
            weight: 0.15
          },
          {
            key: 'fees',
            label: 'Комиссии',
            type: 'currency',
            sortable: true,
            weight: 0.2
          }
        ];

      default:
        return commonHeaders;
    }
  }

  /**
   * Создает строку сравнения для одного продукта
   */
  private createComparisonRow(
    product: BankProduct,
    headers: ComparisonHeader[],
    allProducts: BankProduct[]
  ): ComparisonRow {
    const values: Record<string, ComparisonValue> = {};
    
    headers.forEach(header => {
      const value = this.extractValue(product, header.key);
      const formatted = this.formatValue(value, header.type);
      const score = this.calculateScore(value, header, allProducts);
      const isBest = this.isBestValue(value, header, allProducts);
      const isWorst = this.isWorstValue(value, header, allProducts);
      
      values[header.key] = {
        raw: value,
        formatted,
        is_best: isBest,
        is_worst: isWorst,
        score,
        note: this.getValueNote(product, header.key)
      };
    });

    // Вычисляем общий балл
    const totalScore = this.calculateTotalScore(values, headers);
    
    // Определяем лучший ли это продукт
    const isBestOverall = this.isBestOverallProduct(totalScore, allProducts, headers);
    
    // Генерируем highlights
    const highlights = this.generateRowHighlights(product, values);

    return {
      product_id: product.id,
      bank_name: product.bank?.name || 'Неизвестный банк',
      product_name: product.name,
      values,
      total_score: totalScore,
      is_best_overall: isBestOverall,
      highlights
    };
  }

  /**
   * Извлекает значение из продукта по ключу
   */
  private extractValue(product: BankProduct, key: string): any {
    switch (key) {
      case 'bank_name':
        return product.bank?.name || 'Неизвестный банк';
      case 'product_name':
        return product.name;
      case 'interest_rate':
        return product.interest_rate;
      case 'min_amount':
        return product.min_amount;
      case 'max_amount':
        return product.max_amount;
      case 'min_term':
        return product.min_term;
      case 'max_term':
        return product.max_term;
      case 'fees':
        return this.calculateTotalFees(product.fees);
      case 'early_repayment':
        return product.features?.early_repayment || false;
      case 'capitalization':
        return product.features?.capitalization || false;
      case 'replenishment':
        return product.features?.replenishment || false;
      case 'partial_withdrawal':
        return product.features?.partial_withdrawal || false;
      case 'grace_period':
        return product.features?.grace_period || 0;
      default:
        return null;
    }
  }

  /**
   * Вычисляет общую сумму комиссий
   */
  private calculateTotalFees(fees: Record<string, any>): number {
    if (!fees || typeof fees !== 'object') return 0;
    
    return Object.values(fees).reduce((sum, fee) => {
      const feeValue = typeof fee === 'number' ? fee : 0;
      return sum + feeValue;
    }, 0);
  }

  /**
   * Форматирует значение в зависимости от типа
   */
  private formatValue(value: any, type: string): string {
    if (value === null || value === undefined) {
      return '—';
    }

    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        }).format(value);
      
      case 'percent':
        return `${value.toFixed(2)}%`;
      
      case 'number':
        return value.toString();
      
      case 'boolean':
        return value ? 'Да' : 'Нет';
      
      case 'text':
      default:
        return String(value);
    }
  }

  /**
   * Вычисляет балл для значения (0-100)
   */
  private calculateScore(
    value: any,
    header: ComparisonHeader,
    allProducts: BankProduct[]
  ): number {
    if (value === null || value === undefined) return 0;
    
    // Для булевых значений
    if (header.type === 'boolean') {
      return value ? 100 : 0;
    }
    
    // Для текстовых значений
    if (header.type === 'text') {
      return 50; // нейтральный балл
    }
    
    // Для числовых значений
    const allValues = allProducts
      .map(p => this.extractValue(p, header.key))
      .filter(v => v !== null && v !== undefined && typeof v === 'number');
    
    if (allValues.length === 0) return 50;
    
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    
    if (min === max) return 50;
    
    // Для процентных ставок и комиссий - меньше лучше
    if (header.key === 'interest_rate' || header.key === 'fees') {
      return 100 - ((value - min) / (max - min)) * 100;
    }
    
    // Для остальных - больше лучше
    return ((value - min) / (max - min)) * 100;
  }

  /**
   * Проверяет, является ли значение лучшим
   */
  private isBestValue(
    value: any,
    header: ComparisonHeader,
    allProducts: BankProduct[]
  ): boolean {
    if (value === null || value === undefined) return false;
    if (header.type === 'text') return false;
    if (header.type === 'boolean') return value === true;
    
    const allValues = allProducts
      .map(p => this.extractValue(p, header.key))
      .filter(v => v !== null && v !== undefined && typeof v === 'number');
    
    if (allValues.length === 0) return false;
    
    // Для процентных ставок и комиссий - меньше лучше
    if (header.key === 'interest_rate' || header.key === 'fees') {
      return value === Math.min(...allValues);
    }
    
    // Для остальных - больше лучше
    return value === Math.max(...allValues);
  }

  /**
   * Проверяет, является ли значение худшим
   */
  private isWorstValue(
    value: any,
    header: ComparisonHeader,
    allProducts: BankProduct[]
  ): boolean {
    if (value === null || value === undefined) return false;
    if (header.type === 'text') return false;
    if (header.type === 'boolean') return value === false;
    
    const allValues = allProducts
      .map(p => this.extractValue(p, header.key))
      .filter(v => v !== null && v !== undefined && typeof v === 'number');
    
    if (allValues.length === 0) return false;
    
    // Для процентных ставок и комиссий - больше хуже
    if (header.key === 'interest_rate' || header.key === 'fees') {
      return value === Math.max(...allValues);
    }
    
    // Для остальных - меньше хуже
    return value === Math.min(...allValues);
  }

  /**
   * Получает примечание для значения
   */
  private getValueNote(product: BankProduct, key: string): string | undefined {
    // Добавляем примечания для промо-ставок
    if (key === 'interest_rate' && product.promotional_rate) {
      return `Промо-ставка до ${product.promo_valid_until || 'неизвестной даты'}`;
    }
    
    return undefined;
  }

  /**
   * Вычисляет общий балл продукта
   */
  private calculateTotalScore(
    values: Record<string, ComparisonValue>,
    headers: ComparisonHeader[]
  ): number {
    let totalScore = 0;
    let totalWeight = 0;
    
    headers.forEach(header => {
      const value = values[header.key];
      if (value && header.weight) {
        totalScore += value.score * header.weight;
        totalWeight += header.weight;
      }
    });
    
    return totalWeight > 0 ? totalScore / totalWeight : 0;
  }

  /**
   * Проверяет, является ли продукт лучшим в целом
   */
  private isBestOverallProduct(
    score: number,
    allProducts: BankProduct[],
    headers: ComparisonHeader[]
  ): boolean {
    // Вычисляем баллы для всех продуктов БЕЗ рекурсии
    const allScores = allProducts.map(product => {
      let totalScore = 0;
      let totalWeight = 0;
      
      headers.forEach(header => {
        const value = this.extractValue(product, header.key);
        const score = this.calculateScore(value, header, allProducts);
        
        if (header.weight) {
          totalScore += score * header.weight;
          totalWeight += header.weight;
        }
      });
      
      return totalWeight > 0 ? totalScore / totalWeight : 0;
    });
    
    const maxScore = Math.max(...allScores);
    return Math.abs(score - maxScore) < 0.01; // Используем небольшую погрешность для сравнения float
  }

  /**
   * Генерирует highlights для строки
   */
  private generateRowHighlights(
    product: BankProduct,
    values: Record<string, ComparisonValue>
  ): string[] {
    const highlights: string[] = [];
    
    Object.entries(values).forEach(([key, value]) => {
      if (value.is_best) {
        const label = this.getHighlightLabel(key);
        if (label) {
          highlights.push(label);
        }
      }
    });
    
    // Добавляем промо-условия
    if (product.promotional_rate) {
      highlights.push('Промо-ставка');
    }
    
    if (product.is_featured) {
      highlights.push('Рекомендуем');
    }
    
    return highlights;
  }

  /**
   * Получает метку для highlight
   */
  private getHighlightLabel(key: string): string | null {
    const labels: Record<string, string> = {
      'interest_rate': 'Лучшая ставка',
      'fees': 'Минимальные комиссии',
      'max_amount': 'Максимальная сумма',
      'max_term': 'Максимальный срок',
      'grace_period': 'Лучший льготный период'
    };
    
    return labels[key] || null;
  }

  /**
   * Находит лучшие продукты в каждой категории
   */
  private findBestInCategories(
    rows: ComparisonRow[],
    headers: ComparisonHeader[]
  ): Record<string, string> {
    const bestInCategory: Record<string, string> = {};
    
    headers.forEach(header => {
      if (header.type === 'text') return;
      
      const bestRow = rows.reduce((best, current) => {
        const currentValue = current.values[header.key];
        const bestValue = best.values[header.key];
        
        if (!currentValue || currentValue.score === 0) return best;
        if (!bestValue || bestValue.score === 0) return current;
        
        return currentValue.score > bestValue.score ? current : best;
      }, rows[0]);
      
      if (bestRow) {
        bestInCategory[header.key] = bestRow.product_id;
      }
    });
    
    return bestInCategory;
  }

  /**
   * Создает сводку сравнения
   */
  private createSummary(
    products: BankProduct[],
    rows: ComparisonRow[],
    bestInCategory: Record<string, string>
  ): ComparisonSummary {
    const bestOverallRow = rows.reduce((best, current) => 
      current.total_score > best.total_score ? current : best
    , rows[0]);

    return {
      total_products: products.length,
      best_overall: bestOverallRow.product_id,
      best_rate: bestInCategory['interest_rate'] || '',
      lowest_fees: bestInCategory['fees'] || '',
      highest_rating: '', // будет реализовано позже с рейтингами
      recommendations: this.generateSummaryRecommendations(rows, bestInCategory)
    };
  }

  /**
   * Генерирует рекомендации для сводки
   */
  private generateSummaryRecommendations(
    rows: ComparisonRow[],
    bestInCategory: Record<string, string>
  ): string[] {
    const recommendations: string[] = [];
    
    const bestOverall = rows.find(r => r.is_best_overall);
    if (bestOverall) {
      recommendations.push(
        `${bestOverall.product_name} от ${bestOverall.bank_name} - лучший выбор в целом`
      );
    }
    
    const bestRate = rows.find(r => r.product_id === bestInCategory['interest_rate']);
    if (bestRate && bestRate.product_id !== bestOverall?.product_id) {
      recommendations.push(
        `${bestRate.product_name} от ${bestRate.bank_name} - лучшая процентная ставка`
      );
    }
    
    return recommendations;
  }

  /**
   * Определяет лучшие опции среди продуктов
   */
  private identifyBestOptions(
    products: BankProduct[],
    matrix: ComparisonMatrix
  ): ProductHighlights {
    return {
      bestRate: matrix.best_in_category['interest_rate'] || null,
      lowestFees: matrix.best_in_category['fees'] || null,
      highestRating: matrix.best_in_category['rating'] || null,
      bestOverall: matrix.summary.best_overall
    };
  }

  /**
   * Генерирует рекомендации на основе сравнения
   */
  private generateRecommendations(
    products: BankProduct[],
    matrix: ComparisonMatrix,
    criteria: ComparisonCriteria
  ): string[] {
    return matrix.summary.recommendations;
  }

  /**
   * Применяет подсветку лучших опций к результату сравнения
   * Requirements 1.4: highlight best options for each parameter
   */
  highlightBestOptions(result: ComparisonResult): ComparisonResult {
    // Подсветка уже применена в процессе создания матрицы
    // Этот метод может быть использован для дополнительной обработки
    return {
      ...result,
      highlights: this.identifyBestOptions(result.products, result.matrix)
    };
  }

  /**
   * Обрабатывает промо-ставки и их отображение
   * Requirements 1.6: promotional rate handling and display
   */
  handlePromotionalRates(products: BankProduct[]): BankProduct[] {
    const now = new Date();
    
    return products.map(product => {
      // Проверяем, действительна ли промо-ставка
      if (product.promotional_rate && product.promo_valid_until) {
        const promoEndDate = new Date(product.promo_valid_until);
        
        if (promoEndDate < now) {
          // Промо-ставка истекла, убираем её
          return {
            ...product,
            promotional_rate: undefined,
            promo_valid_until: undefined,
            promo_conditions: undefined
          };
        }
      }
      
      return product;
    });
  }

  /**
   * Применяет фильтры в реальном времени
   * Requirements 1.5: real-time filtering system
   */
  applyFiltersRealtime(
    products: BankProduct[],
    filters: ProductFilters,
    criteria: ComparisonCriteria
  ): BankProduct[] {
    // Сначала обрабатываем промо-ставки
    let filteredProducts = this.handlePromotionalRates(products);
    
    // Применяем фильтры
    filteredProducts = this.filterProducts(filteredProducts, filters);
    
    // Учитываем промо-акции в критериях
    if (!criteria.include_promotions) {
      filteredProducts = filteredProducts.map(product => ({
        ...product,
        promotional_rate: undefined,
        promo_valid_until: undefined,
        promo_conditions: undefined
      }));
    }
    
    return filteredProducts;
  }

  /**
   * Фильтрует продукты по заданным критериям
   */
  filterProducts(products: BankProduct[], filters: ProductFilters): BankProduct[] {
    return products.filter(product => {
      // Фильтр по типу продукта
      if (filters.productType && product.product_type !== filters.productType) {
        return false;
      }
      
      // Фильтр по процентной ставке
      if (filters.minRate !== undefined && product.interest_rate < filters.minRate) {
        return false;
      }
      if (filters.maxRate !== undefined && product.interest_rate > filters.maxRate) {
        return false;
      }
      
      // Фильтр по сумме
      if (filters.minAmount !== undefined && product.max_amount && product.max_amount < filters.minAmount) {
        return false;
      }
      if (filters.maxAmount !== undefined && product.min_amount && product.min_amount > filters.maxAmount) {
        return false;
      }
      
      // Фильтр по региону
      if (filters.region && !product.available_regions.includes(filters.region) && !product.available_regions.includes('all')) {
        return false;
      }
      
      // Фильтр по промо-акциям
      if (filters.hasPromotion && !product.promotional_rate) {
        return false;
      }
      
      // Фильтр по банкам
      if (filters.bankIds && filters.bankIds.length > 0 && !filters.bankIds.includes(product.bank_id)) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Вычисляет общую стоимость продукта
   * Requirements 1.7: total cost calculations
   */
  calculateTotalCost(
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
   * Вычисляет эффективную процентную ставку
   * Requirements 1.7: effective rate computations
   */
  calculateEffectiveRate(
    product: BankProduct,
    amount: number,
    termMonths: number
  ): number {
    const totalCost = this.calculateTotalCost(product, amount, termMonths);
    const totalInterest = totalCost - amount;
    
    // Эффективная годовая ставка
    const effectiveRate = (totalInterest / amount / termMonths * 12) * 100;
    
    return Math.max(0, effectiveRate);
  }

  /**
   * Создает детальную матрицу сравнения с разбивкой затрат
   * Requirements 1.7: comparison matrix with detailed breakdowns
   */
  createDetailedComparisonMatrix(
    products: BankProduct[],
    amount: number,
    termMonths: number,
    criteria: ComparisonCriteria
  ): ComparisonMatrix {
    // Получаем базовую матрицу
    const baseMatrix = this.getComparisonMatrix(products, criteria);
    
    // Добавляем расчетные поля
    const enhancedRows = baseMatrix.rows.map(row => {
      const product = products.find(p => p.id === row.product_id);
      if (!product) return row;
      
      const totalCost = this.calculateTotalCost(product, amount, termMonths);
      const effectiveRate = this.calculateEffectiveRate(product, amount, termMonths);
      const monthlyPayment = totalCost / termMonths;
      
      return {
        ...row,
        values: {
          ...row.values,
          'total_cost': {
            raw: totalCost,
            formatted: this.formatValue(totalCost, 'currency'),
            is_best: false,
            is_worst: false,
            score: 0
          },
          'effective_rate': {
            raw: effectiveRate,
            formatted: this.formatValue(effectiveRate, 'percent'),
            is_best: false,
            is_worst: false,
            score: 0
          },
          'monthly_payment': {
            raw: monthlyPayment,
            formatted: this.formatValue(monthlyPayment, 'currency'),
            is_best: false,
            is_worst: false,
            score: 0
          }
        }
      };
    });
    
    return {
      ...baseMatrix,
      rows: enhancedRows
    };
  }

  /**
   * Сохраняет сравнение для пользователя (закладка)
   * Requirements 1.8: bookmark and save functionality
   */
  async saveComparison(
    userId: string,
    productIds: string[],
    criteria: ComparisonCriteria
  ): Promise<string> {
    // В реальном приложении здесь будет сохранение в БД
    // Возвращаем ID сохраненного сравнения
    const comparisonId = `comparison_${Date.now()}_${userId}`;
    
    // Сохраняем в localStorage как временное решение
    const comparison = {
      id: comparisonId,
      user_id: userId,
      product_ids: productIds,
      comparison_criteria: criteria,
      created_at: new Date().toISOString()
    };
    
    const savedComparisons = JSON.parse(localStorage.getItem('saved_comparisons') || '[]');
    savedComparisons.push(comparison);
    localStorage.setItem('saved_comparisons', JSON.stringify(savedComparisons));
    
    return comparisonId;
  }

  /**
   * Загружает сохраненное сравнение
   * Requirements 1.8: bookmark and save functionality
   */
  async loadComparison(comparisonId: string): Promise<{
    productIds: string[];
    criteria: ComparisonCriteria;
  } | null> {
    // В реальном приложении здесь будет загрузка из БД
    const savedComparisons = JSON.parse(localStorage.getItem('saved_comparisons') || '[]');
    const comparison = savedComparisons.find((c: any) => c.id === comparisonId);
    
    if (!comparison) return null;
    
    return {
      productIds: comparison.product_ids,
      criteria: comparison.comparison_criteria
    };
  }
}
