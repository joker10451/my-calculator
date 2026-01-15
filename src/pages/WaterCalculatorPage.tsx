import CalculatorLayout from "@/components/CalculatorLayout";
import WaterCalculator from "@/components/calculators/WaterCalculator";

const WaterCalculatorPage = () => {
    return (
        <CalculatorLayout
            title="Норма воды"
            description="Рассчитайте, сколько воды нужно пить именно вам для поддержания здоровья"
        >
            <WaterCalculator />
        </CalculatorLayout>
    );
};

export default WaterCalculatorPage;
