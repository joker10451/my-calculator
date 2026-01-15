/**
 * Основной макет для админ-панели
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Building2, 
  CreditCard, 
  BarChart3, 
  Settings, 
  Upload, 
  Download,
  Database,
  Users,
  TrendingUp
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  {
    name: 'Обзор',
    href: '/admin',
    icon: BarChart3,
    description: 'Общая статистика и аналитика'
  },
  {
    name: 'Банки',
    href: '/admin/banks',
    icon: Building2,
    description: 'Управление банками и их рейтингами'
  },
  {
    name: 'Продукты',
    href: '/admin/products',
    icon: CreditCard,
    description: 'Управление банковскими продуктами'
  },
  {
    name: 'Пользователи',
    href: '/admin/users',
    icon: Users,
    description: 'Профили пользователей и аналитика'
  },
  {
    name: 'Аналитика',
    href: '/admin/analytics',
    icon: TrendingUp,
    description: 'Конверсии и доходы'
  },
  {
    name: 'Импорт/Экспорт',
    href: '/admin/import-export',
    icon: Database,
    description: 'Массовые операции с данными'
  },
  {
    name: 'Настройки',
    href: '/admin/settings',
    icon: Settings,
    description: 'Конфигурация системы'
  }
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Боковая панель */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Логотип */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <Link to="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">С</span>
              </div>
              <span className="font-bold text-gray-900">Админ-панель</span>
            </Link>
          </div>

          {/* Навигация */}
          <nav className="flex-1 space-y-1 px-4 py-4">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href || 
                (item.href !== '/admin' && location.pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Информация о пользователе */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">А</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">Администратор</p>
                <p className="text-xs text-gray-500">admin@schitay.ru</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <div className="pl-64">
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Компонент заголовка страницы
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Компонент карточки статистики
 */
interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: React.ComponentType<{ className?: string }>;
}

export function StatCard({ title, value, change, icon: Icon }: StatCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {Icon && (
              <Icon className="h-6 w-6 text-gray-400" />
            )}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {value}
                </div>
                {change && (
                  <div className={cn(
                    'ml-2 flex items-baseline text-sm font-semibold',
                    change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}