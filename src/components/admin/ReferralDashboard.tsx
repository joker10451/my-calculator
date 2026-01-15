/**
 * Панель администратора для просмотра статистики реферальных кликов
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ReferralTracker } from '@/lib/analytics/referralTracking';
import type { ReferralClickEvent } from '@/lib/analytics/referralTracking';
import { TrendingUp, MousePointerClick, Building2, Package, ExternalLink, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function ReferralDashboard() {
  const [clicks, setClicks] = useState<ReferralClickEvent[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof ReferralTracker.getClickStatistics>>();
  const [revenue, setRevenue] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allClicks = ReferralTracker.getUserClicks();
    const statistics = ReferralTracker.getClickStatistics();
    const potentialRevenue = ReferralTracker.getPotentialRevenue();

    setClicks(allClicks);
    setStats(statistics);
    setRevenue(potentialRevenue);
  };

  const handleCleanup = () => {
    if (confirm('Удалить события старше 90 дней?')) {
      ReferralTracker.cleanupOldEvents();
      loadData();
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Подготовка данных для графиков
  const bankChartData = stats ? Object.entries(stats.clicksByBank).map(([bank, count]) => ({
    name: bank,
    value: count
  })) : [];

  const productChartData = stats ? Object.entries(stats.clicksByProduct).map(([product, count]) => ({
    name: product,
    value: count
  })) : [];

  const sourceChartData = stats ? Object.entries(stats.clicksBySource).map(([source, count]) => ({
    name: source,
    value: count
  })) : [];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Реферальная статистика</h1>
        <Button variant="outline" size="sm" onClick={handleCleanup} className="gap-2">
          <Trash2 className="w-4 h-4" />
          Очистить старые
        </Button>
      </div>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MousePointerClick className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Всего кликов</p>
              <p className="text-3xl font-bold">{stats?.totalClicks || 0}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Потенциальный доход</p>
              <p className="text-3xl font-bold">{formatCurrency(revenue)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Банков</p>
              <p className="text-3xl font-bold">{Object.keys(stats?.clicksByBank || {}).length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Клики по банкам */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Клики по банкам
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bankChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Клики по типам продуктов */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" />
            Клики по продуктам
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {productChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Клики по источникам */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Источники трафика</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sourceChartData.map((source, index) => (
            <div key={source.name} className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground capitalize">{source.name}</p>
              <p className="text-2xl font-bold">{source.value}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Последние клики */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4">Последние клики</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium">Дата</th>
                <th className="pb-2 font-medium">Банк</th>
                <th className="pb-2 font-medium">Продукт</th>
                <th className="pb-2 font-medium">Источник</th>
                <th className="pb-2 font-medium">Ссылка</th>
              </tr>
            </thead>
            <tbody>
              {clicks.slice(-20).reverse().map((click, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="py-2 text-muted-foreground">{formatDate(click.timestamp)}</td>
                  <td className="py-2 font-medium">{click.bankId}</td>
                  <td className="py-2">{click.productType}</td>
                  <td className="py-2">
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                      {click.source}
                    </span>
                  </td>
                  <td className="py-2">
                    <a
                      href={click.referralLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Открыть
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {clicks.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Пока нет данных о кликах
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
