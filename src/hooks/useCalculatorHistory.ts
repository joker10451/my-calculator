/**
 * Хук для работы с историей расчётов.
 * Основное хранилище — localStorage.
 * При наличии авторизованной Supabase-сессии синхронизирует историю с таблицей calculation_history.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface CalculationHistoryItem {
  id: string;
  calculatorType: string;
  calculatorName: string;
  timestamp: number;
  inputs: Record<string, unknown>;
  results: Record<string, unknown>;
}

const HISTORY_KEY = 'calculator_history';
const MAX_HISTORY_ITEMS = 50;

async function getSupabaseLazy() {
  const { getSupabase } = await import('@/lib/database/supabase');
  return getSupabase();
}

async function syncToSupabase(userId: string, items: CalculationHistoryItem[]) {
  const supabase = await getSupabaseLazy();
  if (!supabase) return;
  try {
    await supabase
      .from('calculation_history' as never)
      .upsert({ user_id: userId, history: JSON.stringify(items), updated_at: new Date().toISOString() } as never, {
        onConflict: 'user_id',
      });
  } catch {
    // Таблица может не существовать — не критично
  }
}

async function loadFromSupabase(userId: string): Promise<CalculationHistoryItem[] | null> {
  const supabase = await getSupabaseLazy();
  if (!supabase) return null;
  try {
    const { data } = await (supabase
      .from('calculation_history' as never)
      .select('history')
      .eq('user_id', userId)
      .single() as Promise<{ data: { history: string } | null }>);
    if (data?.history) {
      return JSON.parse(data.history) as CalculationHistoryItem[];
    }
  } catch {
    // Игнорируем
  }
  return null;
}

export function useCalculatorHistory() {
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const userIdRef = useRef<string | null>(null);

  // Загрузка истории: localStorage + опциональная Supabase синхронизация
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      // 1. Сначала грузим из localStorage
      try {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (stored && mounted) setHistory(JSON.parse(stored));
      } catch {}

      // 2. Проверяем Supabase-сессию
      const supabase = await getSupabaseLazy();
      if (!supabase || !mounted) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const userId = session.user.id;
        userIdRef.current = userId;

        // 3. Грузим из облака и мёрджим с локальными (облако приоритетнее)
        const cloudHistory = await loadFromSupabase(userId);
        if (!mounted) return;

        if (cloudHistory && cloudHistory.length > 0) {
          const merged = [...cloudHistory];
          setHistory(merged);
          try { localStorage.setItem(HISTORY_KEY, JSON.stringify(merged)); } catch {}
        } else {
          // Облако пустое — заливаем локальные данные
          const stored = localStorage.getItem(HISTORY_KEY);
          if (stored) {
            const localItems: CalculationHistoryItem[] = JSON.parse(stored);
            if (localItems.length > 0) await syncToSupabase(userId, localItems);
          }
        }
      } catch {}
    };

    load();
    return () => { mounted = false; };
  }, []);

  const saveToStorage = useCallback((items: CalculationHistoryItem[]) => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(items)); } catch {}
  }, []);

  const addCalculation = useCallback((
    calculatorType: string,
    calculatorName: string,
    inputs: Record<string, unknown>,
    results: Record<string, unknown>
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
      // Асинхронная синхронизация с Supabase (не блокирует UI)
      if (userIdRef.current) {
        syncToSupabase(userIdRef.current, updated).catch(() => {});
      }
      return updated;
    });

    return newItem.id;
  }, [saveToStorage]);

  const getHistoryByType = useCallback((calculatorType: string) => {
    return history.filter(item => item.calculatorType === calculatorType);
  }, [history]);

  const removeCalculation = useCallback((id: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveToStorage(updated);
      if (userIdRef.current) syncToSupabase(userIdRef.current, updated).catch(() => {});
      return updated;
    });
  }, [saveToStorage]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
    if (userIdRef.current) syncToSupabase(userIdRef.current, []).catch(() => {});
  }, []);

  const clearHistoryByType = useCallback((calculatorType: string) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.calculatorType !== calculatorType);
      saveToStorage(updated);
      if (userIdRef.current) syncToSupabase(userIdRef.current, updated).catch(() => {});
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
