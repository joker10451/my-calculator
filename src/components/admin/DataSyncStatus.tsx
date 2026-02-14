/**
 * Компонент для отображения статуса синхронизации данных
 * Показывает текущий статус, свежесть данных и позволяет запустить синхронизацию вручную
 */

import React from 'react';
import { useDataSync } from '../../hooks/useDataSync';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

export function DataSyncStatus() {
  const { syncStatus, isSyncing, lastSync, errors, dataFreshness, syncNow } = useDataSync();

  const handleSyncNow = async () => {
    try {
      await syncNow();
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
    }
  };

  const getFreshnessColor = (freshness: string) => {
    switch (freshness) {
      case 'fresh':
        return 'bg-green-500';
      case 'stale':
        return 'bg-yellow-500';
      case 'outdated':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getFreshnessLabel = (freshness: string) => {
    switch (freshness) {
      case 'fresh':
        return 'Актуальные';
      case 'stale':
        return 'Устаревающие';
      case 'outdated':
        return 'Устаревшие';
      default:
        return 'Неизвестно';
    }
  };

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Никогда';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Только что';
    if (diffMins < 60) return `${diffMins} мин. назад`;
    if (diffHours < 24) return `${diffHours} ч. назад`;
    return `${diffDays} дн. назад`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Синхронизация данных</CardTitle>
            <CardDescription>
              Автоматическое обновление данных из банковских API
            </CardDescription>
          </div>
          <Button
            onClick={handleSyncNow}
            disabled={isSyncing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Синхронизация...' : 'Синхронизировать'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Статус синхронизации */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isSyncing ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
                <span className="font-medium">Выполняется синхронизация...</span>
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Готово к синхронизации</span>
              </>
            )}
          </div>
          {isSyncing && (
            <span className="text-sm text-muted-foreground">
              {Math.round(syncStatus.sync_progress)}%
            </span>
          )}
        </div>

        {/* Прогресс-бар */}
        {isSyncing && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${syncStatus.sync_progress}%` }}
            />
          </div>
        )}

        {/* Свежесть данных */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Свежесть данных:</span>
          </div>
          <Badge className={getFreshnessColor(dataFreshness)}>
            {getFreshnessLabel(dataFreshness)}
          </Badge>
        </div>

        {/* Последняя синхронизация */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Последняя синхронизация:</span>
          <span className="font-medium">{formatLastSync(lastSync)}</span>
        </div>

        {/* Ошибки */}
        {errors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-1">Ошибки синхронизации:</div>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Информация */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Автоматическая синхронизация выполняется каждый час</p>
          <p>• Данные из официальных API банков имеют наивысший приоритет</p>
          <p>• При конфликтах используются данные из приоритетных источников</p>
        </div>
      </CardContent>
    </Card>
  );
}
