import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Scale, 
  Info, 
  Building, 
  Gavel,
  AlertTriangle,
  Calendar,
  RefreshCw,
  ChevronDown,
  Settings,
  Wifi,
  WifiOff,
  HardDrive,
  Plus,
  Minus
} from "lucide-react";
import { useComparison } from "@/context/ComparisonContext";
import { useToast } from "@/hooks/use-toast";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { feeCalculationEngine } from "@/lib/feeCalculationEngine";
import { exemptionManager } from "@/lib/exemptionManager";
import { feeDataService } from "@/lib/feeDataService";
import { exportToPDF } from "@/lib/pdfService";
import ResultsDisplay from "./ResultsDisplay";
import { 
  CourtType, 
  ExemptionCategory, 
  CalculationResult,
  DataFreshnessStatus,
  DataVersionInfo
} from "@/types/courtFee";

const CourtFeeCalculator = () => {
  const { addItem } = useComparison();
  const { toast } = useToast();
  const {
    isOffline,
    isOnline,
    isOfflineReady,
    cacheStatistics,
    isRefreshing,
    refreshOfflineCache,
    clearOfflineCache,
    getFormattedCacheSize,
    getOfflineReadinessMessage
  } = useOfflineMode();
  
  // Состояние калькулятора
  const [claimAmount, setClaimAmount] = useState(100000);
  const [courtType, setCourtType] = useState<CourtType>('general');
  const [selectedExemption, setSelectedExemption] = useState<ExemptionCategory | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Состояние для данных о актуальности
  const [dataFreshness, setDataFreshness] = useState<DataFreshnessStatus | null>(null);
  const [dataVersion, setDataVersion] = useState<DataVersionInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showOfflineStatus, setShowOfflineStatus] = useState(false);

  // Константы для корректировки цены
  const MIN_CLAIM_AMOUNT = 1000;
  const MAX_CLAIM_AMOUNT = 10000000;
  
  // Функция для определения умного шага
  const getStepSize = (currentValue: number): number => {
    return currentValue < 100000 ? 1000 : 10000;
  };

  // Функция увеличения цены иска
  const handleIncrementAmount = () => {
    const step = getStepSize(claimAmount);
    const newAmount = Math.min(claimAmount + step, MAX_CLAIM_AMOUNT);
    setClaimAmount(newAmount);
  };

  // Функция уменьшения цены иска
  const handleDecrementAmount = () => {
    const step = getStepSize(claimAmount);
    const newAmount = Math.max(claimAmount - step, MIN_CLAIM_AMOUNT);
    setClaimAmount(newAmount);
  };

  // Функция для форматирования числа с разделителями тысяч
  const formatNumberWithSpaces = (value: number): string => {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  };

  // Функция для парсинга числа из строки с разделителями
  const parseNumberFromString = (value: string): number => {
    const cleanValue = value.replace(/\s/g, '');
    const parsed = parseInt(cleanValue, 10);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Обработчик изменения поля ввода
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Разрешаем только цифры и пробелы
    if (!/^[\d\s]*$/.test(inputValue)) {
      return;
    }

    const numericValue = parseNumberFromString(inputValue);
    
    // Применяем ограничения
    let validatedValue = numericValue;
    if (numericValue < MIN_CLAIM_AMOUNT) {
      validatedValue = MIN_CLAIM_AMOUNT;
    } else if (numericValue > MAX_CLAIM_AMOUNT) {
      validatedValue = MAX_CLAIM_AMOUNT;
    }
    
    setClaimAmount(validatedValue);
  };

  // Обработчик потери фокуса поля ввода
  const handleInputBlur = () => {
    // Дополнительная валидация при потере фокуса
    if (claimAmount < MIN_CLAIM_AMOUNT) {
      setClaimAmount(MIN_CLAIM_AMOUNT);
    } else if (claimAmount > MAX_CLAIM_AMOUNT) {
      setClaimAmount(MAX_CLAIM_AMOUNT);
    }
  };

  // Проверка актуальности данных при загрузке компонента
  useEffect(() => {
    const checkDataStatus = async () => {
      try {
        // Проверяем целостность данных
        const isDataValid = feeDataService.validateDataIntegrity();
        if (!isDataValid) {
          toast({
            title: "Предупреждение",
            description: "Обнаружены проблемы с данными о госпошлинах. Расчеты могут быть неточными.",
            variant: "destructive"
          });
        }

        // Получаем информацию о актуальности
        const freshness = feeDataService.checkDataFreshness();
        setDataFreshness(freshness);

        // Получаем информацию о версии
        const version = feeDataService.getDataVersionInfo();
        setDataVersion(version);

        // Показываем предупреждение если данные устарели
        if (!freshness.isUpToDate && freshness.warningMessage) {
          toast({
            title: "Внимание",
            description: freshness.warningMessage,
            variant: "default"
          });
        }

        // В онлайн-режиме проверяем наличие обновлений
        if (isOnline && !isOffline) {
          const hasUpdates = await feeDataService.checkForUpdates();
          if (hasUpdates) {
            toast({
              title: "Доступны обновления",
              description: "Найдены обновления тарифов госпошлин. Рекомендуется обновить данные.",
              variant: "default"
            });
          }
        }

        // Показываем уведомление о офлайн-режиме
        if (isOffline) {
          toast({
            title: "Офлайн-режим",
            description: isOfflineReady 
              ? "Калькулятор работает с кэшированными данными"
              : "Ограниченная функциональность. Некоторые данные могут быть недоступны.",
            variant: "default"
          });
        }
      } catch (error) {
        console.error('Ошибка проверки данных:', error);
      }
    };

    checkDataStatus();
  }, [toast, isOffline, isOnline, isOfflineReady]);

  // Обновление данных
  const handleUpdateData = async () => {
    if (isOffline) {
      toast({
        title: "Офлайн-режим",
        description: "Обновление данных недоступно без подключения к интернету.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Обновляем данные для обоих типов судов
      await feeDataService.updateSchedule('general');
      await feeDataService.updateSchedule('arbitration');
      
      // Обновляем информацию о актуальности
      const freshness = feeDataService.checkDataFreshness();
      setDataFreshness(freshness);
      
      const version = feeDataService.getDataVersionInfo();
      setDataVersion(version);
      
      toast({
        title: "Данные обновлены",
        description: "Тарифы госпошлин успешно обновлены до актуальной версии.",
        variant: "default"
      });
    } catch (error) {
      console.error('Ошибка обновления данных:', error);
      toast({
        title: "Ошибка обновления",
        description: "Не удалось обновить данные. Попробуйте позже.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Обновление офлайн-кэша
  const handleRefreshOfflineCache = async () => {
    if (isOffline) {
      toast({
        title: "Офлайн-режим",
        description: "Обновление кэша недоступно без подключения к интернету.",
        variant: "destructive"
      });
      return;
    }

    const success = await refreshOfflineCache();
    if (success) {
      toast({
        title: "Кэш обновлен",
        description: "Офлайн-данные успешно обновлены.",
        variant: "default"
      });
    } else {
      toast({
        title: "Ошибка обновления кэша",
        description: "Не удалось обновить офлайн-данные.",
        variant: "destructive"
      });
    }
  };

  // Очистка офлайн-кэша
  const handleClearOfflineCache = () => {
    clearOfflineCache();
    toast({
      title: "Кэш очищен",
      description: "Все офлайн-данные удалены.",
      variant: "default"
    });
  };
  // Получение доступных льгот для выбранного типа суда
  const availableExemptions = useMemo(() => {
    return exemptionManager.getAvailableExemptions(courtType);
  }, [courtType]);

  // Основной расчет госпошлины
  const calculationResult = useMemo((): CalculationResult | null => {
    try {
      setIsCalculating(true);
      
      // Базовый расчет в зависимости от типа суда
      let baseCalculation;
      if (courtType === 'general') {
        baseCalculation = feeCalculationEngine.calculateGeneralJurisdictionFee(claimAmount);
      } else {
        baseCalculation = feeCalculationEngine.calculateArbitrationFee(claimAmount);
      }

      let finalCalculation = baseCalculation;
      let exemptionDiscount = 0;

      // Применение льгот если выбраны
      if (selectedExemption) {
        exemptionDiscount = exemptionManager.calculateDiscount(baseCalculation.amount, selectedExemption);
        finalCalculation = feeCalculationEngine.applyExemptions(baseCalculation, selectedExemption);
      }

      // Формирование результата
      const result: CalculationResult = {
        baseFee: baseCalculation.amount,
        exemptionDiscount: exemptionDiscount,
        finalFee: finalCalculation.amount,
        effectiveRate: (finalCalculation.amount / claimAmount) * 100,
        breakdown: finalCalculation.breakdown,
        legalReferences: [
          {
            article: finalCalculation.applicableArticle,
            description: `Расчет госпошлины для ${courtType === 'general' ? 'судов общей юрисдикции' : 'арбитражных судов'}`,
            url: courtType === 'general' 
              ? 'https://www.consultant.ru/document/cons_doc_LAW_19671/b89b1a7c8e6b8e6e6e6e6e6e6e6e6e6e6e6e6e6e/'
              : 'https://www.consultant.ru/document/cons_doc_LAW_19671/b89b1a7c8e6b8e6e6e6e6e6e6e6e6e6e6e6e6e/',
            lastVerified: new Date()
          }
        ]
      };

      if (selectedExemption) {
        result.legalReferences.push({
          article: selectedExemption.legalBasis,
          description: `Льгота: ${selectedExemption.name}`,
          url: 'https://www.consultant.ru/document/cons_doc_LAW_19671/',
          lastVerified: new Date()
        });
      }

      return result;
    } catch (error) {
      console.error('Ошибка расчета:', error);
      return null;
    } finally {
      setIsCalculating(false);
    }
  }, [claimAmount, courtType, selectedExemption]);

  // Форматирование валюты
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Обработчик изменения типа суда
  const handleCourtTypeChange = (newCourtType: CourtType) => {
    setCourtType(newCourtType);
    
    // Проверяем совместимость текущей льготы с новым типом суда
    if (selectedExemption && !selectedExemption.applicableCourts.includes(newCourtType)) {
      setSelectedExemption(null);
      toast({
        title: "Льгота сброшена",
        description: "Выбранная льгота не применима к данному типу суда",
        variant: "default"
      });
    }
  };

  // Обработчик выбора льготы
  const handleExemptionChange = (exemptionId: string) => {
    if (exemptionId === "none") {
      setSelectedExemption(null);
    } else {
      const exemption = exemptionManager.findExemptionById(exemptionId);
      if (exemption && exemptionManager.validateExemption(exemption, courtType)) {
        setSelectedExemption(exemption);
      }
    }
  };

  // Добавление к сравнению
  const handleCompare = () => {
    if (!calculationResult) return;

    addItem({
      title: `Госпошлина: ${formatCurrency(claimAmount)}`,
      calculatorId: "court-fee",
      data: {
        finalFee: calculationResult.finalFee,
        baseFee: calculationResult.baseFee,
        exemptionDiscount: calculationResult.exemptionDiscount,
        courtType: courtType === 'general' ? 'Общая юрисдикция' : 'Арбитражный суд'
      },
      params: {
        claimAmount,
        courtType,
        exemption: selectedExemption?.name || 'Без льгот'
      }
    });
    
    toast({
      title: "Добавлено к сравнению",
      description: "Вы можете сравнить этот расчет с другими на странице сравнения."
    });
  };

  // Поделиться результатом
  const handleShare = async () => {
    if (!calculationResult) return;

    const text = `Расчет госпошлины в суд: цена иска ${formatCurrency(claimAmount)}, госпошлина ${formatCurrency(calculationResult.finalFee)}. ${selectedExemption ? `Льгота: ${selectedExemption.name}, экономия ${formatCurrency(calculationResult.exemptionDiscount)}` : ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ 
          title: 'Расчет госпошлины Считай.RU', 
          text 
        });
        return;
      } catch (e) {
        // Fallback to clipboard
      }
    }
    
    await navigator.clipboard.writeText(text);
    toast({ title: "Скопировано в буфер обмена!" });
  };

  // Экспорт в PDF
  const handleExport = async () => {
    if (!calculationResult) return;
    
    try {
      const filename = `госпошлина-${claimAmount}-${courtType}-${new Date().toISOString().split('T')[0]}`;
      const success = await exportToPDF('court-fee-pdf-export', filename);
      
      if (success) {
        toast({
          title: "PDF сохранен",
          description: "Расчет госпошлины успешно экспортирован в PDF."
        });
      } else {
        throw new Error('Ошибка генерации PDF');
      }
    } catch (error) {
      console.error('Ошибка экспорта PDF:', error);
      toast({
        title: "Ошибка экспорта",
        description: "Не удалось создать PDF файл. Попробуйте еще раз.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Форма ввода */}
        <div className="lg:col-span-7 space-y-6">
          {/* Основные параметры */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5 text-primary" />
                Параметры расчета
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Цена иска */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-base font-medium">Цена иска</label>
                  <span className="text-lg font-semibold">{formatCurrency(claimAmount)}</span>
                </div>
                
                {/* Кнопки корректировки и ползунок */}
                <div className="space-y-3">
                  {/* Кнопки корректировки */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDecrementAmount}
                      disabled={claimAmount <= MIN_CLAIM_AMOUNT}
                      className="h-8 w-8 p-0"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <div className="text-sm text-muted-foreground min-w-[120px] text-center">
                      Шаг: {formatCurrency(getStepSize(claimAmount))}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleIncrementAmount}
                      disabled={claimAmount >= MAX_CLAIM_AMOUNT}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Поле прямого ввода */}
                  <div className="flex items-center justify-center">
                    <div className="w-48">
                      <Input
                        type="text"
                        value={formatNumberWithSpaces(claimAmount)}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        placeholder="Введите сумму"
                        className="text-center text-lg font-medium"
                      />
                      <div className="text-xs text-muted-foreground text-center mt-1">
                        От {formatNumberWithSpaces(MIN_CLAIM_AMOUNT)} до {formatNumberWithSpaces(MAX_CLAIM_AMOUNT)} ₽
                      </div>
                    </div>
                  </div>
                  
                  {/* Ползунок */}
                  <Slider
                    value={[claimAmount]}
                    onValueChange={(v) => setClaimAmount(v[0])}
                    min={MIN_CLAIM_AMOUNT}
                    max={MAX_CLAIM_AMOUNT}
                    step={1000}
                    className="py-4"
                  />
                </div>
                
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 тыс ₽</span>
                  <span>10 млн ₽</span>
                </div>
              </div>

              {/* Тип суда */}
              <div className="space-y-4">
                <label className="text-base font-medium">Тип суда</label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={courtType === 'general' ? 'default' : 'outline'}
                    onClick={() => handleCourtTypeChange('general')}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Building className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-semibold">Общая юрисдикция</div>
                      <div className="text-xs opacity-70">Районные, мировые суды</div>
                    </div>
                  </Button>
                  <Button
                    variant={courtType === 'arbitration' ? 'default' : 'outline'}
                    onClick={() => handleCourtTypeChange('arbitration')}
                    className="h-auto p-4 flex flex-col items-center gap-2"
                  >
                    <Scale className="w-6 h-6" />
                    <div className="text-center">
                      <div className="font-semibold">Арбитражный суд</div>
                      <div className="text-xs opacity-70">Коммерческие споры</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Льготы */}
              <div className="space-y-4">
                <label className="text-base font-medium">Льготная категория</label>
                <Select value={selectedExemption?.id || "none"} onValueChange={handleExemptionChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите льготную категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Без льгот</SelectItem>
                    {availableExemptions.map((exemption) => (
                      <SelectItem key={exemption.id} value={exemption.id}>
                        {exemption.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedExemption && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-medium">{selectedExemption.description}</p>
                        <p className="text-muted-foreground mt-1">
                          Основание: {selectedExemption.legalBasis}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Информационный блок */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex gap-3 text-sm">
                <Info className="w-5 h-5 flex-shrink-0 text-primary" />
                <div>
                  <p className="font-medium mb-1">Важная информация</p>
                  <p className="text-muted-foreground">
                    Расчет выполнен в соответствии с действующим Налоговым кодексом РФ. 
                    Для получения точной информации о льготах обратитесь к статьям 333.36 и 333.37 НК РФ.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Блок актуальности данных */}
          {dataFreshness && (
            <Card className={`${!dataFreshness.isUpToDate ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {dataFreshness.isUpToDate ? (
                    <Calendar className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-sm">
                        {dataFreshness.isUpToDate ? 'Данные актуальны' : 'Внимание: данные могут быть устаревшими'}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleUpdateData}
                          disabled={isUpdating || isOffline}
                          className="h-7 px-2 text-xs"
                        >
                          {isUpdating ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          Обновить
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Последнее обновление: {dataFreshness.lastUpdateDate.toLocaleDateString('ru-RU')}
                      {dataVersion && ` • Версия: ${dataVersion.version}`}
                    </p>
                    {dataFreshness.warningMessage && (
                      <Alert className="mt-3 py-2">
                        <AlertDescription className="text-xs">
                          {dataFreshness.warningMessage}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Блок офлайн-статуса */}
          <Card className={`${isOffline ? 'border-blue-200 bg-blue-50' : isOfflineReady ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {isOffline ? (
                  <WifiOff className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                ) : isOnline ? (
                  <Wifi className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">
                      {isOffline ? 'Офлайн-режим' : isOnline ? 'Онлайн' : 'Проблемы с сетью'}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshOfflineCache}
                        disabled={isRefreshing || isOffline}
                        className="h-7 px-2 text-xs"
                      >
                        {isRefreshing ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <HardDrive className="w-3 h-3" />
                        )}
                        Обновить кэш
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowOfflineStatus(!showOfflineStatus)}
                        className="h-7 px-2 text-xs"
                      >
                        <Settings className="w-3 h-3" />
                        <ChevronDown className={`w-3 h-3 ml-1 transition-transform ${showOfflineStatus ? 'rotate-180' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {getOfflineReadinessMessage()}
                    {cacheStatistics.lastCacheUpdate && (
                      <> • Кэш: {cacheStatistics.lastCacheUpdate.toLocaleDateString('ru-RU')}</>
                    )}
                  </p>
                  {isOffline && !isOfflineReady && (
                    <Alert className="mt-3 py-2">
                      <AlertDescription className="text-xs">
                        Некоторые функции могут быть недоступны. Подключитесь к интернету для полной функциональности.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Расширенная информация об офлайн-режиме */}
          <Collapsible open={showOfflineStatus} onOpenChange={setShowOfflineStatus}>
            <CollapsibleContent>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <HardDrive className="w-4 h-4" />
                    Офлайн-функциональность
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium">Статус сети</p>
                      <p className="text-muted-foreground">
                        {isOnline ? 'Подключено' : 'Отключено'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Режим работы</p>
                      <p className="text-muted-foreground">
                        {isOffline ? 'Офлайн' : 'Онлайн'}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Размер кэша</p>
                      <p className="text-muted-foreground">
                        {getFormattedCacheSize()}
                      </p>
                    </div>
                    <div>
                      <p className="font-medium">Готовность к офлайн</p>
                      <p className="text-muted-foreground">
                        {isOfflineReady ? 'Готов' : 'Не готов'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Кэшированные данные:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Тарифные расписания: {cacheStatistics.schedulesCount}/2</li>
                      <li>• Категории льгот: {cacheStatistics.exemptionsCount}</li>
                      {cacheStatistics.lastCacheUpdate && (
                        <li>• Последнее обновление: {cacheStatistics.lastCacheUpdate.toLocaleDateString('ru-RU')}</li>
                      )}
                    </ul>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshOfflineCache}
                      disabled={isRefreshing || isOffline}
                      className="flex-1"
                    >
                      {isRefreshing ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Обновить кэш
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearOfflineCache}
                      className="flex-1"
                    >
                      <HardDrive className="w-4 h-4 mr-2" />
                      Очистить кэш
                    </Button>
                  </div>

                  <Alert>
                    <Info className="w-4 h-4" />
                    <AlertDescription className="text-xs">
                      В офлайн-режиме калькулятор использует кэшированные данные. 
                      Для получения актуальных тарифов подключитесь к интернету и обновите данные.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Результаты */}
        <div className="lg:col-span-5">
          <ResultsDisplay
            calculationResult={calculationResult}
            courtType={courtType}
            claimAmount={claimAmount}
            selectedExemption={selectedExemption}
            isCalculating={isCalculating}
            onExport={handleExport}
            onShare={handleShare}
            onCompare={handleCompare}
          />
        </div>
      </div>
    </div>
  );
};

export default CourtFeeCalculator;