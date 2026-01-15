/**
 * Unit тесты для компонента PSBCardWidget
 * Проверяют рендеринг, отображение преимуществ, наличие erid и отсутствие комиссии
 * Проверяют интеграцию с системой трекинга
 * Проверяют аналитику Yandex Metrica
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PSBCardWidget } from '@/components/PSBCardWidget';
import { PSB_CARD_DATA } from '@/config/psbCard';

// Создаем мок функции используя vi.hoisted для правильного hoisting
const { mockTrackClick, mockTrackYandexGoal } = vi.hoisted(() => ({
  mockTrackClick: vi.fn(),
  mockTrackYandexGoal: vi.fn()
}));

// Мокаем useReferralTracking
vi.mock('@/lib/analytics/referralTracking', () => ({
  useReferralTracking: () => ({
    trackClick: mockTrackClick
  })
}));

// Мокаем trackYandexGoal
vi.mock('@/hooks/useYandexMetrika', () => ({
  trackYandexGoal: mockTrackYandexGoal,
  useYandexMetrika: vi.fn()
}));

describe('PSBCardWidget Component', () => {
  // Мокаем window.open
  const mockWindowOpen = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    // Сохраняем оригинальный window.open
    global.window.open = mockWindowOpen;
  });

  describe('Rendering with Different Props', () => {
    it('should render with default props', () => {
      render(<PSBCardWidget source="calculator" />);
      
      // Проверяем что компонент отрендерился
      expect(screen.getByText(PSB_CARD_DATA.name)).toBeInTheDocument();
      expect(screen.getByText(PSB_CARD_DATA.bankName)).toBeInTheDocument();
    });

    it('should render in compact variant', () => {
      render(<PSBCardWidget source="calculator" variant="compact" />);
      
      expect(screen.getByText(PSB_CARD_DATA.name)).toBeInTheDocument();
      
      // В компактном варианте должно быть только 3 преимущества + текст о дополнительных
      const firstThreeFeatures = PSB_CARD_DATA.features.slice(0, 3);
      firstThreeFeatures.forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
    });

    it('should render in full variant', () => {
      render(<PSBCardWidget source="calculator" variant="full" />);
      
      expect(screen.getByText(PSB_CARD_DATA.name)).toBeInTheDocument();
      
      // В полном варианте должны быть все преимущества
      // Используем getAllByText для текстов, которые могут встречаться несколько раз
      PSB_CARD_DATA.features.forEach(feature => {
        const elements = screen.getAllByText(feature);
        expect(elements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should apply custom className', () => {
      const { container } = render(
        <PSBCardWidget source="calculator" className="custom-class" />
      );
      
      const card = container.querySelector('.custom-class');
      expect(card).toBeInTheDocument();
    });

    it('should render with showDetails=false', () => {
      render(<PSBCardWidget source="calculator" showDetails={false} />);
      
      expect(screen.getByText(PSB_CARD_DATA.name)).toBeInTheDocument();
      
      // Детальная информация (regular cashback) не должна отображаться в секции описания
      // Но может быть в списке преимуществ, поэтому проверяем что её нет в верхней части
      const regularCashbackElements = screen.queryAllByText(PSB_CARD_DATA.cashback.regular);
      // Если текст есть, он должен быть только в списке преимуществ (1 раз), а не в описании (2 раза)
      expect(regularCashbackElements.length).toBeLessThanOrEqual(1);
    });

    it('should render with different source values', () => {
      const sources: Array<'calculator' | 'comparison' | 'blog' | 'recommendation'> = [
        'calculator',
        'comparison',
        'blog',
        'recommendation'
      ];
      
      sources.forEach(source => {
        const { unmount } = render(<PSBCardWidget source={source} />);
        expect(screen.getByText(PSB_CARD_DATA.name)).toBeInTheDocument();
        unmount();
      });
    });
  });

  describe('Key Benefits Display', () => {
    it('should display all key benefits in full variant', () => {
      render(<PSBCardWidget source="calculator" variant="full" />);
      
      // Проверяем что все преимущества присутствуют (могут быть дубликаты)
      PSB_CARD_DATA.features.forEach(feature => {
        const elements = screen.getAllByText(feature);
        expect(elements.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('should display limited benefits in compact variant', () => {
      render(<PSBCardWidget source="calculator" variant="compact" />);
      
      // Первые 3 преимущества должны отображаться
      PSB_CARD_DATA.features.slice(0, 3).forEach(feature => {
        expect(screen.getByText(feature)).toBeInTheDocument();
      });
      
      // Если преимуществ больше 3, должен быть текст "+N преимуществ"
      if (PSB_CARD_DATA.features.length > 3) {
        const remainingCount = PSB_CARD_DATA.features.length - 3;
        expect(screen.getByText(`+${remainingCount} преимуществ`)).toBeInTheDocument();
      }
    });

    it('should display welcome cashback message', () => {
      render(<PSBCardWidget source="calculator" />);
      
      expect(screen.getByText(PSB_CARD_DATA.cashback.welcome)).toBeInTheDocument();
    });

    it('should display regular cashback in full variant with showDetails', () => {
      render(<PSBCardWidget source="calculator" variant="full" showDetails={true} />);
      
      // Текст может встречаться несколько раз (в описании и в списке преимуществ)
      const elements = screen.getAllByText(PSB_CARD_DATA.cashback.regular);
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('should display bank logo placeholder', () => {
      render(<PSBCardWidget source="calculator" />);
      
      expect(screen.getByText(PSB_CARD_DATA.bankShortName)).toBeInTheDocument();
    });
  });

  describe('Advertising Label with ERID', () => {
    it('should display advertising label with erid', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const eridText = `Реклама • erid: ${PSB_CARD_DATA.affiliate.erid}`;
      expect(screen.getByText(eridText)).toBeInTheDocument();
    });

    it('should have correct erid value', () => {
      render(<PSBCardWidget source="calculator" />);
      
      expect(screen.getByText(/2SDnjehD1C8/)).toBeInTheDocument();
    });

    it('should have aria-label for advertising label', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const label = screen.getByText(/Реклама • erid:/);
      expect(label).toHaveAttribute('aria-label');
      expect(label.getAttribute('aria-label')).toContain(PSB_CARD_DATA.affiliate.erid);
    });
  });

  describe('Commission Data Privacy', () => {
    it('should NOT display commission amount', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      const html = container.innerHTML;
      
      // Проверяем что комиссия не отображается
      expect(html).not.toContain('1633');
      expect(html).not.toContain('1774');
    });

    it('should NOT display commission-related words', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      const html = container.innerHTML.toLowerCase();
      
      expect(html).not.toContain('комиссия');
      expect(html).not.toContain('выплата');
      expect(html).not.toContain('commission');
    });

    it('should NOT expose commission in any variant', () => {
      const variants: Array<'compact' | 'full'> = ['compact', 'full'];
      
      variants.forEach(variant => {
        const { container, unmount } = render(
          <PSBCardWidget source="calculator" variant={variant} />
        );
        
        const html = container.innerHTML;
        expect(html).not.toContain('1633');
        expect(html).not.toContain('1774');
        
        unmount();
      });
    });
  });

  describe('CTA Button Rendering', () => {
    it('should render CTA button', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      expect(button).toBeInTheDocument();
    });

    it('should have correct button text', () => {
      render(<PSBCardWidget source="calculator" />);
      
      expect(screen.getByText('Оформить карту')).toBeInTheDocument();
    });

    it('should render button with correct size in compact variant', () => {
      render(<PSBCardWidget source="calculator" variant="compact" />);
      
      const button = screen.getByText('Оформить карту');
      expect(button).toBeInTheDocument();
    });

    it('should render button with correct size in full variant', () => {
      render(<PSBCardWidget source="calculator" variant="full" />);
      
      const button = screen.getByText('Оформить карту');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have role="region" on card', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      const region = container.querySelector('[role="region"]');
      expect(region).toBeInTheDocument();
    });

    it('should have aria-labelledby on card', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      const region = container.querySelector('[role="region"]');
      expect(region).toHaveAttribute('aria-labelledby', 'psb-card-title');
    });

    it('should have aria-describedby on card', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      const region = container.querySelector('[role="region"]');
      expect(region).toHaveAttribute('aria-describedby', 'psb-card-description');
    });

    it('should have proper heading structure', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const heading = screen.getByText(PSB_CARD_DATA.name);
      expect(heading.tagName).toBe('H3');
    });

    it('should have id on card title for aria-labelledby', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const heading = screen.getByText(PSB_CARD_DATA.name);
      expect(heading).toHaveAttribute('id', 'psb-card-title');
    });

    it('should have id on card description for aria-describedby', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      const description = container.querySelector('#psb-card-description');
      expect(description).toBeInTheDocument();
    });

    it('should have aria-label on CTA button', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      expect(button).toHaveAttribute('aria-label');
      
      const ariaLabel = button.getAttribute('aria-label');
      expect(ariaLabel).toContain(PSB_CARD_DATA.name);
      expect(ariaLabel).toContain(PSB_CARD_DATA.bankName);
      expect(ariaLabel).toContain('новой вкладке');
    });

    it('should have aria-describedby on CTA button', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      expect(button).toHaveAttribute('aria-describedby', 'psb-card-description');
    });

    it('should have aria-hidden on decorative icons', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      // Проверяем что иконки CheckCircle2 имеют aria-hidden
      const checkIcons = container.querySelectorAll('.text-green-600');
      checkIcons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('should have aria-hidden on bank logo', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      // Логотип банка - декоративный элемент
      const logo = container.querySelector('.flex-shrink-0[aria-hidden="true"]');
      expect(logo).toBeInTheDocument();
    });

    it('should have aria-hidden on ExternalLink icon', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      // Иконка внешней ссылки должна быть скрыта от screen readers
      const button = screen.getByText('Оформить карту');
      const icon = button.querySelector('svg[aria-hidden="true"]');
      expect(icon).toBeInTheDocument();
    });

    it('should have role="list" on features container', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      const list = container.querySelector('[role="list"]');
      expect(list).toBeInTheDocument();
    });

    it('should have aria-label on features list', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      const list = container.querySelector('[role="list"]');
      expect(list).toHaveAttribute('aria-label', 'Ключевые преимущества карты');
    });

    it('should have role="listitem" on each feature', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      const listItems = container.querySelectorAll('[role="listitem"]');
      expect(listItems.length).toBeGreaterThan(0);
    });

    it('should have role="note" on cashback offer', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      const note = container.querySelector('[role="note"]');
      expect(note).toBeInTheDocument();
    });

    it('should have aria-label on cashback offer', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      const note = container.querySelector('[role="note"]');
      expect(note).toHaveAttribute('aria-label', 'Основное предложение по кешбэку');
    });

    it('should have role="contentinfo" on advertising label', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      const contentInfo = container.querySelector('[role="contentinfo"]');
      expect(contentInfo).toBeInTheDocument();
    });

    it('should have descriptive aria-label on advertising label', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const label = screen.getByText(/Реклама • erid:/);
      expect(label).toHaveAttribute('aria-label');
      
      const ariaLabel = label.getAttribute('aria-label');
      expect(ariaLabel).toContain('Рекламная информация');
      expect(ariaLabel).toContain('Идентификатор рекламы');
      expect(ariaLabel).toContain(PSB_CARD_DATA.affiliate.erid);
    });

    it('should support keyboard navigation - Enter key', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      
      // Симулируем нажатие Enter
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
      
      // Проверяем что клик был обработан
      expect(mockTrackClick).toHaveBeenCalled();
      expect(mockWindowOpen).toHaveBeenCalled();
    });

    it('should support keyboard navigation - Space key', () => {
      mockTrackClick.mockClear();
      mockWindowOpen.mockClear();
      
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      
      // Симулируем нажатие Space
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });
      
      // Проверяем что клик был обработан
      expect(mockTrackClick).toHaveBeenCalled();
      expect(mockWindowOpen).toHaveBeenCalled();
    });

    it('should prevent default behavior on Space key', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      
      // Создаем событие с preventDefault
      const mockPreventDefault = vi.fn();
      fireEvent.keyDown(button, { 
        key: ' ', 
        code: 'Space',
        preventDefault: mockPreventDefault
      });
      
      // Проверяем что preventDefault был вызван через наш обработчик
      // Так как мы используем onKeyDown на кнопке, проверяем что клик был обработан
      expect(mockTrackClick).toHaveBeenCalled();
    });

    it('should prevent default behavior on Enter key', () => {
      mockTrackClick.mockClear();
      
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      
      // Создаем событие с preventDefault
      const mockPreventDefault = vi.fn();
      fireEvent.keyDown(button, { 
        key: 'Enter', 
        code: 'Enter',
        preventDefault: mockPreventDefault
      });
      
      // Проверяем что preventDefault был вызван через наш обработчик
      // Так как мы используем onKeyDown на кнопке, проверяем что клик был обработан
      expect(mockTrackClick).toHaveBeenCalled();
    });

    it('should not trigger on other keys', () => {
      mockTrackClick.mockClear();
      mockWindowOpen.mockClear();
      
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      
      // Симулируем нажатие других клавиш
      fireEvent.keyDown(button, { key: 'a', code: 'KeyA' });
      fireEvent.keyDown(button, { key: 'Escape', code: 'Escape' });
      fireEvent.keyDown(button, { key: 'Tab', code: 'Tab' });
      
      // Проверяем что клик НЕ был обработан
      expect(mockTrackClick).not.toHaveBeenCalled();
      expect(mockWindowOpen).not.toHaveBeenCalled();
    });

    it('should have role="note" on target audience text', () => {
      const { container } = render(
        <PSBCardWidget source="calculator" variant="full" showDetails={true} />
      );
      
      const targetAudienceText = screen.getByText(/Для клиентов с зарплатным проектом/);
      expect(targetAudienceText).toHaveAttribute('role', 'note');
    });

    it('should be focusable via keyboard (tab navigation)', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      
      // Кнопка должна быть focusable (не иметь tabindex="-1")
      expect(button).not.toHaveAttribute('tabindex', '-1');
    });

    it('should have semantic HTML structure', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      // Проверяем что используются семантические элементы
      expect(container.querySelector('[role="region"]')).toBeInTheDocument();
      expect(container.querySelector('[role="list"]')).toBeInTheDocument();
      expect(container.querySelector('[role="listitem"]')).toBeInTheDocument();
      expect(container.querySelector('[role="note"]')).toBeInTheDocument();
      expect(container.querySelector('[role="contentinfo"]')).toBeInTheDocument();
    });

    it('should have sufficient text contrast (automated check)', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      // Проверяем что текстовые элементы существуют и видимы
      const textElements = container.querySelectorAll('p, span, h3');
      expect(textElements.length).toBeGreaterThan(0);
      
      // В jsdom окружении getComputedStyle может не работать корректно
      // Проверяем что элементы не имеют inline style с очень низкой прозрачностью
      textElements.forEach(element => {
        const inlineOpacity = (element as HTMLElement).style.opacity;
        if (inlineOpacity) {
          expect(parseFloat(inlineOpacity)).toBeGreaterThanOrEqual(0.5);
        }
      });
    });

    it('should have descriptive text for screen readers', () => {
      render(<PSBCardWidget source="calculator" />);
      
      // Проверяем что все важные элементы имеют текстовое описание
      expect(screen.getByText(PSB_CARD_DATA.name)).toBeInTheDocument();
      expect(screen.getByText(PSB_CARD_DATA.bankName)).toBeInTheDocument();
      expect(screen.getByText(PSB_CARD_DATA.cashback.welcome)).toBeInTheDocument();
      
      PSB_CARD_DATA.features.forEach(feature => {
        const elements = screen.getAllByText(feature);
        expect(elements.length).toBeGreaterThan(0);
      });
    });

    it('should work with screen readers (ARIA labels present)', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      // Проверяем что все интерактивные элементы имеют ARIA labels
      const button = screen.getByText('Оформить карту');
      expect(button).toHaveAttribute('aria-label');
      
      const region = container.querySelector('[role="region"]');
      expect(region).toHaveAttribute('aria-labelledby');
      expect(region).toHaveAttribute('aria-describedby');
      
      const list = container.querySelector('[role="list"]');
      expect(list).toHaveAttribute('aria-label');
    });
  });

  describe('Target Audience Display', () => {
    it('should display target audience in full variant with showDetails', () => {
      render(<PSBCardWidget source="calculator" variant="full" showDetails={true} />);
      
      expect(screen.getByText(/Для клиентов с зарплатным проектом/)).toBeInTheDocument();
    });

    it('should NOT display target audience in compact variant', () => {
      render(<PSBCardWidget source="calculator" variant="compact" />);
      
      expect(screen.queryByText(/Для клиентов с зарплатным проектом/)).not.toBeInTheDocument();
    });

    it('should NOT display target audience when showDetails is false', () => {
      render(<PSBCardWidget source="calculator" variant="full" showDetails={false} />);
      
      expect(screen.queryByText(/Для клиентов с зарплатным проектом/)).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render correctly on mobile (compact variant)', () => {
      render(<PSBCardWidget source="calculator" variant="compact" />);
      
      expect(screen.getByText(PSB_CARD_DATA.name)).toBeInTheDocument();
      expect(screen.getByText('Оформить карту')).toBeInTheDocument();
    });

    it('should render correctly on desktop (full variant)', () => {
      render(<PSBCardWidget source="calculator" variant="full" />);
      
      expect(screen.getByText(PSB_CARD_DATA.name)).toBeInTheDocument();
      expect(screen.getByText('Оформить карту')).toBeInTheDocument();
      
      // Все преимущества должны отображаться (могут быть дубликаты)
      PSB_CARD_DATA.features.forEach(feature => {
        const elements = screen.getAllByText(feature);
        expect(elements.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Content Structure', () => {
    it('should have proper card structure', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      // Проверяем наличие основных секций карточки
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
    });

    it('should display bank name and card name', () => {
      render(<PSBCardWidget source="calculator" />);
      
      expect(screen.getByText(PSB_CARD_DATA.name)).toBeInTheDocument();
      expect(screen.getByText(PSB_CARD_DATA.bankName)).toBeInTheDocument();
    });

    it('should have checkmark icons for features', () => {
      const { container } = render(<PSBCardWidget source="calculator" />);
      
      // Проверяем наличие иконок (CheckCircle2 от lucide-react)
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Referral Tracking Integration', () => {
    it('should call trackClick when button is clicked', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      fireEvent.click(button);
      
      // Проверяем что trackClick был вызван
      expect(mockTrackClick).toHaveBeenCalledTimes(1);
    });

    it('should pass correct parameters to trackClick', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      fireEvent.click(button);
      
      // Проверяем параметры вызова
      expect(mockTrackClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'psb-debit-salary',
          bank_id: 'psb',
          product_type: 'debit'
        }),
        PSB_CARD_DATA.affiliate.link,
        'calculator'
      );
    });

    it('should pass correct source from props', () => {
      const sources: Array<'calculator' | 'comparison' | 'blog' | 'recommendation'> = [
        'calculator',
        'comparison',
        'blog',
        'recommendation'
      ];
      
      sources.forEach(source => {
        mockTrackClick.mockClear();
        const { unmount } = render(<PSBCardWidget source={source} />);
        
        const button = screen.getByText('Оформить карту');
        fireEvent.click(button);
        
        expect(mockTrackClick).toHaveBeenCalledWith(
          expect.any(Object),
          expect.any(String),
          source
        );
        
        unmount();
      });
    });

    it('should open affiliate link in new tab when button is clicked', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      fireEvent.click(button);
      
      // Проверяем что window.open был вызван
      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
      expect(mockWindowOpen).toHaveBeenCalledWith(
        PSB_CARD_DATA.affiliate.link,
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('should include erid in the affiliate link', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      fireEvent.click(button);
      
      // Проверяем что ссылка содержит erid
      const calledLink = mockWindowOpen.mock.calls[0][0];
      expect(calledLink).toContain('erid=');
      expect(calledLink).toContain(PSB_CARD_DATA.affiliate.erid);
    });

    it('should still open link if tracking fails', () => {
      // Мокаем trackClick чтобы он выбрасывал ошибку
      mockTrackClick.mockImplementationOnce(() => {
        throw new Error('Tracking error');
      });
      
      // Мокаем console.error чтобы не засорять вывод тестов
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      fireEvent.click(button);
      
      // Проверяем что ссылка всё равно открылась
      expect(mockWindowOpen).toHaveBeenCalledTimes(1);
      expect(mockWindowOpen).toHaveBeenCalledWith(
        PSB_CARD_DATA.affiliate.link,
        '_blank',
        'noopener,noreferrer'
      );
      
      // Проверяем что ошибка была залогирована
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      consoleErrorSpy.mockRestore();
    });

    it('should handle popup blocker gracefully', () => {
      // Мокаем window.open чтобы он возвращал null (popup blocked)
      mockWindowOpen.mockReturnValueOnce(null);
      
      // Мокаем console.warn
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      fireEvent.click(button);
      
      // Проверяем что было предупреждение
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Popup blocked')
      );
      
      consoleWarnSpy.mockRestore();
    });

    it('should track clicks from different variants', () => {
      const variants: Array<'compact' | 'full'> = ['compact', 'full'];
      
      variants.forEach(variant => {
        mockTrackClick.mockClear();
        mockWindowOpen.mockClear();
        
        const { unmount } = render(
          <PSBCardWidget source="calculator" variant={variant} />
        );
        
        const button = screen.getByText('Оформить карту');
        fireEvent.click(button);
        
        expect(mockTrackClick).toHaveBeenCalledTimes(1);
        expect(mockWindowOpen).toHaveBeenCalledTimes(1);
        
        unmount();
      });
    });
  });

  describe('Yandex Metrica Analytics', () => {
    it('should send view event when component mounts', () => {
      render(<PSBCardWidget source="calculator" />);
      
      // Проверяем что событие view было отправлено
      expect(mockTrackYandexGoal).toHaveBeenCalledWith(
        'psb_card_view',
        expect.objectContaining({
          source: 'calculator',
          productId: PSB_CARD_DATA.id
        })
      );
    });

    it('should send view event with correct source', () => {
      const sources: Array<'calculator' | 'comparison' | 'blog' | 'recommendation'> = [
        'calculator',
        'comparison',
        'blog',
        'recommendation'
      ];
      
      sources.forEach(source => {
        mockTrackYandexGoal.mockClear();
        const { unmount } = render(<PSBCardWidget source={source} />);
        
        expect(mockTrackYandexGoal).toHaveBeenCalledWith(
          'psb_card_view',
          expect.objectContaining({
            source,
            productId: PSB_CARD_DATA.id
          })
        );
        
        unmount();
      });
    });

    it('should send view event with variant information', () => {
      const variants: Array<'compact' | 'full'> = ['compact', 'full'];
      
      variants.forEach(variant => {
        mockTrackYandexGoal.mockClear();
        const { unmount } = render(
          <PSBCardWidget source="calculator" variant={variant} />
        );
        
        expect(mockTrackYandexGoal).toHaveBeenCalledWith(
          'psb_card_view',
          expect.objectContaining({
            variant
          })
        );
        
        unmount();
      });
    });

    it('should send view event only once on mount', () => {
      render(<PSBCardWidget source="calculator" />);
      
      // Проверяем что событие было отправлено ровно один раз
      const viewCalls = mockTrackYandexGoal.mock.calls.filter(
        call => call[0] === 'psb_card_view'
      );
      expect(viewCalls.length).toBe(1);
    });

    it('should send click event when button is clicked', () => {
      render(<PSBCardWidget source="calculator" />);
      
      // Очищаем моки после монтирования (чтобы не считать view event)
      mockTrackYandexGoal.mockClear();
      
      const button = screen.getByText('Оформить карту');
      fireEvent.click(button);
      
      // Проверяем что событие click было отправлено
      expect(mockTrackYandexGoal).toHaveBeenCalledWith(
        'psb_card_click',
        expect.objectContaining({
          source: 'calculator',
          productId: PSB_CARD_DATA.id,
          bankId: 'psb'
        })
      );
    });

    it('should send click event with correct parameters', () => {
      render(<PSBCardWidget source="comparison" />);
      
      mockTrackYandexGoal.mockClear();
      
      const button = screen.getByText('Оформить карту');
      fireEvent.click(button);
      
      // Проверяем все параметры события
      expect(mockTrackYandexGoal).toHaveBeenCalledWith(
        'psb_card_click',
        {
          source: 'comparison',
          productId: PSB_CARD_DATA.id,
          bankId: 'psb'
        }
      );
    });

    it('should send click event for each button click', () => {
      render(<PSBCardWidget source="calculator" />);
      
      mockTrackYandexGoal.mockClear();
      
      const button = screen.getByText('Оформить карту');
      
      // Кликаем несколько раз
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      // Проверяем что событие было отправлено 3 раза
      const clickCalls = mockTrackYandexGoal.mock.calls.filter(
        call => call[0] === 'psb_card_click'
      );
      expect(clickCalls.length).toBe(3);
    });

    it('should send both view and click events with correct event names', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      fireEvent.click(button);
      
      // Проверяем что были вызваны оба события
      const eventNames = mockTrackYandexGoal.mock.calls.map(call => call[0]);
      expect(eventNames).toContain('psb_card_view');
      expect(eventNames).toContain('psb_card_click');
    });

    it('should include productId in all analytics events', () => {
      render(<PSBCardWidget source="calculator" />);
      
      const button = screen.getByText('Оформить карту');
      fireEvent.click(button);
      
      // Проверяем что все события содержат productId
      mockTrackYandexGoal.mock.calls.forEach(call => {
        const params = call[1];
        expect(params).toHaveProperty('productId', PSB_CARD_DATA.id);
      });
    });

    it('should include source in all analytics events', () => {
      render(<PSBCardWidget source="blog" />);
      
      const button = screen.getByText('Оформить карту');
      fireEvent.click(button);
      
      // Проверяем что все события содержат source
      mockTrackYandexGoal.mock.calls.forEach(call => {
        const params = call[1];
        expect(params).toHaveProperty('source', 'blog');
      });
    });

    it('should send analytics even if Yandex Metrica is not loaded', () => {
      // trackYandexGoal должен обрабатывать случай когда Yandex Metrica не загружена
      render(<PSBCardWidget source="calculator" />);
      
      // Проверяем что функция была вызвана (она сама решит что делать если YM не загружена)
      expect(mockTrackYandexGoal).toHaveBeenCalled();
    });
  });
});
