/**
 * Калькулятор ОСАГО
 * Расчет стоимости полиса обязательного страхования
 */

import { useState, useMemo, useEffect } from "react";
import { Car, Shield, MapPin, Calendar, Users, Award } from "lucide-react";
import { CalculatorActions } from "@/components/CalculatorActions";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { CalculationHistoryItem } from "@/hooks/useCalculatorHistory";
import { useCalculatorCommon } from "@/hooks/useCalculatorCommon";

const OSAGOCalculator = () => {
  const { formatCurrency, saveCalculation } = useCalculatorCommon('osago', 'Калькулятор ОСАГО');
  
  // Базовые ставки 2026 (примерные)
  const BASE_RATES = {
    car: 5980,
    truck: 7200,
    motorcycle: 1850,
    bus: 8100
  };

  // Коэффициенты
  const REGION_COEFFICIENTS: Record<string, number> = {
    moscow: 2.0,
    spb: 1.8,
    ekb: 1.6,
    nsk: 1.5,
    kzn: 1.4,
    other: 1.2
  };

  const AGE_EXPERIENCE_COEFFICIENTS: Record<string, number> = {
    'young': 1.8,      // до 22 лет, стаж до 3 лет
    'middle': 1.0,     // 22+ лет, стаж 3+ лет
    'experienced': 0.95 // опытный водитель
  };

  const POWER_COEFFICIENTS: Record<string, number> = {
    'low': 0.6,        // до 50 л.с.
    'medium': 1.0,     // 50-100 л.с.
    'high': 1.4,       // 100-150 л.с.
    'very_high': 1.6   // более 150 л.с.
  };

  const [vehicleType, setVehicleType] = useState<'car' | 'truck' | 'motorcycle' | 'bus'>('car');
  const [region, setRegion] = useState('moscow');
  const [power, setPower] = useState('medium');
  const [ageExperience, setAgeExperience] = useState('middle');
  const [drivers, setDrivers] = useState<'limited' | 'unlimited'>('limited');
  const [kbm, setKbm] = useState(1.0); // Коэффициент бонус-малус
  const [period, setPeriod] = useState(12); // месяцев

  const calculation = useMemo(() => {
    const baseRate = BASE_RATES[vehicleType];
    const regionCoef = REGION_COEFFICIENTS[region];
    const powerCoef = POWER_COEFFICIENTS[power];
    const ageCoef = AGE_EXPERIENCE_COEFFICIENTS[ageExperience];
    const driversCoef = drivers === 'unlimited' ? 1.8 : 1.0;
    const periodCoef = period === 12 ? 1.0 : period / 12 * 0.7;

    const cost = Math.round(
      baseRate * 
      regionCoef * 
      powerCoef * 
      ageCoef * 
      driversCoef * 
      kbm * 
      periodCoef
    );

    return {
      cost,
      baseRate,
      coefficients: {
        region: regionCoef,
        power: powerCoef,
        age: ageCoef,
        drivers: driversCoef,
        kbm,
        period: periodCoef
      }
    };
  }, [vehicleType, region, power, ageExperience, drivers, kbm, period]);

  const getKBMDescription = (kbm: number) => {
    if (kbm >= 2.0) return "Много аварий";
    if (kbm >= 1.5) return "Есть аварии";
    if (kbm === 1.0) return "Без аварий (новичок)";
    if (kbm >= 0.7) return "Хорошая история";
    return "Отличная история";
  };

  // Сохранение расчета в историю
  useEffect(() => {
    if (calculation.cost > 0) {
      saveCalculation(
        { vehicleType, region, power, ageExperience, drivers, kbm, period },
        {
          'Стоимость': formatCurrency(calculation.cost),
          'Тип ТС': vehicleType === 'car' ? 'Легковой' : vehicleType === 'truck' ? 'Грузовой' : vehicleType === 'motorcycle' ? 'Мотоцикл' : 'Автобус',
          'Регион': region,
          'КБМ': kbm.toFixed(2),
          'Срок': `${period} мес.`
        }
      );
    }
  }, [calculation.cost, vehicleType, region, power, ageExperience, drivers, kbm, period, saveCalculation, formatCurrency]);

  // Данные для экспорта
  const exportData = [
    { Параметр: 'Тип ТС', Значение: vehicleType === 'car' ? 'Легковой' : vehicleType === 'truck' ? 'Грузовой' : vehicleType === 'motorcycle' ? 'Мотоцикл' : 'Автобус' },
    { Параметр: 'Регион', Значение: region },
    { Параметр: 'Мощность', Значение: power },
    { Параметр: 'Возраст/стаж', Значение: ageExperience },
    { Параметр: 'Водители', Значение: drivers === 'limited' ? 'Ограниченный' : 'Без ограничений' },
    { Параметр: 'КБМ', Значение: kbm.toFixed(2) },
    { Параметр: 'Срок', Значение: `${period} мес.` },
    { Параметр: 'Базовая ставка', Значение: formatCurrency(calculation.baseRate) },
    { Параметр: 'Итоговая стоимость', Значение: formatCurrency(calculation.cost) }
  ];

  // Параметры для share
  const shareParams = {
    vehicleType,
    region,
    power,
    ageExperience,
    drivers,
    kbm,
    period
  };

  // Загрузка расчета из истории
  const handleLoadCalculation = (item: CalculationHistoryItem) => {
    const inputs = item.inputs;
    setVehicleType(inputs.vehicleType);
    setRegion(inputs.region);
    setPower(inputs.power);
    setAgeExperience(inputs.ageExperience);
    setDrivers(inputs.drivers);
    setKbm(inputs.kbm);
    setPeriod(inputs.period);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Панель действий */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Расчет ОСАГО</h2>
        <div className="flex items-center gap-2">
          <CalculatorHistory 
            calculatorType="osago"
            onLoadCalculation={handleLoadCalculation}
          />
          <CalculatorActions
            calculatorId="osago"
            calculatorName="ОСАГО"
            data={exportData}
            printElementId="osago-results"
            shareParams={shareParams}
          />
        </div>
      </div>
      {/* Тип ТС */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <Car className="w-5 h-5 text-primary" />
          Тип транспортного средства
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'car', label: 'Легковой' },
            { value: 'truck', label: 'Грузовой' },
            { value: 'motorcycle', label: 'Мотоцикл' },
            { value: 'bus', label: 'Автобус' }
          ].map(type => (
            <button
              key={type.value}
              onClick={() => setVehicleType(type.value as 'car' | 'truck' | 'bus' | 'motorcycle')}
              className={`p-4 rounded-xl border-2 transition-all ${
                vehicleType === type.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold">{type.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Регион */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Регион регистрации
        </h3>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full p-3 rounded-lg border bg-background"
        >
          <option value="moscow">Москва (коэф. 2.0)</option>
          <option value="spb">Санкт-Петербург (коэф. 1.8)</option>
          <option value="ekb">Екатеринбург (коэф. 1.6)</option>
          <option value="nsk">Новосибирск (коэф. 1.5)</option>
          <option value="kzn">Казань (коэф. 1.4)</option>
          <option value="other">Другой регион (коэф. 1.2)</option>
        </select>
      </div>

      {/* Мощность */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Мощность двигателя
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { value: 'low', label: 'До 50 л.с.' },
            { value: 'medium', label: '50-100 л.с.' },
            { value: 'high', label: '100-150 л.с.' },
            { value: 'very_high', label: 'Более 150 л.с.' }
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setPower(p.value)}
              className={`p-3 rounded-xl border-2 transition-all text-sm ${
                power === p.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Возраст и стаж */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          Возраст и стаж водителя
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { value: 'young', label: 'Молодой водитель', desc: 'До 22 лет, стаж до 3 лет' },
            { value: 'middle', label: 'Средний опыт', desc: '22+ лет, стаж 3+ лет' },
            { value: 'experienced', label: 'Опытный', desc: 'Большой стаж' }
          ].map(age => (
            <button
              key={age.value}
              onClick={() => setAgeExperience(age.value)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                ageExperience === age.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold">{age.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{age.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Количество водителей */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold">Допущенные водители</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
            <input
              type="radio"
              checked={drivers === 'limited'}
              onChange={() => setDrivers('limited')}
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium">Ограниченный список</div>
              <div className="text-sm text-muted-foreground">Указанные водители</div>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50">
            <input
              type="radio"
              checked={drivers === 'unlimited'}
              onChange={() => setDrivers('unlimited')}
              className="w-4 h-4"
            />
            <div>
              <div className="font-medium">Без ограничений</div>
              <div className="text-sm text-muted-foreground">Любой водитель (+80%)</div>
            </div>
          </label>
        </div>
      </div>

      {/* КБМ */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Коэффициент бонус-малус (КБМ)
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>КБМ: {kbm.toFixed(2)}</span>
            <span className="text-muted-foreground">{getKBMDescription(kbm)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.45"
            step="0.05"
            value={kbm}
            onChange={(e) => setKbm(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0.5 (макс. скидка)</span>
            <span>2.45 (макс. надбавка)</span>
          </div>
        </div>
      </div>

      {/* Срок */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="font-bold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Срок страхования
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[3, 6, 12].map(m => (
            <button
              key={m}
              onClick={() => setPeriod(m)}
              className={`p-3 rounded-xl border-2 transition-all ${
                period === m
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="font-semibold">{m} мес.</div>
            </button>
          ))}
        </div>
      </div>

      {/* Результат */}
      <div id="osago-results" className="glass-card p-6 bg-primary/5 border-primary/20">
        <h3 className="text-xl font-bold mb-4">Стоимость полиса ОСАГО</h3>
        <div className="text-4xl font-bold text-primary mb-6">
          {formatCurrency(calculation.cost)}
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Базовая ставка:</span>
            <span className="font-medium">{formatCurrency(calculation.baseRate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Коэффициент региона:</span>
            <span className="font-medium">×{calculation.coefficients.region}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Коэффициент мощности:</span>
            <span className="font-medium">×{calculation.coefficients.power}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Коэффициент возраста/стажа:</span>
            <span className="font-medium">×{calculation.coefficients.age}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">КБМ:</span>
            <span className="font-medium">×{calculation.coefficients.kbm}</span>
          </div>
          {drivers === 'unlimited' && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Без ограничений:</span>
              <span className="font-medium">×{calculation.coefficients.drivers}</span>
            </div>
          )}
          {period !== 12 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Срок {period} мес.:</span>
              <span className="font-medium">×{calculation.coefficients.period.toFixed(2)}</span>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-background/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            ⚠️ Расчет является примерным. Точную стоимость уточняйте в страховых компаниях.
            Коэффициенты актуальны на 2026 год.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OSAGOCalculator;
