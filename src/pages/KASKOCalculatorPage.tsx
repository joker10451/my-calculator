import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import { OffersBlock } from "@/components/affiliate/OffersBlock";
import KASKOCalculator from "@/components/calculators/KASKOCalculator";
import { CalculatorCTA } from "@/components/CalculatorCTA";
import { Shield, Calculator, TrendingDown, Car, DollarSign, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const KASKOCalculatorPage = () => {
    const faqItems = [
        {
            question: "Что такое КАСКО и чем отличается от ОСАГО?",
            answer: "КАСКО - добровольное страхование автомобиля от ущерба, угона и полной гибели. ОСАГО - обязательное страхование ответственности перед третьими лицами. КАСКО защищает ваш автомобиль, ОСАГО - чужой."
        },
        {
            question: "Как рассчитывается стоимость КАСКО?",
            answer: "Стоимость КАСКО зависит от: стоимости автомобиля, возраста и марки авто, региона, возраста и стажа водителя, наличия противоугонной системы, франшизы, набора рисков. Обычно составляет 5-12% от стоимости авто."
        },
        {
            question: "Что такое франшиза в КАСКО?",
            answer: "Франшиза - это сумма ущерба, которую вы оплачиваете сами. Например, при франшизе 15 000₽ и ущербе 50 000₽ страховая заплатит 35 000₽. Франшиза снижает стоимость полиса на 20-40%."
        },
        {
            question: "Стоит ли покупать КАСКО на старый автомобиль?",
            answer: "Для авто старше 7-10 лет КАСКО обычно невыгодно: высокая стоимость полиса относительно цены авто, ограниченное покрытие, выплаты с учетом износа. Лучше откладывать деньги на ремонт."
        },
        {
            question: "Как сэкономить на КАСКО?",
            answer: "Способы экономии: выбрать франшизу, застраховать только от угона, установить противоугонную систему, выбрать ремонт на СТОА, оформить полис на год сразу, сравнить предложения разных компаний."
        }
    ];

    const features = [
        { icon: Calculator, text: "Расчет полного и частичного КАСКО", color: 'blue' as const },
        { icon: Shield, text: "Учет противоугонных систем", color: 'green' as const },
        { icon: TrendingDown, text: "Расчет с франшизой", color: 'purple' as const },
        { icon: Car, text: "Все марки и модели автомобилей", color: 'orange' as const },
        { icon: DollarSign, text: "Сравнение стоимости в разных компаниях", color: 'pink' as const },
        { icon: FileText, text: "Подбор оптимального покрытия", color: 'indigo' as const }
    ];

    const howToUseSteps = [
        "Введите марку и модель автомобиля",
        "Укажите год выпуска и стоимость авто",
        "Выберите регион и условия хранения",
        "Укажите возраст и стаж водителя",
        "Выберите набор рисков и франшизу",
        "Изучите расчет стоимости КАСКО"
    ];

    return (
        <CalculatorPageWrapper
            seoTitle="Калькулятор КАСКО 2026 - Рассчитать стоимость страховки онлайн"
            seoDescription="Калькулятор КАСКО 2026: рассчитайте стоимость полиса по марке авто, возрасту, региону. Сравните предложения страховых компаний — бесплатно."
            seoKeywords="каско калькулятор, расчет каско, стоимость каско 2026, калькулятор каско онлайн, франшиза каско"
            canonical="https://schitay-online.ru/calculator/kasko/"
            schemaName="Калькулятор КАСКО"
            schemaDescription="Бесплатный онлайн калькулятор для расчета стоимости полиса КАСКО"
            title="Калькулятор КАСКО"
            description="Рассчитайте стоимость добровольного страхования автомобиля"
            category="Авто"
            categoryHref="/category/auto"
            faqItems={faqItems}
                        calculator={<KASKOCalculator />}
                        afterCalculator={
                            <div className="space-y-4">
                                <CalculatorCTA
                                    testKey="kasko_main_cta"
                                    label="Рассчитать и оформить КАСКО онлайн"
                                    description="Полное и частичное КАСКО, рассрочка платежа, дистанционный осмотр. Партнёр: ВСК"
                                    href="https://trk.ppdu.ru/click/mqYRntHD?erid=2SDnjeJfe47&utm_source=schitay-online&utm_medium=calculator_cta&utm_campaign=kasko&utm_content=main_button"
                                    variant="insurance"
                                    erid="2SDnjeJfe47"
                                    calculatorId="kasko"
                                />
                                <OffersBlock
                                    product="auto_insurance"
                                    placement="result_block"
                                    title="Подходящие предложения по автострахованию"
                                    subtitle="Сравните предложения по КАСКО и ОСАГО и выберите подходящий вариант."
                                />
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    Хотите посмотреть больше предложений?{" "}
                                    <Link to="/offers?category=insurance&q=каско" className="font-semibold text-primary hover:underline">
                                        Открыть каталог предложений по КАСКО
                                    </Link>
                                </div>
                            </div>
                        }
            features={features}
            howToUseSteps={howToUseSteps}
        />
    );
};

export default KASKOCalculatorPage;
