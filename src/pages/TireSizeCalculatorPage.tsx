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
            seoDescription="Калькулятор размера шин: подберите шины для автомобиля по марке. Совместимость, сравнение размеров, расчет клиренса — онлайн."
            seoKeywords="калькулятор шин, размер шин, подбор шин, калькулятор дисков"
            canonical="https://schitay-online.ru/calculator/tire-size/"
            schemaName="Калькулятор шин"
            schemaDescription="Бесплатный онлайн калькулятор размера шин"
            appCategory="UtilityApplication"
            title="Калькулятор размера шин"
            description="Рассчитайте и сравните параметры автомобильных шин"
            category="Транспорт"
            categoryHref="/category/auto"
            faqItems={faqItems}
            calculator={<TireSizeCalculator />}
            howToUseSteps={[
                "Введите текущий размер шин или марку автомобиля",
                "Сравните параметры: ширина, профиль, диаметр",
                "Узнайте, какие шины совместимы с вашими дисками",
                "Проверьте клиренс после замены шин"
            ]}
        />
    );
};

export default TireSizeCalculatorPage;
