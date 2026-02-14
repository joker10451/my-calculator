import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import TireSizeCalculator from "@/components/calculators/TireSizeCalculator";

const TireSizeCalculatorPage = () => {
    const faqItems = [
        {
            question: "Как читать маркировку шин?",
            answer: "Маркировка 205/55 R16 означает: 205 - ширина в мм, 55 - высота профиля в % от ширины, R - радиальная конструкция, 16 - диаметр диска в дюймах."
        },
        {
            question: "Можно ли ставить шины другого размера?",
            answer: "Можно, но с ограничениями. Внешний диаметр колеса не должен отличаться более чем на 3%. Иначе будут неточности спидометра и проблемы с управлением."
        }
    ];

    return (
        <CalculatorPageWrapper
            seoTitle="Калькулятор размера шин 2026"
            seoDescription="Рассчитайте параметры шин и сравните размеры. Узнайте, какие шины подходят для вашего автомобиля."
            seoKeywords="калькулятор шин, размер шин, подбор шин, калькулятор дисков"
            canonical="https://schitay-online.ru/calculator/tire-size"
            schemaName="Калькулятор шин"
            schemaDescription="Бесплатный онлайн калькулятор размера шин"
            title="Калькулятор размера шин"
            description="Рассчитайте и сравните параметры автомобильных шин"
            category="Транспорт"
            categoryHref="/category/transport"
            faqItems={faqItems}
            calculator={<TireSizeCalculator />}
        />
    );
};

export default TireSizeCalculatorPage;
