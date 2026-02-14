/**
 * Internal Analytics Dashboard
 * Displays conversion metrics and partner performance
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  getAllMetrics,
  exportConversionData,
  type ConversionMetrics,
} from '@/lib/analytics/conversionTracking';
import { Download, TrendingUp, MousePointerClick, DollarSign, Target } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<ConversionMetrics[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string>('all');

  useEffect(() => {
    loadMetrics();
    // Refresh metrics every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = () => {
    const data = getAllMetrics();
    setMetrics(data);
  };

  const handleExport = () => {
    const data = exportConversionData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalMetrics = metrics.reduce(
    (acc, m) => ({
      conversions: acc.conversions + m.totalConversions,
      value: acc.value + m.totalValue,
      rate: acc.rate + m.conversionRate,
    }),
    { conversions: 0, value: 0, rate: 0 }
  );

  const avgConversionRate = metrics.length > 0 ? totalMetrics.rate / metrics.length : 0;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Аналитика и конверсии</h1>
          <p className="text-muted-foreground">
            Отслеживание эффективности партнерских виджетов
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Экспорт данных
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Всего конверсий</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.conversions}</div>
            <p className="text-xs text-muted-foreground">За все время</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Средняя конверсия</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConversionRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">По всем партнерам</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Общая ценность</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalMetrics.value.toLocaleString('ru-RU')} ₽
            </div>
            <p className="text-xs text-muted-foreground">Сумма конверсий</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Партнеров</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.length}</div>
            <p className="text-xs text-muted-foreground">Активных партнеров</p>
          </CardContent>
        </Card>
      </div>

      {/* Partner Metrics */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all" onClick={() => setSelectedPartner('all')}>
            Все партнеры
          </TabsTrigger>
          {metrics.map(m => (
            <TabsTrigger
              key={m.partner}
              value={m.partner}
              onClick={() => setSelectedPartner(m.partner)}
            >
              {m.partner}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid gap-4">
            {metrics.map(metric => (
              <PartnerMetricCard key={metric.partner} metric={metric} />
            ))}
          </div>
        </TabsContent>

        {metrics.map(metric => (
          <TabsContent key={metric.partner} value={metric.partner} className="space-y-4">
            <PartnerMetricCard metric={metric} detailed />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

interface PartnerMetricCardProps {
  metric: ConversionMetrics;
  detailed?: boolean;
}

const PartnerMetricCard = ({ metric, detailed = false }: PartnerMetricCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="capitalize">{metric.partner}</CardTitle>
        <CardDescription>
          Конверсия: {metric.conversionRate.toFixed(2)}% | Средний чек:{' '}
          {metric.averageValue.toLocaleString('ru-RU')} ₽
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Конверсий</p>
              <p className="text-2xl font-bold">{metric.totalConversions}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Общая сумма</p>
              <p className="text-2xl font-bold">
                {metric.totalValue.toLocaleString('ru-RU')} ₽
              </p>
            </div>
          </div>

          {detailed && (
            <>
              <div>
                <h4 className="text-sm font-medium mb-2">По продуктам</h4>
                <div className="space-y-2">
                  {Object.entries(metric.byProduct).map(([product, count]) => (
                    <div key={product} className="flex justify-between text-sm">
                      <span className="capitalize">{product}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">По калькуляторам</h4>
                <div className="space-y-2">
                  {Object.entries(metric.byCalculator).map(([calculator, count]) => (
                    <div key={calculator} className="flex justify-between text-sm">
                      <span>{calculator}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
