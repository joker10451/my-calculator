import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import WaterCalculator from "@/components/calculators/WaterCalculator";

const WaterCalculatorPage = () => {
    const faqItems = [
        {
            question: "Сколько воды нужно пить в день?",
            answer: "Рекомендуемая норма: 30-40 мл на 1 кг веса. Для человека весом 70 кг это 2.1-2.8 литра в день. При физических нагрузках норма увеличивается."
        },
        {
            question: "Как рассчитывается норма воды?",
            answer: "Норма воды зависит от веса, возраста, пола и уровня активности. Калькулятор учитывает все эти факторы для точного расчета."
        }
    ];

    return (
        <CalculatorPageWrapper
            seoTitle="Калькулятор нормы воды 2026"
            seoDescription="Рассчитайте свою суточную норму воды с учетом веса, возраста и активности."
            seoKeywords="калькулятор воды, норма воды в день, сколько пить воды"
            canonical="https://schitay-online.ru/calculator/water"
            schemaName="Калькулятор воды"
            schemaDescription="Бесплатный онлайн калькулятор суточной нормы воды"
            title="Калькулятор нормы воды"
            description="Узнайте, сколько воды вам нужно пить ежедневно"
            category="Здоровье"
            categoryHref="/category/personal"
            faqItems={faqItems}
            calculator={<WaterCalculator />}
        />
    );
};

export default WaterCalculatorPage;
