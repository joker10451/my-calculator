/**
 * Хук для работы с историей расчетов
 * Сохраняет историю в localStorage
 */

import { useState, useEffect, useCallback } from 'react';

export interface CalculationHistoryItem {
  id: string;
  calculatorType: string;
  calculatorName: string;
  timestamp: number;
  inputs: Record<string, any>;
  results: Record<string, any>;
}

const HISTORY_KEY = 'calculator_history';
const MAX_HISTORY_ITEMS = 50;

export function useCalculatorHistory() {
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);

  // Загрузка истории из localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Error loading calculator history:', error);
    }
  }, []);

  // Сохранение истории в localStorage
  const saveToStorage = useCallback((items: CalculationHistoryItem[]) => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving calculator history:', error);
    }
  }, []);

  // Добавление нового расчета
  const addCalculation = useCallback((
    calculatorType: string,
    calculatorName: string,
    inputs: Record<string, any>,
    results: Record<string, any>
  ) => {
    const newItem: CalculationHistoryItem = {
      id: `${calculatorType}_${Date.now()}`,
      calculatorType,
      calculatorName,
      timestamp: Date.now(),
      inputs,
      results,
    };

    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, MAX_HISTORY_ITEMS);
      saveToStorage(updated);
      return updated;
    });

    return newItem.id;
  }, [saveToStorage]);

  // Получение истории для конкретного калькулятора
  const getHistoryByType = useCallback((calculatorType: string) => {
    return history.filter(item => item.calculatorType === calculatorType);
  }, [history]);

  // Удаление записи из истории
  const removeCalculation = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Очистка всей истории
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  // Очистка истории для конкретного калькулятора
  const clearHistoryByType = useCallback((calculatorType: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.calculatorType !== calculatorType);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  return {
    history,
    addCalculation,
    getHistoryByType,
    removeCalculation,
    clearHistory,
    clearHistoryByType,
  };
}
