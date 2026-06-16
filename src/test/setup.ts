// Настройка тестовой среды для Vitest с happy-dom
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Мок для ResizeObserver (не поддерживается в happy-dom)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Мок для IntersectionObserver (не поддерживается в happy-dom)
global.IntersectionObserver = class IntersectionObserver {
  constructor(
    public callback: IntersectionObserverCallback,
    public options?: IntersectionObserverInit
  ) {}
  
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
} as any;

// Мок для matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Мок для navigator.clipboard
Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
  writable: true,
  configurable: true,
});

// Мок для navigator.share
Object.defineProperty(navigator, 'share', {
  value: vi.fn().mockResolvedValue(undefined),
  writable: true,
  configurable: true,
});

// Мок для Canvas API
class MockCanvasRenderingContext2D {
  fillStyle = '';
  strokeStyle = '';
  lineWidth = 1;
  font = '';
  textAlign = 'start';
  textBaseline = 'alphabetic';

  fillRect = vi.fn();
  strokeRect = vi.fn();
  fillText = vi.fn();
  drawImage = vi.fn();
  clearRect = vi.fn();
  beginPath = vi.fn();
  moveTo = vi.fn();
  lineTo = vi.fn();
  stroke = vi.fn();
  fill = vi.fn();
  arc = vi.fn();
  closePath = vi.fn();
}

const mockCanvasContext = new MockCanvasRenderingContext2D();

// Переопределяем createElement для canvas
const originalCreateElement = document.createElement.bind(document);
document.createElement = function(tagName: string, options?: any) {
  const element = originalCreateElement.call(document, tagName, options);
  if (tagName.toLowerCase() === 'canvas') {
    Object.assign(element, {
      width: 300,
      height: 150,
      getContext: () => mockCanvasContext,
      toDataURL: () => 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      toBlob: (callback: (blob: Blob | null) => void, type?: string) => {
        const blob = new Blob(['fake-image-data'], { type: type || 'image/png' });
        setTimeout(() => callback(blob), 0);
      },
    });
  }
  return element;
};

// Мок для Image constructor
global.Image = class MockImage {
  src = '';
  width = 0;
  height = 0;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  
  constructor() {
    setTimeout(() => {
      this.width = 100;
      this.height = 100;
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
} as any;

// URL.createObjectURL и revokeObjectURL для Blob/File
if (typeof URL.createObjectURL === 'undefined') {
  URL.createObjectURL = vi.fn(() => 'blob:mock-url');
}
if (typeof URL.revokeObjectURL === 'undefined') {
  URL.revokeObjectURL = vi.fn();
}
