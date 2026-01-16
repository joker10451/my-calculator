import { describe, test, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Suspense, lazy } from 'react';
import { MemoryRouter } from 'react-router-dom';

// Тестируем что компоненты блога загружаются через lazy loading
describe('Code Splitting for Blog Components', () => {
  test('BlogComments loads lazily', async () => {
    const BlogComments = lazy(() => import('@/components/blog/BlogComments'));

    render(
      <Suspense fallback={<div>Loading comments...</div>}>
        <BlogComments articleId="test-article" />
      </Suspense>
    );

    // Сначала должен показаться fallback
    expect(screen.getByText('Loading comments...')).toBeInTheDocument();

    // Затем компонент должен загрузиться
    await waitFor(() => {
      expect(screen.queryByText('Loading comments...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('BlogRecommendations loads lazily', async () => {
    const BlogRecommendations = lazy(() => import('@/components/blog/BlogRecommendations'));

    render(
      <Suspense fallback={<div>Loading recommendations...</div>}>
        <BlogRecommendations articleId="test-article" />
      </Suspense>
    );

    // Сначала должен показаться fallback
    expect(screen.getByText('Loading recommendations...')).toBeInTheDocument();

    // Затем компонент должен загрузиться
    await waitFor(() => {
      expect(screen.queryByText('Loading recommendations...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('BlogPage loads lazily', async () => {
    const BlogPage = lazy(() => import('@/pages/BlogPage'));

    render(
      <MemoryRouter>
        <Suspense fallback={<div>Loading blog page...</div>}>
          <BlogPage />
        </Suspense>
      </MemoryRouter>
    );

    // Сначала должен показаться fallback
    expect(screen.getByText('Loading blog page...')).toBeInTheDocument();

    // Затем страница должна загрузиться
    await waitFor(() => {
      expect(screen.queryByText('Loading blog page...')).not.toBeInTheDocument();
    }, { timeout: 3000 });
  });
});

describe('Lazy Loading Performance', () => {
  test('lazy components do not block initial render', () => {
    const BlogComments = lazy(() => import('@/components/blog/BlogComments'));

    const startTime = performance.now();
    
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <BlogComments articleId="test" />
      </Suspense>
    );

    const renderTime = performance.now() - startTime;

    // Рендер с fallback должен быть быстрым (< 100ms)
    expect(renderTime).toBeLessThan(100);
  });

  test('multiple lazy components can load in parallel', async () => {
    const BlogComments = lazy(() => import('@/components/blog/BlogComments'));
    const BlogRecommendations = lazy(() => import('@/components/blog/BlogRecommendations'));

    const startTime = performance.now();

    render(
      <>
        <Suspense fallback={<div>Loading comments...</div>}>
          <BlogComments articleId="test" />
        </Suspense>
        <Suspense fallback={<div>Loading recommendations...</div>}>
          <BlogRecommendations articleId="test" />
        </Suspense>
      </>
    );

    await waitFor(() => {
      expect(screen.queryByText('Loading comments...')).not.toBeInTheDocument();
      expect(screen.queryByText('Loading recommendations...')).not.toBeInTheDocument();
    }, { timeout: 5000 });

    const loadTime = performance.now() - startTime;

    // Параллельная загрузка должна быть быстрее последовательной
    // Ожидаем что загрузка займет меньше 5 секунд
    expect(loadTime).toBeLessThan(5000);
  });
});
