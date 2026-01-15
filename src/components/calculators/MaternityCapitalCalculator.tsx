import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calculator, Baby, Info, Share2, Wallet, Calendar, Download } from "lucide-react";
import { exportToPDF } from "@/lib/pdfService";
import { STAMP_BASE64 } from "@/lib/assets";
import { CalculatorActions } from "@/components/CalculatorActions";
import { CalculatorHistory } from "@/components/CalculatorHistory";
import { parseShareableLink } from "@/utils/exportUtils";
import { useCalculatorCommon } from "@/hooks/useCalculatorCommon";

// Official data for 2026 (approved by Putin)
const BASE_CAPITAL = 934058; // 1st child (2026)
const ADD_CAPITAL = 230000; // 2nd child (if 1st was after 2020)
const FULL_CAPITAL_2ND = 934058; // 2nd child (total)

const MaternityCapitalCalculator = () => {
    const { formatCurrency, saveCalculation, showToast } = useCalculatorCommon('maternity-capital', 'Калькулятор материнского капитала');
    const [firstChildYear, setFirstChildYear] = useState<number | null>(2026);
    const [secondChildYear, setSecondChildYear] = useState<number | null>(null);
    const [hasSecondChild, setHasSecondChild] = useState(false);

    useEffect(() => {
        const params = parseShareableLink();
        if (params) {
            if (params.firstChildYear) setFirstChildYear(params.firstChildYear);
            if (params.secondChildYear) setSecondChildYear(params.secondChildYear);
            if (params.hasSecondChild !== undefined) setHasSecondChild(params.hasSecondChild);
        }
    }, []);

    const calculateCapital = () => {
        let total = 0;

        // Logic simplification for MVP
        if (!hasSecondChild) {
            // Only 1 child
            if (firstChildYear && firstChildYear >= 2020) return BASE_CAPITAL;
            return 0; // No capital for 1st child before 2020
        } else {
            // 2 children
            if (firstChildYear && firstChildYear < 2020) {
                // 1st before 2020, 2nd after 2020 (presumably)
                if (secondChildYear && secondChildYear >= 2020) return FULL_CAPITAL_2ND;
            } else if (firstChildYear && firstChildYear >= 2020) {
                // 1st after 2020
                if (secondChildYear && secondChildYear >= 2020) return FULL_CAPITAL_2ND;
            }
            return 0; // Fallback
        }
    };

    const totalAmount = useMemo(() => calculateCapital(), [firstChildYear, secondChildYear, hasSecondChild]);

    const handleDownload = async () => {
        showToast("Генерация PDF", "Пожалуйста, подождите...");
        const success = await exportToPDF("maternity-report-template", `материнский_капитал_${new Date().toISOString().split('T')[0]}`, STAMP_BASE64);
        if (success) {
            showToast("Успех!", "PDF-отчет успешно сформирован.");
        } else {
            showToast("Ошибка", "Не удалось создать PDF-отчет.", "destructive");
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-8">
                {/* Input Form */}
                <div className="lg:col-span-3 space-y-8">

                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Baby className="w-5 h-5 text-primary" />
                            Ваши дети
                        </h3>

                        {/* 1st Child */}
                        <div className="p-4 border rounded-xl bg-card space-y-4">
                            <label className="text-base font-medium block">Первый ребенок</label>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">Год рождения:</span>
                                <select
                                    value={firstChildYear || ''}
                                    onChange={(e) => setFirstChildYear(Number(e.target.value))}
                                    className="calc-input h-10 w-32"
                                >
                                    {Array.from({ length: 27 }, (_, i) => 2000 + i).map(y => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 2nd Child Toggle */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="hasSecondChild"
                                checked={hasSecondChild}
                                onChange={(e) => setHasSecondChild(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="hasSecondChild" className="font-medium cursor-pointer">
                                Есть второй ребенок
                            </label>
                        </div>

                        {/* 2nd Child Input */}
                        {hasSecondChild && (
                            <div className="p-4 border rounded-xl bg-card space-y-4 animate-fade-in">
                                <label className="text-base font-medium block">Второй ребенок</label>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground">Год рождения:</span>
                                    <select
                                        value={secondChildYear || 2026}
                                        onChange={(e) => setSecondChildYear(Number(e.target.value))}
                                        className="calc-input h-10 w-32"
                                    >
                                        {Array.from({ length: 27 }, (_, i) => 2000 + i).map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Info Block */}
                    <div className="bg-muted/50 p-4 rounded-xl flex gap-3 text-sm text-muted-foreground">
                        <Info className="w-5 h-5 flex-shrink-0 text-primary" />
                        <p>
                            Материнский капитал проиндексирован с 1 февраля 2025 и 2026 года. Расчет актуален на весь 2026 год.
                        </p>
                    </div>
                </div>

                {/* Results */}
                <div className="lg:col-span-2">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            <Calculator className="w-5 h-5 text-primary" />
                            Размер выплаты
                        </h3>

                        {/* Total */}
                        <div className="mb-6">
                            <div className="text-sm text-muted-foreground mb-1">
                                Положено к выплате
                            </div>
                            <div className="calc-result animate-count-up text-3xl md:text-4xl text-balance">
                                {formatCurrency(totalAmount)}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4 py-4 border-t border-border">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    Индексация
                                </span>
                                <span className="font-semibold">Февраль 2026</span>
                            </div>
                            <div className="text-xs text-muted-foreground pt-2">
                                Сумма является предварительной. Точный размер узнавайте в СФР.
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3 pt-4 border-t border-border">
                            <Button variant="hero" className="w-full gap-2" onClick={handleDownload}>
                                <Download className="w-5 h-5" />
                                Скачать PDF
                            </Button>
                            <Button variant="outline" className="w-full gap-2">
                                <Share2 className="w-5 h-5" />
                                Сохранить
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden PDF Template */}
            <div className="fixed -left-[9999px] top-0">
                <div id="maternity-report-template" className="bg-white p-12 w-[800px] text-slate-900 font-sans">
                    <div className="flex justify-between items-start mb-12 border-b-2 border-primary/20 pb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Материнский капитал</h1>
                            <p className="text-slate-600">Расчет размера выплаты • Калькулятор Считай.RU</p>
                        </div>
                        <div className="text-right text-sm text-slate-500">
                            <p>Дата: {new Date().toLocaleDateString('ru-RU')}</p>
                            <p>schitay.ru</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Данные о детях</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Первый ребенок:</span>
                                    <span className="font-semibold">{firstChildYear || "—"} год</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Второй ребенок:</span>
                                    <span className="font-semibold">
                                        {hasSecondChild ? (secondChildYear || "2026") + " год" : "Нет"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4 text-slate-800">Размер выплаты</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between text-xl">
                                    <span className="text-slate-600">К выплате:</span>
                                    <span className="font-bold text-primary">{formatCurrency(totalAmount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Индексация:</span>
                                    <span className="font-semibold">Февраль 2026</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-lg mb-8">
                        <h3 className="font-bold text-lg mb-3 text-slate-800">Актуальные размеры на 2026 год</h3>
                        <div className="text-sm text-slate-600 space-y-2">
                            <p>• На первого ребенка (рожденного с 2020 года): {formatCurrency(BASE_CAPITAL)}</p>
                            <p>• На второго ребенка (если первый до 2020): {formatCurrency(FULL_CAPITAL_2ND)}</p>
                            <p>• Доплата на второго ребенка (если первый после 2020): {formatCurrency(ADD_CAPITAL)}</p>
                            <p>• Размеры проиндексированы с февраля 2026 года</p>
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-6 rounded-lg mb-8 border border-yellow-200">
                        <h3 className="font-bold text-lg mb-3 text-yellow-800">Важная информация</h3>
                        <div className="text-sm text-yellow-700 space-y-2">
                            <p>• Данный расчет является предварительным</p>
                            <p>• Точный размер выплаты уточняйте в Социальном фонде России (СФР)</p>
                            <p>• Право на материнский капитал возникает при рождении/усыновлении ребенка</p>
                            <p>• Сертификат можно получить в электронном виде через Госуслуги</p>
                        </div>
                    </div>

                    <div className="text-center text-xs text-slate-400 border-t pt-4">
                        <p>Расчет выполнен на основе действующего законодательства РФ на 2026 год.</p>
                        <p className="mt-2">Сформировано на schitay.ru • Дата: {new Date().toLocaleString('ru-RU')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaternityCapitalCalculator;
