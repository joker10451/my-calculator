import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import VacationCalculator from "@/components/calculators/VacationCalculator";
import { Link } from "react-router-dom";

const VacationPayPage = () => {
  const faqItems = [
    {
      question: "Как рассчитать отпускные в 2026 году?",
      answer: "Формула: средний дневной заработок × дни отпуска. Средний дневной = сумма выплат за 12 мес ÷ 12 ÷ 29,3. Пример: зарплата 80 000 ₽/мес, отпуск 14 дней: 80 000 × 12 ÷ 12 ÷ 29,3 = 2 730 ₽/день. Отпускные = 2 730 × 14 = 38 220 ₽ (до вычета НДФЛ)."
    },
    {
      question: "Когда выгоднее брать отпуск в 2026 году?",
      answer: "Выгоднее в месяцах с наибольшим количеством рабочих дней: июль (23 дня), август (21), октябрь (23). Меньше всего теряете в деньгах, когда рабочий день стоит дёшево (много рабочих дней). Невыгодно: январь (16 дней), май (17), февраль (19)."
    },
    {
      question: "Сколько дней отпуска положено по закону в 2026?",
      answer: "Минимум 28 календарных дней в год. Работники вредных производств, ненормированным днём и на Крайнем Севере — дополнительный отпуск. Делить можно на части, но одна из них должна быть не менее 14 дней."
    },
    {
      question: "Отпускные облагаются налогом в 2026?",
      answer: "Да, НДФЛ 13% (или 15% при годовом доходе свыше 5 млн ₽). Удерживается при выплате. Также начисляются страховые взносы. На руки вы получаете сумму за вычетом НДФЛ."
    },
    {
      question: "Когда должны выплатить отпускные по закону?",
      answer: "Не позднее чем за 3 календарных дня до начала отпуска (ст. 136 ТК РФ). Если срок нарушен — работник вправе перенести отпуск. За каждый день просрочки полагается компенсация 1/150 ключевой ставки ЦБ."
    }
  ];

  return (
    <CalculatorPageWrapper
      seoTitle="Отпускные 2026 — калькулятор, расчёт, примеры и сроки выплат"
      seoDescription="Калькулятор отпускных 2026: рассчитайте сумму по среднему заработку. Формула, примеры, сроки выплаты, НДФЛ. Узнайте, в каком месяце выгоднее брать отпуск."
      seoKeywords="отпускные 2026, калькулятор отпускных, расчёт отпускных онлайн, когда выгодно брать отпуск, средний заработок, НДФЛ с отпускных, срок выплаты отпускных"
      canonical="https://schitay-online.ru/calculator/vacation/otpusknye-2026/"
      schemaName="Калькулятор отпускных 2026"
      schemaDescription="Бесплатный онлайн калькулятор отпускных с учётом ТК РФ и ставок НДФЛ 2026 года"
      title="Отпускные 2026"
      description="Рассчитайте отпускные по среднему заработку с учётом правил 2026 года"
      category="Зарплата и налоги"
      categoryHref="/category/salary"
      faqItems={faqItems}
      calculator={<VacationCalculator />}
      howToUseSteps={[
        "Введите среднемесячную зарплату за последние 12 месяцев",
        "Укажите количество дней отпуска",
        "Добавьте премии и надбавки (если есть)",
        "Изучите сумму отпускных и НДФЛ к удержанию"
      ]}
      afterCalculator={
        <div className="space-y-4">
          <div className="surface-muted rounded-2xl p-4 md:p-5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Отпускные 2026: главное
            </h3>
            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p><strong>Формула:</strong> средний дневной заработок × дни отпуска</p>
              <p><strong>Минимум:</strong> 28 календарных дней в год</p>
              <p><strong>Срок выплаты:</strong> не позднее чем за 3 дня</p>
              <p><strong>НДФЛ:</strong> 13% (15% при доходе свыше 5 млн ₽/год)</p>
              <p><strong>Выгодные месяцы:</strong> июль, август, октябрь 2026 (много рабочих дней)</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/calculator/vacation/"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Все расчёты по отпускам
            </Link>
            <Link
              to="/calculator/sick-leave/"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Калькулятор больничного
            </Link>
            <Link
              to="/blog/?q=отпускные"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Статьи об отпускных
            </Link>
          </div>
        </div>
      }
      aboutTitle="Отпускные в 2026 году: как рассчитать и не ошибиться"
      aboutDescription="Отпускные — это оплата ежегодного оплачиваемого отпуска по ТК РФ. Расчёт: средний дневной заработок за 12 месяцев умножается на количество дней отпуска. Средний заработок считается делением всех выплат на 12 и на 29,3 (среднемесячное число дней). Учитываются зарплата, премии, надбавки. Отпускные облагаются НДФЛ, выплачиваются за 3 дня. Неиспользованные дни свыше 28 можно компенсировать деньгами."
      features={[]}
    />
  );
};

export default VacationPayPage;
