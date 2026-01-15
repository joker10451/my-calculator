/**
 * Компонент для управления банковскими продуктами
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Search, Upload, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useToast } from '../ui/use-toast';
import { BankRepository, BankProductRepository } from '../../lib/database';
import type { 
  Bank, 
  BankProduct, 
  BankProductCreateData, 
  BankProductUpdateData, 
  ProductFilters,
  ProductType 
} from '../../types/bank';
import { PageHeader } from './AdminLayout';

export function ProductManagement() {
  const [products, setProducts] = useState<BankProduct[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<BankProduct | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Загрузка данных
  useEffect(() => {
    loadData();
  }, []);

  // Применение фильтров
  useEffect(() => {
    loadProducts();
  }, [filters, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, banksData] = await Promise.all([
        BankProductRepository.getProducts(),
        BankRepository.getBanks()
      ]);
      setProducts(productsData);
      setBanks(banksData);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить данные',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const currentFilters = {
        ...filters,
        search_query: searchQuery || undefined
      };
      const productsData = await BankProductRepository.getProducts(currentFilters);
      setProducts(productsData);
    } catch (error) {
      console.error('Ошибка загрузки продуктов:', error);
    }
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: BankProduct) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteProduct = async (product: BankProduct) => {
    if (!confirm(`Вы уверены, что хотите удалить продукт "${product.name}"?`)) {
      return;
    }

    try {
      await BankProductRepository.deleteProduct(product.id);
      await loadProducts();
      toast({
        title: 'Успешно',
        description: 'Продукт удален'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить продукт',
        variant: 'destructive'
      });
    }
  };

  const handleSaveProduct = async (productData: BankProductCreateData | BankProductUpdateData) => {
    try {
      if (editingProduct) {
        await BankProductRepository.updateProduct(editingProduct.id, productData);
        toast({
          title: 'Успешно',
          description: 'Продукт обновлен'
        });
      } else {
        await BankProductRepository.createProduct(productData as BankProductCreateData);
        toast({
          title: 'Успешно',
          description: 'Продукт создан'
        });
      }
      
      setIsDialogOpen(false);
      await loadProducts();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить продукт',
        variant: 'destructive'
      });
    }
  };

  const handleBulkImport = () => {
    // TODO: Реализовать массовый импорт
    toast({
      title: 'В разработке',
      description: 'Функция массового импорта будет добавлена позже'
    });
  };

  const handleExport = () => {
    // TODO: Реализовать экспорт
    toast({
      title: 'В разработке',
      description: 'Функция экспорта будет добавлена позже'
    });
  };

  const getBankName = (bankId: string) => {
    const bank = banks.find(b => b.id === bankId);
    return bank?.name || 'Неизвестный банк';
  };

  const getProductTypeLabel = (type: ProductType) => {
    const labels = {
      mortgage: 'Ипотека',
      deposit: 'Вклад',
      credit: 'Кредит',
      insurance: 'Страхование'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Загрузка продуктов...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Управление продуктами"
        description="Добавление, редактирование и управление банковскими продуктами"
        actions={
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleBulkImport}>
              <Upload className="h-4 w-4 mr-2" />
              Импорт
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleCreateProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить продукт
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Редактировать продукт' : 'Добавить новый продукт'}
                  </DialogTitle>
                </DialogHeader>
                <ProductForm
                  product={editingProduct}
                  banks={banks}
                  onSave={handleSaveProduct}
                  onCancel={() => setIsDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Фильтры и поиск */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Фильтры</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Поиск</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Поиск по названию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="product_type">Тип продукта</Label>
              <Select
                value={filters.product_type || ''}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  product_type: value as ProductType || undefined 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все типы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все типы</SelectItem>
                  <SelectItem value="mortgage">Ипотека</SelectItem>
                  <SelectItem value="deposit">Вклады</SelectItem>
                  <SelectItem value="credit">Кредиты</SelectItem>
                  <SelectItem value="insurance">Страхование</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bank_id">Банк</Label>
              <Select
                value={filters.bank_id || ''}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  bank_id: value || undefined 
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все банки" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все банки</SelectItem>
                  {banks.map(bank => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="is_active">Статус</Label>
              <Select
                value={filters.is_active?.toString() || ''}
                onValueChange={(value) => setFilters(prev => ({ 
                  ...prev, 
                  is_active: value === '' ? undefined : value === 'true'
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Все статусы" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Все статусы</SelectItem>
                  <SelectItem value="true">Активные</SelectItem>
                  <SelectItem value="false">Неактивные</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Список продуктов */}
      <div className="grid gap-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            bankName={getBankName(product.bank_id)}
            onEdit={() => handleEditProduct(product)}
            onDelete={() => handleDeleteProduct(product)}
          />
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет продуктов</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || Object.keys(filters).length > 0 
              ? 'Не найдено продуктов по заданным критериям'
              : 'Начните с добавления первого продукта'
            }
          </p>
          {!searchQuery && Object.keys(filters).length === 0 && (
            <Button onClick={handleCreateProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Добавить продукт
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Карточка продукта
 */
interface ProductCardProps {
  product: BankProduct;
  bankName: string;
  onEdit: () => void;
  onDelete: () => void;
}

function ProductCard({ product, bankName, onEdit, onDelete }: ProductCardProps) {
  const getProductTypeLabel = (type: ProductType) => {
    const labels = {
      mortgage: 'Ипотека',
      deposit: 'Вклад',
      credit: 'Кредит',
      insurance: 'Страхование'
    };
    return labels[type] || type;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-lg">{product.name}</CardTitle>
              <Badge variant={product.is_active ? 'default' : 'secondary'}>
                {product.is_active ? 'Активен' : 'Неактивен'}
              </Badge>
              {product.is_featured && (
                <Badge variant="outline">Рекомендуемый</Badge>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{bankName}</span>
              <span>•</span>
              <span>{getProductTypeLabel(product.product_type)}</span>
              <span>•</span>
              <span className="font-medium text-blue-600">
                {product.interest_rate}% годовых
              </span>
            </div>
          </div>
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {product.description && (
          <p className="text-sm text-gray-600">{product.description}</p>
        )}

        {/* Основные параметры */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {product.min_amount && (
            <div>
              <span className="text-gray-500">Мин. сумма:</span>
              <div className="font-medium">{formatCurrency(product.min_amount)}</div>
            </div>
          )}
          {product.max_amount && (
            <div>
              <span className="text-gray-500">Макс. сумма:</span>
              <div className="font-medium">{formatCurrency(product.max_amount)}</div>
            </div>
          )}
          {product.min_term && (
            <div>
              <span className="text-gray-500">Мин. срок:</span>
              <div className="font-medium">{product.min_term} мес.</div>
            </div>
          )}
          {product.max_term && (
            <div>
              <span className="text-gray-500">Макс. срок:</span>
              <div className="font-medium">{product.max_term} мес.</div>
            </div>
          )}
        </div>

        {/* Промо-условия */}
        {product.promotional_rate && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-yellow-800">
                  Промо-ставка: {product.promotional_rate}%
                </span>
                {product.promo_valid_until && (
                  <div className="text-xs text-yellow-600">
                    До {new Date(product.promo_valid_until).toLocaleDateString('ru-RU')}
                  </div>
                )}
              </div>
            </div>
            {product.promo_conditions && (
              <p className="text-xs text-yellow-700 mt-1">{product.promo_conditions}</p>
            )}
          </div>
        )}

        {/* Регионы */}
        {product.available_regions.length > 0 && !product.available_regions.includes('all') && (
          <div>
            <span className="text-xs text-gray-500">Доступно в регионах:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {product.available_regions.slice(0, 3).map(region => (
                <Badge key={region} variant="outline" className="text-xs">
                  {region}
                </Badge>
              ))}
              {product.available_regions.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.available_regions.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Форма создания/редактирования продукта
 */
interface ProductFormProps {
  product: BankProduct | null;
  banks: Bank[];
  onSave: (data: BankProductCreateData | BankProductUpdateData) => void;
  onCancel: () => void;
}

function ProductForm({ product, banks, onSave, onCancel }: ProductFormProps) {
  const [formData, setFormData] = useState<BankProductCreateData>({
    bank_id: product?.bank_id || '',
    product_type: product?.product_type || 'mortgage',
    name: product?.name || '',
    description: product?.description || '',
    interest_rate: product?.interest_rate || 0,
    min_amount: product?.min_amount || undefined,
    max_amount: product?.max_amount || undefined,
    min_term: product?.min_term || undefined,
    max_term: product?.max_term || undefined,
    fees: product?.fees || {},
    requirements: product?.requirements || {},
    features: product?.features || {},
    promotional_rate: product?.promotional_rate || undefined,
    promo_valid_until: product?.promo_valid_until || '',
    promo_conditions: product?.promo_conditions || '',
    available_regions: product?.available_regions || ['all'],
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    priority: product?.priority || 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof BankProductCreateData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Основное</TabsTrigger>
          <TabsTrigger value="conditions">Условия</TabsTrigger>
          <TabsTrigger value="features">Особенности</TabsTrigger>
          <TabsTrigger value="promo">Промо</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          {/* Основная информация */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bank_id">Банк *</Label>
              <Select
                value={formData.bank_id}
                onValueChange={(value) => handleChange('bank_id', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите банк" />
                </SelectTrigger>
                <SelectContent>
                  {banks.map(bank => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="product_type">Тип продукта *</Label>
              <Select
                value={formData.product_type}
                onValueChange={(value) => handleChange('product_type', value as ProductType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mortgage">Ипотека</SelectItem>
                  <SelectItem value="deposit">Вклад</SelectItem>
                  <SelectItem value="credit">Кредит</SelectItem>
                  <SelectItem value="insurance">Страхование</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="name">Название продукта *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="interest_rate">Процентная ставка (%) *</Label>
            <Input
              id="interest_rate"
              type="number"
              min="0"
              step="0.01"
              value={formData.interest_rate}
              onChange={(e) => handleChange('interest_rate', parseFloat(e.target.value) || 0)}
              required
            />
          </div>
        </TabsContent>

        <TabsContent value="conditions" className="space-y-4">
          {/* Суммы и сроки */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_amount">Минимальная сумма</Label>
              <Input
                id="min_amount"
                type="number"
                min="0"
                value={formData.min_amount || ''}
                onChange={(e) => handleChange('min_amount', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
            <div>
              <Label htmlFor="max_amount">Максимальная сумма</Label>
              <Input
                id="max_amount"
                type="number"
                min="0"
                value={formData.max_amount || ''}
                onChange={(e) => handleChange('max_amount', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_term">Минимальный срок (мес.)</Label>
              <Input
                id="min_term"
                type="number"
                min="1"
                value={formData.min_term || ''}
                onChange={(e) => handleChange('min_term', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
            <div>
              <Label htmlFor="max_term">Максимальный срок (мес.)</Label>
              <Input
                id="max_term"
                type="number"
                min="1"
                value={formData.max_term || ''}
                onChange={(e) => handleChange('max_term', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>

          {/* Комиссии */}
          <div>
            <Label>Комиссии (JSON)</Label>
            <Textarea
              value={JSON.stringify(formData.fees, null, 2)}
              onChange={(e) => {
                try {
                  const fees = JSON.parse(e.target.value);
                  handleChange('fees', fees);
                } catch {
                  // Игнорируем ошибки парсинга во время ввода
                }
              }}
              rows={4}
              placeholder='{"application": 0, "monthly": 500}'
            />
          </div>

          {/* Требования */}
          <div>
            <Label>Требования (JSON)</Label>
            <Textarea
              value={JSON.stringify(formData.requirements, null, 2)}
              onChange={(e) => {
                try {
                  const requirements = JSON.parse(e.target.value);
                  handleChange('requirements', requirements);
                } catch {
                  // Игнорируем ошибки парсинга во время ввода
                }
              }}
              rows={4}
              placeholder='{"min_income": 50000, "min_age": 21}'
            />
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          {/* Особенности */}
          <div>
            <Label>Особенности продукта (JSON)</Label>
            <Textarea
              value={JSON.stringify(formData.features, null, 2)}
              onChange={(e) => {
                try {
                  const features = JSON.parse(e.target.value);
                  handleChange('features', features);
                } catch {
                  // Игнорируем ошибки парсинга во время ввода
                }
              }}
              rows={6}
              placeholder='{"early_repayment": true, "grace_period": false}'
            />
          </div>

          {/* Регионы */}
          <div>
            <Label htmlFor="available_regions">Доступные регионы (через запятую)</Label>
            <Input
              id="available_regions"
              value={formData.available_regions.join(', ')}
              onChange={(e) => {
                const regions = e.target.value.split(',').map(r => r.trim()).filter(r => r);
                handleChange('available_regions', regions.length > 0 ? regions : ['all']);
              }}
              placeholder="moscow, spb, all"
            />
          </div>

          {/* Статусы */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange('is_active', checked)}
              />
              <Label htmlFor="is_active">Активный продукт</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_featured"
                checked={formData.is_featured}
                onCheckedChange={(checked) => handleChange('is_featured', checked)}
              />
              <Label htmlFor="is_featured">Рекомендуемый продукт</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="priority">Приоритет (0-100)</Label>
            <Input
              id="priority"
              type="number"
              min="0"
              max="100"
              value={formData.priority}
              onChange={(e) => handleChange('priority', parseInt(e.target.value) || 0)}
            />
          </div>
        </TabsContent>

        <TabsContent value="promo" className="space-y-4">
          {/* Промо-условия */}
          <div>
            <Label htmlFor="promotional_rate">Промо-ставка (%)</Label>
            <Input
              id="promotional_rate"
              type="number"
              min="0"
              step="0.01"
              value={formData.promotional_rate || ''}
              onChange={(e) => handleChange('promotional_rate', e.target.value ? parseFloat(e.target.value) : undefined)}
            />
          </div>

          <div>
            <Label htmlFor="promo_valid_until">Действует до</Label>
            <Input
              id="promo_valid_until"
              type="date"
              value={formData.promo_valid_until}
              onChange={(e) => handleChange('promo_valid_until', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="promo_conditions">Условия промо</Label>
            <Textarea
              id="promo_conditions"
              value={formData.promo_conditions}
              onChange={(e) => handleChange('promo_conditions', e.target.value)}
              rows={4}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Кнопки */}
      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">
          {product ? 'Обновить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
}