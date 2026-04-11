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
          <label htmlFor="price-input" className="font-semibold text-lg flex items-center gap-2 cursor-pointer">
            <Home className="w-5 h-5 text-primary" />
            Стоимость недвижимости
          </label>
          <div className="relative">
            <input
              id="price-input"
              type="text"
              inputMode="numeric"
              value={price.toLocaleString('ru-RU')}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^\d]/g, '');
                if (raw) setPrice(Number(raw));
              }}
              className="text-right text-xl font-bold text-primary bg-transparent border-none focus:outline-none w-44"
              aria-label="Стоимость недвижимости в рублях"
            />
          </div>
        </div>
        <Slider 
          value={[price]} 
          onValueChange={v => setPrice(v[0])} 
          min={500000} 
          max={50000000} 
          step={100000}
          aria-label="Ползунок стоимости недвижимости" 
        />
      </div>

      {/* Initial Payment */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label htmlFor="initial-payment-input" className="font-medium text-slate-600 cursor-pointer">Первоначальный взнос</label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsInitialPercent(!isInitialPercent)}
              className="text-xs bg-muted px-2 py-1 rounded-md hover:bg-muted/80 transition-colors"
              aria-label={isInitialPercent ? "Переключить на рубли" : "Переключить на проценты"}
            >
              {isInitialPercent ? "%" : "₽"}
            </button>
            <span className="font-bold">
              {isInitialPercent ? `${initialPayment}%` : formatCurrency(initialPayment)}
            </span>
            <input 
              id="initial-payment-input" 
              type="hidden" 
              value={initialPayment} 
              aria-label="Сумма первоначального взноса"
            />
          </div>
        </div>
        <Slider
          value={[initialPayment]}
          onValueChange={v => setInitialPayment(v[0])}
          min={0}
          max={isInitialPercent ? 90 : price * 0.9}
          step={isInitialPercent ? 1 : 100000}
          aria-label="Ползунок первоначального взноса"
        />
      </div>

      {/* Term and Rate */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <label htmlFor="term-input" className="font-medium text-slate-600 cursor-pointer">Срок (лет)</label>
            <span className="font-bold">{term}</span>
          </div>
          <Slider 
            id="term-input"
            value={[term]} 
            onValueChange={v => setTerm(v[0])} 
            min={1} 
            max={30} 
            step={1} 
            aria-label="Срок ипотеки в годах"
          />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <label htmlFor="rate-input" className="font-medium text-slate-600 cursor-pointer">Ставка (%)</label>
            <span className="font-bold">{rate}%</span>
          </div>
          <Slider 
            id="rate-input"
            value={[rate]} 
            onValueChange={v => setRate(v[0])} 
            min={0.1} 
            max={40} 
            step={0.1} 
            aria-label="Процентная ставка"
          />
        </div>
      </div>

      <div className="pt-4 border-t space-y-6">
        <fieldset>
          <legend className="sr-only">Тип платежа</legend>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="payment-type"
                checked={paymentType === "annuity"}
                onChange={() => setPaymentType("annuity")}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium group-hover:text-primary transition-colors">Аннуитетный</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="payment-type"
                checked={paymentType === "differentiated"}
                onChange={() => setPaymentType("differentiated")}
                className="w-4 h-4 text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium group-hover:text-primary transition-colors">Дифференцированный</span>
            </label>
          </div>
        </fieldset>

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
