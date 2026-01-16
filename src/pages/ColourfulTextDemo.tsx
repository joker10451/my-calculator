/**
 * Демонстрационная страница для компонента ColourfulText
 * Временная страница для проверки работы компонента
 */

import React from 'react';
import { ColourfulText } from '@/components/ui/colourful-text';

export const ColourfulTextDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold">
            Лучшие <ColourfulText text="финансовые" /> калькуляторы
          </h1>
          <p className="text-xl text-muted-foreground">
            Демонстрация компонента ColourfulText
          </p>
        </div>
        
        <div className="space-y-8">
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">
              <ColourfulText text="Популярные" /> статьи
            </h2>
            <p className="text-lg text-muted-foreground">
              Пример использования в заголовке секции
            </p>
          </section>
          
          <section className="space-y-4">
            <h2 className="text-3xl font-bold">
              Начните <ColourfulText text="экономить" /> сегодня
            </h2>
            <p className="text-lg text-muted-foreground">
              Пример использования в призыве к действию
            </p>
          </section>
          
          <section className="space-y-4">
            <h3 className="text-2xl font-semibold">
              Кастомные цвета
            </h3>
            <div className="text-4xl font-bold">
              <ColourfulText 
                text="Красный, Зеленый, Синий"
                colors={['#ff0000', '#00ff00', '#0000ff']}
                animationDuration={3000}
              />
            </div>
          </section>
          
          <section className="space-y-4">
            <h3 className="text-2xl font-semibold">
              Быстрая анимация
            </h3>
            <div className="text-4xl font-bold">
              <ColourfulText 
                text="Быстро!"
                animationDuration={2000}
                staggerDelay={30}
              />
            </div>
          </section>
          
          <section className="space-y-4">
            <h3 className="text-2xl font-semibold">
              Без анимации (для тестирования)
            </h3>
            <div className="text-4xl font-bold">
              <ColourfulText 
                text="Статичный текст"
                disableAnimation={true}
              />
            </div>
          </section>
        </div>
        
        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Информация о компоненте</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>✅ 10 цветов по умолчанию</li>
            <li>✅ Анимация цвета, позиции, масштаба и размытия</li>
            <li>✅ Stagger эффект (задержка между символами)</li>
            <li>✅ Поддержка prefers-reduced-motion</li>
            <li>✅ Кастомизируемые цвета и длительность</li>
            <li>✅ TypeScript типизация</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ColourfulTextDemo;
