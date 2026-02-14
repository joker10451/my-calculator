import { useState, useEffect, useCallback } from "react";
import { storage } from "@/shared/utils/storage";

/**
 * Оптимизированный хук для работы с localStorage
 * @param key - ключ для хранения
 * @param initialValue - начальное значение
 * @param options - дополнительные опции
 */
function useLocalStorage<T>(
  key: string, 
  initialValue: T,
  options: {
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
    syncAcrossTabs?: boolean;
  } = {}
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = false
  } = options;

  // Функция для чтения значения из localStorage
  const readValue = useCallback((): T => {
    try {
      const item = storage.get(key, null);
      return item !== null ? (typeof item === 'string' ? deserialize(item) : item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, deserialize]);

  // Состояние с ленивой инициализацией
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Функция для записи значения
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Вычисляем новое значение
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Обновляем состояние
      setStoredValue(valueToStore);
      
      // Сохраняем в localStorage
      storage.set(key, valueToStore);
      
      // Отправляем кастомное событие для синхронизации между табами
      if (syncAcrossTabs && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent('local-storage-change', {
          detail: { key, value: valueToStore }
        }));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, syncAcrossTabs]);

  // Функция для удаления значения
  const removeValue = useCallback(() => {
    try {
      storage.remove(key);
      setStoredValue(initialValue);
      
      if (syncAcrossTabs && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent('local-storage-change', {
          detail: { key, value: null }
        }));
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue, syncAcrossTabs]);

  // Синхронизация между табами
  useEffect(() => {
    if (!syncAcrossTabs || typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ('detail' in e) {
        // Кастомное событие
        const { key: eventKey, value } = e.detail;
        if (eventKey === key) {
          setStoredValue(value !== null ? value : initialValue);
        }
      } else {
        // Стандартное событие storage
        if (e.key === key) {
          const newValue = e.newValue;
          setStoredValue(newValue !== null ? deserialize(newValue) : initialValue);
        }
      }
    };

    // Слушаем оба типа событий
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-change', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-change', handleStorageChange as EventListener);
    };
  }, [key, initialValue, deserialize, syncAcrossTabs]);

  // Проверяем изменения при монтировании (для случаев, когда значение изменилось в другой вкладке)
  useEffect(() => {
    const currentValue = readValue();
    if (JSON.stringify(currentValue) !== JSON.stringify(storedValue)) {
      setStoredValue(currentValue);
    }
  }, [readValue, storedValue]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;