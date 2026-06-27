import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import AlimonyCalculator from "@/components/calculators/AlimonyCalculator";
import { Link } from "react-router-dom";

const AlimonyTwoChildrenPage = () => {
  const faqItems = [
    {
      question: "Сколько процентов алиментов на двоих детей в 2026 году?",
      answer: "По Семейному кодексу РФ (ст. 81), на двоих детей взыскивается 33% от дохода плательщика. Это одна треть всех доходов: зарплаты, пенсии, пособия, авторские гонорары. Минимальная сумма привязана к МРОТ региона."
    },
    {
      question: "Как рассчитать алименты на двоих детей, если отец не работает?",
      answer: "Если плательщик не имеет официального дохода, алименты назначаются в твердой денежной сумме. Суд определяет размер на основе прожиточного минимума на детей в регионе. Обычно это 0.5–1 прожиточный минимум на каждого ребенка."
    },
    {
      question: "Можно ли увеличить алименты на двоих детей?",
      answer: "Да, если изменились обстоятельства: выросли расходы на лечение, образование детей, появились дополнительные потребности. Подайте исковое заявление в суд с обоснованием увеличения суммы."
    },
    {
      question: "Алименты на двоих детей от разных браков",
      answer: "На каждого ребенка от разных браков назначается по 16.5% (половина от 33%). Итого плательщик отдает 33% от дохода, дел поровну между детьми. Суд не может назначить больше 50% на двоих детей."
    },
    {
      question: "Какие документы нужны для подачи на алименты на двоих детей?",
      answer: "Понадобятся: свидетельства о рождении обоих детей, паспорт, справка о доходах плательщика (если есть), документ о браке или разводе, справка о составе семьи. Иск подается в мировой суд по месту жительства."
    }
  ];

  return (
    <CalculatorPageWrapper
      seoTitle="Алименты на двоих детей 2026 — расчет онлайн, сколько процентов"
      seoDescription="Калькулятор алиментов на двоих детей 2026: рассчитайте сколько платить — 33% от зарплаты или твердая сумма. Формула по Семейному кодексу РФ, примеры расчета."
      seoKeywords="алименты на двоих детей 2026, сколько процентов алиментов на двоих детей, калькулятор алиментов на двоих, алименты на 2 детей, 33 процента алименты"
      canonical="https://schitay-online.ru/calculator/alimony/dvoih-detey/"
      schemaName="Калькулятор алиментов на двоих детей"
      schemaDescription="Бесплатный онлайн калькулятор алиментов на двоих детей с учетом ставок 2026 года"
      title="Алименты на двоих детей 2026"
      description="Рассчитайте размер алиментов на двоих детей: 33% от дохода или твердая сумма"
      category="Семейные"
      categoryHref="/category/family"
      faqItems={faqItems}
      calculator={<AlimonyCalculator />}
      howToUseSteps={[
        "Укажите количество детей — 2",
        "Введите размер дохода плательщика алиментов",
        "Выберите способ взыскания: процент от дохода или твердая сумма",
        "Нажмите «Рассчитать» — получите точную сумму алиментов"
      ]}
      afterCalculator={
        <div className="space-y-4">
          <div className="surface-muted rounded-2xl p-4 md:p-5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Важно знать об алиментах на двоих детей
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <li>• <strong>33%</strong> — стандартная ставка на двоих детей (ст. 81 СК РФ)</li>
              <li>• Алименты удерживаются со <strong>всех видов дохода</strong>: зарплата, пенсия, пособия</li>
              <li>• <strong>Безработный</strong> плательщик — алименты в твердой сумме по прожиточному минимуму</li>
              <li>• <strong>Исковая давность</strong> — 3 года, если доказать попытки взыскания</li>
              <li>• За <strong>уклонение</strong> — штраф, исполнительный лист, ограничение выезда</li>
            </ul>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/calculator/alimony/"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Все калькуляторы алиментов
            </Link>
            <Link
              to="/calculator/salary/"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Калькулятор зарплаты
            </Link>
            <Link
              to="/blog/?q=алименты"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Статьи об алиментах
            </Link>
          </div>
        </div>
      }
      aboutTitle="Алименты на двоих детей в 2026 году"
      aboutDescription="Алименты на двоих детей составляют 33% от дохода плательщика по статье 81 Семейного кодекса РФ. Это одна треть всех видов заработка: зарплата, пенсия, пособия, доход от аренды. Если плательщик не работает или скрывает доход, суд назначает алименты в твердой сумме — обычно от 0.5 до 1 прожиточного минимума на каждого ребенка. Наш калькулятор рассчитает точную сумму с учетом актуальных ставок 2026 года."
      features={[]}
    />
  );
};

export default AlimonyTwoChildrenPage;
