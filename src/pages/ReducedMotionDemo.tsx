/**
 * Reduced Motion Demo Page
 * Демонстрирует работу поддержки prefers-reduced-motion
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion, useAnimationProps, useConditionalAnimation } from '@/hooks/useReducedMotion';
import { FadeInUp, HoverScale, PageTransition, StaggerContainer, StaggerItem } from '@/components/animations';
import { ColourfulText } from '@/components/ui/colourful-text';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, CheckCircle2, XCircle } from 'lucide-react';

export default function ReducedMotionDemo() {
  const shouldReduceMotion = useReducedMotion();
  const [testCount, setTestCount] = useState(0);

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <FadeInUp>
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                Демонстрация <ColourfulText text="Reduced Motion" />
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Проверка поддержки предпочтений пользователя по анимациям
              </p>
            </div>
          </FadeInUp>

          {/* Status Alert */}
          <FadeInUp delay={0.1}>
            <Alert className={shouldReduceMotion ? 'border-orange-500' : 'border-green-500'}>
              {shouldReduceMotion ? (
                <XCircle className="h-4 w-4 text-orange-500" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              )}
              <AlertTitle>
                Статус: {shouldReduceMotion ? 'Анимации отключены' : 'Анимации включены'}
              </AlertTitle>
              <AlertDescription>
                {shouldReduceMotion ? (
                  <>
                    Вы предпочитаете уменьшенное движение. Все анимации автоматически отключены.
                    <br />
                    <strong>Как включить анимации:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Chrome/Edge: DevTools → Cmd/Ctrl+Shift+P → "Emulate CSS prefers-reduced-motion" → "no-preference"</li>
                      <li>Firefox: about:config → ui.prefersReducedMotion → 0</li>
                      <li>Safari: System Preferences → Accessibility → Display → Отключить "Reduce Motion"</li>
                    </ul>
                  </>
                ) : (
                  <>
                    Анимации работают нормально. Все компоненты используют плавные переходы.
                    <br />
                    <strong>Как отключить анимации:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li>Chrome/Edge: DevTools → Cmd/Ctrl+Shift+P → "Emulate CSS prefers-reduced-motion" → "reduce"</li>
                      <li>Firefox: about:config → ui.prefersReducedMotion → 1</li>
                      <li>Safari: System Preferences → Accessibility → Display → Включить "Reduce Motion"</li>
                    </ul>
                  </>
                )}
              </AlertDescription>
            </Alert>
          </FadeInUp>

          {/* Test Components */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* FadeInUp Test */}
            <FadeInUp delay={0.2}>
              <Card>
                <CardHeader>
                  <CardTitle>FadeInUp Component</CardTitle>
                  <CardDescription>
                    Появление с эффектом fade и движением вверх
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {shouldReduceMotion 
                        ? 'Компонент отображается мгновенно без анимации'
                        : 'Компонент плавно появляется снизу вверх'
                      }
                    </p>
                    <Badge variant={shouldReduceMotion ? 'secondary' : 'default'}>
                      {shouldReduceMotion ? 'Статичный' : 'Анимированный'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </FadeInUp>

            {/* HoverScale Test */}
            <FadeInUp delay={0.3}>
              <HoverScale>
                <Card className="cursor-pointer">
                  <CardHeader>
                    <CardTitle>HoverScale Component</CardTitle>
                    <CardDescription>
                      Увеличение при наведении
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        {shouldReduceMotion 
                          ? 'Наведите курсор - масштабирование отключено'
                          : 'Наведите курсор для эффекта масштабирования'
                        }
                      </p>
                      <Badge variant={shouldReduceMotion ? 'secondary' : 'default'}>
                        {shouldReduceMotion ? 'Статичный' : 'Интерактивный'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </HoverScale>
            </FadeInUp>

            {/* ColourfulText Test */}
            <FadeInUp delay={0.4}>
              <Card>
                <CardHeader>
                  <CardTitle>ColourfulText Component</CardTitle>
                  <CardDescription>
                    Анимированный цветной текст
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-2xl font-bold">
                      <ColourfulText text="Финансовые калькуляторы" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {shouldReduceMotion 
                        ? 'Текст отображается статично'
                        : 'Каждый символ циклически меняет цвет'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </FadeInUp>

            {/* StaggerContainer Test */}
            <FadeInUp delay={0.5}>
              <Card>
                <CardHeader>
                  <CardTitle>Stagger Animation</CardTitle>
                  <CardDescription>
                    Последовательное появление элементов
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StaggerContainer className="space-y-2">
                    {['Элемент 1', 'Элемент 2', 'Элемент 3', 'Элемент 4'].map((item, index) => (
                      <StaggerItem key={index}>
                        <div className="p-3 bg-primary/10 rounded-lg">
                          {item}
                        </div>
                      </StaggerItem>
                    ))}
                  </StaggerContainer>
                  <p className="text-sm text-muted-foreground mt-4">
                    {shouldReduceMotion 
                      ? 'Все элементы появляются одновременно'
                      : 'Элементы появляются с задержкой'
                    }
                  </p>
                </CardContent>
              </Card>
            </FadeInUp>
          </div>

          {/* Interactive Test */}
          <FadeInUp delay={0.6}>
            <Card>
              <CardHeader>
                <CardTitle>Интерактивный тест</CardTitle>
                <CardDescription>
                  Проверка работы хуков useAnimationProps и useConditionalAnimation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button 
                    onClick={() => setTestCount(testCount + 1)}
                    className="relative"
                  >
                    Нажми меня ({testCount})
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    {shouldReduceMotion 
                      ? 'Кнопка без анимации нажатия'
                      : 'Кнопка с анимацией нажатия'
                    }
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <TestBox 
                    title="useAnimationProps"
                    description={shouldReduceMotion 
                      ? 'Возвращает пустой объект'
                      : 'Возвращает props анимации'
                    }
                  />
                  <TestBox 
                    title="useConditionalAnimation"
                    description={shouldReduceMotion 
                      ? 'Возвращает статичное значение'
                      : 'Возвращает анимированное значение'
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </FadeInUp>

          {/* Documentation Link */}
          <FadeInUp delay={0.7}>
            <Card className="bg-primary/5">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <CardTitle>Документация</CardTitle>
                    <CardDescription className="mt-2">
                      Подробное руководство по использованию reduced motion находится в файле:
                      <code className="block mt-2 p-2 bg-background rounded text-sm">
                        src/hooks/REDUCED_MOTION_GUIDE.md
                      </code>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </FadeInUp>
        </div>
      </div>
    </PageTransition>
  );
}

// Helper component for testing
function TestBox({ title, description }: { title: string; description: string }) {
  const animationProps = useAnimationProps({
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  });
  
  const duration = useConditionalAnimation(0.3, 0);

  return (
    <motion.div
      {...animationProps}
      transition={{ duration }}
      className="p-4 bg-muted rounded-lg cursor-pointer"
    >
      <h4 className="font-semibold text-sm mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </motion.div>
  );
}
