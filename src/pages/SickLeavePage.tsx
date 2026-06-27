import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import SickLeaveCalculator from "@/components/calculators/SickLeaveCalculator";
import { Link } from "react-router-dom";

const SickLeavePage = () => {
  const faqItems = [
    {
      question: "Как рассчитать больничный лист в 2026 году?",
      answer: "Формула: средний заработок за 2 года ÷ 730 × стаж × дни болезни. При стаже 8+ лет — 100% среднего заработка, 5–8 лет — 80%, до 5 лет — 60%. Максимальный средний заработок в 2026 году — 3 044 ₽/день."
    },
    {
      question: "Сколько платят по больничному в 2026 году?",
      answer: "Зависит от стажа и зарплаты. Пример: зарплата 80 000 ₽, стаж 10 лет, болезнь 10 дней. Средний заработок: 80 000 × 24 мес ÷ 730 = 2 630 ₽/день. Выплата: 2 630 × 10 = 26 300 ₽ (полная сумма)."
    },
    {
      question: "Кто оплачивает больничный — работодатель или ФСС?",
      answer: "Первые 3 дня болезни — работодатель, остальное — ФСС (Фонд социального страхования). С 2022 года оплата проходит через прямые выплаты ФСС — деньги приходят на карту работника напрямую."
    },
    {
      question: "Какой максимальный больничный в 2026 году?",
      answer: "Максимальный средний заработок для расчёта больничного в 2026 году: 3 044 ₽/день (предел базы ФСС). При стаже 8+ лет и 10 днях болезни максимальная выплата — 30 440 ₽. За месяц — около 91 320 ₽."
    },
    {
      question: "Больничный по уходу за ребёнком как рассчитать?",
      answer: "Та же формула, что и для взрослого. При стаже 8+ лет — 100% среднего заработка. Оплата — первые 3 дня работодателем, остальное ФСС. Ограничение по дням: 15 дней в год для амбулаторного лечения ребёнка."
    }
  ];

  return (
    <CalculatorPageWrapper
      seoTitle="Больничный лист 2026 — калькулятор, расчёт пособия по нетрудоспособности"
      seoDescription="Калькулятор больничного листа 2026: рассчитайте пособие по нетрудоспособности с учётом стажа и среднего заработка. Правила ФСС, максимум, формула — бесплатно онлайн."
      seoKeywords="больничный лист 2026, калькулятор больничного, расчёт пособия по нетрудоспособности, сколько платят по больничному, максимальный больничный 2026"
      canonical="https://schitay-online.ru/calculator/sick-leave/bolnichniy-list/"
      schemaName="Калькулятор больничного листа"
      schemaDescription="Бесплатный онлайн калькулятор пособия по временной нетрудоспособности с учётом ставок 2026 года"
      title="Больничный лист 2026"
      description="Рассчитайте пособие по нетрудоспособности с учётом стажа и зарплаты"
      category="Зарплата и налоги"
      categoryHref="/category/salary"
      faqItems={faqItems}
      calculator={<SickLeaveCalculator />}
      howToUseSteps={[
        "Введите средний заработок за 2 предыдущих года",
        "Укажите страховой стаж (до 5 лет, 5–8 лет, 8+ лет)",
        "Введите количество дней болезни",
        "Изучите сумму пособия и кто его выплачивает"
      ]}
      afterCalculator={
        <div className="space-y-4">
          <div className="surface-muted rounded-2xl p-4 md:p-5">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Больничный лист 2026: ключевые правила
            </h3>
            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-300">
              <p><strong>Стаж 8+ лет:</strong> 100% среднего заработка</p>
              <p><strong>Стаж 5–8 лет:</strong> 80% среднего заработка</p>
              <p><strong>Стаж до 5 лет:</strong> 60% среднего заработка</p>
              <p><strong>Оплата:</strong> первые 3 дня — работодатель, далее — ФСС</p>
              <p><strong>Максимум в день:</strong> 3 044 ₽ (предел базы ФСС 2026)</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm">
            <Link
              to="/calculator/sick-leave/"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Все калькуляторы пособий
            </Link>
            <Link
              to="/calculator/vacation/"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Калькулятор отпускных
            </Link>
            <Link
              to="/blog/?q=больничный"
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-700 dark:text-slate-300 hover:text-primary"
            >
              Статьи о больничных
            </Link>
          </div>
        </div>
      }
      aboutTitle="Больничный лист в 2026 году"
      aboutDescription="Пособие по временной нетрудоспособности (больничный лист) рассчитывается на основе среднего заработка за 2 предыдущих года. Ставка зависит от страхового стажа: 100% при стаже 8+ лет, 80% при 5–8 годах, 60% до 5 лет. Первые 3 дня оплачивает работодатель, остальное — ФСС через прямые выплаты. Максимальный средний заработок в 2026 году — 3 044 ₽/день."
      features={[]}
    />
  );
};

export default SickLeavePage;
