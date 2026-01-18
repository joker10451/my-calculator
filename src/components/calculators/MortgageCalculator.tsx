import { CalculatorActions } from "@/components/CalculatorActions";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { useMortgageCalculator } from "@/hooks/useMortgageCalculator";
import { MortgageInputs } from "./mortgage/MortgageInputs";
import { MortgageSummary } from "./mortgage/MortgageSummary";
import { MortgageExtraPayments } from "./mortgage/MortgageExtraPayments";
import { MortgageResultsTabs } from "./mortgage/MortgageResultsTabs";
import { MortgageComparison } from "./mortgage/MortgageComparison";
import { ZenithAI } from "./mortgage/ZenithAI";

const MortgageCalculator = () => {
  const {
    price, setPrice,
    initialPayment, setInitialPayment,
    isInitialPercent, setIsInitialPercent,
    term, setTerm,
    rate, setRate,
    paymentType, setPaymentType,
    withMatCapital, setWithMatCapital,
    extraPayments,
    calculations,
    handleDownload,
    handleShare,
    handleCompare,
    addExtraPayment,
    removeExtraPayment,
    updateExtraPayment,
    handleLoadFromHistory,
    exportData,
    formatCurrency,
    pinnedCalculation,
    handlePinCurrent,
    handleClearPinned,
    MAT_CAPITAL
  } = useMortgageCalculator();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Панель действий */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Ипотечный калькулятор</h2>
        <div className="flex gap-2">
          <CalculatorHistory
            calculatorType="mortgage"
            onLoadCalculation={handleLoadFromHistory}
          />
          <CalculatorActions
            calculatorId="mortgage"
            calculatorName="Ипотечный калькулятор"
            data={exportData}
            printElementId="mortgage-results"
            shareParams={{
              price,
              initialPayment,
              term,
              rate,
              withMatCapital,
              paymentType
            }}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Ввод данных */}
        <div className="lg:col-span-7 space-y-8">
          <MortgageInputs
            price={price}
            setPrice={setPrice}
            initialPayment={initialPayment}
            setInitialPayment={setInitialPayment}
            isInitialPercent={isInitialPercent}
            setIsInitialPercent={setIsInitialPercent}
            term={term}
            setTerm={setTerm}
            rate={rate}
            setRate={setRate}
            paymentType={paymentType}
            setPaymentType={setPaymentType}
            withMatCapital={withMatCapital}
            setWithMatCapital={setWithMatCapital}
            formatCurrency={formatCurrency}
            MAT_CAPITAL={MAT_CAPITAL}
          />

          <MortgageExtraPayments
            extraPayments={extraPayments}
            addExtraPayment={addExtraPayment}
            removeExtraPayment={removeExtraPayment}
            updateExtraPayment={updateExtraPayment}
          />

          <MortgageResultsTabs
            calculations={calculations}
            formatCurrency={formatCurrency}
          />

          <div id="mortgage-comparison" className="pt-8 border-t">
            <MortgageComparison
              pinned={pinnedCalculation}
              current={calculations}
              currentInputs={{ price, initialPayment, term, rate, paymentType }}
              formatCurrency={formatCurrency}
              onPin={handlePinCurrent}
              onClear={handleClearPinned}
            />
          </div>
        </div>

        {/* Результаты и графики */}
        <div className="lg:col-span-5 space-y-8">
          <MortgageSummary
            calculations={calculations}
            formatCurrency={formatCurrency}
            handleDownload={handleDownload}
            handleShare={handleShare}
            handleCompare={handleCompare}
          />

          <ZenithAI
            calculations={calculations}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>
    </div>
  );
};

export default MortgageCalculator;
