import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import CourtFeeCalculator from "@/components/calculators/CourtFeeCalculator";
import { Link } from "react-router-dom";

const DivorceFeePage = () => {
  const faqItems = [
    {
      question: "Сколько стоит развод через ЗАГС в 2026 году?",
      answer: "Госпошлина за расторжение брака через ЗАГС составляет 650 рублей с каждого супруга. Итого 1 300 рублей на двоих. Если заявление подает один супруг (по решению суда) — 350 рублей."
    },
    {
      question: "Сколько стоит развод через суд в 2026 году?",
      answer: "Госпошлина за подачу искового заявления о расторжении брака — 650 рублей. Если بالإضافة к разводу делится имущество, госпошлина рассчитывается от стоимости имущества: 4% от суммы, но не менее 400 рублей."
    },
    {
      question: "Кто платит госпошлину при разводе?",
      answer: "Госпошлину платит каждый супруг при разводе через ЗАГС (650 ₽ каждый). При разводе через суд — истец платит 650 ₽ при подаче иска, ответчик — при регистрации развода в ЗАГСе."
    },
    {
      question: "Можно ли не платить госпошлину при разводе?",
      answer: "Освобождаются от госпошлины: лица, признанные недееспособными, инвалиды I и II группы, ветераны боевых действий. Также при разделе имущества на сумму менее 100 000 рублей госпошлина не уплачивается."
    },
    {
      question: "Как оплатить госпошлину за развод?",
      answer: "Оплатить можно: через банк (квитанция), через Госуслуги (онлайн, скидка 30%), через СБП или банковское приложение. Реквизиты берите в ЗАГСе или на сайте суда. Сохраните чек — он понадобится при подаче документов."
    }
  ];

  return (
    <CalculatorPageWrapper
      seoTitle="Госпошлина за развод 2026 — сколько стоит расторжение брака"
      seoDescription="Калькулятор госпошлины за развод 2026: сколько стоит расторжение брака через ЗАГС и суд. Актуальные тарифы НК РФ — 650 ₽ с каждого. Онлайн расчет."
      seoKeywords="госпошлина за развод 2026, сколько стоит развод, госпошлина расторжение брака, развод через ЗАГС стоимость, развод через суд госпошлина"
      canonical="https://schitay-online.ru/calculator/court-fee/razvod/"
      schemaName="Калькулятор госпошлины за развод"
      schemaDescription="Бесплатный онлайн калькулятор госпошлины за расторжение брака через ЗАГС и суд в 2026 году"
      title="Госпошлина за развод 2026"
      description="Рассчитайте сколько стоит развод через ЗАГС и суд в 2026 году"
      category="Юридические"
      categoryHref="/category/legal"
      faqItems={faqItems}
      calculator={<CourtFeeCalculator />}
      howToUseSteps={[
        "Выберите способ расторжения брака: через ЗАГС или суд",
        "Укажите, есть ли совместное имущество для раздела",
        "Введите стоимость имущества (если делится через суд)",
        "Изучите размер госпошлины и способы оплаты"
      ]}
      afterCalculator={
        <div className="space-y-4">
          <div className="surface-muted rounded-2xl p-4 md:p-5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Госпошлина за развод 2026: актуальные тарифы
            </h3>
            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p><strong>Через ЗАГС (обоюдно):</strong> 650 ₽ с каждого = 1 300 ₽</p>
              <p><strong>Через ЗАГС (по решению суда):</strong> 350 ₽ (один супруг)</p>
              <p><strong>Через суд (без раздела имущества):</strong> 650 ₽ (истец) + 650 ₽ (ответчик при регистрации)</p>
              <p><strong>Через суд (с разделом имущества):</strong> 650 ₽ + госпошлина от стоимости имущества</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Скидка 30% при оплате через Госуслуги</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/calculator/court-fee/"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Все госпошлины
            </Link>
            <Link
              to="/calculator/alimony/"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Калькулятор алиментов
            </Link>
            <Link
              to="/blog/?q=развод"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Статьи о разводе
            </Link>
          </div>
        </div>
      }
      aboutTitle="Госпошлина за развод в 2026 году"
      aboutDescription="Госпошлина за расторжение брака в 2026 году составляет 650 рублей с каждого супруга при разводе через ЗАГС по обоюдному согласию. При разводе через суд — 650 рублей при подаче иска плюс 650 рублей ответчиком при регистрации в ЗАГСе. Если параллельно делится имущество, добавляется госпошлина от стоимости имущества: 4% от суммы, но не менее 400 рублей. Через Госуслуги — скидка 30%."
      features={[]}
    />
  );
};

export default DivorceFeePage;
