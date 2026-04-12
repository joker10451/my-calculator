import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import FuelCalculator from "@/components/calculators/FuelCalculator";
import { OffersBlock } from "@/components/affiliate/OffersBlock";

const FuelCalculatorPage = () => {
    const faqItems = [
        {
            question: "Как рассчитать расход топлива?",
            answer: "Расход топлива = (Литры / Километры) × 100. Например, если вы проехали 500 км и потратили 40 литров, расход = (40 / 500) × 100 = 8 л/100км."
        },
        {
            question: "Какой расход топлива считается нормальным?",
            answer: "Для легковых автомобилей нормальный расход: 5-7 л/100км для малолитражек, 7-10 л/100км для среднего класса, 10-15 л/100км для внедорожников."
        }
    ];

    return (
        <CalculatorPageWrapper
            seoTitle="Калькулятор расхода топлива 2026"
            seoDescription="Рассчитайте расход топлива и стоимость поездки. Узнайте, сколько бензина нужно на поездку."
            seoKeywords="калькулятор топлива, расход бензина, расчет топлива на поездку"
            canonical="https://schitay-online.ru/calculator/fuel/"
            schemaName="Калькулятор топлива"
            schemaDescription="Бесплатный онлайн калькулятор расхода топлива"
            title="Калькулятор расхода топлива"
            description="Рассчитайте расход и стоимость топлива для вашей поездки"
            category="Транспорт"
            categoryHref="/category/transport"
            faqItems={faqItems}
            calculator={<FuelCalculator />}
            afterCalculator={<OffersBlock product="auto_insurance" placement="result_block" title="ОСАГО и КАСКО для вашего авто" subtitle="Оформите полис онлайн — без визита в офис." />}
        />
    );
};

export default FuelCalculatorPage;
