import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import VacationCalculator from "@/components/calculators/VacationCalculator";
import { Calendar, Calculator, TrendingUp, DollarSign, FileText, Users } from "lucide-react";

const VacationCalculatorPage = () => {
    const faqItems = [
        {
            question: "Как рассчитываются отпускные?",
            answer: "Отпускные = Средний дневной заработок × Количество дней отпуска. Средний дневной заработок = Сумма выплат за 12 месяцев / 12 / 29.3. Учитываются все выплаты: зарплата, премии, надбавки."
        },
        {
            question: "Сколько дней отпуска положено в год?",
            answer: "Основной оплачиваемый отпуск - 28 календарных дней в год. Некоторые категории работников имеют право на дополнительный отпуск: работники вредных производств, ненормированный рабочий день, работа на Крайнем Севере."
        },
        {
            question: "Когда выплачиваются отпускные?",
            answer: "Отпускные должны быть выплачены не позднее чем за 3 дня до начала отпуска. Если этот срок нарушен, работник может перенести отпуск или потребовать компенсацию."
        },
        {
            question: "Облагаются ли отпускные НДФЛ?",
            answer: "Да, отпускные облагаются НДФЛ 13% (или 15% для доходов свыше 5 млн в год). НДФЛ удерживается при выплате отпускных. Страховые взносы также начисляются."
        },
        {
            question: "Можно ли получить компенсацию вместо отпуска?",
            answer: "Компенсацию можно получить только за дни отпуска свыше 28 календарных дней. Основной отпуск должен быть использован. Исключение - компенсация при увольнении за все неиспользованные дни."
        }
    ];

    const features = [
        { icon: Calculator, text: "Точный расчет по Трудовому кодексу РФ", color: 'blue' as const },
        { icon: Calendar, text: "Учет расчетного периода", color: 'green' as const },
        { icon: TrendingUp, text: "Расчет среднего заработка", color: 'purple' as const },
        { icon: DollarSign, text: "Учет премий и надбавок", color: 'orange' as const },
        { icon: FileText, text: "Расчет компенсации при увольнении", color: 'pink' as const },
        { icon: Users, text: "Актуал��ные данные 2026 года", color: 'indigo' as const }
    ];

    const howToUseSteps = [
        "Введите вашу среднюю зарплату за последние 12 месяцев",
        "Укажите количество дней отпуска",
        "При необходимости добавьте премии и надбавки",
        "Изучите расчет отпускных",
        "Узнайте сумму к выплате после вычета НДФЛ"
    ];

    return (
        <CalculatorPageWrapper
            seoTitle="Калькулятор отпускных 2026 - Расчет отпускных онлайн"
            seoDescription="Рассчитайте отпускные с учетом среднего заработка, премий и НДФЛ. Актуальные правила расчета 2026 года."
            seoKeywords="калькулятор отпускных, расчет отпускных 2026, отпускные онлайн, средний заработок"
            canonical="https://schitay-online.ru/calculator/vacation"
            schemaName="Калькулятор отпускных"
            schemaDescription="Бесплатный онлайн калькулятор для расчета отпускных"
            title="Калькулятор отпускных"
            description="Рассчитайте сумму отпускных с учетом среднего заработка"
            category="Зарплата и налоги"
            categoryHref="/category/financial"
            faqItems={faqItems}
            calculator={<VacationCalculator />}
            features={features}
            howToUseSteps={howToUseSteps}
        />
    );
};

export default VacationCalculatorPage;
