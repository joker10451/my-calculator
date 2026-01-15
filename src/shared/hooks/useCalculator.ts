import { useState, useCallback, useMemo, useEffect } from 'react';
import type { 
  CalculatorConfig, 
  CalculatorState, 
  CalculatorResult,
  ValidationResult 
} from '../types/calculator';
import { ValidationEngine } from '../utils/validation';
import { storage } from '../utils/storage';

/**
 * Универсальный хук для создания калькуляторов
 */
export function useCalculator<T extends Record<string, unknown>>(
  config: CalculatorConfig<T>
): {
  values: T;
  results: Record<string, CalculatorResult>;
  errors: Record<string, string>;
  isValid: boolean;
  updateValue: (field: keyof T, value: unknown) => void;
  updateValues: (newValues: Partial<T>) => void;
  resetValues: () => void;
  validateField: (field: keyof T) => void;
  validateAll: () => ValidationResult;
  exportData: () => { values: T; results: Record<string, CalculatorResult> };
  importData: (data: { values: T; results?: Record<string, CalculatorResult> }) => void;
} {
  // Инициализация валидатора
  const validator = useMemo(
    () => new ValidationEngine(config.validationRules),
    [config.validationRules]
  );

  // Загрузка сохраненных значений
  const loadSavedValues = useCallback((): T => {
    const savedValues: Partial<T> = {};
    
    Object.keys(config.defaultValues).forEach(key => {
      const storageKey = `${config.storagePrefix}${key}`;
      const savedValue = storage.get(storageKey, null);
      if (savedValue !== null) {
        savedValues[key as keyof T] = savedValue;
      }
    });

    return { ...config.defaultValues, ...savedValues };
  }, [config.defaultValues, config.storagePrefix]);

  // Состояние калькулятора
  const [state, setState] = useState<CalculatorState<T>>(() => {
    const initialValues = loadSavedValues();
    const initialResults = config.calculations(initialValues);
    const validation = validator.validate(initialValues);

    return {
      values: initialValues,
      results: initialResults,
      isValid: validation.isValid,
      errors: validation.errors.reduce((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {} as Record<string, string>),
    };
  });

  // Сохранение значения в localStorage
  const saveValue = useCallback((field: keyof T, value: unknown) => {
    const storageKey = `${config.storagePrefix}${String(field)}`;
    storage.set(storageKey, value);
  }, [config.storagePrefix]);

  // Обновление одного значения
  const updateValue = useCallback((field: keyof T, value: unknown) => {
    setState(prevState => {
      const newValues = { ...prevState.values, [field]: value };
      const newResults = config.calculations(newValues);
      const validation = validator.validate(newValues);

      // Сохраняем в localStorage
      saveValue(field, value);

      return {
        values: newValues,
        results: newResults,
        isValid: validation.isValid,
        errors: validation.errors.reduce((acc, error) => {
          acc[error.field] = error.message;
          return acc;
        }, {} as Record<string, string>),
      };
    });
  }, [config.calculations, validator, saveValue]);

  // Обновление нескольких значений
  const updateValues = useCallback((newValues: Partial<T>) => {
    setState(prevState => {
      const updatedValues = { ...prevState.values, ...newValues };
      const newResults = config.calculations(updatedValues);
      const validation = validator.validate(updatedValues);

      // Сохраняем все новые значения в localStorage
      Object.entries(newValues).forEach(([key, value]) => {
        saveValue(key as keyof T, value);
      });

      return {
        values: updatedValues,
        results: newResults,
        isValid: validation.isValid,
        errors: validation.errors.reduce((acc, error) => {
          acc[error.field] = error.message;
          return acc;
        }, {} as Record<string, string>),
      };
    });
  }, [config.calculations, validator, saveValue]);

  // Сброс к значениям по умолчанию
  const resetValues = useCallback(() => {
    const defaultResults = config.calculations(config.defaultValues);
    const validation = validator.validate(config.defaultValues);

    // Очищаем localStorage
    Object.keys(config.defaultValues).forEach(key => {
      const storageKey = `${config.storagePrefix}${key}`;
      storage.remove(storageKey);
    });

    setState({
      values: config.defaultValues,
      results: defaultResults,
      isValid: validation.isValid,
      errors: validation.errors.reduce((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {} as Record<string, string>),
    });
  }, [config.defaultValues, config.calculations, config.storagePrefix, validator]);

  // Валидация одного поля
  const validateField = useCallback((field: keyof T) => {
    const error = validator.validateField(field, state.values[field]);
    
    setState(prevState => ({
      ...prevState,
      errors: error 
        ? { ...prevState.errors, [field]: error.message }
        : { ...prevState.errors, [field]: undefined },
    }));
  }, [validator, state.values]);

  // Валидация всех полей
  const validateAll = useCallback((): ValidationResult => {
    const validation = validator.validate(state.values);
    
    setState(prevState => ({
      ...prevState,
      isValid: validation.isValid,
      errors: validation.errors.reduce((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {} as Record<string, string>),
    }));

    return validation;
  }, [validator, state.values]);

  // Экспорт данных
  const exportData = useCallback(() => ({
    values: state.values,
    results: state.results,
  }), [state.values, state.results]);

  // Импорт данных
  const importData = useCallback((data: { values: T; results?: Record<string, CalculatorResult> }) => {
    const newResults = data.results || config.calculations(data.values);
    const validation = validator.validate(data.values);

    // Сохраняем импортированные значения
    Object.entries(data.values).forEach(([key, value]) => {
      saveValue(key as keyof T, value);
    });

    setState({
      values: data.values,
      results: newResults,
      isValid: validation.isValid,
      errors: validation.errors.reduce((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {} as Record<string, string>),
    });
  }, [config.calculations, validator, saveValue]);

  // Пересчет при изменении конфигурации
  useEffect(() => {
    const newResults = config.calculations(state.values);
    const validation = validator.validate(state.values);

    setState(prevState => ({
      ...prevState,
      results: newResults,
      isValid: validation.isValid,
      errors: validation.errors.reduce((acc, error) => {
        acc[error.field] = error.message;
        return acc;
      }, {} as Record<string, string>),
    }));
  }, [config.calculations, validator, state.values]);

  return {
    values: state.values,
    results: state.results,
    errors: state.errors,
    isValid: state.isValid,
    updateValue,
    updateValues,
    resetValues,
    validateField,
    validateAll,
    exportData,
    importData,
  };
}