/**
 * Color System Demo Page
 * Демонстрация цветовой системы блога
 */

import { colors } from '@/lib/design-system';

export default function ColorSystemDemo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-h1 font-bold text-gradient-primary">
            Цветовая система блога
          </h1>
          <p className="text-body text-muted-foreground">
            Демонстрация палитры цветов и градиентов
          </p>
        </div>

        {/* Primary Colors */}
        <section className="space-y-4">
          <h2 className="text-h2 font-bold">Primary Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(colors.primary).map(([key, value]) => {
              if (typeof value !== 'string' || key === 'gradient' || key === 'solid' || key === 'light' || key === 'dark') return null;
              return (
                <div key={key} className="space-y-2">
                  <div 
                    className="h-24 rounded-lg shadow-md"
                    style={{ backgroundColor: value }}
                  />
                  <p className="text-sm font-medium">{key}</p>
                  <p className="text-xs text-muted-foreground">{value}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Category Colors */}
        <section className="space-y-4">
          <h2 className="text-h2 font-bold">Category Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(colors.categories).map(([category, colorObj]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-semibold capitalize">{category}</h3>
                <div className="space-y-2">
                  <div 
                    className="h-20 rounded-lg shadow-md"
                    style={{ backgroundColor: colorObj.base }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div 
                      className="h-12 rounded"
                      style={{ backgroundColor: colorObj.light }}
                    />
                    <div 
                      className="h-12 rounded"
                      style={{ backgroundColor: colorObj.dark }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Accent Colors */}
        <section className="space-y-4">
          <h2 className="text-h2 font-bold">Accent Colors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Object.entries(colors.accent).map(([name, colorObj]) => (
              <div key={name} className="space-y-3">
                <h3 className="text-lg font-semibold capitalize">{name}</h3>
                <div className="space-y-2">
                  <div 
                    className="h-20 rounded-lg shadow-md"
                    style={{ backgroundColor: colorObj.base }}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div 
                      className="h-12 rounded"
                      style={{ backgroundColor: colorObj.light }}
                    />
                    <div 
                      className="h-12 rounded"
                      style={{ backgroundColor: colorObj.dark }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Gradient Backgrounds */}
        <section className="space-y-4">
          <h2 className="text-h2 font-bold">Gradient Backgrounds</h2>
          
          {/* Hero Gradients */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Hero Gradients</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-hero-light h-32 rounded-lg shadow-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Hero Light</span>
              </div>
              <div className="bg-hero-dark h-32 rounded-lg shadow-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Hero Dark</span>
              </div>
            </div>
          </div>

          {/* Card Gradients */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Card Gradients</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card-light h-32 rounded-lg shadow-lg flex items-center justify-center">
                <span className="text-foreground font-bold text-xl">Card Light</span>
              </div>
              <div className="bg-card-dark h-32 rounded-lg shadow-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">Card Dark</span>
              </div>
            </div>
          </div>

          {/* Category Gradients */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Category Gradients</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-finance h-24 rounded-lg shadow-lg flex items-center justify-center">
                <span className="text-white font-semibold">Finance</span>
              </div>
              <div className="bg-gradient-taxes h-24 rounded-lg shadow-lg flex items-center justify-center">
                <span className="text-white font-semibold">Taxes</span>
              </div>
              <div className="bg-gradient-mortgage h-24 rounded-lg shadow-lg flex items-center justify-center">
                <span className="text-white font-semibold">Mortgage</span>
              </div>
              <div className="bg-gradient-utilities h-24 rounded-lg shadow-lg flex items-center justify-center">
                <span className="text-white font-semibold">Utilities</span>
              </div>
              <div className="bg-gradient-salary h-24 rounded-lg shadow-lg flex items-center justify-center">
                <span className="text-white font-semibold">Salary</span>
              </div>
              <div className="bg-gradient-insurance h-24 rounded-lg shadow-lg flex items-center justify-center">
                <span className="text-white font-semibold">Insurance</span>
              </div>
              <div className="bg-gradient-investment h-24 rounded-lg shadow-lg flex items-center justify-center">
                <span className="text-white font-semibold">Investment</span>
              </div>
              <div className="bg-gradient-savings h-24 rounded-lg shadow-lg flex items-center justify-center">
                <span className="text-white font-semibold">Savings</span>
              </div>
            </div>
          </div>
        </section>

        {/* Text Gradients */}
        <section className="space-y-4">
          <h2 className="text-h2 font-bold">Text Gradients</h2>
          <div className="space-y-4">
            <h3 className="text-4xl font-bold text-gradient-primary">
              Primary Gradient Text
            </h3>
            <h3 className="text-4xl font-bold text-gradient-finance">
              Finance Gradient Text
            </h3>
            <h3 className="text-4xl font-bold text-gradient-success">
              Success Gradient Text
            </h3>
          </div>
        </section>

        {/* Neutral Palette */}
        <section className="space-y-4">
          <h2 className="text-h2 font-bold">Neutral Palette</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {Object.entries(colors.neutral).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <div 
                  className="h-16 rounded shadow-sm border"
                  style={{ backgroundColor: value }}
                />
                <p className="text-xs text-center">{key}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Usage Examples */}
        <section className="space-y-4">
          <h2 className="text-h2 font-bold">Usage Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card with gradient */}
            <div className="bg-gradient-primary p-8 rounded-2xl shadow-lg text-white">
              <h3 className="text-2xl font-bold mb-4">Gradient Card</h3>
              <p className="text-white/90">
                Пример карточки с градиентным фоном для привлечения внимания
              </p>
            </div>

            {/* Card with category color */}
            <div className="bg-gradient-mortgage p-8 rounded-2xl shadow-lg text-white">
              <h3 className="text-2xl font-bold mb-4">Category Card</h3>
              <p className="text-white/90">
                Карточка с цветом категории для визуальной группировки
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
