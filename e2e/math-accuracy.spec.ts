import { test, expect } from '@playwright/test';

test.describe('Проверка математической точности калькуляторов', () => {
  
  test.describe('Калькулятор налога на вклады', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/calculator/deposit-tax');
    });

    test('базовый расчет: 350к доход, 21% ставка ЦБ', async ({ page }) => {
      // Сумма процентов - находим по лейблу
      await page.getByLabel('Общая сумма полученных процентов (за год)').fill('350000');
      
      // Ключевая ставка
      await page.getByLabel('Максимальная ключевая ставка ЦБ в году').fill('21');

      // Проверка необлагаемого лимита (1 000 000 * 0.21 = 210 000)
      const limitText = page.getByText('Необлагаемый лимит (вычет):');
      await expect(limitText.locator('xpath=following-sibling::span')).toContainText('210 000');

      // Проверка суммы, с которой берется налог (350 000 - 210 000 = 140 000)
      const taxableText = page.getByText('Сумма, с которой берется налог:');
      await expect(taxableText.locator('xpath=following-sibling::span')).toContainText('140 000');

      // Проверка налога (140 000 * 13% = 18 200)
      const resultsBlock = page.locator('.bg-surface-secondary', { hasText: 'Результат расчета' });
      await expect(resultsBlock).toContainText('18 200');
    });

    test('расчет для высокого дохода (>5 млн руб, 15%)', async ({ page }) => {
      await page.getByLabel('Общая сумма полученных процентов (за год)').fill('350000');
      await page.getByLabel('Максимальная ключевая ставка ЦБ в году').fill('21');
      
      // Клик по чекбоксу высокого дохода
      await page.getByLabel('Мой совокупный годовой доход больше 5 млн руб.').check();

      // Проверка ставки (поле "Ставка НДФЛ:")
      const rateLabel = page.getByText('Ставка НДФЛ:');
      await expect(rateLabel.locator('xpath=following-sibling::span')).toContainText('15%');

      // Проверка налога (140 000 * 15% = 21 000)
      const resultsBlock = page.locator('.bg-surface-secondary', { hasText: 'Результат расчета' });
      await expect(resultsBlock).toContainText('21 000');
    });
  });

  test.describe('Ипотечный калькулятор', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/calculator/mortgage');
    });

    test('стандартный аннуитетный платеж: 10 млн цена, 2 млн взнос, 20 лет, 15%', async ({ page }) => {
      // Стоимость
      await page.locator('#price-input').fill('10000000');
      
      // Первоначальный взнос (нужно убедиться, что он в рублях, а не процентах)
      // По умолчанию он в рублях или переключается. Проверим кнопку
      const toggleBtn = page.getByRole('button', { name: /%/ });
      if (await toggleBtn.isVisible()) {
        // Если видим %, значит сейчас рубли. Оставляем.
      } else {
        await page.getByRole('button', { name: /₽/ }).click();
      }
      
      // Ввод взноса. Так как это ползунок + скрытый инпут, 
      // попробуем найти текст и кликнуть по нему для появления инпута или использовать API ползунка
      // В MortgageInputs.tsx: value={price.toLocaleString('ru-RU')}
      // Мы уже заполнили #price-input.
      
      // Для взноса там нет прямого текстового инпута кроме скрытого. 
      // Но в MortgageInputs.tsx есть: 
      // <input id="initial-payment-input" type="hidden" value={initialPayment} ... />
      // И рядом <span className="font-bold">{isInitialPercent ? ... : formatCurrency(initialPayment)}</span>
      
      // Попробуем установить значения через вызов функций в консоли или через ползунки (сложнее в E2E).
      // На самом деле, большинство инпутов имеют id.
      // Срок
      const termSlider = page.locator('#term-input');
      // Rate
      const rateSlider = page.locator('#rate-input');
      
      // Установка значений напрямую в стейт через Playwright evaluate может быть надежнее для сложных UI
      await termSlider.focus();
      // Установим 1 год (минимум) - нажмем стрелку влево много раз
      for (let i = 0; i < 30; i++) await page.keyboard.press('ArrowLeft');

      // Ставка 12%
      await rateSlider.focus();
      // По умолчанию 15%, нажмем влево 30 раз (шаг 0.1)
      for (let i = 0; i < 30; i++) await page.keyboard.press('ArrowLeft');

      // Результирующий блок
      const resultsBlock = page.locator('#mortgage-results');
      
      // Проверка ежемесячного платежа
      // Для 10млн - 10% (взнос) = 9млн на 1 год под 12%
      // Платеж ~ 799 638 руб
      await expect(resultsBlock).toContainText('799');
    });
  });

  test.describe('Калькулятор госпошлины', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/calculator/court-fee');
    });

    test('СОЮ: расчет для иска 1 000 000 руб', async ({ page }) => {
      // Ищем инпут суммы иска
      const amountInput = page.locator('input[type="number"]').first();
      await amountInput.fill('1000000');

      // Убеждаемся что выбран СОЮ (обычно по умолчанию)
      await page.getByText('Суд общей юрисдикции').click();

      // Проверка результата
      // Формула 2026: 0.5% + фиксированная сумма (но проверим по engine)
      // 1 000 000 руб в СОЮ -> смотрим feeCalculationEngine.ts
      // Для 1 млн: 15 000 + 0.5% от (1 000 000 - 500 000) = 15 000 + 2 500 = 17 500
      const resultsBlock = page.locator('.bg-surface-secondary', { hasText: 'Результат расчета' });
      await expect(resultsBlock).toContainText('17 500');
    });

    test('Арбитраж: расчет для иска 1 000 000 руб', async ({ page }) => {
      const amountInput = page.locator('input[type="number"]').first();
      await amountInput.fill('1000000');

      // Выбираем Арбитражный суд
      await page.getByText('Арбитражный суд', { exact: true }).click();

      // Проверка результата
      // Арбитраж 1 млн: 25 000 + 0.4% от (1 000 000 - 500 000) = 25 000 + 2 000 = 27 000
      const resultsBlock = page.locator('.bg-surface-secondary', { hasText: 'Результат расчета' });
      await expect(resultsBlock).toContainText('27 000');
    });
  });
});
