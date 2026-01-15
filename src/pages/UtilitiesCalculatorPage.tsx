import CalculatorLayout from "@/components/CalculatorLayout";
import UtilitiesCalculator from "@/components/calculators/UtilitiesCalculator";

const UtilitiesCalculatorPage = () => {
    return (
        <CalculatorLayout
            title="Калькулятор ЖКХ"
            description="Контролируйте расходы на коммунальные услуги: свет, вода и др."
        >
            <UtilitiesCalculator />
        </CalculatorLayout>
    );
};

export default UtilitiesCalculatorPage;
