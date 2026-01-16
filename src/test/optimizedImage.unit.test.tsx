import { describe, test, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { OptimizedImage } from '@/components/blog/OptimizedImage';

describe('OptimizedImage Component', () => {
  test('renders with blur placeholder initially', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        width={800}
        height={600}
      />
    );

    // Проверяем что есть placeholder
    const images = screen.getAllByRole('img', { hidden: true });
    expect(images.length).toBeGreaterThan(0);
  });

  test('applies lazy loading for non-priority images', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        priority={false}
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'lazy');
  });

  test('applies eager loading for priority images', () => {
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        priority={true}
      />
    );

    const img = screen.getByAltText('Test image');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  test('generates WebP URL correctly', () => {
    const { container } = render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        priority={true}
      />
    );

    const source = container.querySelector('source[type="image/webp"]');
    expect(source).toBeTruthy();
  });

  test('calls onLoad callback when image loads', async () => {
    const onLoad = vi.fn();
    
    render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        priority={true}
        onLoad={onLoad}
      />
    );

    const img = screen.getByAltText('Test image');
    
    // Симулируем загрузку изображения
    img.dispatchEvent(new Event('load'));

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalledTimes(1);
    });
  });

  test('applies custom className', () => {
    const { container } = render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        className="custom-class"
      />
    );

    const wrapper = container.querySelector('.custom-class');
    expect(wrapper).toBeTruthy();
  });

  test('sets correct sizes attribute', () => {
    const customSizes = '(max-width: 600px) 100vw, 50vw';
    
    const { container } = render(
      <OptimizedImage
        src="/test-image.jpg"
        alt="Test image"
        priority={true}
        sizes={customSizes}
      />
    );

    const source = container.querySelector('source[type="image/webp"]');
    expect(source).toHaveAttribute('sizes', customSizes);
  });
});

describe('Lazy Loading Behavior', () => {
  test('image below fold uses lazy loading', () => {
    render(
      <OptimizedImage
        src="/below-fold.jpg"
        alt="Below fold image"
        priority={false}
      />
    );

    const img = screen.getByAltText('Below fold image');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(img).toHaveAttribute('decoding', 'async');
  });

  test('featured image uses eager loading', () => {
    render(
      <OptimizedImage
        src="/featured.jpg"
        alt="Featured image"
        priority={true}
      />
    );

    const img = screen.getByAltText('Featured image');
    expect(img).toHaveAttribute('loading', 'eager');
  });
});
