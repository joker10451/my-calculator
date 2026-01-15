/**
 * Главный модуль для работы с базой данных банковских продуктов
 * Экспортирует все необходимые компоненты для работы с данными
 */

// Основные репозитории
export { BankRepository, BankProductRepository, BankDataValidator } from './bankRepository';

// Система синхронизации данных
export { DataSyncManager, dataSyncManager, DataSourcePriority } from './dataSync';

// Подключения к базам данных
export { supabase, handleDatabaseError, DatabaseError } from './supabase';
export { localDB } from './local-storage';

// Типы данных
export type {
  Bank,
  BankCreateData,
  BankUpdateData,
  BankProduct,
  BankProductCreateData,
  BankProductUpdateData,
  ProductFilters,
  ProductSortOptions,
  ProductSearchResult,
  UserProfile,
  UserProfileData,
  Recommendation,
  RecommendationCreateData,
  Comparison,
  ComparisonCriteria,
  ComparisonMatrix,
  ReferralAnalytics,
  ReferralEventData,
  ValidationResult,
  ValidationError,
  QueryOptions,
  BankStatistics,
  DataSourceConfig,
  SyncStatus
} from '../../types/bank';

// Утилиты для работы с данными
export class DatabaseUtils {
  /**
   * Проверка доступности базы данных
   */
  static async checkConnection(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('banks')
        .select('id')
        .limit(1);
      
      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Получение информации о версии схемы
   */
  static async getSchemaVersion(): Promise<string> {
    try {
      // В реальной реализации здесь будет запрос к таблице версий
      return '1.0.0';
    } catch {
      return 'unknown';
    }
  }

  /**
   * Инициализация базы данных с тестовыми данными
   */
  static async initializeWithSampleData(): Promise<void> {
    try {
      // Проверяем, есть ли уже данные
      const banks = await BankRepository.getBanks();
      if (banks.length > 0) {
        console.log('База данных уже содержит данные');
        return;
      }

      // Создаем тестовые банки
      const sampleBanks = [
        {
          name: 'Сбербанк',
          short_name: 'Сбербанк',
          logo_url: '/banks/sberbank.png',
          website_url: 'https://sberbank.ru',
          overall_rating: 4.2,
          customer_service_rating: 4.0,
          reliability_rating: 4.5,
          processing_speed_rating: 4.1,
          phone: '+7 (800) 555-55-50',
          email: 'info@sberbank.ru',
          license_number: '1481',
          central_bank_code: '044525225',
          is_partner: true,
          commission_rate: 0.15,
          referral_terms: 'Комиссия 0.15% от суммы кредита'
        },
        {
          name: 'ВТБ',
          short_name: 'ВТБ',
          logo_url: '/banks/vtb.png',
          website_url: 'https://vtb.ru',
          overall_rating: 4.0,
          customer_service_rating: 3.8,
          reliability_rating: 4.2,
          processing_speed_rating: 3.9,
          phone: '+7 (800) 100-24-24',
          email: 'info@vtb.ru',
          license_number: '1000',
          central_bank_code: '044525187',
          is_partner: true,
          commission_rate: 0.12,
          referral_terms: 'Комиссия 0.12% от суммы кредита'
        },
        {
          name: 'Альфа-Банк',
          short_name: 'Альфа-Банк',
          logo_url: '/banks/alfabank.png',
          website_url: 'https://alfabank.ru',
          overall_rating: 4.3,
          customer_service_rating: 4.2,
          reliability_rating: 4.1,
          processing_speed_rating: 4.4,
          phone: '+7 (800) 200-00-00',
          email: 'info@alfabank.ru',
          license_number: '1326',
          central_bank_code: '044525593',
          is_partner: true,
          commission_rate: 0.18,
          referral_terms: 'Комиссия 0.18% от суммы кредита'
        }
      ];

      const createdBanks = [];
      for (const bankData of sampleBanks) {
        const bank = await BankRepository.createBank(bankData);
        createdBanks.push(bank);
      }

      // Создаем тестовые продукты
      const sampleProducts = [
        {
          bank_id: createdBanks[0].id,
          product_type: 'mortgage' as const,
          name: 'Ипотека на готовое жилье',
          description: 'Кредит на покупку готового жилья на вторичном рынке',
          interest_rate: 16.5,
          min_amount: 500000,
          max_amount: 30000000,
          min_term: 12,
          max_term: 360,
          fees: { application: 0, monthly: 0 },
          requirements: { min_income: 50000, min_age: 21 },
          features: { early_repayment: true, grace_period: false },
          available_regions: ['moscow', 'spb', 'all'],
          is_featured: true,
          priority: 10
        },
        {
          bank_id: createdBanks[1].id,
          product_type: 'mortgage' as const,
          name: 'Ипотека Победа над процентами',
          description: 'Специальная программа ипотечного кредитования',
          interest_rate: 15.9,
          min_amount: 600000,
          max_amount: 25000000,
          min_term: 12,
          max_term: 300,
          fees: { application: 1000, monthly: 0 },
          requirements: { min_income: 45000, min_age: 23 },
          features: { early_repayment: true, grace_period: true },
          available_regions: ['moscow', 'spb', 'regions'],
          is_featured: true,
          priority: 8
        },
        {
          bank_id: createdBanks[2].id,
          product_type: 'deposit' as const,
          name: 'Альфа-Депозит',
          description: 'Выгодный вклад с возможностью пополнения',
          interest_rate: 18.5,
          min_amount: 10000,
          max_amount: 50000000,
          min_term: 3,
          max_term: 36,
          fees: {},
          requirements: { min_age: 18 },
          features: { capitalization: true, replenishment: true },
          available_regions: ['all'],
          is_featured: true,
          priority: 9
        },
        {
          bank_id: createdBanks[0].id,
          product_type: 'credit' as const,
          name: 'Потребительский кредит',
          description: 'Кредит на любые цели без обеспечения',
          interest_rate: 19.9,
          min_amount: 50000,
          max_amount: 5000000,
          min_term: 6,
          max_term: 84,
          fees: { application: 0, monthly: 0 },
          requirements: { min_income: 30000, min_age: 21 },
          features: { early_repayment: true, online_application: true },
          available_regions: ['all'],
          is_featured: false,
          priority: 5
        }
      ];

      for (const productData of sampleProducts) {
        await BankProductRepository.createProduct(productData);
      }

      console.log('База данных инициализирована с тестовыми данными');
    } catch (error) {
      console.error('Ошибка инициализации базы данных:', error);
      throw error;
    }
  }

  /**
   * Очистка всех данных (для тестирования)
   */
  static async clearAllData(): Promise<void> {
    try {
      // Получаем все продукты и банки
      const products = await BankProductRepository.getProducts();
      const banks = await BankRepository.getBanks();

      // Удаляем все продукты
      for (const product of products) {
        await BankProductRepository.deleteProduct(product.id);
      }

      // Удаляем все банки
      for (const bank of banks) {
        await BankRepository.deleteBank(bank.id);
      }

      console.log('Все данные очищены');
    } catch (error) {
      console.error('Ошибка очистки данных:', error);
      throw error;
    }
  }

  /**
   * Получение статистики использования базы данных
   */
  static async getDatabaseStats(): Promise<{
    total_banks: number;
    total_products: number;
    products_by_type: Record<string, number>;
    storage_size_estimate: string;
  }> {
    try {
      const banks = await BankRepository.getBanks();
      const products = await BankProductRepository.getProducts();

      const productsByType = products.reduce((acc, product) => {
        acc[product.product_type] = (acc[product.product_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Примерная оценка размера данных
      const dataSize = JSON.stringify({ banks, products }).length;
      const sizeInKB = Math.round(dataSize / 1024);
      const storageSizeEstimate = sizeInKB > 1024 
        ? `${Math.round(sizeInKB / 1024)} MB`
        : `${sizeInKB} KB`;

      return {
        total_banks: banks.length,
        total_products: products.length,
        products_by_type: productsByType,
        storage_size_estimate: storageSizeEstimate
      };
    } catch (error) {
      console.error('Ошибка получения статистики:', error);
      throw error;
    }
  }
}

// Автоматическая инициализация при первом импорте
if (typeof window !== 'undefined') {
  // Инициализируем базу данных с тестовыми данными при первом запуске
  DatabaseUtils.checkConnection().then(isConnected => {
    if (isConnected) {
      console.log('Подключение к Supabase установлено');
    } else {
      console.log('Используется локальное хранилище');
      // Инициализируем локальную базу с тестовыми данными
      DatabaseUtils.initializeWithSampleData().catch(console.error);
    }
  });
}