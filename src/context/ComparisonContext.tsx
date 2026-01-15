import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { STORAGE_KEYS } from '@/shared/constants';
import { storage } from '@/shared/utils/storage';
import useLocalStorage from '@/hooks/useLocalStorage';

export interface ComparisonItem {
  id: string;
  title: string;
  calculatorId: string;
  data: Record<string, unknown>;
  params: Record<string, unknown>;
  timestamp: number;
}

interface ComparisonContextType {
  items: ComparisonItem[];
  addItem: (item: Omit<ComparisonItem, 'id' | 'timestamp'>) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  hasItem: (calculatorId: string, params: Record<string, unknown>) => boolean;
  getItemsCount: () => number;
  canAddMore: () => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

const MAX_COMPARISON_ITEMS = 4;

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useLocalStorage<ComparisonItem[]>(
    STORAGE_KEYS.COMPARISON_ITEMS, 
    [],
    { syncAcrossTabs: true }
  );

  const addItem = useCallback((newItem: Omit<ComparisonItem, 'id' | 'timestamp'>) => {
    const item: ComparisonItem = {
      ...newItem,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    setItems(prevItems => {
      // Проверяем, не превышаем ли лимит
      if (prevItems.length >= MAX_COMPARISON_ITEMS) {
        // Удаляем самый старый элемент
        const sortedItems = [...prevItems].sort((a, b) => a.timestamp - b.timestamp);
        return [item, ...sortedItems.slice(0, MAX_COMPARISON_ITEMS - 1)];
      }
      
      return [item, ...prevItems];
    });
  }, [setItems]);

  const removeItem = useCallback((id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, [setItems]);

  const clearAll = useCallback(() => {
    setItems([]);
  }, [setItems]);

  const hasItem = useCallback((calculatorId: string, params: Record<string, unknown>) => {
    return items.some(item => 
      item.calculatorId === calculatorId && 
      JSON.stringify(item.params) === JSON.stringify(params)
    );
  }, [items]);

  const getItemsCount = useCallback(() => items.length, [items]);

  const canAddMore = useCallback(() => items.length < MAX_COMPARISON_ITEMS, [items]);

  const contextValue = useMemo(() => ({
    items,
    addItem,
    removeItem,
    clearAll,
    hasItem,
    getItemsCount,
    canAddMore,
  }), [items, addItem, removeItem, clearAll, hasItem, getItemsCount, canAddMore]);

  return (
    <ComparisonContext.Provider value={contextValue}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = (): ComparisonContextType => {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};
