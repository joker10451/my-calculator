import CalculatorLayout from "@/components/CalculatorLayout";
import AlimonyCalculator from "@/components/calculators/AlimonyCalculator";

const AlimonyCalculatorPage = () => {
    return (
        <CalculatorLayout
            title="Калькулятор алиментов"
            description="Рассчитайте сумму алиментов на детей в зависимости от дохода и количества детей"
        >
            <AlimonyCalculator />
        </CalculatorLayout>
    );
};

export default AlimonyCalculatorPage;
