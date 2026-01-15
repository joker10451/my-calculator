import CalculatorLayout from "@/components/CalculatorLayout";
import BMICalculator from "@/components/calculators/BMICalculator";

const BMICalculatorPage = () => {
    return (
        <CalculatorLayout
            title="Индекс массы тела (ИМТ)"
            description="Простой способ узнать, находится ли ваш вес в пределах нормы"
        >
            <BMICalculator />
        </CalculatorLayout>
    );
};

export default BMICalculatorPage;
