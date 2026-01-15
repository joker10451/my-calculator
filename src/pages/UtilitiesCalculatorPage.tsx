import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import UtilitiesCalculator from "@/components/calculators/UtilitiesCalculator";

const UtilitiesCalculatorPage = () => {
    const faqItems = [
        {
            question: "Как рассчитываются коммунальные платежи?",
            answer: "Коммунальные платежи рассчитываются по тарифам, установленным в вашем регионе. Учитываются: площадь жилья, количество прописанных, наличие счетчиков."
        },
        {
            question: "Можно ли уменьшить коммунальные платежи?",
            answer: "Да, установите счетчики воды и электричества, утеплите квартиру, используйте энергосберегающие приборы, оформите субсидию при низком доходе."
        }
    ];

    return (
        <CalculatorPageWrapper
            seoTitle="Калькулятор коммунальных платежей 2026"
            seoDescription="Рассчитайте стоимость коммунальных услуг: электричество, вода, отопление, газ."
            seoKeywords="калькулятор ЖКХ, коммунальные платежи, расчет коммуналки"
            canonical="https://schitay-online.ru/calculator/utilities"
            schemaName="Калькулятор ЖКХ"
            schemaDescription="Бесплатный онлайн калькулятор коммунальных платежей"
            title="Калькулятор коммунальных платежей"
            description="Рассчитайте стоимость коммунальных услуг для вашей квартиры"
            category="Коммунальные услуги"
            categoryHref="/category/utilities"
            faqItems={faqItems}
            calculator={<UtilitiesCalculator />}
        />
    );
};

export default UtilitiesCalculatorPage;
