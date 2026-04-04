import { test, expect } from '@playwright/test';

test.describe('Главная страница', () => {
  test('загружается корректно', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Считай/);
  });

  test('навигация по категориям работает', async ({ page }) => {
    await page.goto('/');
    const categoryLinks = page.locator('a[href*="/category/"]');
    await expect(categoryLinks.first()).toBeVisible();
  });
});

test.describe('Калькулятор ипотеки', () => {
  test('открывается и показывает результаты', async ({ page }) => {
    await page.goto('/calculator/mortgage');
    await expect(page).toHaveTitle(/Ипотечный/);
  });
});

test.describe('Калькулятор переплаты', () => {
  test('рассчитывает переплату', async ({ page }) => {
    await page.goto('/calculator/overpayment');
    await expect(page).toHaveTitle(/переплат/);

    const result = page.getByText('Ваш результат');
    await expect(result).not.toBeVisible();

    const btn = page.getByRole('button', { name: /Узнать правду/ });
    await expect(btn).toBeVisible();
    await btn.click();

    await expect(result).toBeVisible();
  });

  test('shareable link работает', async ({ page, context }) => {
    await page.goto('/calculator/overpayment');
    const btn = page.getByRole('button', { name: /Узнать правду/ });
    await btn.click();

    const shareBtn = page.getByRole('button', { name: /Поделиться/ });
    await expect(shareBtn).toBeVisible();
  });
});

test.describe('Сравнение банков', () => {
  test('открывается и показывает таблицу', async ({ page }) => {
    await page.goto('/compare-banks');
    await expect(page).toHaveTitle(/Сравнение банков/);
  });
});

test.describe('Рефинансирование', () => {
  test('рассчитывает экономию', async ({ page }) => {
    await page.goto('/calculator/refinancing');
    await expect(page).toHaveTitle(/рефинансир/);

    const btn = page.getByRole('button', { name: /Рассчитать выгоду/ });
    await expect(btn).toBeVisible();
  });
});

test.describe('Квиз финансовой грамотности', () => {
  test('открывается и показывает вопросы', async ({ page }) => {
    await page.goto('/quiz/financial-literacy');
    await expect(page).toHaveTitle(/финансовую грамотность/);

    const question = page.locator('h2').first();
    await expect(question).toBeVisible();
  });

  test('можно ответить на вопрос', async ({ page }) => {
    await page.goto('/quiz/financial-literacy');
    const options = page.locator('button').filter({ hasText: /^[A-D]/ });
    await expect(options.first()).toBeVisible();
    await options.first().click();

    const explanation = page.locator('text=/Правильно|Неверно/');
    await expect(explanation).toBeVisible();
  });
});

test.describe('Embed виджеты', () => {
  test('открывается страница виджетов', async ({ page }) => {
    await page.goto('/widgets');
    await expect(page).toHaveTitle(/Виджеты калькуляторов/);
  });
});

test.describe('JoyMoney', () => {
  test('открывается страница JoyMoney', async ({ page }) => {
    await page.goto('/joy-money');
    await expect(page).toHaveTitle(/JoyMoney/);
  });
});

test.describe('Курьер Яндекс.Еда', () => {
  test('открывается страница курьера', async ({ page }) => {
    await page.goto('/courier-yandex');
    await expect(page).toHaveTitle(/Курьер/);
  });
});
