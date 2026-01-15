import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calculator, 
  FileText, 
  CheckCircle, 
  ExternalLink,
  Download,
  Share2,
  Scale,
  AlertCircle,
  Info
} from "lucide-react";
import { 
  CalculationResult, 
  CourtType, 
  ExemptionCategory,
  FeeBreakdownItem,
  LegalReference
} from "@/types/courtFee";

interface ResultsDisplayProps {
  calculationResult: CalculationResult | null;
  courtType: CourtType;
  claimAmount: number;
  selectedExemption: ExemptionCategory | null;
  isCalculating: boolean;
  onExport?: () => void;
  onShare?: () => void;
  onCompare?: () => void;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  calculationResult,
  courtType,
  claimAmount,
  selectedExemption,
  isCalculating,
  onExport,
  onShare,
  onCompare
}) => {
  
  // Форматирование валюты
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Форматирование процентов
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Получение названия типа суда
  const getCourtTypeName = (type: CourtType) => {
    return type === 'general' ? 'Суды общей юрисдикции' : 'Арбитражные суды';
  };

  // Рендер состояния загрузки
  if (isCalculating) {
    return (
      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Результат расчета
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Выполняется расчет...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Рендер ошибки
  if (!calculationResult) {
    return (
      <Card className="sticky top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Результат расчета
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Ошибка расчета</p>
            <p className="text-sm text-muted-foreground mt-1">
              Проверьте введенные данные и попробуйте снова
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Результат расчета
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Итоговая сумма крупным шрифтом */}
        <div className="text-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/20">
          <div className="text-sm text-muted-foreground mb-2">
            Госпошлина к доплате
          </div>
          <div className="text-4xl font-bold text-primary mb-2">
            {formatCurrency(calculationResult.finalFee)}
          </div>
          <div className="text-sm text-muted-foreground">
            {formatPercentage(calculationResult.effectiveRate)} от цены иска
          </div>
          <Badge variant="secondary" className="mt-2">
            {getCourtTypeName(courtType)}
          </Badge>
        </div>

        {/* Пошаговый расчет с формулами */}
        <div className="space-y-4">
          <h4 className="font-semibold text-base flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Детализация расчета
          </h4>
          
          <div className="space-y-3">
            {/* Базовая пошлина */}
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <div className="font-medium">Базовая госпошлина</div>
                <div className="text-sm text-muted-foreground">
                  Цена иска: {formatCurrency(claimAmount)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(calculationResult.baseFee)}</div>
              </div>
            </div>

            {/* Применимые льготы и размер экономии */}
            {calculationResult.exemptionDiscount > 0 && selectedExemption && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex-1">
                  <div className="font-medium text-green-700 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Льгота применена
                  </div>
                  <div className="text-sm text-green-600">
                    {selectedExemption.name}
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    {selectedExemption.description}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-700">
                    -{formatCurrency(calculationResult.exemptionDiscount)}
                  </div>
                  <div className="text-xs text-green-600">экономия</div>
                </div>
              </div>
            )}

            {/* Подробная детализация из breakdown */}
            {calculationResult.breakdown && calculationResult.breakdown.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">Формула расчета:</div>
                {calculationResult.breakdown.map((item: FeeBreakdownItem, index: number) => (
                  <div key={index} className="p-3 bg-muted/20 rounded border-l-4 border-primary/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{item.description}</span>
                      <span className="font-semibold">
                        {item.amount >= 0 ? formatCurrency(item.amount) : `-${formatCurrency(Math.abs(item.amount))}`}
                      </span>
                    </div>
                    {item.formula && (
                      <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded mt-2">
                        {item.formula}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Основание: {item.legalBasis}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ссылки на статьи НК РФ */}
        {calculationResult.legalReferences && calculationResult.legalReferences.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-base flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Правовые основания
            </h4>
            <div className="space-y-2">
              {calculationResult.legalReferences.map((ref: LegalReference, index: number) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{ref.article}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {ref.description}
                      </div>
                      {ref.paragraph && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {ref.paragraph}
                        </div>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-2 h-8 w-8 p-0"
                      onClick={() => window.open(ref.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Проверено: {ref.lastVerified.toLocaleDateString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Информационный блок */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex gap-3 text-sm">
            <Info className="w-4 h-4 flex-shrink-0 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800 mb-1">Важная информация</p>
              <p className="text-blue-700 text-xs">
                Расчет выполнен в соответствии с действующим Налоговым кодексом РФ. 
                Размер госпошлины может изменяться при внесении изменений в законодательство. 
                Для получения актуальной информации рекомендуем обратиться к официальным источникам.
              </p>
            </div>
          </div>
        </div>

        {/* Действия с результатом */}
        <div className="space-y-3 pt-4 border-t border-border">
          <Button 
            variant="default" 
            className="w-full gap-2" 
            onClick={onExport}
            disabled={!onExport}
          >
            <Download className="w-4 h-4" />
            Скачать расчет в PDF
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={onShare}
              disabled={!onShare}
            >
              <Share2 className="w-4 h-4" />
              Поделиться
            </Button>
            <Button 
              variant="secondary" 
              className="gap-2" 
              onClick={onCompare}
              disabled={!onCompare}
            >
              <Scale className="w-4 h-4" />
              К сравнению
            </Button>
          </div>
        </div>

        {/* Дополнительная информация о экономии */}
        {calculationResult.exemptionDiscount > 0 && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
            <div className="text-center">
              <div className="text-sm text-green-600 mb-1">Общая экономия от льготы</div>
              <div className="text-2xl font-bold text-green-700">
                {formatCurrency(calculationResult.exemptionDiscount)}
              </div>
              <div className="text-xs text-green-600 mt-1">
                {formatPercentage((calculationResult.exemptionDiscount / calculationResult.baseFee) * 100)} от базовой пошлины
              </div>
            </div>
          </div>
        )}
      </CardContent>

      {/* Скрытый элемент для PDF экспорта */}
      <div id="court-fee-pdf-export" className="hidden print:block p-8 bg-white">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2">Расчет государственной пошлины в суд</h1>
          <p className="text-gray-600">Сформировано на Считай.RU - {new Date().toLocaleDateString('ru-RU')}</p>
        </div>

        <div className="space-y-6">
          {/* Основная информация */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Исходные данные</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600">Цена иска:</span>
                <span className="font-semibold ml-2">{formatCurrency(claimAmount)}</span>
              </div>
              <div>
                <span className="text-gray-600">Тип суда:</span>
                <span className="font-semibold ml-2">{getCourtTypeName(courtType)}</span>
              </div>
              {selectedExemption && (
                <div className="col-span-2">
                  <span className="text-gray-600">Льготная категория:</span>
                  <span className="font-semibold ml-2">{selectedExemption.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Результат расчета */}
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Результат расчета</h2>
            <div className="text-center p-6 bg-gray-50 rounded-lg mb-4">
              <div className="text-sm text-gray-600 mb-2">Итоговая госпошлина</div>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {formatCurrency(calculationResult.finalFee)}
              </div>
              <div className="text-sm text-gray-600">
                {formatPercentage(calculationResult.effectiveRate)} от цены иска
              </div>
            </div>

            {/* Детализация */}
            <div className="space-y-3">
              <div className="flex justify-between p-3 bg-gray-50 rounded">
                <span>Базовая госпошлина:</span>
                <span className="font-semibold">{formatCurrency(calculationResult.baseFee)}</span>
              </div>
              
              {calculationResult.exemptionDiscount > 0 && (
                <div className="flex justify-between p-3 bg-green-50 rounded">
                  <span>Льгота ({selectedExemption?.name}):</span>
                  <span className="font-semibold text-green-700">
                    -{formatCurrency(calculationResult.exemptionDiscount)}
                  </span>
                </div>
              )}

              {calculationResult.breakdown && calculationResult.breakdown.map((item, index) => (
                <div key={index} className="p-3 border-l-4 border-blue-200 bg-gray-50">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{item.description}</span>
                    <span className="font-semibold text-sm">
                      {item.amount >= 0 ? formatCurrency(item.amount) : `-${formatCurrency(Math.abs(item.amount))}`}
                    </span>
                  </div>
                  {item.formula && (
                    <div className="text-xs text-gray-600 font-mono mt-1">{item.formula}</div>
                  )}
                  <div className="text-xs text-gray-500 mt-1">Основание: {item.legalBasis}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Правовые основания */}
          {calculationResult.legalReferences && calculationResult.legalReferences.length > 0 && (
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Правовые основания</h2>
              <div className="space-y-3">
                {calculationResult.legalReferences.map((ref, index) => (
                  <div key={index} className="p-3 border rounded">
                    <div className="font-medium">{ref.article}</div>
                    <div className="text-sm text-gray-600 mt-1">{ref.description}</div>
                    {ref.paragraph && (
                      <div className="text-xs text-gray-500 mt-1">{ref.paragraph}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-2">
                      Проверено: {ref.lastVerified.toLocaleDateString('ru-RU')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Дисклеймер */}
          <div className="border rounded-lg p-4 bg-yellow-50">
            <h3 className="font-semibold mb-2">Важная информация</h3>
            <p className="text-sm text-gray-700">
              Расчет выполнен в соответствии с действующим Налоговым кодексом РФ. 
              Размер госпошлины может изменяться при внесении изменений в законодательство. 
              Для получения актуальной информации рекомендуем обратиться к официальным источникам.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Документ сформирован автоматически на сайте Считай.RU - {new Date().toLocaleString('ru-RU')}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ResultsDisplay;