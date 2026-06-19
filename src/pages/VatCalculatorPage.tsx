import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const VatCalculatorPage = () => {
  const [amount, setAmount] = useState<string>('');
  const [rate, setRate] = useState<number>(20);
  const [operation, setOperation] = useState<'extract' | 'add'>('extract');

  const calculateVat = () => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return {
        baseAmount: 0,
        vatAmount: 0,
        totalAmount: 0,
      };
    }

    if (operation === 'extract') {
      const vatAmount = (numericAmount * rate) / (100 + rate);
      const baseAmount = numericAmount - vatAmount;
      return {
        baseAmount,
        vatAmount,
        totalAmount: numericAmount,
      };
    } else {
      const vatAmount = numericAmount * (rate / 100);
      const totalAmount = numericAmount + vatAmount;
      return {
        baseAmount: numericAmount,
        vatAmount,
        totalAmount,
      };
    }
  };

  const results = calculateVat();

  const handlePresetRate = (newRate: number) => {
    setRate(newRate);
  };

  const schemaOrgJSONLD = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Что такое НДС простыми словами?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "НДС (налог на добавленную стоимость) — это косвенный налог, который включен в стоимость большинства товаров и услуг. Фактически его оплачивает конечный потребитель (покупатель), а продавец перечисляет собранные средства в бюджет государства."
        }
      },
      {
        "@type": "Question",
        "name": "Как правильно: выделить или начислить НДС?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Зависит от вашей задачи. Если у вас есть итоговая сумма, которую заплатил клиент, и нужно узнать, сколько в ней налога, нужно 'выделить НДС'. Если у вас есть базовая цена товара, к которой нужно добавить налог перед продажей, нужно 'начислить НДС'."
        }
      },
      {
        "@type": "Question",
        "name": "Зачем нужен калькулятор НДС?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Калькулятор НДС помогает быстро и без ошибок определить сумму налога, базовую стоимость или итоговую цену. Это экономит время предпринимателям, бухгалтерам и обычным покупателям, особенно при расчетах сложных сумм и разных ставок (например, 20% в РФ, 12% в Казахстане)."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>Калькулятор НДС онлайн 2026: выделить и начислить НДС 20%</title>
        <meta name="description" content="Бесплатный калькулятор НДС. Поможет быстро выделить или начислить НДС (20%, 10%, 12%) из любой суммы онлайн. Формулы расчета и актуальные ставки 2026 года." />
        <meta name="keywords" content="калькулятор ндс, расчет ндс, выделить ндс 20, начислить ндс онлайн, калькулятор ндс 2026" />
        <script type="application/ld+json">
          {JSON.stringify(schemaOrgJSONLD)}
        </script>
      </Helmet>

      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <Breadcrumbs items={[
          { label: 'Главная', path: '/' },
          { label: 'Калькуляторы', path: '/all' },
          { label: 'Калькулятор НДС', path: '/calculator/vat' }
        ]} />

        <div className="max-w-4xl mx-auto mt-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Калькулятор НДС онлайн: выделить или начислить налог
            </h1>
            <p className="text-lg text-muted-foreground">
              Быстрый и точный расчет НДС 20%, 10% или 0% (а также ставок для стран СНГ) по актуальным данным 2026 года.
            </p>
          </div>

          <Card className="mb-12 shadow-md">
            <CardHeader>
              <CardTitle>Параметры расчета</CardTitle>
              <CardDescription>Введите сумму и выберите необходимые настройки</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label>Действие с НДС</Label>
                    <RadioGroup
                      value={operation}
                      onValueChange={(val) => setOperation(val as 'extract' | 'add')}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="extract" id="extract" />
                        <Label htmlFor="extract" className="cursor-pointer">Выделить НДС</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="add" id="add" />
                        <Label htmlFor="add" className="cursor-pointer">Начислить НДС</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="amount">Сумма (₽)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Например: 100000"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Ставка НДС (%)</Label>
                    <div className="flex items-center space-x-4">
                      <Input
                        type="number"
                        value={rate}
                        onChange={(e) => setRate(Number(e.target.value))}
                        className="w-24"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => handlePresetRate(20)}>20% (РФ)</Button>
                        <Button variant="outline" size="sm" onClick={() => handlePresetRate(10)}>10%</Button>
                        <Button variant="outline" size="sm" onClick={() => handlePresetRate(12)}>12% (РК)</Button>
                        <Button variant="outline" size="sm" onClick={() => handlePresetRate(0)}>0%</Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg flex flex-col justify-center space-y-4">
                  <h3 className="text-xl font-semibold mb-2">Результаты:</h3>

                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="text-muted-foreground">Сумма без НДС:</span>
                    <span className="font-medium text-lg">{results.baseAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b text-primary">
                    <span className="font-medium">Сумма НДС ({rate}%):</span>
                    <span className="font-bold text-xl">{results.vatAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</span>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-muted-foreground">Итоговая сумма с НДС:</span>
                    <span className="font-bold text-2xl">{results.totalAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <article className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
            <h2>Как работает калькулятор НДС?</h2>
            <p>
              Наш онлайн-инструмент предназначен для быстрого и точного расчета налога на добавленную стоимость. В зависимости от вашей задачи, вы можете использовать две основные функции:
            </p>
            <ul>
              <li><strong>Выделить НДС:</strong> Эта опция нужна, если у вас есть итоговая сумма (например, в чеке или договоре), и вам нужно узнать, какая часть из этой суммы является налогом, а какая — чистой стоимостью товара или услуги.</li>
              <li><strong>Начислить НДС:</strong> Используйте эту функцию, если у вас есть базовая цена (себестоимость + наценка), и вам нужно прибавить к ней налог, чтобы получить итоговую розничную цену для покупателя.</li>
            </ul>

            <h2>Ставки НДС в России и СНГ в 2026 году</h2>
            <p>При расчетах важно учитывать актуальные налоговые ставки, которые зависят от региона и типа товаров:</p>
            <ul>
              <li><strong>20%</strong> — основная ставка в РФ, применяется к большинству товаров и услуг по умолчанию.</li>
              <li><strong>10%</strong> — льготная ставка в РФ, действует для определенных категорий (продукты питания, детские товары, медикаменты, печатная продукция).</li>
              <li><strong>0%</strong> — применяется при экспорте товаров, международных перевозках и некоторых других специфических операциях.</li>
              <li><strong>12%</strong> — актуальная базовая ставка НДС в Казахстане.</li>
              <li><strong>20%</strong> — актуальная базовая ставка НДС в Беларуси.</li>
            </ul>

            <h2>Формулы расчета НДС</h2>
            <p>Если вы хотите произвести расчет самостоятельно, используйте следующие формулы:</p>
            <ul>
              <li><strong>Как выделить НДС 20%:</strong> <code>Сумма с НДС × 20 / 120</code></li>
              <li><strong>Как начислить НДС 20%:</strong> <code>Сумма без НДС × 0.20</code></li>
            </ul>

            <h2 className="mt-12 mb-6">Часто задаваемые вопросы (FAQ)</h2>
            <div className="not-prose mt-6">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                <AccordionTrigger>Что такое НДС простыми словами?</AccordionTrigger>
                <AccordionContent>
                  НДС (налог на добавленную стоимость) — это косвенный налог, который включен в стоимость большинства товаров и услуг. Фактически его оплачивает конечный потребитель (покупатель), а продавец перечисляет собранные средства в бюджет государства.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Как правильно: выделить или начислить НДС?</AccordionTrigger>
                <AccordionContent>
                  Зависит от вашей задачи. Если у вас есть итоговая сумма, которую заплатил клиент, и нужно узнать, сколько в ней налога, нужно "выделить НДС". Если у вас есть базовая цена товара, к которой нужно добавить налог перед продажей, нужно "начислить НДС".
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Зачем нужен калькулятор НДС?</AccordionTrigger>
                <AccordionContent>
                  Калькулятор НДС помогает быстро и без ошибок определить сумму налога, базовую стоимость или итоговую цену. Это экономит время предпринимателям, бухгалтерам и обычным покупателям, особенно при расчетах сложных сумм и разных ставок (например, 20% в РФ, 12% в Казахстане).
                </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </article>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default VatCalculatorPage;
