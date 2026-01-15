import CalculatorLayout from "@/components/CalculatorLayout";
import CalorieCalculator from "@/components/calculators/CalorieCalculator";

const CalorieCalculatorPage = () => {
    return (
        <CalculatorLayout
            title="Калькулятор калорий"
            description="Рассчитайте суточную норму калорий (КБЖУ) для похудения или набора массы"
        >
            <CalorieCalculator />
        </CalculatorLayout>
    );
};

export default CalorieCalculatorPage;
