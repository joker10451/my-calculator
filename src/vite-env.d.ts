/// <reference types="vite/client" />

// Yandex Metrika types
interface Window {
  ym?: (
    counterId: number,
    method: string,
    goal?: string,
    params?: Record<string, unknown>
  ) => void;
  gtag?: (
    command: string,
    eventName: string,
    params?: Record<string, unknown>
  ) => void;
}
