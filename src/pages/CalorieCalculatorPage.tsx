import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import { OffersBlock } from "@/components/affiliate/OffersBlock";
import CalorieCalculator from "@/components/calculators/CalorieCalculator";
import { Link } from "react-router-dom";

const CalorieCalculatorPage = () => {
    const faqItems = [
        {
            question: "Как рассчитывается суточная норма калорий?",
            answer: "Суточная норма рассчитывается по формуле Миффлина-Сан Жеора с учетом пола, возраста, роста, веса и уровня активности. Для похудения нужен дефицит калорий, для набора массы - профицит."
        },
        {
            question: "Сколько калорий нужно для похудения?",
            answer: "Для безопасного похудения рекомендуется дефицит 300-500 калорий в день. Это позволит терять 0.5-1 кг в неделю без вреда для здоровья."
        }
    ];

    return (
        <CalculatorPageWrapper
            seoTitle="Калькулятор калорий 2026 - Расчет суточной нормы"
            seoDescription="Рассчитайте свою суточную норму калорий для похудения, поддержания или набора веса."
            seoKeywords="калькулятор калорий, суточная норма калорий, расчет калорий для похудения"
            canonical="https://schitay-online.ru/calculator/calories/"
            schemaName="Калькулятор калорий"
            schemaDescription="Бесплатный онлайн калькулятор суточной нормы калорий"
            title="Калькулятор калорий"
            description="Рассчитайте суточную норму калорий для достижения ваших целей"
            category="Здоровье"
            categoryHref="/category/personal"
            faqItems={faqItems}
            calculator={<CalorieCalculator />}
            afterCalculator={
                <div className="space-y-4">
                    <OffersBlock
                        product="insurance"
                        placement="result_block"
                        title="Страхование здоровья"
                        subtitle="Подберите программы страховой защиты для активного отдыха и путешествий."
                    />
                    <div className="text-sm text-slate-600">
                        Быстрый переход:{" "}
                        <Link to="/offers?category=insurance&q=клещ" className="font-semibold text-primary hover:underline">
                            защита от укуса клеща
                        </Link>
                        .
                    </div>
                </div>
            }
        />
    );
};

export default CalorieCalculatorPage;
