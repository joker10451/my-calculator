/**
 * Экспорт локальных утилит для работы с данными
 */

export { LocalDataManager } from './LocalDataManager';
export { LocalStorageCache } from './LocalStorageCache';
export { EnhancedCacheManager } from './EnhancedCacheManager';
export { FallbackSystem } from './FallbackSystem';

// Оставляем ApiSourceManager для обратной совместимости (будет удален позже)
export { ApiSourceManager } from './ApiSourceManager';

// Типы (только те что используются)
export type {
  FeeScheduleApiData,
  LegalDocumentData
} from '@/types/apiSources';