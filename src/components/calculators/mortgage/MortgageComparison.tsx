import { Compare } from "@/components/ui/compare";
import { type MortgageCalculationResult } from "@/lib/mortgageCalculations";
import { Button } from "@/components/ui/button";
import { X, Pin } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MortgageComparisonProps {
    pinned: {
        calculations: MortgageCalculationResult;
        inputs: any;
    } | null;
    current: MortgageCalculationResult;
    currentInputs: any;
    formatCurrency: (val: number) => string;
    onClear: () => void;
    onPin: () => void;
}

export const MortgageComparison = ({
    pinned,
    current,
    currentInputs,
    formatCurrency,
    onClear,
    onPin
}: MortgageComparisonProps) => {
    const { t } = useTranslation();

    if (!pinned) {
        return (
            <div className="p-6 bg-muted/30 border border-dashed rounded-xl text-center">
                <p className="text-muted-foreground mb-4">
                    {t('common.mortgage_calc.comparison.hint')}
                </p>
                <Button onClick={onPin} variant="outline" className="gap-2">
                    <Pin className="w-4 h-4" />
                    {t('common.mortgage_calc.comparison.pin_button')}
                </Button>
            </div>
        );
    }

    const ComparisonCard = ({
        title,
        data,
        inputs,
        isCurrent
    }: {
        title: string;
        data: MortgageCalculationResult;
        inputs: any;
        isCurrent?: boolean
    }) => (
        <div className={`p-4 h-full flex flex-col justify-between ${isCurrent ? 'bg-primary/5' : 'bg-muted/50'}`}>
            <div>
                <h4 className="font-bold text-lg mb-4 text-center">{title}</h4>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('common.mortgage_calc.inputs.price')}</span>
                        <span className="font-medium">{formatCurrency(inputs.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('common.mortgage_calc.inputs.rate')}</span>
                        <span className="font-medium">{inputs.rate}%</span>
                    </div>
                    <div className="flex justify-between text-sm border-t pt-2">
                        <span className="text-muted-foreground font-semibold uppercase text-[10px]">{t('common.mortgage_calc.summary.monthly')}</span>
                        <span className="font-bold text-primary">{formatCurrency(data.monthlyPayment)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-semibold uppercase text-[10px]">{t('common.mortgage_calc.summary.overpayment')}</span>
                        <span className="font-bold text-destructive">{formatCurrency(data.totalInterest)}</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                {isCurrent ? t('common.mortgage_calc.comparison.current_badge') : t('common.mortgage_calc.comparison.pinned_badge')}
            </div>
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">{t('common.mortgage_calc.comparison.title')}</h3>
                <Button variant="ghost" size="sm" onClick={onClear} className="h-8 gap-1 text-muted-foreground">
                    <X className="w-4 h-4" />
                    {t('common.mortgage_calc.comparison.clear')}
                </Button>
            </div>

            <div className="h-[300px] w-full max-w-2xl mx-auto">
                <Compare
                    firstContent={
                        <ComparisonCard
                            title={t('common.mortgage_calc.comparison.variant_a')}
                            data={pinned.calculations}
                            inputs={pinned.inputs}
                        />
                    }
                    secondContent={
                        <ComparisonCard
                            title={t('common.mortgage_calc.comparison.variant_b')}
                            data={current}
                            inputs={currentInputs}
                            isCurrent
                        />
                    }
                    className="h-full w-full"
                    slideMode="hover"
                />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-2 italic">
                {t('common.mortgage_calc.comparison.slider_hint')}
            </p>
        </div>
    );
};
