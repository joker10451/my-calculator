import { TrendingDown as SavingsIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type ExtraPayment } from "@/lib/mortgageCalculations";
import { useTranslation } from "react-i18next";

interface MortgageExtraPaymentsProps {
    extraPayments: ExtraPayment[];
    addExtraPayment: () => void;
    removeExtraPayment: (id: string) => void;
    updateExtraPayment: (id: string, updates: Partial<ExtraPayment>) => void;
}

export const MortgageExtraPayments = ({
    extraPayments,
    addExtraPayment,
    removeExtraPayment,
    updateExtraPayment
}: MortgageExtraPaymentsProps) => {
    const { t } = useTranslation();

    return (
        <div className="glass-card p-6 space-y-6 border-2 border-primary/20 bg-primary/5">
            <div className="flex items-center justify-between">
                <h4 className="font-bold flex items-center gap-2">
                    <SavingsIcon className="w-5 h-5 text-primary" />
                    {t('common.mortgage_calc.extra_payments.title')}
                </h4>
                <Button variant="outline" size="sm" onClick={addExtraPayment} className="gap-2">
                    <Plus className="w-4 h-4" />
                    {t('common.mortgage_calc.extra_payments.add_button')}
                </Button>
            </div>

            {extraPayments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 bg-background/50 rounded-xl border border-dashed">
                    {t('common.mortgage_calc.extra_payments.empty_hint')}
                </p>
            ) : (
                <div className="space-y-4">
                    {extraPayments.map((p) => (
                        <div key={p.id} className="bg-background p-4 rounded-xl border flex flex-col md:flex-row gap-4 items-end md:items-center">
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground">{t('common.mortgage_calc.extra_payments.amount')}</label>
                                    <input
                                        type="number"
                                        value={p.amount}
                                        onChange={(e) => updateExtraPayment(p.id, { amount: Number(e.target.value) })}
                                        className="w-full bg-muted/30 border-none rounded px-2 py-1 text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground">{t('common.mortgage_calc.extra_payments.month')}</label>
                                    <input
                                        type="number"
                                        value={p.month}
                                        onChange={(e) => updateExtraPayment(p.id, { month: Number(e.target.value) })}
                                        className="w-full bg-muted/30 border-none rounded px-2 py-1 text-sm font-bold"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground">{t('common.mortgage_calc.extra_payments.type')}</label>
                                    <select
                                        value={p.type}
                                        onChange={(e) => updateExtraPayment(p.id, { type: e.target.value as 'one-time' | 'monthly' })}
                                        className="w-full bg-muted/30 border-none rounded px-2 py-1 text-xs"
                                    >
                                        <option value="one-time">{t('common.mortgage_calc.extra_payments.one_time')}</option>
                                        <option value="monthly">{t('common.mortgage_calc.extra_payments.monthly')}</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] uppercase font-bold text-muted-foreground">{t('common.mortgage_calc.extra_payments.mode')}</label>
                                    <select
                                        value={p.mode}
                                        onChange={(e) => updateExtraPayment(p.id, { mode: e.target.value as 'reduce-term' | 'reduce-payment' })}
                                        className="w-full bg-muted/30 border-none rounded px-2 py-1 text-xs"
                                    >
                                        <option value="reduce-term">{t('common.mortgage_calc.extra_payments.reduce_term')}</option>
                                        <option value="reduce-payment">{t('common.mortgage_calc.extra_payments.reduce_payment')}</option>
                                    </select>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeExtraPayment(p.id)} className="text-destructive h-8 w-8">
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
