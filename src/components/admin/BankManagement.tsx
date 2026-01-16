/**
 * Компонент для управления банками
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Star, Building2, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { useToast } from '../ui/use-toast';
import { BankRepository } from '../../lib/database';
import type { Bank, BankCreateData, BankUpdateData } from '../../types/bank';
import { PageHeader } from './AdminLayout';

export function BankManagement() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBank, setEditingBank] = useState<Bank | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  // Загрузка банков
  useEffect(() => {
    loadBanks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadBanks = async () => {
    try {
      setLoading(true);
      const banksData = await BankRepository.getBanks();
      setBanks(banksData);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список банков',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBank = () => {
    setEditingBank(null);
    setIsDialogOpen(true);
  };

  const handleEditBank = (bank: Bank) => {
    setEditingBank(bank);
    setIsDialogOpen(true);
  };

  const handleDeleteBank = async (bank: Bank) => {
    if (!confirm(`Вы уверены, что хотите удалить банк "${bank.name}"?`)) {
      return;
    }

    try {
      await BankRepository.deleteBank(bank.id);
      await loadBanks();
      toast({
        title: 'Успешно',
        description: 'Банк удален'
      });
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить банк',
        variant: 'destructive'
      });
    }
  };

  const handleSaveBank = async (bankData: BankCreateData | BankUpdateData) => {
    try {
      if (editingBank) {
        await BankRepository.updateBank(editingBank.id, bankData);
        toast({
          title: 'Успешно',
          description: 'Банк обновлен'
        });
      } else {
        await BankRepository.createBank(bankData as BankCreateData);
        toast({
          title: 'Успешно',
          description: 'Банк создан'
        });
      }
      
      setIsDialogOpen(false);
      await loadBanks();
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить банк',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500">Загрузка банков...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Управление банками"
        description="Добавление, редактирование и управление банками-партнерами"
        actions={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreateBank}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить банк
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingBank ? 'Редактировать банк' : 'Добавить новый банк'}
                </DialogTitle>
              </DialogHeader>
              <BankForm
                bank={editingBank}
                onSave={handleSaveBank}
                onCancel={() => setIsDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        }
      />

      {/* Список банков */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {banks.map((bank) => (
          <BankCard
            key={bank.id}
            bank={bank}
            onEdit={() => handleEditBank(bank)}
            onDelete={() => handleDeleteBank(bank)}
          />
        ))}
      </div>

      {banks.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет банков</h3>
          <p className="text-gray-500 mb-4">Начните с добавления первого банка</p>
          <Button onClick={handleCreateBank}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить банк
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Карточка банка
 */
interface BankCardProps {
  bank: Bank;
  onEdit: () => void;
  onDelete: () => void;
}

function BankCard({ bank, onEdit, onDelete }: BankCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {bank.logo_url ? (
              <img
                src={bank.logo_url}
                alt={bank.name}
                className="h-10 w-10 rounded object-contain"
              />
            ) : (
              <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-gray-500" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{bank.name}</CardTitle>
              <p className="text-sm text-gray-500">{bank.short_name}</p>
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
        {/* Рейтинг */}
        {bank.overall_rating && (
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{bank.overall_rating.toFixed(1)}</span>
            <span className="text-xs text-gray-500">общий рейтинг</span>
          </div>
        )}

        {/* Статусы */}
        <div className="flex flex-wrap gap-2">
          {bank.is_partner && (
            <Badge variant="secondary">Партнер</Badge>
          )}
          {bank.commission_rate && (
            <Badge variant="outline">
              Комиссия {bank.commission_rate}%
            </Badge>
          )}
        </div>

        {/* Контакты */}
        <div className="space-y-1 text-sm text-gray-600">
          {bank.phone && (
            <div>Телефон: {bank.phone}</div>
          )}
          {bank.email && (
            <div>Email: {bank.email}</div>
          )}
          {bank.website_url && (
            <div className="flex items-center space-x-1">
              <span>Сайт:</span>
              <a
                href={bank.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center"
              >
                {new URL(bank.website_url).hostname}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>
          )}
        </div>

        {/* Лицензия */}
        {bank.license_number && (
          <div className="text-xs text-gray-500">
            Лицензия ЦБ РФ № {bank.license_number}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Форма создания/редактирования банка
 */
interface BankFormProps {
  bank: Bank | null;
  onSave: (data: BankCreateData | BankUpdateData) => void;
  onCancel: () => void;
}

function BankForm({ bank, onSave, onCancel }: BankFormProps) {
  const [formData, setFormData] = useState<BankCreateData>({
    name: bank?.name || '',
    short_name: bank?.short_name || '',
    logo_url: bank?.logo_url || '',
    website_url: bank?.website_url || '',
    overall_rating: bank?.overall_rating || undefined,
    customer_service_rating: bank?.customer_service_rating || undefined,
    reliability_rating: bank?.reliability_rating || undefined,
    processing_speed_rating: bank?.processing_speed_rating || undefined,
    phone: bank?.phone || '',
    email: bank?.email || '',
    address: bank?.address || '',
    license_number: bank?.license_number || '',
    central_bank_code: bank?.central_bank_code || '',
    is_partner: bank?.is_partner || false,
    commission_rate: bank?.commission_rate || undefined,
    referral_terms: bank?.referral_terms || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof BankCreateData, value: string | number | boolean | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      {/* Основная информация */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Название банка *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="short_name">Короткое название *</Label>
          <Input
            id="short_name"
            value={formData.short_name}
            onChange={(e) => handleChange('short_name', e.target.value)}
            required
          />
        </div>
      </div>

      {/* URL-адреса */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="logo_url">URL логотипа</Label>
          <Input
            id="logo_url"
            type="url"
            value={formData.logo_url}
            onChange={(e) => handleChange('logo_url', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="website_url">Сайт банка</Label>
          <Input
            id="website_url"
            type="url"
            value={formData.website_url}
            onChange={(e) => handleChange('website_url', e.target.value)}
          />
        </div>
      </div>

      {/* Рейтинги */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="overall_rating">Общий рейтинг (0-5)</Label>
          <Input
            id="overall_rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.overall_rating || ''}
            onChange={(e) => handleChange('overall_rating', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
        <div>
          <Label htmlFor="customer_service_rating">Рейтинг сервиса (0-5)</Label>
          <Input
            id="customer_service_rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.customer_service_rating || ''}
            onChange={(e) => handleChange('customer_service_rating', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="reliability_rating">Рейтинг надежности (0-5)</Label>
          <Input
            id="reliability_rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.reliability_rating || ''}
            onChange={(e) => handleChange('reliability_rating', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
        <div>
          <Label htmlFor="processing_speed_rating">Скорость обработки (0-5)</Label>
          <Input
            id="processing_speed_rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.processing_speed_rating || ''}
            onChange={(e) => handleChange('processing_speed_rating', e.target.value ? parseFloat(e.target.value) : undefined)}
          />
        </div>
      </div>

      {/* Контакты */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone">Телефон</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="address">Адрес</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          rows={2}
        />
      </div>

      {/* Лицензия */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="license_number">Номер лицензии ЦБ</Label>
          <Input
            id="license_number"
            value={formData.license_number}
            onChange={(e) => handleChange('license_number', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="central_bank_code">Код ЦБ</Label>
          <Input
            id="central_bank_code"
            value={formData.central_bank_code}
            onChange={(e) => handleChange('central_bank_code', e.target.value)}
          />
        </div>
      </div>

      {/* Партнерство */}
      <div className="flex items-center space-x-2">
        <Switch
          id="is_partner"
          checked={formData.is_partner}
          onCheckedChange={(checked) => handleChange('is_partner', checked)}
        />
        <Label htmlFor="is_partner">Банк-партнер</Label>
      </div>

      {formData.is_partner && (
        <>
          <div>
            <Label htmlFor="commission_rate">Комиссия (%) *</Label>
            <Input
              id="commission_rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.commission_rate || ''}
              onChange={(e) => handleChange('commission_rate', e.target.value ? parseFloat(e.target.value) : undefined)}
              required={formData.is_partner}
            />
          </div>
          <div>
            <Label htmlFor="referral_terms">Условия партнерства</Label>
            <Textarea
              id="referral_terms"
              value={formData.referral_terms}
              onChange={(e) => handleChange('referral_terms', e.target.value)}
              rows={3}
            />
          </div>
        </>
      )}

      {/* Кнопки */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">
          {bank ? 'Обновить' : 'Создать'}
        </Button>
      </div>
    </form>
  );
}