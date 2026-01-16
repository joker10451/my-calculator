/**
 * Компонент для массового импорта банковских продуктов
 */

import React, { useState, useRef } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../ui/use-toast';
import { BankRepository, BankProductRepository } from '../../lib/database';
import type { Bank, BankProduct, BankCreateData, BankProductCreateData } from '../../types/bank';

interface ImportResult {
  success: boolean;
  total: number;
  imported: number;
  errors: Array<{
    row: number;
    message: string;
    data?: Record<string, unknown>;
  }>;
}

export function BulkImport() {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'banks' | 'products') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      toast({
        title: 'Ошибка',
        description: 'Поддерживаются только файлы CSV и JSON',
        variant: 'destructive'
      });
      return;
    }

    setImporting(true);
    setProgress(0);
    setImportResult(null);

    try {
      const text = await file.text();
      let data: Record<string, unknown>[];

      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else {
        data = parseCSV(text);
      }

      if (!Array.isArray(data)) {
        throw new Error('Файл должен содержать массив данных');
      }

      const result = type === 'banks' 
        ? await importBanks(data)
        : await importProducts(data);

      setImportResult(result);

      if (result.success) {
        toast({
          title: 'Импорт завершен',
          description: `Импортировано ${result.imported} из ${result.total} записей`
        });
      } else {
        toast({
          title: 'Импорт завершен с ошибками',
          description: `Импортировано ${result.imported} из ${result.total} записей`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка импорта',
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
        variant: 'destructive'
      });
      setImportResult({
        success: false,
        total: 0,
        imported: 0,
        errors: [{ row: 0, message: error instanceof Error ? error.message : 'Неизвестная ошибка' }]
      });
    } finally {
      setImporting(false);
      setProgress(100);
      // Очищаем input для возможности повторного выбора того же файла
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const parseCSV = (text: string): Record<string, unknown>[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV файл должен содержать заголовки и хотя бы одну строку данных');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, unknown> = {};
      
      headers.forEach((header, index) => {
        let value: string | number | boolean | Record<string, unknown> = values[index] || '';
        
        // Попытка преобразования типов
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (value && !isNaN(Number(value))) value = Number(value);
        else if (value && value.startsWith('{') && value.endsWith('}')) {
          try {
            value = JSON.parse(value);
          } catch {
            // Оставляем как строку если не удалось распарсить JSON
          }
        }
        
        row[header] = value;
      });
      
      data.push(row);
    }

    return data;
  };

  const importBanks = async (data: Record<string, unknown>[]): Promise<ImportResult> => {
    const result: ImportResult = {
      success: true,
      total: data.length,
      imported: 0,
      errors: []
    };

    for (let i = 0; i < data.length; i++) {
      setProgress((i / data.length) * 100);
      
      try {
        const bankData: BankCreateData = {
          name: data[i].name || data[i].Название || '',
          short_name: data[i].short_name || data[i]['Короткое название'] || data[i].name || '',
          logo_url: data[i].logo_url || data[i]['URL логотипа'] || '',
          website_url: data[i].website_url || data[i]['Сайт'] || '',
          overall_rating: parseFloat(data[i].overall_rating || data[i]['Общий рейтинг'] || '0') || undefined,
          customer_service_rating: parseFloat(data[i].customer_service_rating || data[i]['Рейтинг сервиса'] || '0') || undefined,
          reliability_rating: parseFloat(data[i].reliability_rating || data[i]['Рейтинг надежности'] || '0') || undefined,
          processing_speed_rating: parseFloat(data[i].processing_speed_rating || data[i]['Скорость обработки'] || '0') || undefined,
          phone: data[i].phone || data[i]['Телефон'] || '',
          email: data[i].email || data[i]['Email'] || '',
          address: data[i].address || data[i]['Адрес'] || '',
          license_number: data[i].license_number || data[i]['Номер лицензии'] || '',
          central_bank_code: data[i].central_bank_code || data[i]['Код ЦБ'] || '',
          is_partner: Boolean(data[i].is_partner || data[i]['Партнер'] || false),
          commission_rate: parseFloat(data[i].commission_rate || data[i]['Комиссия'] || '0') || undefined,
          referral_terms: data[i].referral_terms || data[i]['Условия партнерства'] || ''
        };

        if (!bankData.name) {
          throw new Error('Отсутствует название банка');
        }

        await BankRepository.createBank(bankData);
        result.imported++;
      } catch (error) {
        result.success = false;
        result.errors.push({
          row: i + 1,
          message: error instanceof Error ? error.message : 'Неизвестная ошибка',
          data: data[i]
        });
      }
    }

    return result;
  };

  const importProducts = async (data: Record<string, unknown>[]): Promise<ImportResult> => {
    const result: ImportResult = {
      success: true,
      total: data.length,
      imported: 0,
      errors: []
    };

    // Получаем список банков для сопоставления
    const banks = await BankRepository.getBanks();
    const bankMap = new Map<string, string>();
    banks.forEach(bank => {
      bankMap.set(bank.name.toLowerCase(), bank.id);
      bankMap.set(bank.short_name.toLowerCase(), bank.id);
    });

    for (let i = 0; i < data.length; i++) {
      setProgress((i / data.length) * 100);
      
      try {
        const bankName = (data[i].bank_name || data[i]['Банк'] || '').toLowerCase();
        const bankId = bankMap.get(bankName);
        
        if (!bankId) {
          throw new Error(`Банк "${bankName}" не найден в системе`);
        }

        const productData: BankProductCreateData = {
          bank_id: bankId,
          product_type: (data[i].product_type || data[i]['Тип продукта'] || 'mortgage').toLowerCase() as 'mortgage' | 'deposit' | 'credit' | 'insurance',
          name: data[i].name || data[i]['Название'] || '',
          description: data[i].description || data[i]['Описание'] || '',
          interest_rate: parseFloat(data[i].interest_rate || data[i]['Процентная ставка'] || '0'),
          min_amount: parseInt(data[i].min_amount || data[i]['Мин. сумма'] || '0') || undefined,
          max_amount: parseInt(data[i].max_amount || data[i]['Макс. сумма'] || '0') || undefined,
          min_term: parseInt(data[i].min_term || data[i]['Мин. срок'] || '0') || undefined,
          max_term: parseInt(data[i].max_term || data[i]['Макс. срок'] || '0') || undefined,
          fees: typeof data[i].fees === 'object' ? data[i].fees : {},
          requirements: typeof data[i].requirements === 'object' ? data[i].requirements : {},
          features: typeof data[i].features === 'object' ? data[i].features : {},
          promotional_rate: parseFloat(data[i].promotional_rate || data[i]['Промо-ставка'] || '0') || undefined,
          promo_valid_until: data[i].promo_valid_until || data[i]['Промо до'] || '',
          promo_conditions: data[i].promo_conditions || data[i]['Условия промо'] || '',
          available_regions: Array.isArray(data[i].available_regions) 
            ? data[i].available_regions as string[]
            : String(data[i].available_regions || data[i]['Регионы'] || 'all').split(',').map((r: string) => r.trim()),
          is_active: Boolean(data[i].is_active !== undefined ? data[i].is_active : data[i]['Активен'] !== undefined ? data[i]['Активен'] : true),
          is_featured: Boolean(data[i].is_featured || data[i]['Рекомендуемый'] || false),
          priority: parseInt(data[i].priority || data[i]['Приоритет'] || '0') || 0
        };

        if (!productData.name) {
          throw new Error('Отсутствует название продукта');
        }

        if (!productData.interest_rate) {
          throw new Error('Отсутствует процентная ставка');
        }

        await BankProductRepository.createProduct(productData);
        result.imported++;
      } catch (error) {
        result.success = false;
        result.errors.push({
          row: i + 1,
          message: error instanceof Error ? error.message : 'Неизвестная ошибка',
          data: data[i]
        });
      }
    }

    return result;
  };

  const downloadTemplate = (type: 'banks' | 'products') => {
    let csvContent = '';
    
    if (type === 'banks') {
      csvContent = [
        'name,short_name,logo_url,website_url,overall_rating,customer_service_rating,reliability_rating,processing_speed_rating,phone,email,address,license_number,central_bank_code,is_partner,commission_rate,referral_terms',
        'Пример Банк,ПримерБанк,https://example.com/logo.png,https://example.com,4.5,4.2,4.8,4.1,+7 (800) 123-45-67,info@example.com,"г. Москва, ул. Примерная, д. 1",1234,044525000,true,0.15,"Комиссия 0.15% от суммы кредита"'
      ].join('\n');
    } else {
      csvContent = [
        'bank_name,product_type,name,description,interest_rate,min_amount,max_amount,min_term,max_term,fees,requirements,features,promotional_rate,promo_valid_until,promo_conditions,available_regions,is_active,is_featured,priority',
        'Пример Банк,mortgage,"Ипотека на готовое жилье","Кредит на покупку готового жилья",16.5,500000,30000000,12,360,"{}","{}","{}",15.9,2024-12-31,"Специальная ставка для новых клиентов","moscow,spb,all",true,true,10'
      ].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `template_${type}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Массовый импорт данных</h2>
        <p className="text-gray-600">
          Загрузите файлы CSV или JSON для массового добавления банков и продуктов
        </p>
      </div>

      <Tabs defaultValue="banks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="banks">Импорт банков</TabsTrigger>
          <TabsTrigger value="products">Импорт продуктов</TabsTrigger>
        </TabsList>

        <TabsContent value="banks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Импорт банков</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Поддерживаются файлы CSV и JSON. Обязательные поля: название банка.
                </AlertDescription>
              </Alert>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate('banks')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Скачать шаблон CSV
                </Button>

                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json"
                    onChange={(e) => handleFileUpload(e, 'banks')}
                    className="hidden"
                    id="banks-file-input"
                  />
                  <Button
                    onClick={() => document.getElementById('banks-file-input')?.click()}
                    disabled={importing}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {importing ? 'Импорт...' : 'Выбрать файл'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span>Импорт продуктов</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Поддерживаются файлы CSV и JSON. Обязательные поля: название банка, название продукта, процентная ставка.
                  Банки должны быть предварительно добавлены в систему.
                </AlertDescription>
              </Alert>

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => downloadTemplate('products')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Скачать шаблон CSV
                </Button>

                <div className="flex-1">
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={(e) => handleFileUpload(e, 'products')}
                    className="hidden"
                    id="products-file-input"
                  />
                  <Button
                    onClick={() => document.getElementById('products-file-input')?.click()}
                    disabled={importing}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {importing ? 'Импорт...' : 'Выбрать файл'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Прогресс импорта */}
      {importing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Импорт данных...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Результаты импорта */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {importResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
              <span>Результаты импорта</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{importResult.total}</div>
                <div className="text-sm text-gray-500">Всего записей</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{importResult.imported}</div>
                <div className="text-sm text-gray-500">Импортировано</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                <div className="text-sm text-gray-500">Ошибок</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Ошибки импорта:</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {importResult.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between">
                          <span>Строка {error.row}: {error.message}</span>
                          <Badge variant="outline">Ошибка</Badge>
                        </div>
                        {error.data && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs">Показать данные</summary>
                            <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-x-auto">
                              {JSON.stringify(error.data, null, 2)}
                            </pre>
                          </details>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Инструкции */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Инструкции по импорту</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Формат CSV:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Первая строка должна содержать заголовки столбцов</li>
              <li>Используйте запятую как разделитель</li>
              <li>Заключайте текст в кавычки, если он содержит запятые</li>
              <li>Для JSON-полей (fees, requirements, features) используйте валидный JSON</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Формат JSON:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Файл должен содержать массив объектов</li>
              <li>Каждый объект представляет одну запись</li>
              <li>Используйте правильные типы данных (числа, булевы значения)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-2">Рекомендации:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Сначала импортируйте банки, затем продукты</li>
              <li>Проверьте данные перед импортом</li>
              <li>Делайте резервные копии перед массовыми операциями</li>
              <li>Импортируйте данные небольшими порциями (до 1000 записей)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}