import { GlassCard } from '@/components/ui/glass-card';
import { useFeatureDetection } from '@/hooks/useFeatureDetection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Bell, Settings, User, Check, X } from 'lucide-react';

export default function GlassmorphismDemo() {
  const features = useFeatureDetection();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center text-white space-y-4">
          <h1 className="text-5xl font-bold">Glassmorphism Demo</h1>
          <p className="text-xl opacity-90">
            Демонстрация компонентов с эффектом glassmorphism
          </p>
        </div>

        {/* Feature Detection Status */}
        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Поддержка браузера
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(features).map(([feature, supported]) => (
              <div
                key={feature}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5"
              >
                <span className="text-white font-medium capitalize">
                  {feature.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                {supported ? (
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                    <Check className="w-3 h-3 mr-1" />
                    Поддерживается
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                    <X className="w-3 h-3 mr-1" />
                    Не поддерживается
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Default Variant */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">Default Variant</h2>
          <GlassCard className="p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Стандартная стеклянная карточка
            </h3>
            <p className="text-white/80 text-lg leading-relaxed mb-6">
              Это стандартный вариант glassmorphic карточки с полупрозрачным фоном,
              размытием backdrop-filter и тонкой границей. Идеально подходит для
              контентных блоков и информационных панелей.
            </p>
            <div className="flex gap-3">
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                Кнопка 1
              </Button>
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                Кнопка 2
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Header Variant */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">Header Variant</h2>
          <GlassCard variant="header" className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-white">Навигация</h3>
                <nav className="flex gap-4">
                  <a href="#" className="text-white/80 hover:text-white transition-colors">
                    Главная
                  </a>
                  <a href="#" className="text-white/80 hover:text-white transition-colors">
                    О нас
                  </a>
                  <a href="#" className="text-white/80 hover:text-white transition-colors">
                    Контакты
                  </a>
                </nav>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-0 w-10 h-10 p-0"
                >
                  <Search className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-0 w-10 h-10 p-0"
                >
                  <Bell className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-0 w-10 h-10 p-0"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 text-white border-0 w-10 h-10 p-0"
                >
                  <User className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Modal Variant */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">Modal Variant</h2>
          <div className="relative h-96 rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200"
              alt="Background"
              className="w-full h-full object-cover"
            />
            <GlassCard
              variant="modal"
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md border border-white/20">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Модальное окно
                </h3>
                <p className="text-white/80 mb-6">
                  Это пример модального окна с glassmorphism эффектом.
                  Темный полупрозрачный фон с размытием создает фокус на контенте.
                </p>
                <div className="flex gap-3">
                  <Button className="flex-1 bg-white text-purple-600 hover:bg-white/90">
                    Подтвердить
                  </Button>
                  <Button className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/30">
                    Отмена
                  </Button>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">Grid Layout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <GlassCard key={i} className="p-6 hover:scale-105 transition-transform">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{i}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white">Карточка {i}</h3>
                </div>
                <p className="text-white/70">
                  Пример контента в glassmorphic карточке с hover эффектом.
                </p>
              </GlassCard>
            ))}
          </div>
        </div>

        {/* Search Bar Example */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">Search Bar</h2>
          <GlassCard className="p-2">
            <div className="flex items-center gap-3 px-4">
              <Search className="w-5 h-5 text-white/60" />
              <input
                type="text"
                placeholder="Поиск..."
                className="flex-1 bg-transparent border-0 text-white placeholder:text-white/50 focus:outline-none text-lg py-3"
              />
              <Button
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
              >
                Найти
              </Button>
            </div>
          </GlassCard>
        </div>

        {/* Fallback Example */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-white">Fallback Mode</h2>
          <GlassCard useFallback className="p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Режим совместимости
            </h3>
            <p className="text-white/80 text-lg leading-relaxed">
              Эта карточка использует fallback режим с непрозрачным фоном вместо
              backdrop-filter. Это обеспечивает совместимость со старыми браузерами,
              которые не поддерживают современные CSS свойства.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
