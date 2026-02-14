/**
 * Хук для работы с избранными калькуляторами
 * Сохраняет избранное в localStorage
 */

import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'favorite_calculators';

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  // Загрузка избранного из localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setFavorites(parsed);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  // Сохранение в localStorage
  const saveToStorage = useCallback((items: string[]) => {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, []);

  // Добавление в избранное
  const addFavorite = useCallback((calculatorId: string) => {
    setFavorites(prev => {
      if (prev.includes(calculatorId)) {
        return prev;
      }
      const updated = [...prev, calculatorId];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Удаление из избранного
  const removeFavorite = useCallback((calculatorId: string) => {
    setFavorites(prev => {
      const updated = prev.filter(id => id !== calculatorId);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Переключение избранного
  const toggleFavorite = useCallback((calculatorId: string) => {
    setFavorites(prev => {
      const updated = prev.includes(calculatorId)
        ? prev.filter(id => id !== calculatorId)
        : [...prev, calculatorId];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  // Проверка, находится ли калькулятор в избранном
  const isFavorite = useCallback((calculatorId: string) => {
    return favorites.includes(calculatorId);
  }, [favorites]);

  // Очистка всего избранного
  const clearFavorites = useCallback(() => {
    setFavorites([]);
    localStorage.removeItem(FAVORITES_KEY);
  }, []);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
  };
}
