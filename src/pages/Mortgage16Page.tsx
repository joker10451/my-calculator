import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import MortgageCalculatorWithComparison from "@/components/calculators/mortgage/MortgageCalculatorWithComparison";
import { Link } from "react-router-dom";

const Mortgage16Page = () => {
  const faqItems = [
    {
      question: "Какая ставка по ипотеке в 2026 году?",
      answer: "В 2026 году базовая ставка по ипотеке — 14–16% годовых при первоначальном взносе от 20%. Семейная ипотека — 6%, IT-ипотека — 5%, дальневосточная — 2%. Без страховании жизни банк добавляет 1–2% к ставке."
    },
    {
      question: "Сколько платить за ипотеку 5 млн под 16%?",
      answer: "При ипотеке 5 млн ₽ под 16% на 20 лет ежемесячный платеж составит approximately 68 700 ₽. Переплата по процентам — около 11.5 млн ₽. Используйте наш калькулятор для точного расчета с учетом досрочного погашения."
    },
    {
      question: "Выгодно ли досрочно гасить ипотеку при 16%?",
      answer: "Да, при ставке 16% досрочное погашение очень выгодно. Каждый дополнительный платеж в 10 000 ₽ экономит около 50 000 ₽ процентов за весь срок. Рекомендуем стратегию «сокращение срока» при высоких ставках."
    },
    {
      question: "Можно ли рефинансировать ипотеку под меньшую ставку?",
      answer: "Если ваша ставка выше рыночной, рефинансирование выгодно. Разница в 2% на 5 млн ₽ за 15 лет экономит более 1 млн ₽. Обратитесь в банк-кредитор илиComparer offers от разных банков."
    },
    {
      question: "Маткапитал можно использовать как первоначальный взнос?",
      answer: "Да, материнский капитал 934 058 ₽ можно направить на первоначальный взнос по ипотеке. Это делает ипотеку доступнее для семей с детьми. Дополнительно доступна семейная ипотека под 6%."
    }
  ];

  return (
    <CalculatorPageWrapper
      seoTitle="Ипотека 16 процентов 2026 — калькулятор, переплата, досрочное погашение"
      seoDescription="Калькулятор ипотеки под 16% в 2026 году: рассчитайте ежемесячный платеж, переплату и график. Сравните с семейной ипотекой 6%. Досрочное погашение — экономия до миллионов."
      seoKeywords="ипотека 16 процентов 2026, ипотечный калькулятор 16%, ежемесячный платеж ипотека 16 процентов, переплата ипотека 2026"
      canonical="https://schitay-online.ru/calculator/mortgage/16-procentov/"
      schemaName="Калькулятор ипотеки под 16%"
      schemaDescription="Бесплатный онлайн калькулятор ипотеки под 16% годовых с расчетом досрочного погашения"
      title="Ипотека под 16% в 2026 году"
      description="Рассчитайте ежемесячный платеж и переплату по ипотеке под 16%"
      category="Финансы"
      categoryHref="/category/finance"
      faqItems={faqItems}
      calculator={<MortgageCalculatorWithComparison />}
      howToUseSteps={[
        "Введите стоимость недвижимости и первоначальный взнос",
        "Укажите ставку 16% и срок кредита (например, 20 лет)",
        "Добавьте досрочные платежи для оптимизации",
        "Сравните с семейной ипотекой 6% и других программ"
      ]}
      afterCalculator={
        <div className="space-y-4">
          <div className="surface-muted rounded-2xl p-4 md:p-5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Ипотека 16% в 2026 году: что важно знать
            </h3>
            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p><strong>Базовая ставка:</strong> 14–16% при ПВ от 20%</p>
              <p><strong>Семейная ипотека:</strong> 6% (первый/второй ребёнок с 2018 г.)</p>
              <p><strong>IT-ипотека:</strong> 5% (для сотрудников аккредитованных IT-компаний)</p>
              <p><strong>Досрочное погашение:</strong> стратегия «сокращение срока» при 16% экономит больше</p>
              <p><strong>Без страховании:</strong> банк добавляет +1–2% к ставке</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/calculator/mortgage/"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Ипотечный калькулятор
            </Link>
            <Link
              to="/calculator/refinancing/"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Рефинансирование
            </Link>
            <Link
              to="/blog/?q=ипотека"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Статьи об ипотеке
            </Link>
          </div>
        </div>
      }
      aboutTitle="Ипотека под 16% в 2026 году"
      aboutDescription="В 2026 году базовая ставка по ипотеке составляет 14–16% годовых. При первоначальном взносе от 20% и страховании жизни банк готов предложить 14–15%. Без страховании — 15–16%. Семейная ипотека доступна под 6% для семей с детьми. Наш калькулятор поможет рассчитать точный ежемесячный платеж, переплату и выгоду от досрочного погашения."
      features={[]}
    />
  );
};

export default Mortgage16Page;
