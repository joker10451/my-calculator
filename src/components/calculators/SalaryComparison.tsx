import React, { useState, useMemo } from 'react';
import { Wallet, ArrowRightLeft, TrendingDown, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SalaryScenario {
  grossSalary: number;
  hasNDFL: boolean;
  ndflRate: number;
}

const calculateSalary = (scenario: SalaryScenario) => {
  const ndfl = scenario.hasNDFL ? scenario.grossSalary * (scenario.ndflRate / 100) : 0;
  const netSalary = scenario.grossSalary - ndfl;
  const yearGross = scenario.grossSalary * 12;
  const yearNDFL = ndfl * 12;
  const yearNet = netSalary * 12;
  
  return {
    ndfl,
    netSalary,
    yearGross,
    yearNDFL,
    yearNet
  };
};

export const SalaryComparison = () => {
  const [scenarioA, setScenarioA] = useState<SalaryScenario>({
    grossSalary: 100000,
    hasNDFL: true,
    ndflRate: 13
  });

  const [scenarioB, setScenarioB] = useState<SalaryScenario>({
    grossSalary: 120000,
    hasNDFL: true,
    ndflRate: 13
  });

  const [isOpen, setIsOpen] = useState(true);

  const resultA = useMemo(() => calculateSalary(scenarioA), [scenarioA]);
  const resultB = useMemo(() => calculateSalary(scenarioB), [scenarioB]);

  const diff = {
    gross: scenarioB.grossSalary - scenarioA.grossSalary,
    net: resultB.netSalary - resultA.netSalary,
    yearGross: resultB.yearGross - resultA.yearGross,
    yearNet: resultB.yearNet - resultA.yearNet,
    ndfl: resultB.yearNDFL - resultA.yearNDFL
  };

  const isBetterB = diff.yearNet > 0;

  return (
    <Card className="w-full border-2 border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <ArrowRightLeft className="w-6 h-6 text-primary" />
          Сравнение двух вариантов зарплаты
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Сравните две зарплаты: текущую и предлагаемую. Узнайте реальную разницу "на руки" с учетом НДФЛ.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full flex justify-between items-center">
              <span className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Настроить сценарии
              </span>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Current Job */}
            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-4 text-blue-700 dark:text-blue-400">Текущая работа</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Зарплата до вычета (гросс), ₽</Label>
                  <Input
                    type="number"
                    value={scenarioA.grossSalary}
                    onChange={(e) => setScenarioA({...scenarioA, grossSalary: Number(e.target.value)})}
                    className="mt-1"
                  />
                  <Slider
                    value={[scenarioA.grossSalary]}
                    onValueChange={([v]) => setScenarioA({...scenarioA, grossSalary: v})}
                    min={20000}
                    max={500000}
                    step={5000}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs">Ставка НДФЛ, %</Label>
                  <Input
                    type="number"
                    value={scenarioA.ndflRate}
                    onChange={(e) => setScenarioA({...scenarioA, ndflRate: Number(e.target.value)})}
                    className="mt-1"
                  />
                  <Slider
                    value={[scenarioA.ndflRate]}
                    onValueChange={([v]) => setScenarioA({...scenarioA, ndflRate: v})}
                    min={13}
                    max={15}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* New Job */}
            <div className="p-4 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold mb-4 text-green-700 dark:text-green-400">Новое предложение</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Зарплата до вычета (гросс), ₽</Label>
                  <Input
                    type="number"
                    value={scenarioB.grossSalary}
                    onChange={(e) => setScenarioB({...scenarioB, grossSalary: Number(e.target.value)})}
                    className="mt-1"
                  />
                  <Slider
                    value={[scenarioB.grossSalary]}
                    onValueChange={([v]) => setScenarioB({...scenarioB, grossSalary: v})}
                    min={20000}
                    max={500000}
                    step={5000}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs">Ставка НДФЛ, %</Label>
                  <Input
                    type="number"
                    value={scenarioB.ndflRate}
                    onChange={(e) => setScenarioB({...scenarioB, ndflRate: Number(e.target.value)})}
                    className="mt-1"
                  />
                  <Slider
                    value={[scenarioB.ndflRate]}
                    onValueChange={([v]) => setScenarioB({...scenarioB, ndflRate: v})}
                    min={13}
                    max={15}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Results */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Current */}
          <div className="p-3 md:p-4 bg-blue-50/30 dark:bg-blue-900/5 rounded-lg border border-blue-100 dark:border-blue-800/30 overflow-hidden">
            <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-400 text-center text-sm md:text-base">Текущая</h4>
            <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">До вычета:</span>
                <span className="font-medium text-right break-all">{formatCurrency(scenarioA.grossSalary)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">НДФL:</span>
                <span className="font-medium text-red-500 text-right break-all">-{formatCurrency(resultA.ndfl)}</span>
              </div>
              <div className="flex justify-between gap-2 border-t pt-1.5 md:pt-2">
                <span className="text-muted-foreground">На руки:</span>
                <span className="font-bold text-green-600 text-right break-all">{formatCurrency(resultA.netSalary)}</span>
              </div>
            </div>
          </div>

          {/* New */}
          <div className="p-3 md:p-4 bg-green-50/30 dark:bg-green-900/5 rounded-lg border border-green-100 dark:border-green-800/30 overflow-hidden">
            <h4 className="font-semibold mb-3 text-green-700 dark:text-green-400 text-center text-sm md:text-base">Новая</h4>
            <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">До вычета:</span>
                <span className="font-medium text-right break-all">{formatCurrency(scenarioB.grossSalary)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">НДФL:</span>
                <span className="font-medium text-red-500 text-right break-all">-{formatCurrency(resultB.ndfl)}</span>
              </div>
              <div className="flex justify-between gap-2 border-t pt-1.5 md:pt-2">
                <span className="text-muted-foreground">На руки:</span>
                <span className="font-bold text-green-600 text-right break-all">{formatCurrency(resultB.netSalary)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Winner */}
        <div className={`p-4 rounded-lg border-2 ${isBetterB ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'}`}>
          <div className="flex items-center gap-3 mb-3">
            <TrendingDown className={`w-6 h-6 ${isBetterB ? 'text-green-600' : 'text-red-600'}`} />
            <h4 className="font-bold text-lg">
              {isBetterB ? 'Новое предложение лучше!' : 'Текущая работа выгоднее'}
            </h4>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-2">
              <div className="text-lg md:text-xl font-bold text-green-600 break-all">
                {formatCurrency(Math.abs(diff.net))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {isBetterB ? 'больше в месяц' : 'меньше в месяц'}
              </div>
            </div>
            <div className="p-2">
              <div className="text-lg md:text-xl font-bold text-green-600 break-all">
                {formatCurrency(Math.abs(diff.yearNet))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">разница в год</div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-amber-800 dark:text-amber-400 mb-1">Анализ</h5>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {isBetterB ? (
                  <>
                    Новое предложение выгоднее на <strong>{formatCurrency(Math.abs(diff.yearNet))}</strong> в год. 
                    Это {formatCurrency(Math.abs(diff.net))} больше каждый месяц "на руки".
                  </>
                ) : (
                  <>
                    Текущая работа выгоднее на <strong>{formatCurrency(Math.abs(diff.yearNet))}</strong> в год. 
                    Новое предложение смотрится привлекательнее, но реальная разница меньше из-за НДФЛ.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SalaryComparison;
