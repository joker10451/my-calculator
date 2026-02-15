import React, { useState, useMemo } from 'react';
import { Calculator, ArrowRightLeft, TrendingDown, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Scenario {
  propertyValue: number;
  downPayment: number;
  rate: number;
  term: number;
}

const calculateMortgage = (scenario: Scenario) => {
  const loanAmount = scenario.propertyValue - scenario.downPayment;
  const monthlyRate = scenario.rate / 100 / 12;
  const numberOfPayments = scenario.term * 12;
  
  if (monthlyRate === 0) {
    const monthlyPayment = loanAmount / numberOfPayments;
    return {
      loanAmount,
      monthlyPayment,
      totalPayment: loanAmount,
      totalInterest: 0
    };
  }
  
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;
  
  return {
    loanAmount,
    monthlyPayment,
    totalPayment,
    totalInterest
  };
};

export const MortgageScenarioComparison = () => {
  const [scenarioA, setScenarioA] = useState<Scenario>({
    propertyValue: 8000000,
    downPayment: 1600000,
    rate: 18,
    term: 20
  });

  const [scenarioB, setScenarioB] = useState<Scenario>({
    propertyValue: 8000000,
    downPayment: 3200000,
    rate: 17,
    term: 15
  });

  const [isOpen, setIsOpen] = useState(true);

  const resultA = useMemo(() => calculateMortgage(scenarioA), [scenarioA]);
  const resultB = useMemo(() => calculateMortgage(scenarioB), [scenarioB]);

  const diff = {
    monthlyPayment: resultA.monthlyPayment - resultB.monthlyPayment,
    totalInterest: resultA.totalInterest - resultB.totalInterest,
    totalPayment: resultA.totalPayment - resultB.totalPayment,
    years: scenarioA.term - scenarioB.term,
    downPayment: scenarioB.downPayment - scenarioA.downPayment
  };

  const isBetterB = diff.totalPayment > 0;

  const updateScenario = (scenario: 'A' | 'B', field: keyof Scenario, value: number) => {
    if (scenario === 'A') {
      setScenarioA(prev => ({ ...prev, [field]: value }));
    } else {
      setScenarioB(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <Card className="w-full border-2 border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <ArrowRightLeft className="w-6 h-6 text-primary" />
          Сравнение двух сценариев ипотеки
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Сравните два варианта: разные первоначальные взносы, сроки или ставки от разных банков. 
          Увидьте реальную экономию в цифрах.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full flex justify-between items-center">
              <span className="flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                Настроить сценарии
              </span>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Scenario A */}
            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-4 text-blue-700 dark:text-blue-400">Сценарий А</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Стоимость жилья, ₽</Label>
                  <Input
                    type="number"
                    value={scenarioA.propertyValue}
                    onChange={(e) => updateScenario('A', 'propertyValue', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Первый взнос, ₽</Label>
                  <Input
                    type="number"
                    value={scenarioA.downPayment}
                    onChange={(e) => updateScenario('A', 'downPayment', Number(e.target.value))}
                    className="mt-1"
                  />
                  <Slider
                    value={[scenarioA.downPayment]}
                    onValueChange={([v]) => updateScenario('A', 'downPayment', v)}
                    max={scenarioA.propertyValue}
                    step={100000}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs">Ставка, %</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={scenarioA.rate}
                    onChange={(e) => updateScenario('A', 'rate', Number(e.target.value))}
                    className="mt-1"
                  />
                  <Slider
                    value={[scenarioA.rate]}
                    onValueChange={([v]) => updateScenario('A', 'rate', v)}
                    max={30}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs">Срок, лет</Label>
                  <Input
                    type="number"
                    value={scenarioA.term}
                    onChange={(e) => updateScenario('A', 'term', Number(e.target.value))}
                    className="mt-1"
                  />
                  <Slider
                    value={[scenarioA.term]}
                    onValueChange={([v]) => updateScenario('A', 'term', v)}
                    max={30}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Scenario B */}
            <div className="p-4 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold mb-4 text-green-700 dark:text-green-400">Сценарий Б</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">Стоимость жилья, ₽</Label>
                  <Input
                    type="number"
                    value={scenarioB.propertyValue}
                    onChange={(e) => updateScenario('B', 'propertyValue', Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">Первый взнос, ₽</Label>
                  <Input
                    type="number"
                    value={scenarioB.downPayment}
                    onChange={(e) => updateScenario('B', 'downPayment', Number(e.target.value))}
                    className="mt-1"
                  />
                  <Slider
                    value={[scenarioB.downPayment]}
                    onValueChange={([v]) => updateScenario('B', 'downPayment', v)}
                    max={scenarioB.propertyValue}
                    step={100000}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs">Ставка, %</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={scenarioB.rate}
                    onChange={(e) => updateScenario('B', 'rate', Number(e.target.value))}
                    className="mt-1"
                  />
                  <Slider
                    value={[scenarioB.rate]}
                    onValueChange={([v]) => updateScenario('B', 'rate', v)}
                    max={30}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-xs">Срок, лет</Label>
                  <Input
                    type="number"
                    value={scenarioB.term}
                    onChange={(e) => updateScenario('B', 'term', Number(e.target.value))}
                    className="mt-1"
                  />
                  <Slider
                    value={[scenarioB.term]}
                    onValueChange={([v]) => updateScenario('B', 'term', v)}
                    max={30}
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
          {/* Result A */}
          <div className="p-4 bg-blue-50/30 dark:bg-blue-900/5 rounded-lg border border-blue-100 dark:border-blue-800/30">
            <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-400 text-center">Сценарий А</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Сумма кредита:</span>
                <span className="font-medium">{formatCurrency(resultA.loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ежемесячный:</span>
                <span className="font-medium">{formatCurrency(resultA.monthlyPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Переплата:</span>
                <span className="font-medium text-red-500">{formatCurrency(resultA.totalInterest)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Общая:</span>
                <span className="font-bold">{formatCurrency(resultA.totalPayment)}</span>
              </div>
            </div>
          </div>

          {/* Result B */}
          <div className="p-4 bg-green-50/30 dark:bg-green-900/5 rounded-lg border border-green-100 dark:border-green-800/30">
            <h4 className="font-semibold mb-3 text-green-700 dark:text-green-400 text-center">Сценарий Б</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Сумма кредита:</span>
                <span className="font-medium">{formatCurrency(resultB.loanAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ежемесячный:</span>
                <span className="font-medium">{formatCurrency(resultB.monthlyPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Переплата:</span>
                <span className="font-medium text-red-500">{formatCurrency(resultB.totalInterest)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-muted-foreground">Общая:</span>
                <span className="font-bold">{formatCurrency(resultB.totalPayment)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Winner */}
        <div className={`p-4 rounded-lg border-2 ${isBetterB ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'}`}>
          <div className="flex items-center gap-3 mb-3">
            <TrendingDown className={`w-6 h-6 ${isBetterB ? 'text-green-600' : 'text-blue-600'}`} />
            <h4 className="font-bold text-lg">
              {isBetterB ? 'Сценарий Б выгоднее!' : 'Сценарий А выгоднее!'}
            </h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(Math.abs(diff.monthlyPayment))}
              </div>
              <div className="text-xs text-muted-foreground">
                {diff.monthlyPayment > 0 ? 'меньше в месяц' : 'больше в месяц'}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(Math.abs(diff.totalInterest))}
              </div>
              <div className="text-xs text-muted-foreground">экономия на %</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(Math.abs(diff.totalPayment))}
              </div>
              <div className="text-xs text-muted-foreground">общая экономия</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {Math.abs(diff.years)} лет
              </div>
              <div className="text-xs text-muted-foreground">
                {diff.years > 0 ? 'раньше свободны' : 'дольше кредит'}
              </div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-amber-800 dark:text-amber-400 mb-1">Аналитика</h5>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {isBetterB ? (
                  <>
                    Сценарий Б экономит <strong>{formatCurrency(Math.abs(diff.totalPayment))}</strong> и освобождает от ипотеки на <strong>{Math.abs(diff.years)} лет раньше</strong>. 
                    Дополнительный первоначальный взнос {formatCurrency(diff.downPayment)} окупается за счёт снижения процентов.
                  </>
                ) : (
                  <>
                    Сценарий А выгоднее общей экономией <strong>{formatCurrency(Math.abs(diff.totalPayment))}</strong>. 
                    При меньшем первоначальном взносе у вас остаётся больше свободных средств для других целей.
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

export default MortgageScenarioComparison;
