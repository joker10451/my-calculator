import { TrendingDown, Download, Share2, Scale, TrendingDown as SavingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip as ChartTooltip, Legend } from 'recharts';
import { useTranslation } from "react-i18next";

interface MortgageSummaryProps {
    calculations: any;
    formatCurrency: (v: number) => string;
    handleDownload: () => void;
    handleShare: () => void;
    handleCompare: () => void;
}

export const MortgageSummary = ({
    calculations,
    formatCurrency,
    handleDownload,
    handleShare,
    handleCompare
}: MortgageSummaryProps) => {
    const { t } = useTranslation();

    return (
        <div id="mortgage-results" className="lg:col-span-5 space-y-6">
            <div className="glass-card p-6 bg-primary/5 border-primary/20">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <TrendingDown className="w-6 h-6 text-primary" />
                    {t('common.mortgage_calc.title')}
                </h3>

                <div className="space-y-6">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">{t('common.mortgage_calc.summary.monthly')}</p>
                        <div className="text-4xl font-black text-primary animate-count-up">
                            {formatCurrency(calculations.monthlyPayment)}
                        </div>
                    </div>

                    {calculations.savings > 0 && (
                        <div className="p-4 bg-green-50 rounded-2xl border border-green-200 animate-fade-in">
                            <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                                <SavingsIcon className="w-5 h-5" />
                                {t('common.mortgage_calc.comparison.benefits')}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-[10px] text-green-600 uppercase font-bold">{t('common.mortgage_calc.summary.savings')}</p>
                                    <p className="text-xl font-black text-green-700">{formatCurrency(calculations.savings)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-green-600 uppercase font-bold">{t('common.mortgage_calc.comparison.term_reduction')}</p>
                                    <p className="text-xl font-black text-green-700">
                                        {Math.floor(calculations.termReductionMonths / 12)}{t('common.mortgage_calc.comparison.years_short')} {calculations.termReductionMonths % 12}{t('common.mortgage_calc.comparison.months_short')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-primary/10">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">{t('common.mortgage_calc.summary.total')}</p>
                            <p className="font-bold">{formatCurrency(calculations.totalAmount)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase font-bold">{t('common.mortgage_calc.summary.overpayment')}</p>
                            <p className="font-bold text-destructive">{formatCurrency(calculations.totalInterest)}</p>
                        </div>
                    </div>

                    {/* Pie Chart */}
                    <div className="h-[200px] w-full pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Тело', value: calculations.loanAmount, color: '#3b82f6' },
                                        { name: 'Проценты', value: calculations.totalInterest, color: '#ef4444' }
                                    ]}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <ChartTooltip formatter={(v: number) => formatCurrency(v)} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-3 pt-6 border-t border-primary/10">
                        <Button className="w-full gap-2 py-6 text-lg" variant="hero" onClick={handleDownload}>
                            <Download className="w-6 h-6" />
                            {t('common.footer.download')}
                        </Button>
                        <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" className="gap-2" onClick={handleShare}>
                                <Share2 className="w-4 h-4" />
                                {t('common.footer.share')}
                            </Button>
                            <Button variant="secondary" className="gap-2" onClick={handleCompare}>
                                <Scale className="w-4 h-4" />
                                {t('common.footer.to_comparison')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
