import SalaryCalculator from "./SalaryCalculator";
import { SalaryComparison } from "./SalaryComparison";

export const SalaryCalculatorWithComparison = () => {
  return (
    <div className="space-y-8">
      <SalaryCalculator />
      <SalaryComparison />
    </div>
  );
};

export default SalaryCalculatorWithComparison;
