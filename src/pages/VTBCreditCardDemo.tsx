/**
 * Демо-страница для отображения виджета кредитной карты ВТБ
 */

import { VTBCreditCardWidget } from '@/components/VTBCreditCardWidget';
import { VTBCreditCardErrorBoundary } from '@/components/VTBCreditCardErrorBoundary';
import { Helmet } from 'react-helmet-async';

export default function VTBCreditCardDemo() {
  return (
    <>
      <Helmet>
        <title>Кредитная карта ВТБ - Считай.RU</title>
        <meta 
          name="description" 
          content="Кредитная карта ВТБ с льготным периодом до 200 дней и кешбэком до 15%. Бесплатное обслуживание и доставка." 
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Кредитная карта ВТБ</h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Компактный вариант */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Компактный вариант</h2>
            <VTBCreditCardErrorBoundary>
              <VTBCreditCardWidget 
                source="demo_page" 
                variant="compact"
                showDetails={false}
              />
            </VTBCreditCardErrorBoundary>
          </div>

          {/* Полный вариант */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Полный вариант</h2>
            <VTBCreditCardErrorBoundary>
              <VTBCreditCardWidget 
                source="demo_page" 
                variant="full"
                showDetails={true}
              />
            </VTBCreditCardErrorBoundary>
          </div>
        </div>

        {/* Дополнительная информация */}
        <div className="mt-8 p-6 bg-muted rounded-lg">
          <h2 className="text-xl font-semibold mb-4">О кредитной карте</h2>
          <div className="space-y-4 text-sm">
            <p>
              Кредитная карта ВТБ — это удобный финансовый инструмент с льготным периодом 
              до 200 дней для рефинансирования и до 100 дней для покупок.
            </p>
            <p>
              Карта предлагает кешбэк до 15% в выбранных категориях, бесплатное обслуживание 
              и доставку, а также возможность снятия наличных без комиссии в первые 30 дней.
            </p>
            <p className="text-xs text-muted-foreground">
              Оценивайте свои финансовые возможности и риски. 
              Изучите все условия кредита на сайте vtb.ru/personal/karty/kreditnye/vozmozhnosti
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
