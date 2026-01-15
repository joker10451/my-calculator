import CalculatorLayout from "@/components/CalculatorLayout";
import CurrencyConverter from "@/components/calculators/CurrencyConverter";

const CurrencyConverterPage = () => {
    return (
        <CalculatorLayout
            title="Конвертер валют"
            description="Удобный перевод валют по актуальному курсу: доллары, евро, юани и другие"
        >
            <CurrencyConverter />
        </CalculatorLayout>
    );
};

export default CurrencyConverterPage;
