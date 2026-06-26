/**
 * Error Boundary для виджета Pampadu (ОСАГО).
 * Ловит ошибки рендеринга iframe-виджета и показывает fallback
 * с прямой ссылкой на расчёт.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { PAMPADU_OSAGO } from '@/config/pampaduOsago';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PampaduOsagoErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('PampaduOsagoWidget rendering error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Виджет ОСАГО временно недоступен
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Не удалось загрузить виджет расчёта ОСАГО. Перейдите по прямой ссылке —
              расчёт откроется в новой вкладке.
            </p>
            <a
              href={PAMPADU_OSAGO.directLink}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Рассчитать ОСАГО на Pampadu
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
