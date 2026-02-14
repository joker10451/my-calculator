import { useComparison } from "@/context/ComparisonContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Scale, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const ComparisonPage = () => {
    const { items, removeItem, clearAll } = useComparison();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            maximumFractionDigits: 0,
        }).format(value);
    };

    const getCalculatorName = (id: string) => {
        switch (id) {
            case 'mortgage': return 'Ипотека';
            case 'credit': return 'Кредит';
            case 'salary': return 'Зарплата';
            case 'court-fee': return 'Госпошлина';
            default: return id;
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-muted/30">
            <Helmet>
                <title>Сравнение расчетов | Считай.RU</title>
            </Helmet>
            <Header />

            <main className="flex-1 py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
                        <div>
                            <Link to="/" className="text-primary hover:underline flex items-center gap-2 mb-4">
                                <ArrowLeft className="w-4 h-4" />
                                Вернуться на главную
                            </Link>
                            <h1 className="text-4xl font-bold flex items-center gap-3">
                                <Scale className="w-8 h-8 text-primary" />
                                Сравнение результатов
                            </h1>
                        </div>
                        {items.length > 0 && (
                            <Button variant="destructive" onClick={clearAll} className="w-fit">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Очистить всё
                            </Button>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-20 bg-background rounded-2xl border-2 border-dashed border-muted flex flex-col items-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
                                <Scale className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Список сравнения пуст</h3>
                            <p className="text-muted-foreground mb-8">Добавляйте результаты расчетов из калькуляторов, чтобы сравнить их здесь.</p>
                            <Link to="/">
                                <Button variant="hero">Перейти к калькуляторам</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {items.map((item) => (
                                <div key={item.id} className="glass-card p-6 flex flex-col relative group animate-fade-in translate-y-0 transition-all hover:-translate-y-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeItem(item.id)}
                                    >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>

                                    <div className="mb-4">
                                        <span className="text-[10px] uppercase font-bold text-primary tracking-wider px-2 py-1 bg-primary/10 rounded-full mb-2 inline-block">
                                            {getCalculatorName(item.calculatorId)}
                                        </span>
                                        <h3 className="text-xl font-bold line-clamp-2 min-h-[3.5rem] leading-tight">
                                            {item.title}
                                        </h3>
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <div className="p-3 bg-muted/50 rounded-lg">
                                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">
                                                {item.calculatorId === 'court-fee' ? 'Госпошлина' : 'Ежемес. платеж / На руки'}
                                            </p>
                                            <p className="text-2xl font-black text-primary">
                                                {item.calculatorId === 'court-fee' 
                                                    ? formatCurrency(item.data.finalFee)
                                                    : formatCurrency(item.data.monthlyPayment)
                                                }
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 text-sm">
                                            {item.calculatorId === 'court-fee' ? (
                                                <>
                                                    <div className="flex justify-between border-b border-border pb-1">
                                                        <span className="text-muted-foreground">Цена иска</span>
                                                        <span className="font-semibold">{formatCurrency(item.params.claimAmount)}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-border pb-1">
                                                        <span className="text-muted-foreground">Тип суда</span>
                                                        <span className="font-semibold">{item.data.courtType}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-border pb-1">
                                                        <span className="text-muted-foreground">Льгота</span>
                                                        <span className="font-semibold">{item.params.exemption}</span>
                                                    </div>
                                                    {item.data.exemptionDiscount > 0 && (
                                                        <div className="flex justify-between border-b border-border pb-1">
                                                            <span className="text-muted-foreground">Экономия</span>
                                                            <span className="font-semibold text-green-600">
                                                                -{formatCurrency(item.data.exemptionDiscount)}
                                                            </span>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex justify-between border-b border-border pb-1">
                                                        <span className="text-muted-foreground">Сумма кредита / Оклад</span>
                                                        <span className="font-semibold">{formatCurrency(item.data.loanAmount)}</span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-border pb-1">
                                                        <span className="text-muted-foreground">Переплата / Налог</span>
                                                        <span className="font-semibold text-destructive">
                                                            {item.calculatorId === 'salary' ? '-' : ''}{formatCurrency(item.data.totalOverpayment)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between border-b border-border pb-1">
                                                        <span className="text-muted-foreground">Всего выплат</span>
                                                        <span className="font-semibold">
                                                            {formatCurrency(item.data.totalAmount || (item.data.monthlyPayment * 12))}
                                                        </span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        <Link to={
                                            item.calculatorId === 'mortgage' ? '/calculator/mortgage' : 
                                            item.calculatorId === 'credit' ? '/calculator/credit' : 
                                            item.calculatorId === 'salary' ? '/calculator/salary' :
                                            item.calculatorId === 'court-fee' ? '/calculator/court-fee' :
                                            '/'
                                        }>
                                            <Button variant="outline" className="w-full gap-2 text-xs">
                                                К расчету
                                                <ArrowRight className="w-3 h-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ComparisonPage;
