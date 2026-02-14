/**
 * Мок для Supabase клиента для тестирования
 */

// Простая in-memory база данных для тестов
class MockDatabase {
  private data: Record<string, any[]> = {
    banks: [],
    bank_products: [],
    user_profiles: [],
    recommendations: [],
    comparisons: [],
    referral_analytics: []
  };

  private nextId = 1;

  clear() {
    this.data = {
      banks: [],
      bank_products: [],
      user_profiles: [],
      recommendations: [],
      comparisons: [],
      referral_analytics: []
    };
    this.nextId = 1;
  }

  generateId(): string {
    return `mock-id-${this.nextId++}`;
  }

  insert(table: string, record: any) {
    const id = this.generateId();
    const now = new Date().toISOString();
    const newRecord = {
      ...record,
      id,
      created_at: now,
      updated_at: now
    };
    
    this.data[table].push(newRecord);
    return { data: newRecord, error: null };
  }

  select(table: string, filters: any = {}) {
    let records = [...this.data[table]];
    
    // Применяем фильтры
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'eq') {
        const [field, filterValue] = value as [string, any];
        records = records.filter(record => record[field] === filterValue);
      } else if (key === 'gte') {
        const [field, filterValue] = value as [string, any];
        records = records.filter(record => record[field] >= filterValue);
      } else if (key === 'lte') {
        const [field, filterValue] = value as [string, any];
        records = records.filter(record => record[field] <= filterValue);
      } else if (key === 'contains') {
        const [field, filterValue] = value as [string, any[]];
        records = records.filter(record => {
          const recordValue = record[field];
          if (Array.isArray(recordValue)) {
            return filterValue.some(val => recordValue.includes(val));
          }
          return false;
        });
      }
    });
    
    return { data: records, error: null };
  }

  selectSingle(table: string, filters: any = {}) {
    const result = this.select(table, filters);
    if (result.data.length === 0) {
      return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
    }
    return { data: result.data[0], error: null };
  }

  update(table: string, id: string, updates: any) {
    const records = this.data[table];
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) {
      return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
    }
    
    const updatedRecord = {
      ...records[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    records[index] = updatedRecord;
    return { data: updatedRecord, error: null };
  }

  delete(table: string, id: string) {
    const records = this.data[table];
    const index = records.findIndex(record => record.id === id);
    
    if (index === -1) {
      return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
    }
    
    // Каскадное удаление для банков
    if (table === 'banks') {
      this.data.bank_products = this.data.bank_products.filter(
        product => product.bank_id !== id
      );
    }
    
    records.splice(index, 1);
    return { data: null, error: null };
  }
}

const mockDb = new MockDatabase();

// Мок для Supabase query builder
class MockQueryBuilder {
  private table: string;
  private filters: any = {};
  private selectFields = '*';
  private orderBy: { field: string; ascending: boolean } | null = null;
  private rangeLimit: { from: number; to: number } | null = null;
  private single = false;

  constructor(table: string) {
    this.table = table;
  }

  select(fields = '*') {
    this.selectFields = fields;
    return this;
  }

  eq(field: string, value: any) {
    this.filters.eq = [field, value];
    return this;
  }

  gte(field: string, value: any) {
    this.filters.gte = [field, value];
    return this;
  }

  lte(field: string, value: any) {
    this.filters.lte = [field, value];
    return this;
  }

  contains(field: string, value: any[]) {
    this.filters.contains = [field, value];
    return this;
  }

  textSearch(field: string, query: string) {
    // Простая реализация текстового поиска
    this.filters.textSearch = [field, query];
    return this;
  }

  order(field: string, options: { ascending?: boolean } = {}) {
    this.orderBy = { field, ascending: options.ascending ?? true };
    return this;
  }

  range(from: number, to: number) {
    this.rangeLimit = { from, to };
    return this;
  }

  limit(count: number) {
    this.rangeLimit = { from: 0, to: count - 1 };
    return this;
  }

  single() {
    this.single = true;
    return this;
  }

  async then(resolve: (result: any) => void) {
    let result;
    
    if (this.single) {
      result = mockDb.selectSingle(this.table, this.filters);
    } else {
      result = mockDb.select(this.table, this.filters);
      
      // Применяем текстовый поиск
      if (this.filters.textSearch) {
        const [field, query] = this.filters.textSearch;
        result.data = result.data.filter((record: any) => 
          record[field]?.toLowerCase().includes(query.toLowerCase())
        );
      }
      
      // Применяем сортировку
      if (this.orderBy) {
        result.data.sort((a: any, b: any) => {
          const aVal = a[this.orderBy!.field];
          const bVal = b[this.orderBy!.field];
          
          if (this.orderBy!.ascending) {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
      }
      
      // Применяем лимиты
      if (this.rangeLimit) {
        result.data = result.data.slice(this.rangeLimit.from, this.rangeLimit.to + 1);
      }
    }
    
    return resolve(result);
  }
}

// Мок для Supabase insert builder
class MockInsertBuilder {
  private table: string;
  private records: any[] = [];

  constructor(table: string, records: any[]) {
    this.table = table;
    this.records = records;
  }

  select(fields = '*') {
    return this;
  }

  single() {
    return this;
  }

  async then(resolve: (result: any) => void) {
    if (this.records.length === 1) {
      const result = mockDb.insert(this.table, this.records[0]);
      return resolve(result);
    } else {
      // Множественная вставка
      const results = this.records.map(record => mockDb.insert(this.table, record));
      const data = results.map(r => r.data);
      return resolve({ data, error: null });
    }
  }
}

// Мок для Supabase update builder
class MockUpdateBuilder {
  private table: string;
  private updates: any;
  private filters: any = {};

  constructor(table: string, updates: any) {
    this.table = table;
    this.updates = updates;
  }

  eq(field: string, value: any) {
    this.filters.eq = [field, value];
    return this;
  }

  select(fields = '*') {
    return this;
  }

  single() {
    return this;
  }

  async then(resolve: (result: any) => void) {
    if (this.filters.eq) {
      const [field, value] = this.filters.eq;
      const result = mockDb.update(this.table, value, this.updates);
      return resolve(result);
    }
    return resolve({ data: null, error: { message: 'No filters specified' } });
  }
}

// Мок для Supabase delete builder
class MockDeleteBuilder {
  private table: string;
  private filters: any = {};

  constructor(table: string) {
    this.table = table;
  }

  eq(field: string, value: any) {
    this.filters.eq = [field, value];
    return this;
  }

  async then(resolve: (result: any) => void) {
    if (this.filters.eq) {
      const [field, value] = this.filters.eq;
      const result = mockDb.delete(this.table, value);
      return resolve(result);
    }
    return resolve({ data: null, error: { message: 'No filters specified' } });
  }
}

// Главный мок для Supabase клиента
export const mockSupabase = {
  from(table: string) {
    return {
      select: (fields?: string) => new MockQueryBuilder(table).select(fields),
      insert: (records: any | any[]) => {
        const recordsArray = Array.isArray(records) ? records : [records];
        return new MockInsertBuilder(table, recordsArray);
      },
      update: (updates: any) => new MockUpdateBuilder(table, updates),
      delete: () => new MockDeleteBuilder(table)
    };
  }
};

// Функция для очистки мок базы данных
export const clearMockDatabase = () => {
  mockDb.clear();
};

// Функция для получения данных из мок базы
export const getMockData = (table: string) => {
  return mockDb.data[table] || [];
};

// Экспорт типов для совместимости
export type Database = any;
export class DatabaseError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export const handleDatabaseError = (error: any): never => {
  throw new DatabaseError(error.message || 'Database error', error.code, error);
};