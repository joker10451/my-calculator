import { test, expect } from '@playwright/test';

/**
 * E2E тесты для блога
 * Покрывают основные пользовательские сценарии
 */

test.describe('Блог - Основные сценарии', () => {
  
  test.beforeEach(async ({ page }) => {
    // Переходим на страницу блога перед каждым тестом
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
  });

  test('Поиск статей работает корректно', async ({ page }) => {
    // Находим поле поиска
    const searchInput = page.getByPlaceholder('Поиск по статьям...');
    await expect(searchInput).toBeVisible();

    // Вводим поисковый запрос
    await searchInput.fill('ипотека');
    
    // Ждем debounce (300ms) + небольшой запас
    await page.waitForTimeout(500);

    // Проверяем, что результаты отображаются
    const resultsCount = page.getByText(/Найдено статей:/);
    await expect(resultsCount).toBeVisible();

    // Проверяем, что есть хотя бы одна статья в результатах
    const articleCards = page.locator('[role="listitem"]');
    await expect(articleCards.first()).toBeVisible();

    // Проверяем, что заголовки статей содержат поисковый запрос (регистронезависимо)
    const firstCard = articleCards.first();
    const cardText = await firstCard.textContent();
    expect(cardText?.toLowerCase()).toContain('ипотека');
  });

  test('Чтение статьи с прогрессом', async ({ page }) => {
    // Кликаем на первую статью
    const firstArticle = page.locator('[role="listitem"]').first();
    await firstArticle.click();
    
    // Ждем загрузки страницы статьи
    await page.waitForLoadState('networkidle');

    // Проверяем, что мы на странице статьи
    await expect(page.locator('article')).toBeVisible();

    // Проверяем наличие заголовка статьи
    const articleTitle = page.locator('article h1');
    await expect(articleTitle).toBeVisible();

    // Проверяем наличие индикатора прогресса чтения
    // (отображается только для статей > 1000 слов)
    const progressBar = page.locator('[role="progressbar"]');
    const isProgressVisible = await progressBar.isVisible().catch(() => false);
    
    if (isProgressVisible) {
      // Если прогресс-бар виден, проверяем его значение
      const progressValue = await progressBar.getAttribute('aria-valuenow');
      expect(Number(progressValue)).toBeGreaterThanOrEqual(0);
      expect(Number(progressValue)).toBeLessThanOrEqual(100);

      // Скроллим вниз
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(500);

      // Проверяем, что прогресс увеличился
      const newProgressValue = await progressBar.getAttribute('aria-valuenow');
      expect(Number(newProgressValue)).toBeGreaterThan(Number(progressValue));
    }

    // Проверяем наличие времени чтения
    const readingTime = page.getByText(/мин чтения/);
    await expect(readingTime).toBeVisible();
  });

  test('Клики на калькуляторы работают', async ({ page }) => {
    // Переходим на первую статью
    const firstArticle = page.locator('[role="listitem"]').first();
    await firstArticle.click();
    await page.waitForLoadState('networkidle');

    // Ищем секцию со связанными калькуляторами
    const calculatorsSection = page.locator('section').filter({ 
      has: page.getByText('Полезные калькуляторы') 
    });

    // Проверяем, есть ли связанные калькуляторы
    const hasCalculators = await calculatorsSection.isVisible().catch(() => false);
    
    if (hasCalculators) {
      // Находим первый калькулятор
      const firstCalculator = calculatorsSection.locator('a').first();
      await expect(firstCalculator).toBeVisible();

      // Получаем href калькулятора
      const calculatorHref = await firstCalculator.getAttribute('href');
      expect(calculatorHref).toBeTruthy();

      // Кликаем на калькулятор
      await firstCalculator.click();
      await page.waitForLoadState('networkidle');

      // Проверяем, что мы перешли на страницу калькулятора
      expect(page.url()).toContain(calculatorHref!);
    }
  });

  test('Шеринг статей работает', async ({ page }) => {
    // Переходим на первую статью
    const firstArticle = page.locator('[role="listitem"]').first();
    await firstArticle.click();
    await page.waitForLoadState('networkidle');

    // Находим кнопку "Поделиться"
    const shareButton = page.getByRole('button', { name: /Поделиться/ });
    await expect(shareButton).toBeVisible();

    // Кликаем на кнопку шеринга
    await shareButton.click();

    // Проверяем, что открылся диалог шеринга
    const shareDialog = page.getByRole('dialog');
    await expect(shareDialog).toBeVisible();

    // Проверяем наличие кнопок социальных сетей
    await expect(page.getByRole('button', { name: /ВКонтакте/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Telegram/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /WhatsApp/ })).toBeVisible();

    // Проверяем кнопку копирования ссылки
    const copyButton = page.getByRole('button', { name: /Скопировать ссылку/ });
    await expect(copyButton).toBeVisible();

    // Кликаем на кнопку копирования
    await copyButton.click();

    // Проверяем, что текст кнопки изменился
    await expect(page.getByRole('button', { name: /Ссылка скопирована/ })).toBeVisible();
  });

  test('Постинг комментариев работает', async ({ page }) => {
    // Переходим на первую статью
    const firstArticle = page.locator('[role="listitem"]').first();
    await firstArticle.click();
    await page.waitForLoadState('networkidle');

    // Скроллим к секции комментариев
    await page.evaluate(() => {
      const commentsSection = document.querySelector('section[aria-labelledby="comments-heading"]');
      commentsSection?.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(500);

    // Проверяем наличие формы комментариев
    const commentForm = page.locator('form').filter({ 
      has: page.getByPlaceholder(/Ваше имя/) 
    });
    
    const hasCommentForm = await commentForm.isVisible().catch(() => false);
    
    if (hasCommentForm) {
      // Заполняем форму комментария
      await page.getByPlaceholder(/Ваше имя/).fill('Тестовый Пользователь');
      await page.getByPlaceholder(/Email/).fill('test@example.com');
      await page.getByPlaceholder(/Ваш комментарий/).fill('Это тестовый комментарий для проверки функциональности.');

      // Находим кнопку отправки
      const submitButton = commentForm.getByRole('button', { name: /Отправить/ });
      await expect(submitButton).toBeVisible();

      // Проверяем, что кнопка активна (форма валидна)
      const isDisabled = await submitButton.isDisabled();
      expect(isDisabled).toBe(false);

      // Отправляем комментарий
      await submitButton.click();

      // Проверяем, что появилось сообщение об успехе или модерации
      const successMessage = page.getByText(/модерации|успешно|отправлен/i);
      await expect(successMessage).toBeVisible({ timeout: 5000 });
    }
  });

  test('Фильтрация по категориям работает', async ({ page }) => {
    // Находим селектор категорий
    const categorySelect = page.getByRole('combobox', { name: /Фильтр по категории/ });
    await expect(categorySelect).toBeVisible();

    // Кликаем на селектор
    await categorySelect.click();

    // Выбираем первую категорию (не "Все категории")
    const firstCategory = page.getByRole('option').nth(1);
    const categoryName = await firstCategory.textContent();
    await firstCategory.click();

    // Ждем применения фильтра
    await page.waitForTimeout(500);

    // Проверяем, что отображаются только статьи выбранной категории
    const articleCards = page.locator('[role="listitem"]');
    const count = await articleCards.count();
    
    if (count > 0) {
      // Проверяем первую статью
      const firstCard = articleCards.first();
      const categoryBadge = firstCard.locator('[role="status"]').first();
      const badgeText = await categoryBadge.textContent();
      expect(badgeText).toContain(categoryName);
    }
  });

  test('Навигация между статьями работает', async ({ page }) => {
    // Переходим на первую статью
    const firstArticle = page.locator('[role="listitem"]').first();
    const firstArticleTitle = await firstArticle.locator('h3, h2').textContent();
    await firstArticle.click();
    await page.waitForLoadState('networkidle');

    // Проверяем наличие навигации между статьями
    const prevButton = page.getByRole('link', { name: /Предыдущая статья|Назад/ });
    const nextButton = page.getByRole('link', { name: /Следующая статья|Далее/ });

    const hasPrev = await prevButton.isVisible().catch(() => false);
    const hasNext = await nextButton.isVisible().catch(() => false);

    if (hasNext) {
      // Кликаем на следующую статью
      await nextButton.click();
      await page.waitForLoadState('networkidle');

      // Проверяем, что мы на другой странице
      const currentTitle = await page.locator('article h1').textContent();
      expect(currentTitle).not.toBe(firstArticleTitle);
    }
  });

  test('Оглавление (TOC) работает', async ({ page }) => {
    // Переходим на первую статью
    const firstArticle = page.locator('[role="listitem"]').first();
    await firstArticle.click();
    await page.waitForLoadState('networkidle');

    // Проверяем наличие оглавления (только на desktop)
    const toc = page.locator('aside').filter({ has: page.getByText(/Содержание|Оглавление/) });
    const hasTOC = await toc.isVisible().catch(() => false);

    if (hasTOC) {
      // Находим первую ссылку в оглавлении
      const firstTOCLink = toc.locator('a').first();
      await expect(firstTOCLink).toBeVisible();

      // Кликаем на ссылку
      await firstTOCLink.click();
      await page.waitForTimeout(500);

      // Проверяем, что произошел скролл (URL должен содержать якорь)
      expect(page.url()).toContain('#');
    }
  });

  test('Responsive design работает на мобильных', async ({ page, isMobile }) => {
    if (!isMobile) {
      test.skip();
    }

    // Проверяем, что страница блога загружается на мобильном
    await expect(page.locator('h1')).toBeVisible();

    // Проверяем, что карточки статей отображаются в одну колонку
    const articleCards = page.locator('[role="listitem"]');
    const firstCard = articleCards.first();
    await expect(firstCard).toBeVisible();

    // Переходим на статью
    await firstCard.click();
    await page.waitForLoadState('networkidle');

    // Проверяем, что контент читаем без зума
    const article = page.locator('article');
    await expect(article).toBeVisible();

    // Проверяем, что кнопки достаточно большие для тапа
    const shareButton = page.getByRole('button', { name: /Поделиться/ });
    if (await shareButton.isVisible()) {
      const box = await shareButton.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44); // Минимальный размер для тапа
    }
  });

  test('Производительность: страница загружается быстро', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Проверяем, что страница загрузилась менее чем за 3 секунды
    expect(loadTime).toBeLessThan(3000);

    // Проверяем, что основной контент виден
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[role="listitem"]').first()).toBeVisible();
  });
});
