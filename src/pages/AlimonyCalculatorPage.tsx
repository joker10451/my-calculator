import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import AlimonyCalculator from "@/components/calculators/AlimonyCalculator";

const AlimonyCalculatorPage = () => {
    const faqItems = [
        {
            question: "Как рассчитываются алименты в 2026 году?",
            answer: "Алименты рассчитываются от дохода: 25% на одного ребенка, 33% на двух детей, 50% на трех и более. Минимальный размер привязан к прожиточному минимуму."
        },
        {
            question: "Можно ли изменить размер алиментов?",
            answer: "Да, размер алиментов можно изменить через суд при изменении материального положения, появлении других иждивенцев или по соглашению сторон."
        }
    ];

    return (
        <CalculatorPageWrapper
            seoTitle="Калькулятор алиментов 2026"
            seoDescription="Рассчитайте размер алиментов на детей с учетом дохода и количества детей."
            seoKeywords="калькулятор алиментов, расчет алиментов 2026, алименты на ребенка"
            canonical="https://schitay-online.ru/calculator/alimony"
            schemaName="Калькулятор алиментов"
            schemaDescription="Бесплатный онлайн калькулятор алиментов на детей"
            title="Калькулятор алиментов"
            description="Рассчитайте размер алиментов на содержание детей"
            category="Юридические"
            categoryHref="/category/legal"
            faqItems={faqItems}
            calculator={<AlimonyCalculator />}
        />
    );
};

export default AlimonyCalculatorPage;
