/**
 * HeroSection Demo Page
 * Демонстрационная страница для визуальной проверки компонента HeroSection
 */

import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HeroSection } from '@/components/blog/HeroSection';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const HeroSectionDemo = () => {
  return (
    <>
      <Helmet>
        <title>HeroSection Demo | Считай.RU</title>
        <meta name="description" content="Демонстрация компонента HeroSection" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pb-2xl">
          {/* Навигация назад */}
          <div className="container mx-auto px-4 py-lg">
            <Button variant="ghost" asChild>
              <Link to="/blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад к блогу
              </Link>
            </Button>
          </div>

          {/* Демо 1: Стандартная hero-секция */}
          <section className="mb-3xl">
            <div className="container mx-auto px-4 mb-lg">
              <h2 className="text-2xl font-bold">Стандартная Hero-секция (height: large)</h2>
              <p className="text-muted-foreground">С анимированным текстом и градиентным фоном</p>
            </div>
            <HeroSection
              title="Лучшие"
              highlightedText="финансовые"
              titleSuffix="калькуляторы России"
              description="Экспертные статьи о финансах, налогах, ипотеке и экономии. Актуальная информация и практические советы для 2026 года."
              height="large"
            />
          </section>

          {/* Демо 2: Hero-секция среднего размера */}
          <section className="mb-3xl">
            <div className="container mx-auto px-4 mb-lg">
              <h2 className="text-2xl font-bold">Hero-секция среднего размера (height: medium)</h2>
              <p className="text-muted-foreground">Компактная версия для внутренних страниц</p>
            </div>
            <HeroSection
              title="Финансовый"
              highlightedText="блог"
              description="Актуальные статьи и советы по финансам"
              height="medium"
            />
          </section>

          {/* Демо 3: Hero-секция на весь экран */}
          <section className="mb-3xl">
            <div className="container mx-auto px-4 mb-lg">
              <h2 className="text-2xl font-bold">Hero-секция на весь экран (height: screen)</h2>
              <p className="text-muted-foreground">Максимальная высота для главной страницы</p>
            </div>
            <HeroSection
              title="Начните"
              highlightedText="экономить"
              titleSuffix="уже сегодня"
              description="Используйте наши калькуляторы для расчета налогов, ипотеки, ЖКХ и других финансовых операций"
              height="screen"
            />
          </section>

          {/* Информация о компоненте */}
          <section className="container mx-auto px-4 py-3xl">
            <div className="bg-card rounded-xl p-2xl border">
              <h2 className="text-2xl font-bold mb-lg">О компоненте HeroSection</h2>
              
              <div className="space-y-lg">
                <div>
                  <h3 className="text-xl font-semibold mb-2">Основные возможности:</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Анимированный цветной текст (ColourfulText) для выделения ключевых слов</li>
                    <li>Крупная типографика (64px на десктопе) для максимального визуального эффекта</li>
                    <li>Градиентный оверлей для улучшения читаемости текста</li>
                    <li>Опциональное фоновое изображение с анимацией появления</li>
                    <li>Три варианта высоты: screen, large, medium</li>
                    <li>Поддержка prefers-reduced-motion для доступности</li>
                    <li>Адаптивный дизайн для всех размеров экранов</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Требования:</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Requirements 10.1: Анимированный цветной текст в заголовках</li>
                    <li>Requirements 10.6: Частицы или плавающие элементы в hero-секции</li>
                    <li>Requirements 2.1: Крупные заголовки (H1: 48px+)</li>
                    <li>Requirements 5.4: Просторная hero-секция с большими отступами (80-120px)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-2">Пример использования:</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                    <code>{`<HeroSection
  title="Лучшие"
  highlightedText="финансовые"
  titleSuffix="калькуляторы России"
  description="Экспертные статьи и инструменты"
  backgroundImage="/hero-bg.webp"
  height="large"
/>`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default HeroSectionDemo;
