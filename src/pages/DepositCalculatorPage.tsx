import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import { OffersBlock } from "@/components/affiliate/OffersBlock";
import DepositCalculator from "@/components/calculators/DepositCalculator";
import { TrustInfoBlock } from "@/components/TrustInfoBlock";
import { TrendingUp, PiggyBank, Calendar, BarChart3, Calculator, LineChart } from "lucide-react";
import { Link } from "react-router-dom";

const DepositCalculatorPage = () => {
    const faqItems = [
        {
            question: "Что такое капитализация процентов по вкладу?",
            answer: "Капитализация - это начисление процентов на проценты. Банк периодически (ежемесячно, ежеквартально) добавляет начисленные проценты к сумме вклада, и в следующем периоде проценты начисляются уже на увеличенную сумму. Это позволяет получить больший доход."
        },
        {
            question: "Как рассчитать доход по вкладу с капитализацией?",
            answer: "Для расчета используется формула сложных процентов: S = P × (1 + r/n)^(n×t), где P - начальная сумма, r - годовая ставка, n - количество капитализаций в год, t - срок в годах. Наш калькулятор автоматически производит этот расчет."
        },
        {
            question: "Какие ставки по вкладам в 2026 году?",
            answer: "Средние ставки по вкладам в 2026 году составляют от 8% до 18% годовых в зависимости от банка, суммы вклада и срока размещения. Самые высокие ставки предлагаются по вкладам на срок от 1 года без возможности досрочного снятия."
        },
        {
            question: "Облагаются ли проценты по вкладам налогом?",
            answer: "С 2021 года проценты по вкладам облагаются НДФЛ 13%, если их сумма превышает необлагаемый минимум (1 млн рублей × ключевая ставка ЦБ). Налог удерживается автоматически банком или налоговой службой."
        },
        {
            question: "Что выгоднее: вклад с капитализацией или без?",
            answer: "Вклад с капитализацией всегда выгоднее при прочих равных условиях, так как проценты начисляются на проценты. Однако банки могут предлагать более высокую ставку по вкладам без капитализации, поэтому нужно сравнивать итоговую доходность."
        }
    ];

    const features = [
        { icon: Calculator, text: "Расчет доходности с учетом капитализации процентов", color: 'blue' as const },
        { icon: PiggyBank, text: "Учет регулярных пополнений вклада", color: 'green' as const },
        { icon: Calendar, text: "Различные периоды капитализации (ежемесячно, ежеквартально, ежегодно)", color: 'purple' as const },
        { icon: TrendingUp, text: "Расчет эффективной процентной ставки", color: 'orange' as const },
        { icon: BarChart3, text: "График роста вклада с визуализацией", color: 'pink' as const },
        { icon: LineChart, text: "Сравнение различных вариантов вкладов", color: 'indigo' as const }
    ];

    const howToUseSteps = [
        "Введите начальную сумму вклада",
        "Укажите процентную ставку (уточните актуальную ставку в банке)",
        "Выберите срок вклада в месяцах",
        "Укажите периодичность капитализации процентов",
        "При необходимости добавьте регулярные пополнения",
        "Изучите результаты расчета и график роста вклада"
    ];

    return (
        <CalculatorPageWrapper
            seoTitle="Калькулятор вкладов 2026"
            seoDescription="Рассчитайте доходность вклада с капитализацией процентов и пополнением. Актуальные ставки банков 2026 года."
            seoKeywords="калькулятор вкладов, расчет процентов по вкладу, депозитный калькулятор, вклады 2026, капитализация процентов"
            canonical="https://schitay-online.ru/calculator/deposit/"
            schemaName="Калькулятор вкладов"
            schemaDescription="Бесплатный онлайн калькулятор для расчета доходности банковских вкладов с капитализацией"
            title="Калькулятор вкладов"
            description="Рассчитайте сложный процент по вкладу с пополнением и капитализацией"
            category="Финансы"
            categoryHref="/category/finance"
            faqItems={faqItems}
            calculator={<DepositCalculator />}
            afterCalculator={
                <div className="space-y-6">
                    <OffersBlock product="deposit" placement="result_block" />
                    <div className="surface-muted rounded-2xl p-4 md:p-5">
                        <h3 className="text-base font-semibold text-slate-900">Дополнительно к расчету вклада</h3>
                        <div className="mt-3 flex flex-wrap gap-2 text-sm">
                            <Link to="/blog/?q=вклад" className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 hover:text-primary">
                                Статьи про вклады
                            </Link>
                            <Link to="/calculator/investment/" className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 hover:text-primary">
                                Калькулятор инвестиций
                            </Link>
                            <Link to="/offers?category=debit" className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700 hover:text-primary">
                                Карты и накопительные продукты
                            </Link>
                        </div>
                    </div>
                    <div className="text-sm text-slate-600">
                        Подберите альтернативные варианты в каталоге{" "}
                        <Link to="/offers?category=debit" className="font-semibold text-primary hover:underline">
                            (карты и накопительные предложения)
                        </Link>
                        .
                    </div>
                    <TrustInfoBlock
                        page="/calculator/deposit"
                        updatedAt="Апрель 2026"
                        sourceLabel="Публичные тарифы банков и рыночные ставки"
                        methodology="Расчёт выполняется по формуле сложного процента с учётом капитализации и пополнений."
                        forWho="Для тех, кто выбирает вклад и хочет сравнить сценарии по сроку, ставке и капитализации."
                    />
                </div>
            }
            features={features}
            howToUseSteps={howToUseSteps}
        />
    );
};

export default DepositCalculatorPage;
