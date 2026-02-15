import CreditCalculator from "./CreditCalculator";
import { CreditComparison } from "./CreditComparison";

export const CreditCalculatorWithComparison = () => {
  return (
    <div className="space-y-8">
      <CreditCalculator />
      <CreditComparison />
    </div>
  );
};

export default CreditCalculatorWithComparison;
