import CalculatorPageWrapper from "@/components/CalculatorPageWrapper";
import CurrencyConverter from "@/components/calculators/CurrencyConverter";

const CurrencyConverterPage = () => {
    const faqItems = [
        {
            question: "Откуда берутся курсы валют?",
            answer: "Курсы валют обновляются ежедневно на основе данных Центрального Банка РФ и международных валютных бирж. Мы используем актуальные рыночные котировки для точного расчета."
        },
        {
            question: "Можно ли использовать конвертер для бизнеса?",
            answer: "Да, наш конвертер подходит для предварительных расчетов в бизнесе. Однако для официальных операций рекомендуем уточнять курс в вашем банке, так как банковские курсы могут отличаться от биржевых."
        },
        {
            question: "Какие валюты поддерживаются?",
            answer: "Конвертер поддерживает основные мировые валюты: российский рубль (RUB), доллар США (USD), евро (EUR), китайский юань (CNY), британский фунт (GBP), японская иена (JPY) и другие популярные валюты."
        }
    ];

    return (
        <CalculatorPageWrapper
            seoTitle="Конвертер валют онлайн 2026 - Курс доллара, евро, юаня"
            seoDescription="Бесплатный онлайн конвертер валют с актуальными курсами ЦБ РФ. Перевод рублей в доллары, евро, юани и другие валюты. Быстро и точно."
            seoKeywords="конвертер валют, курс валют, доллар, евро, юань, обмен валют, калькулятор валют"
            canonical="https://schitay-online.ru/calculator/currency"
            schemaName="Конвертер валют"
            schemaDescription="Бесплатный онлайн конвертер валют с актуальными курсами"
            title="Конвертер валют"
            description="Удобный перевод валют по актуальному курсу: доллары, евро, юани и другие"
            category="Финансы"
            categoryHref="/category/financial"
            faqItems={faqItems}
            calculator={<CurrencyConverter />}
        />
    );
};

export default CurrencyConverterPage;
