import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import { SelfEmployedCalculator } from "@/components/calculators/SelfEmployedCalculator";
import { Link } from "react-router-dom";

const SelfEmployedTaxPage = () => {
  const faqItems = [
    {
      question: "Сколько процентов налог самозанятых в 2026 году?",
      answer: "Налог на профессиональный доход (НПД) для самозанятых: 4% с дохода от физических лиц и 6% от юридических лиц. Лимит — 2.4 млн рублей в год. Превышение облагается по обычной ставке НДФЛ 13%."
    },
    {
      question: "Как рассчитать налог самозанятого?",
      answer: "Формула: сумма дохода × ставка (4% или 6%). Например, заработал 100 000 ₽ от физлиц: 100 000 × 4% = 4 000 ₽ налога. Чистый доход: 96 000 ₽. Налог платится ежемесячно до 28 числа."
    },
    {
      question: "Можно ли стать самозанятым в 2026 году?",
      answer: "Да, регистрация через приложение «Мой налог» или Госуслуги. Ограничения: доход до 2.4 млн ₽/год, нельзя нанимать сотрудников, нельзя продавать подакцизные товары. ИП тоже могут перейти на НПД."
    },
    {
      question: "Чем самозанятый отличается от ИП?",
      answer: "Самозанятый (НПД): налог 4-6%, нет отчётности, нет взносов, лимит 2.4 млн ₽. ИП на УСН: налог 6-15%, обязательные страховые взносы ~50 000 ₽/год, отчётность. Самозанятый проще, но с ограничениями."
    },
    {
      question: "Нужно ли платить страховые взносы самозанятым?",
      answer: "Нет, самозанятые (НПД) не платят страховые взносы. Это главное преимущество режима. Но и пенсионный стаж не идёт — нужно отдельно оформлять добровольное страхование для стажа."
    }
  ];

  return (
    <CalculatorPageWrapper
      seoTitle="Налог самозанятых 2026 — калькулятор НПД, сколько платить"
      seoDescription="Калькулятор налога самозанятых 2026: рассчитайте НПД 4% или 6%, чистый доход после налога. Формула, лимит 2.4 млн, сравнение с ИП — бесплатно онлайн."
      seoKeywords="налог самозанятых 2026, НПД калькулятор, самозанятый сколько платить, налог 4 процента, самозанятый калькулятор налогов"
      canonical="https://schitay-online.ru/calculator/self-employed/npd/"
      schemaName="Калькулятор налога самозанятых"
      schemaDescription="Бесплатный онлайн калькулятор налога на профессиональный доход (НПД) для самозанятых в 2026 году"
      title="Налог самозанятых 2026"
      description="Рассчитайте сколько платить налогов как самозанятый — НПД 4% или 6%"
      category="Зарплата и налоги"
      categoryHref="/category/salary"
      faqItems={faqItems}
      calculator={<SelfEmployedCalculator />}
      howToUseSteps={[
        "Введите сумму дохода за месяц",
        "Укажите, от кого доход: физлицо (4%) или юрлицо (6%)",
        "Нажмите «Рассчитать» — калькулятор покажет сумму НПД",
        "Изучите чистый доход после налога и сравнение с другими режимами"
      ]}
      afterCalculator={
        <div className="space-y-4">
          <div className="surface-muted rounded-2xl p-4 md:p-5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Налоги самозанятых в 2026 году
            </h3>
            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p><strong>НПД от физлиц:</strong> 4% — например, 100 000 ₽ × 4% = 4 000 ₽</p>
              <p><strong>НПД от юрлиц:</strong> 6% — например, 100 000 ₽ × 6% = 6 000 ₽</p>
              <p><strong>Лимит:</strong> 2 400 000 ₽ в год, далее — НДФЛ 13%</p>
              <p><strong>Взносы:</strong> не платятся (в отличие от ИП)</p>
              <p><strong>Отчётность:</strong> нет (налоговая всё считает сама)</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/calculator/self-employed/"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Все калькуляторы самозанятых
            </Link>
            <Link
              to="/calculator/salary/"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Калькулятор зарплаты
            </Link>
            <Link
              to="/blog/?q=самозанятый"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Статьи о самозанятых
            </Link>
          </div>
        </div>
      }
      aboutTitle="Налог на профессиональный доход (НПД) в 2026 году"
      aboutDescription="Самозанятые в России платят налог на профессиональный доход (НПД): 4% с дохода от физических лиц и 6% от юридических. Лимит — 2.4 млн рублей в год. Главные преимущества: нет страховых взносов, нет отчётности, регистрация за 5 минут через приложение «Мой налог». Наш калькулятор рассчитает точную сумму налога и чистый доход."
      features={[]}
    />
  );
};

export default SelfEmployedTaxPage;
