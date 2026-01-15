// Настройка тестовой среды для Vitest
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Мок для ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Мок для matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
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
});

// Мок для navigator.share
Object.defineProperty(navigator, 'share', {
  value: vi.fn().mockResolvedValue(undefined),
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

class MockHTMLCanvasElement {
  width = 300;
  height = 150;
  
  getContext(contextType: string) {
    if (contextType === '2d') {
      return new MockCanvasRenderingContext2D();
    }
    return null;
  }
  
  toDataURL(type?: string, quality?: number) {
    // Возвращаем валидный PNG data URL
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  }
  
  toBlob(callback: (blob: Blob | null) => void, type?: string, quality?: number) {
    const blob = new Blob(['fake-image-data'], { type: type || 'image/png' });
    setTimeout(() => callback(blob), 0);
  }
}

// Мок для createElement canvas
const originalCreateElement = document.createElement.bind(document);
document.createElement = vi.fn().mockImplementation((tagName: string) => {
  if (tagName === 'canvas') {
    return new MockHTMLCanvasElement() as any;
  }
  if (tagName === 'a') {
    return {
      href: '',
      download: '',
      click: vi.fn(),
      style: {},
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
      remove: vi.fn()
    } as any;
  }
  return originalCreateElement(tagName);
});

// Мок для Image constructor
global.Image = class MockImage {
  src = '';
  width = 0;
  height = 0;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  
  constructor() {
    // Симулируем успешную загрузку изображения
    setTimeout(() => {
      this.width = 100;
      this.height = 100;
      if (this.onload) {
        this.onload();
      }
    }, 0);
  }
} as any;

// Мок для URL API
Object.defineProperty(global, 'URL', {
  value: class MockURL {
    static createObjectURL = vi.fn(() => 'blob:mock-url');
    static revokeObjectURL = vi.fn();
  },
  writable: true
});

// Мок для Blob
global.Blob = class MockBlob {
  size: number;
  type: string;
  
  constructor(blobParts?: BlobPart[], options?: BlobPropertyBag) {
    this.size = blobParts ? blobParts.join('').length : 0;
    this.type = options?.type || '';
  }
  
  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(this.size));
  }
  
  text(): Promise<string> {
    return Promise.resolve('mock-blob-text');
  }
} as any;