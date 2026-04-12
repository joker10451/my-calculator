import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import { OffersBlock } from "@/components/affiliate/OffersBlock";
import BMICalculator from "@/components/calculators/BMICalculator";
import { Link } from "react-router-dom";

const BMICalculatorPage = () => {
    const faqItems = [
        {
            question: "Что такое индекс массы тела (ИМТ)?",
            answer: "ИМТ - это показатель соотношения веса и роста человека. Формула: ИМТ = Вес (кг) / Рост² (м). Используется для оценки соответствия массы тела норме."
        },
        {
            question: "Какие значения ИМТ считаются нормой?",
            answer: "Норма ИМТ: 18.5-24.9. Менее 18.5 - недостаточный вес, 25-29.9 - избыточный вес, 30+ - ожирение. Однако ИМТ не учитывает мышечную массу и телосложение."
        }
    ];

    return (
        <CalculatorPageWrapper
            seoTitle="Калькулятор индекса массы тела (ИМТ) 2026"
            seoDescription="Рассчитайте свой индекс массы тела онлайн. Узнайте, соответствует ли ваш вес норме."
            seoKeywords="калькулятор ИМТ, индекс массы тела, расчет ИМТ, калькулятор веса"
            canonical="https://schitay-online.ru/calculator/bmi/"
            schemaName="Калькулятор ИМТ"
            schemaDescription="Бесплатный онлайн калькулятор индекса массы тела"
            title="Индекс массы тела (ИМТ)"
            description="Простой способ узнать, находится ли ваш вес в пределах нормы"
            category="Здоровье"
            categoryHref="/category/health"
            faqItems={faqItems}
            calculator={<BMICalculator />}
            afterCalculator={
                <div className="space-y-4">
                    <OffersBlock
                        product="insurance"
                        placement="result_block"
                        title="Полезные страховые предложения"
                        subtitle="Если часто бываете на природе, посмотрите актуальные программы защиты здоровья."
                    />
                    <div className="text-sm text-slate-600">
                        Точечная подборка по теме:{" "}
                        <Link to="/offers?category=insurance&q=клещ" className="font-semibold text-primary hover:underline">
                            предложения по защите от укуса клеща
                        </Link>
                        .
                    </div>
                </div>
            }
        />
    );
};

export default BMICalculatorPage;
