import MortgageCalculator from "./MortgageCalculator";
import { MortgageScenarioComparison } from "./MortgageScenarioComparison";

export const MortgageCalculatorWithComparison = () => {
  return (
    <div className="space-y-8">
      <MortgageCalculator />
      <MortgageScenarioComparison />
    </div>
  );
};

export default MortgageCalculatorWithComparison;
