/**
 * Error Boundary для компонента VTBCreditCardWidget
 * Обеспечивает graceful degradation при ошибках рендеринга
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Error Boundary для виджета кредитной карты ВТБ
 * 
 * Перехватывает ошибки рендеринга и отображает fallback UI
 * вместо краша всего приложения.
 */
export class VTBCreditCardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('VTB Credit Card Widget Error:', error, errorInfo);
    
    // Можно отправить ошибку в систему мониторинга
    // например, Sentry, LogRocket и т.д.
  }

  render() {
    if (this.state.hasError) {
      // Если передан кастомный fallback, используем его
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Иначе показываем стандартное сообщение об ошибке
      return (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Ошибка загрузки
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Не удалось загрузить информацию о кредитной карте ВТБ.
              Попробуйте обновить страницу.
            </p>
            {this.state.error && process.env.NODE_ENV === 'development' && (
              <details className="mt-4">
                <summary className="text-xs cursor-pointer text-muted-foreground">
                  Детали ошибки (только в режиме разработки)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
