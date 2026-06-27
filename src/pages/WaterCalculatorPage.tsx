import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import { OffersBlock } from "@/components/affiliate/OffersBlock";
import WaterCalculator from "@/components/calculators/WaterCalculator";
import { Link } from "react-router-dom";

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
            seoDescription="Калькулятор воды: рассчитайте сколько пить воды в день по весу и активности. Норма воды для здоровья — бесплатно онлайн."
            seoKeywords="калькулятор воды, норма воды в день, сколько пить воды"
            canonical="https://schitay-online.ru/calculator/water/"
            schemaName="Калькулятор воды"
            schemaDescription="Бесплатный онлайн калькулятор суточной нормы воды"
            appCategory="UtilityApplication"
            title="Калькулятор нормы воды"
            description="Узнайте, сколько воды вам нужно пить ежедневно"
            category="Здоровье"
            categoryHref="/category/health"
            faqItems={faqItems}
            calculator={<WaterCalculator />}
            howToUseSteps={[
                "Введите свой вес в килограммах",
                "Укажите уровень физической активности",
                "Нажмите «Рассчитать» — калькулятор покажет норму воды",
                "Узнайте, сколько стаканов воды нужно пить ежедневно"
            ]}
            afterCalculator={
                <div className="space-y-4">
                    <OffersBlock
                        product="insurance"
                        placement="result_block"
                        title="Дополнительная защита здоровья"
                        subtitle="Актуальные страховые программы для тех, кто часто проводит время на природе."
                    />
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                        Посмотреть целевое предложение:{" "}
                        <Link to="/offers?category=insurance&q=клещ" className="font-semibold text-primary hover:underline">
                            страхование от укуса клеща
                        </Link>
                        .
                    </div>
                </div>
            }
        />
    );
};

export default WaterCalculatorPage;
