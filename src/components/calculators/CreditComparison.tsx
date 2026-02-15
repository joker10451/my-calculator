import React, { useState, useMemo } from 'react';
import { CreditCard, ArrowRightLeft, TrendingDown, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { formatCurrency } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface CreditScenario {
  loanAmount: number;
  rate: number;
  term: number;
}

const calculateCredit = (scenario: CreditScenario) => {
  const monthlyRate = scenario.rate / 100 / 12;
  const numberOfPayments = scenario.term * 12;
  
  if (monthlyRate === 0) {
    const monthlyPayment = scenario.loanAmount / numberOfPayments;
    return {
      monthlyPayment,
      totalPayment: scenario.loanAmount,
      totalInterest: 0
    };
  }
  
  const monthlyPayment = scenario.loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - scenario.loanAmount;
  
  return {
    monthlyPayment,
    totalPayment,
    totalInterest
  };
};

export const CreditComparison = () => {
  const [scenarioA, setScenarioA] = useState<CreditScenario>({
    loanAmount: 500000,
    rate: 20,
    term: 3
  });

  const [scenarioB, setScenarioB] = useState<CreditScenario>({
    loanAmount: 500000,
    rate: 18,
    term: 2
  });

  const [isOpen, setIsOpen] = useState(true);

  const resultA = useMemo(() => calculateCredit(scenarioA), [scenarioA]);
  const resultB = useMemo(() => calculateCredit(scenarioB), [scenarioB]);

  const diff = {
    monthlyPayment: resultA.monthlyPayment - resultB.monthlyPayment,
    totalInterest: resultA.totalInterest - resultB.totalInterest,
    totalPayment: resultA.totalPayment - resultB.totalPayment,
    years: scenarioA.term - scenarioB.term
  };

  const isBetterB = diff.totalPayment > 0;

  const updateScenario = (scenario: 'A' | 'B', field: keyof CreditScenario, value: number) => {
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
          Сравнение кредитов от разных банков
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Сравните два варианта потребительского кредита: разные ставки, суммы и сроки от разных банков.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full flex justify-between items-center">
              <span className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Настроить сценарии
              </span>
              {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Bank A */}
            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800">
              <h3 className="font-semibold mb-4 text-blue-700 dark:text-blue-400">Банк А</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Сумма кредита, ₽</Label>
                  <Input
                    type="number"
                    value={scenarioA.loanAmount}
                    onChange={(e) => updateScenario('A', 'loanAmount', Number(e.target.value))}
                    className="mt-1"
                  />
                  <Slider
                    value={[scenarioA.loanAmount]}
                    onValueChange={([v]) => updateScenario('A', 'loanAmount', v)}
                    max={5000000}
                    step={10000}
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
                    min={5}
                    max={50}
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
                    min={1}
                    max={7}
                    step={1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            {/* Bank B */}
            <div className="p-4 bg-green-50/50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold mb-4 text-green-700 dark:text-green-400">Банк Б</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Сумма кредита, ₽</Label>
                  <Input
                    type="number"
                    value={scenarioB.loanAmount}
                    onChange={(e) => updateScenario('B', 'loanAmount', Number(e.target.value))}
                    className="mt-1"
                  />
                  <Slider
                    value={[scenarioB.loanAmount]}
                    onValueChange={([v]) => updateScenario('B', 'loanAmount', v)}
                    max={5000000}
                    step={10000}
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
                    min={5}
                    max={50}
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
                    min={1}
                    max={7}
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
          <div className="p-3 md:p-4 bg-blue-50/30 dark:bg-blue-900/5 rounded-lg border border-blue-100 dark:border-blue-800/30 overflow-hidden">
            <h4 className="font-semibold mb-3 text-blue-700 dark:text-blue-400 text-center text-sm md:text-base">Банк А</h4>
            <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">В месяц:</span>
                <span className="font-medium text-right break-all">{formatCurrency(resultA.monthlyPayment)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Переплата:</span>
                <span className="font-medium text-red-500 text-right break-all">{formatCurrency(resultA.totalInterest)}</span>
              </div>
              <div className="flex justify-between border-t pt-1.5 md:pt-2 gap-2">
                <span className="text-muted-foreground">Всего:</span>
                <span className="font-bold text-right break-all">{formatCurrency(resultA.totalPayment)}</span>
              </div>
            </div>
          </div>

          {/* Result B */}
          <div className="p-3 md:p-4 bg-green-50/30 dark:bg-green-900/5 rounded-lg border border-green-100 dark:border-green-800/30 overflow-hidden">
            <h4 className="font-semibold mb-3 text-green-700 dark:text-green-400 text-center text-sm md:text-base">Банк Б</h4>
            <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">В месяц:</span>
                <span className="font-medium text-right break-all">{formatCurrency(resultB.monthlyPayment)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-muted-foreground">Переплата:</span>
                <span className="font-medium text-red-500 text-right break-all">{formatCurrency(resultB.totalInterest)}</span>
              </div>
              <div className="flex justify-between border-t pt-1.5 md:pt-2 gap-2">
                <span className="text-muted-foreground">Всего:</span>
                <span className="font-bold text-right break-all">{formatCurrency(resultB.totalPayment)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Winner */}
        <div className={`p-4 rounded-lg border-2 ${isBetterB ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'}`}>
          <div className="flex items-center gap-3 mb-3">
            <TrendingDown className={`w-6 h-6 ${isBetterB ? 'text-green-600' : 'text-blue-600'}`} />
            <h4 className="font-bold text-lg">
              {isBetterB ? 'Банк Б выгоднее!' : 'Банк А выгоднее!'}
            </h4>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
            <div className="p-2">
              <div className="text-lg md:text-xl font-bold text-green-600 break-all">
                {formatCurrency(Math.abs(diff.monthlyPayment))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {diff.monthlyPayment > 0 ? 'меньше в месяц' : 'больше в месяц'}
              </div>
            </div>
            <div className="p-2">
              <div className="text-lg md:text-xl font-bold text-green-600 break-all">
                {formatCurrency(Math.abs(diff.totalInterest))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">экономия на %</div>
            </div>
            <div className="p-2">
              <div className="text-lg md:text-xl font-bold text-green-600 break-all">
                {formatCurrency(Math.abs(diff.totalPayment))}
              </div>
              <div className="text-xs text-muted-foreground mt-1">общая экономия</div>
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-amber-800 dark:text-amber-400 mb-1">Вывод</h5>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {isBetterB ? (
                  <>
                    Банк Б экономит <strong>{formatCurrency(Math.abs(diff.totalPayment))}</strong>. 
                    При разнице в ставке всего {Math.abs(scenarioA.rate - scenarioB.rate)}% экономия составляет значительную сумму.
                  </>
                ) : (
                  <>
                    Банк А выгоднее на <strong>{formatCurrency(Math.abs(diff.totalPayment))}</strong>. 
                    Даже небольшая разница в ставке существенно влияет на переплату при длительном сроке.
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

export default CreditComparison;
