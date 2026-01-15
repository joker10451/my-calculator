import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import SickLeaveCalculator from "@/components/calculators/SickLeaveCalculator";
import { Heart, Calculator, TrendingUp, DollarSign, FileText, Calendar } from "lucide-react";

const SickLeaveCalculatorPage = () => {
    const faqItems = [
        {
            question: "Как рассчитывается больничный?",
            answer: "Больничный = Средний дневной заработок × Процент оплаты × Количество дней. Процент зависит от стажа: до 5 лет - 60%, 5-8 лет - 80%, от 8 лет - 100%. Средний заработок рассчитывается за 2 предыдущих года."
        },
        {
            question: "Кто оплачивает больничный?",
            answer: "Первые 3 дня больничного оплачивает работодатель, остальные дни - ФСС (Фонд социального страхования). При уходе за больным ребенком все дни оплачивает ФСС."
        },
        {
            question: "Есть ли максимальная сумма больничного?",
            answer: "Да, максимальный размер больничного ограничен предельной базой для взносов в ФСС. В 2026 году максимальный дневной заработок для расчета - около 3 500₽, максимальная выплата за месяц - около 105 000₽."
        },
        {
            question: "Облагается ли больничный НДФЛ?",
            answer: "Да, пособие по временной нетрудоспособности облагается НДФЛ 13% (или 15% для высоких доходов). НДФЛ удерживается при выплате. Страховые взносы на больничные не начисляются."
        },
        {
            question: "Можно ли получить больничный при стаже менее 6 месяцев?",
            answer: "Да, но размер пособия будет рассчитываться исходя из МРОТ (минимального размера оплаты труда). В 2026 году МРОТ составляет 19 242₽. Это примерно 630₽ в день."
        }
    ];

    const features = [
        { icon: Calculator, text: "Расчет по правилам ФСС 2026", color: 'blue' as const },
        { icon: Calendar, text: "Учет страхового стажа", color: 'green' as const },
        { icon: TrendingUp, text: "Расчет среднего заработка за 2 года", color: 'purple' as const },
        { icon: DollarSign, text: "Учет максимальных и минимальных выплат", color: 'orange' as const },
        { icon: FileText, text: "Расчет для разных типов больничных", color: 'pink' as const },
        { icon: Heart, text: "Больничный по уходу за ребенком", color: 'indigo' as const }
    ];

    const howToUseSteps = [
        "Введите ваш средний заработок за последние 2 года",
        "Укажите страховой стаж",
        "Введите количество дней больничного",
        "Выберите тип больничного (болезнь или уход за ребенком)",
        "Изучите расчет пособия",
        "Узнайте сумму к выплате после вычета НДФЛ"
    ];

    return (
        <CalculatorPageWrapper
            seoTitle="Калькулятор больничного 2026 - Расчет больничного листа онлайн"
            seoDescription="Рассчитайте пособие по временной нетрудоспособности с учетом стажа и среднего заработка. Актуальные правила ФСС 2026."
            seoKeywords="калькулятор больничного, расчет больничного 2026, больничный лист онлайн, пособие по нетрудоспособности"
            canonical="https://schitay-online.ru/calculator/sick-leave"
            schemaName="Калькулятор больничного"
            schemaDescription="Бесплатный онлайн калькулятор для расчета больничного листа"
            title="Калькулятор больничного"
            description="Рассчитайте пособие по временной нетрудоспособности"
            category="Зарплата и налоги"
            categoryHref="/category/financial"
            faqItems={faqItems}
            calculator={<SickLeaveCalculator />}
            features={features}
            howToUseSteps={howToUseSteps}
        />
    );
};

export default SickLeaveCalculatorPage;
