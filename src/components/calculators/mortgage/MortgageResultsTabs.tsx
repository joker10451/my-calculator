import { Table as TableIcon, LineChart as LineChartIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend } from 'recharts';

interface MortgageResultsTabsProps {
    calculations: any;
    formatCurrency: (v: number) => string;
}

export const MortgageResultsTabs = ({
    calculations,
    formatCurrency
}: MortgageResultsTabsProps) => {
    return (
        <Tabs defaultValue="schedule">
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
                <TabsTrigger value="schedule" className="gap-2">
                    <TableIcon className="w-4 h-4" />
                    График
                </TabsTrigger>
                <TabsTrigger value="charts" className="gap-2">
                    <LineChartIcon className="w-4 h-4" />
                    Динамика
                </TabsTrigger>
            </TabsList>
            <TabsContent value="schedule" className="mt-4">
                <div className="glass-card p-6 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b text-left text-muted-foreground">
                                    <th className="pb-2 font-medium">№</th>
                                    <th className="pb-2 font-medium">Платеж</th>
                                    <th className="pb-2 font-medium">Основной долг</th>
                                    <th className="pb-2 font-medium">Проценты</th>
                                    <th className="pb-2 font-medium">Остаток</th>
                                </tr>
                            </thead>
                            <tbody>
                                {calculations.schedule.slice(0, 100).map((item: any) => (
                                    <tr key={item.month} className={`border-b last:border-0 hover:bg-slate-50 transition-colors ${item.isEarly ? 'bg-green-50/50' : ''}`}>
                                        <td className="py-2 text-muted-foreground">{item.month}</td>
                                        <td className="py-2 font-semibold">
                                            {formatCurrency(item.payment)}
                                            {item.isEarly && <span className="ml-2 text-[10px] text-green-600 font-bold uppercase">Досрочно</span>}
                                        </td>
                                        <td className="py-2">{formatCurrency(item.principal)}</td>
                                        <td className="py-2 text-destructive">{formatCurrency(item.interest)}</td>
                                        <td className="py-2 text-xs text-muted-foreground">{formatCurrency(item.balance)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="charts" className="mt-4">
                <div className="glass-card p-6 h-[400px]">
                    <h4 className="font-bold mb-6 text-center">Прогноз изменения остатка долга (тыс. ₽)</h4>
                    <ResponsiveContainer width="100%" height="90%">
                        <AreaChart data={calculations.comparisonData}>
                            <defs>
                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={24} />
                            <YAxis tick={{ fontSize: 10 }} />
                            <ChartTooltip />
                            <Legend />
                            <Area
                                type="monotone"
                                name="С досрочными"
                                dataKey="current"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCurrent)"
                            />
                            <Area
                                type="monotone"
                                name="Без досрочных"
                                dataKey="standard"
                                stroke="#94A3B8"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fill="none"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </TabsContent>
        </Tabs>
    );
};
