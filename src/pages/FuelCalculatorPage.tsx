import CalculatorLayout from "@/components/CalculatorLayout";
import FuelCalculator from "@/components/calculators/FuelCalculator";

const FuelCalculatorPage = () => {
    return (
        <CalculatorLayout
            title="Калькулятор топлива"
            description="Рассчитайте стоимость поездки и необходимый объем топлива"
        >
            <FuelCalculator />
        </CalculatorLayout>
    );
};

export default FuelCalculatorPage;
