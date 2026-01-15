// Базовая структура API сервера для системы сравнения и рекомендаций
// В production это будет отдельный Node.js сервер
// В development интегрируется с Vite dev server

import { supabase, handleDatabaseError } from '../database/supabase';
import { cache } from '../cache/redis';

// Типы для API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface FilterParams {
  productType?: string;
  bankId?: string;
  region?: string;
  minRate?: number;
  maxRate?: number;
  minAmount?: number;
  maxAmount?: number;
  isActive?: boolean;
  isFeatured?: boolean;
}

// Базовый класс для API контроллеров
export abstract class BaseController {
  protected async handleRequest<T>(
    operation: () => Promise<T>,
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<ApiResponse<T>> {
    try {
      // Проверяем кэш если указан ключ
      if (cacheKey) {
        const cached = await cache.get<T>(cacheKey);
        if (cached) {
          return { success: true, data: cached };
        }
      }

      const result = await operation();

      // Сохраняем в кэш если указан ключ
      if (cacheKey && result) {
        await cache.set(cacheKey, result, cacheTTL);
      }

      return { success: true, data: result };
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof Error) {
        return { 
          success: false, 
          error: error.message,
          message: 'Произошла ошибка при выполнении запроса'
        };
      }
      
      return { 
        success: false, 
        error: 'Unknown error',
        message: 'Неизвестная ошибка'
      };
    }
  }

  protected buildPagination(params: PaginationParams) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 20));
    const offset = (page - 1) * limit;
    
    return { page, limit, offset };
  }
}

// Контроллер для банков
export class BanksController extends BaseController {
  async getAllBanks(params: PaginationParams = {}) {
    const { limit, offset } = this.buildPagination(params);
    const cacheKey = `banks:all:${limit}:${offset}`;
    
    return this.handleRequest(async () => {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .order('overall_rating', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) handleDatabaseError(error);
      return data;
    }, cacheKey, 10 * 60 * 1000); // 10 минут
  }

  async getBankById(id: string) {
    const cacheKey = `bank:${id}`;
    
    return this.handleRequest(async () => {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .eq('id', id)
        .single();

      if (error) handleDatabaseError(error);
      return data;
    }, cacheKey, 30 * 60 * 1000); // 30 минут
  }

  async getPartnerBanks() {
    const cacheKey = 'banks:partners';
    
    return this.handleRequest(async () => {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .eq('is_partner', true)
        .order('commission_rate', { ascending: false });

      if (error) handleDatabaseError(error);
      return data;
    }, cacheKey, 15 * 60 * 1000); // 15 минут
  }
}

// Контроллер для банковских продуктов
export class ProductsController extends BaseController {
  async getProducts(filters: FilterParams = {}, pagination: PaginationParams = {}) {
    const { limit, offset } = this.buildPagination(pagination);
    const cacheKey = `products:${JSON.stringify(filters)}:${limit}:${offset}`;
    
    return this.handleRequest(async () => {
      let query = supabase
        .from('bank_products')
        .select(`
          *,
          banks (
            id,
            name,
            short_name,
            logo_url,
            overall_rating,
            is_partner
          )
        `)
        .eq('is_active', true);

      // Применяем фильтры
      if (filters.productType) {
        query = query.eq('product_type', filters.productType);
      }
      if (filters.bankId) {
        query = query.eq('bank_id', filters.bankId);
      }
      if (filters.minRate !== undefined) {
        query = query.gte('interest_rate', filters.minRate);
      }
      if (filters.maxRate !== undefined) {
        query = query.lte('interest_rate', filters.maxRate);
      }
      if (filters.minAmount !== undefined) {
        query = query.gte('min_amount', filters.minAmount);
      }
      if (filters.maxAmount !== undefined) {
        query = query.lte('max_amount', filters.maxAmount);
      }
      if (filters.isFeatured !== undefined) {
        query = query.eq('is_featured', filters.isFeatured);
      }
      if (filters.region) {
        query = query.contains('available_regions', [filters.region]);
      }

      const { data, error } = await query
        .order('priority', { ascending: false })
        .order('interest_rate', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) handleDatabaseError(error);
      return data;
    }, cacheKey, 5 * 60 * 1000); // 5 минут
  }

  async getProductById(id: string) {
    const cacheKey = `product:${id}`;
    
    return this.handleRequest(async () => {
      const { data, error } = await supabase
        .from('bank_products')
        .select(`
          *,
          banks (
            id,
            name,
            short_name,
            logo_url,
            website_url,
            overall_rating,
            customer_service_rating,
            reliability_rating,
            processing_speed_rating,
            is_partner,
            commission_rate
          )
        `)
        .eq('id', id)
        .single();

      if (error) handleDatabaseError(error);
      return data;
    }, cacheKey, 15 * 60 * 1000); // 15 минут
  }

  async getFeaturedProducts(productType?: string) {
    const cacheKey = `products:featured:${productType || 'all'}`;
    
    return this.handleRequest(async () => {
      let query = supabase
        .from('bank_products')
        .select(`
          *,
          banks (
            id,
            name,
            short_name,
            logo_url,
            overall_rating,
            is_partner
          )
        `)
        .eq('is_active', true)
        .eq('is_featured', true);

      if (productType) {
        query = query.eq('product_type', productType);
      }

      const { data, error } = await query
        .order('priority', { ascending: false })
        .limit(10);

      if (error) handleDatabaseError(error);
      return data;
    }, cacheKey, 10 * 60 * 1000); // 10 минут
  }
}

// Контроллер для сравнений
export class ComparisonController extends BaseController {
  async compareProducts(productIds: string[], userId?: string) {
    const cacheKey = `comparison:${productIds.sort().join(',')}`;
    
    return this.handleRequest(async () => {
      // Получаем продукты для сравнения
      const { data: products, error } = await supabase
        .from('bank_products')
        .select(`
          *,
          banks (
            id,
            name,
            short_name,
            logo_url,
            overall_rating,
            is_partner
          )
        `)
        .in('id', productIds)
        .eq('is_active', true);

      if (error) handleDatabaseError(error);
      if (!products || products.length === 0) {
        throw new Error('Продукты для сравнения не найдены');
      }

      // Создаем матрицу сравнения
      const comparisonMatrix = this.buildComparisonMatrix(products);
      
      // Сохраняем сравнение в базу (если есть пользователь)
      if (userId) {
        await this.saveComparison(userId, productIds, comparisonMatrix);
      }

      return {
        products,
        matrix: comparisonMatrix,
        highlights: this.highlightBestOptions(products),
        timestamp: new Date().toISOString()
      };
    }, cacheKey, 5 * 60 * 1000); // 5 минут
  }

  private buildComparisonMatrix(products: any[]) {
    const headers = [
      'Банк',
      'Продукт', 
      'Процентная ставка',
      'Мин. сумма',
      'Макс. сумма',
      'Срок',
      'Комиссии',
      'Рейтинг банка'
    ];

    const rows = products.map(product => ({
      productId: product.id,
      bank: product.banks.name,
      product: product.name,
      interestRate: product.interest_rate,
      minAmount: product.min_amount,
      maxAmount: product.max_amount,
      term: `${product.min_term}-${product.max_term} мес.`,
      fees: Object.keys(product.fees || {}).length,
      bankRating: product.banks.overall_rating
    }));

    return { headers, rows };
  }

  private highlightBestOptions(products: any[]) {
    const highlights: Record<string, string> = {};
    
    // Лучшая процентная ставка (минимальная для кредитов, максимальная для вкладов)
    const mortgageProducts = products.filter(p => p.product_type === 'mortgage' || p.product_type === 'credit');
    const depositProducts = products.filter(p => p.product_type === 'deposit');
    
    if (mortgageProducts.length > 0) {
      const bestRate = Math.min(...mortgageProducts.map(p => p.interest_rate));
      const bestProduct = mortgageProducts.find(p => p.interest_rate === bestRate);
      if (bestProduct) highlights.bestRate = bestProduct.id;
    }
    
    if (depositProducts.length > 0) {
      const bestRate = Math.max(...depositProducts.map(p => p.interest_rate));
      const bestProduct = depositProducts.find(p => p.interest_rate === bestRate);
      if (bestProduct) highlights.bestDepositRate = bestProduct.id;
    }

    // Лучший рейтинг банка
    const bestRating = Math.max(...products.map(p => p.banks.overall_rating || 0));
    const bestRatedProduct = products.find(p => p.banks.overall_rating === bestRating);
    if (bestRatedProduct) highlights.bestRating = bestRatedProduct.id;

    return highlights;
  }

  private async saveComparison(userId: string, productIds: string[], matrix: any) {
    try {
      const { error } = await supabase
        .from('comparisons')
        .insert({
          user_id: userId,
          product_ids: productIds,
          comparison_matrix: matrix,
          comparison_criteria: {},
          highlighted_products: []
        });

      if (error) {
        console.error('Ошибка сохранения сравнения:', error);
      }
    } catch (error) {
      console.error('Ошибка сохранения сравнения:', error);
    }
  }
}

// Создаем экземпляры контроллеров
export const banksController = new BanksController();
export const productsController = new ProductsController();
export const comparisonController = new ComparisonController();

// Простой роутер для API
export class ApiRouter {
  private routes: Map<string, (params: any) => Promise<ApiResponse>> = new Map();

  constructor() {
    this.setupRoutes();
  }

  private setupRoutes() {
    // Маршруты для банков
    this.routes.set('GET /api/banks', (params) => banksController.getAllBanks(params));
    this.routes.set('GET /api/banks/:id', (params) => banksController.getBankById(params.id));
    this.routes.set('GET /api/banks/partners', () => banksController.getPartnerBanks());

    // Маршруты для продуктов
    this.routes.set('GET /api/products', (params) => productsController.getProducts(params.filters, params.pagination));
    this.routes.set('GET /api/products/:id', (params) => productsController.getProductById(params.id));
    this.routes.set('GET /api/products/featured', (params) => productsController.getFeaturedProducts(params.type));

    // Маршруты для сравнений
    this.routes.set('POST /api/compare', (params) => comparisonController.compareProducts(params.productIds, params.userId));
  }

  async handleRequest(method: string, path: string, params: any = {}): Promise<ApiResponse> {
    const routeKey = `${method} ${path}`;
    const handler = this.routes.get(routeKey);

    if (!handler) {
      return {
        success: false,
        error: 'Route not found',
        message: 'Маршрут не найден'
      };
    }

    return await handler(params);
  }

  getRoutes() {
    return Array.from(this.routes.keys());
  }
}

export const apiRouter = new ApiRouter();