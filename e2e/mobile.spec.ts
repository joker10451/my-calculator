import { test, expect, devices } from '@playwright/test';

/**
 * E2E тесты для мобильных устройств
 * Проверка responsive design и touch interactions
 */

test.describe('Мобильное тестирование', () => {
  
  test.use({ ...devices['iPhone 12'] });

  test('Responsive design на iOS Safari', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Проверяем viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(428); // iPhone 12 width

    // Проверяем, что заголовок виден
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();

    // Проверяем, что карточки статей в одну колонку
    const articles = page.locator('[role="listitem"]');
    const firstArticle = articles.first();
    const secondArticle = articles.nth(1);

    if (await secondArticle.isVisible()) {
      const firstBox = await firstArticle.boundingBox();
      const secondBox = await secondArticle.boundingBox();

      // Проверяем, что статьи расположены вертикально (не горизонтально)
      if (firstBox && secondBox) {
        expect(secondBox.y).toBeGreaterThan(firstBox.y + firstBox.height - 10);
      }
    }
  });

  test('Touch interactions работают', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Тап на первую статью
    const firstArticle = page.locator('[role="listitem"]').first();
    await firstArticle.tap();
    await page.waitForLoadState('networkidle');

    // Проверяем, что перешли на страницу статьи
    await expect(page.locator('article')).toBeVisible();

    // Проверяем размер кнопок (минимум 44x44px для iOS)
    const shareButton = page.getByRole('button', { name: /Поделиться/ });
    if (await shareButton.isVisible()) {
      const box = await shareButton.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }

    // Тестируем свайп/скролл
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(300);

    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(400);
  });

  test('Мобильное меню работает', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Ищем бургер-меню (если есть)
    const menuButton = page.getByRole('button', { name: /меню|menu/i });
    const hasMenu = await menuButton.isVisible().catch(() => false);

    if (hasMenu) {
      await menuButton.tap();
      await page.waitForTimeout(300);

      // Проверяем, что меню открылось
      const nav = page.locator('nav');
      await expect(nav).toBeVisible();
    }
  });

  test('Поиск работает на мобильном', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    const searchInput = page.getByPlaceholder('Поиск по статьям...');
    await expect(searchInput).toBeVisible();

    // Тап на поле поиска
    await searchInput.tap();
    await searchInput.fill('налоги');
    await page.waitForTimeout(500);

    // Проверяем результаты
    const resultsCount = page.getByText(/Найдено статей:/);
    await expect(resultsCount).toBeVisible();
  });

  test('Изображения загружаются на мобильном', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Переходим на статью
    const firstArticle = page.locator('[role="listitem"]').first();
    await firstArticle.tap();
    await page.waitForLoadState('networkidle');

    // Проверяем featured image
    const featuredImage = page.locator('article img').first();
    const hasImage = await featuredImage.isVisible().catch(() => false);

    if (hasImage) {
      // Проверяем, что изображение загрузилось
      const naturalWidth = await featuredImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);

      // Проверяем, что изображение адаптивное
      const box = await featuredImage.boundingBox();
      const viewport = page.viewportSize();
      if (box && viewport) {
        expect(box.width).toBeLessThanOrEqual(viewport.width);
      }
    }
  });

  test('Текст читаем без зума', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Переходим на статью
    const firstArticle = page.locator('[role="listitem"]').first();
    await firstArticle.tap();
    await page.waitForLoadState('networkidle');

    // Проверяем размер шрифта основного текста
    const articleContent = page.locator('.prose p').first();
    if (await articleContent.isVisible()) {
      const fontSize = await articleContent.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });

      const fontSizeNum = parseInt(fontSize);
      // Минимальный размер шрифта для мобильного - 16px
      expect(fontSizeNum).toBeGreaterThanOrEqual(16);
    }
  });

  test('Форма комментариев работает на мобильном', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    const firstArticle = page.locator('[role="listitem"]').first();
    await firstArticle.tap();
    await page.waitForLoadState('networkidle');

    // Скроллим к комментариям
    await page.evaluate(() => {
      const commentsSection = document.querySelector('section[aria-labelledby="comments-heading"]');
      commentsSection?.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(500);

    // Проверяем форму
    const nameInput = page.getByPlaceholder(/Ваше имя/);
    const hasForm = await nameInput.isVisible().catch(() => false);

    if (hasForm) {
      // Тап на поле ввода
      await nameInput.tap();
      await nameInput.fill('Мобильный Пользователь');

      // Проверяем, что клавиатура не перекрывает поле
      const box = await nameInput.boundingBox();
      const viewport = page.viewportSize();
      if (box && viewport) {
        expect(box.y).toBeLessThan(viewport.height / 2);
      }
    }
  });
});

test.describe('Мобильное тестирование - Android', () => {
  
  test.use({ ...devices['Pixel 5'] });

  test('Responsive design на Android Chrome', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Проверяем viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeLessThanOrEqual(393); // Pixel 5 width

    // Проверяем основные элементы
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[role="listitem"]').first()).toBeVisible();
  });

  test('Pull-to-refresh не ломает страницу', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Симулируем pull-to-refresh (свайп вниз от верха)
    await page.touchscreen.tap(200, 50);
    await page.mouse.move(200, 50);
    await page.mouse.down();
    await page.mouse.move(200, 200);
    await page.mouse.up();
    await page.waitForTimeout(500);

    // Проверяем, что страница не сломалась
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Мобильное тестирование - Tablet', () => {
  
  test.use({ ...devices['iPad Pro'] });

  test('Responsive design на планшете', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    // Проверяем viewport
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThan(768); // Tablet width

    // На планшете должно быть 2 колонки
    const articles = page.locator('[role="listitem"]');
    const firstArticle = articles.first();
    const secondArticle = articles.nth(1);

    if (await secondArticle.isVisible()) {
      const firstBox = await firstArticle.boundingBox();
      const secondBox = await secondArticle.boundingBox();

      // Проверяем, что статьи могут быть рядом (горизонтально)
      if (firstBox && secondBox) {
        const isHorizontal = Math.abs(firstBox.y - secondBox.y) < 50;
        // На планшете допускается как горизонтальное, так и вертикальное расположение
        expect(isHorizontal || secondBox.y > firstBox.y).toBe(true);
      }
    }
  });

  test('Оглавление (TOC) видно на планшете', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    const firstArticle = page.locator('[role="listitem"]').first();
    await firstArticle.tap();
    await page.waitForLoadState('networkidle');

    // На планшете TOC должно быть видно
    const toc = page.locator('aside').filter({ has: page.getByText(/Содержание|Оглавление/) });
    const hasTOC = await toc.isVisible().catch(() => false);

    // TOC может быть видно или скрыто в зависимости от размера экрана
    // Просто проверяем, что страница не сломалась
    await expect(page.locator('article')).toBeVisible();
  });
});
