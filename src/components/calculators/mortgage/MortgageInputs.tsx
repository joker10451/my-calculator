import { Home } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface MortgageInputsProps {
  price: number;
  setPrice: (value: number) => void;
  initialPayment: number;
  setInitialPayment: (value: number) => void;
  isInitialPercent: boolean;
  setIsInitialPercent: (value: boolean) => void;
  term: number;
  setTerm: (value: number) => void;
  rate: number;
  setRate: (value: number) => void;
  paymentType: "annuity" | "differentiated";
  setPaymentType: (value: "annuity" | "differentiated") => void;
  withMatCapital: boolean;
  setWithMatCapital: (value: boolean) => void;
  formatCurrency: (val: number) => string;
  MAT_CAPITAL: number;
}

export const MortgageInputs = ({
  price,
  setPrice,
  initialPayment,
  setInitialPayment,
  isInitialPercent,
  setIsInitialPercent,
  term,
  setTerm,
  rate,
  setRate,
  paymentType,
  setPaymentType,
  withMatCapital,
  setWithMatCapital,
  formatCurrency,
  MAT_CAPITAL,
}: MortgageInputsProps) => {
  return (
    <div className="glass-card p-6 space-y-8">
      {/* Price */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-semibold text-lg flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            Стоимость недвижимости
          </label>
          <div className="relative">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="text-right text-xl font-bold text-primary bg-transparent border-none focus:outline-none w-40"
            />
          </div>
        </div>
        <Slider value={[price]} onValueChange={v => setPrice(v[0])} min={500000} max={50000000} step={100000} />
      </div>

      {/* Initial Payment */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="font-medium text-slate-600">Первоначальный взнос</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsInitialPercent(!isInitialPercent)}
              className="text-xs bg-muted px-2 py-1 rounded-md hover:bg-muted/80 transition-colors"
            >
              {isInitialPercent ? "%" : "₽"}
            </button>
            <span className="font-bold">
              {isInitialPercent ? `${initialPayment}%` : formatCurrency(initialPayment)}
            </span>
          </div>
        </div>
        <Slider
          value={[initialPayment]}
          onValueChange={v => setInitialPayment(v[0])}
          min={0}
          max={isInitialPercent ? 90 : price * 0.9}
          step={isInitialPercent ? 1 : 100000}
        />
      </div>

      {/* Term and Rate */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <label className="font-medium text-slate-600">Срок (лет)</label>
            <span className="font-bold">{term}</span>
          </div>
          <Slider value={[term]} onValueChange={v => setTerm(v[0])} min={1} max={30} step={1} />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <label className="font-medium text-slate-600">Ставка (%)</label>
            <span className="font-bold">{rate}%</span>
          </div>
          <Slider value={[rate]} onValueChange={v => setRate(v[0])} min={0.1} max={40} step={0.1} />
        </div>
      </div>

      <div className="pt-4 border-t space-y-6">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              checked={paymentType === "annuity"}
              onChange={() => setPaymentType("annuity")}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium group-hover:text-primary transition-colors">Аннуитетный</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              checked={paymentType === "differentiated"}
              onChange={() => setPaymentType("differentiated")}
              className="w-4 h-4 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium group-hover:text-primary transition-colors">Дифференцированный</span>
          </label>
        </div>

        <label className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl cursor-pointer hover:bg-primary/10 transition-colors">
          <input
            type="checkbox"
            checked={withMatCapital}
            onChange={() => setWithMatCapital(!withMatCapital)}
            className="w-5 h-5 rounded border-primary text-primary"
          />
          <div>
            <p className="font-bold text-sm">Использовать материнский капитал</p>
            <p className="text-xs text-muted-foreground">Вычесть {formatCurrency(MAT_CAPITAL)} из суммы долга</p>
          </div>
        </label>
      </div>
    </div>
  );
};
