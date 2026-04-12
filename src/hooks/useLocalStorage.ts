import { useState, useEffect, useCallback, useRef } from "react";
import { storage } from "@/shared/utils/storage";

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
    deserialize = JSON.parse,
    syncAcrossTabs = false
  } = options;

  const initialValueRef = useRef(initialValue);
  initialValueRef.current = initialValue;

  const readValue = useCallback((): T => {
    try {
      const item = storage.get(key, null);
      return item !== null ? (typeof item === 'string' ? deserialize(item) : item) : initialValueRef.current;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValueRef.current;
    }
  }, [key, deserialize]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      setStoredValue(prev => {
        const valueToStore = value instanceof Function ? value(prev) : value;
        storage.set(key, valueToStore);
        if (syncAcrossTabs && typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent('local-storage-change', {
            detail: { key, value: valueToStore }
          }));
        }
        return valueToStore;
      });
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, syncAcrossTabs]);

  const removeValue = useCallback(() => {
    try {
      storage.remove(key);
      setStoredValue(initialValueRef.current);
      if (syncAcrossTabs && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent('local-storage-change', {
          detail: { key, value: null }
        }));
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, syncAcrossTabs]);

  useEffect(() => {
    if (!syncAcrossTabs || typeof window === "undefined") return;

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ('detail' in e) {
        const { key: eventKey, value } = e.detail;
        if (eventKey === key) {
          setStoredValue(value !== null ? value : initialValueRef.current);
        }
      } else {
        if (e.key === key) {
          const newValue = e.newValue;
          setStoredValue(newValue !== null ? deserialize(newValue) : initialValueRef.current);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-change', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-change', handleStorageChange as EventListener);
    };
  }, [key, deserialize, syncAcrossTabs]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
