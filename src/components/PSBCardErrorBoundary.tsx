/**
 * Error Boundary для компонента PSBCardWidget
 * Ловит ошибки рендеринга и показывает fallback UI
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary компонент для PSBCardWidget
 * 
 * Перехватывает ошибки рендеринга и показывает fallback UI
 * вместо краша всего приложения
 */
export class PSBCardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Обновляем state чтобы показать fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Логируем ошибку для мониторинга
    console.error('PSBCardWidget rendering error:', error, errorInfo);
    
    // Здесь можно отправить ошибку в систему мониторинга
    // например, Sentry, LogRocket и т.д.
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback UI при ошибке
      return (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Ошибка загрузки карты
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              К сожалению, не удалось загрузить информацию о карте. 
              Попробуйте обновить страницу.
            </p>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
