import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCalculatorHistory } from '@/hooks/useCalculatorHistory';
import { useComparison } from '@/context/ComparisonContext';

/**
 * Общий хук для всех калькуляторов
 * Предоставляет переиспользуемую логику: форматирование, сохранение, сравнение
 */
export const useCalculatorCommon = (calculatorId: string, calculatorName: string) => {
  const { toast } = useToast();
  const { addCalculation } = useCalculatorHistory();
  const { addItem } = useComparison();

  // Форматирование валюты
  const formatCurrency = useCallback((value: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  // Форматирование процентов
  const formatPercent = useCallback((value: number, decimals: number = 2): string => {
    return `${value.toFixed(decimals)}%`;
  }, []);

  // Форматирование срока
  const formatTerm = useCallback((months: number): string => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    const parts: string[] = [];
    if (years > 0) {
      parts.push(`${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`);
    }
    if (remainingMonths > 0) {
      parts.push(`${remainingMonths} мес`);
    }
    
    return parts.length > 0 ? parts.join(' ') : '0 мес';
  }, []);

  // Сохранение расчета в историю
  const saveCalculation = useCallback((
    inputs: Record<string, unknown>,
    results: Record<string, string>
  ) => {
    addCalculation(calculatorId, calculatorName, inputs, results);
  }, [calculatorId, calculatorName, addCalculation]);

  // Добавление к сравнению
  const addToComparison = useCallback((
    title: string,
    data: Record<string, number>,
    params: Record<string, unknown>
  ) => {
    addItem({
      title,
      calculatorId,
      data,
      params,
    });
    
    toast({
      title: 'Добавлено к сравнению',
      description: 'Вы можете сравнить этот расчет с другими на странице сравнения.',
    });
  }, [calculatorId, addItem, toast]);

  // Показать уведомление
  const showToast = useCallback((
    title: string,
    description?: string,
    variant: 'default' | 'destructive' = 'default'
  ) => {
    toast({ title, description, variant });
  }, [toast]);

  // Копирование в буфер обмена
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Скопировано!', 'Результат сохранен в буфер обмена.');
      return true;
    } catch (error) {
      showToast('Ошибка', 'Не удалось скопировать', 'destructive');
      return false;
    }
  }, [showToast]);

  // Поделиться (Web Share API)
  const share = useCallback(async (data: { title: string; text: string; url?: string }) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        // Пользователь отменил или ошибка
        return false;
      }
    } else {
      // Fallback - копируем в буфер
      return await copyToClipboard(data.text);
    }
  }, [copyToClipboard]);

  return {
    // Форматирование
    formatCurrency,
    formatPercent,
    formatTerm,
    
    // Сохранение и сравнение
    saveCalculation,
    addToComparison,
    
    // Уведомления и шаринг
    showToast,
    copyToClipboard,
    share,
  };
};
