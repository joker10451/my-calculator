import {
    Banknote,
    Home,
    Car,
    Heart,
    Users,
    TrendingUp,
    Scale
} from "lucide-react";

export const categories = [
    {
        id: "finance",
        name: "Кредиты и ипотека",
        icon: Banknote,
        color: "bg-finance/10 text-finance border-finance/20 hover:bg-finance/20",
        description: "Рассчитай платежи и переплату",
        calculators: [
            { name: "Ипотечный калькулятор", href: "/calculator/mortgage" },
            { name: "Кредитный калькулятор", href: "/calculator/credit" },
            { name: "Рефинансирование", href: "/calculator/refinancing" },
            { name: "Калькулятор вкладов", href: "/calculator/deposit" },
            { name: "Конвертер валют", href: "/calculator/currency" },
            { name: "Доходность инвестиций", href: "/calculator/investment" }
        ],
        href: "/category/finance",
    },
    {
        id: "salary",
        name: "Зарплата и налоги",
        icon: TrendingUp,
        color: "bg-finance/10 text-finance border-finance/20 hover:bg-finance/20",
        description: "НДФЛ, пенсия, самозанятость",
        calculators: [
            { name: "Калькулятор зарплаты и НДФЛ", href: "/calculator/salary" },
            { name: "Калькулятор отпускных", href: "/calculator/vacation" },
            { name: "Калькулятор больничного", href: "/calculator/sick-leave" },
            { name: "Налоги для ИП/самозанятых", href: "/calculator/self-employed" },
            { name: "Калькулятор пенсии", href: "/calculator/pension" }
        ],
        href: "/category/salary",
    },
    {
        id: "housing",
        name: "ЖКХ и коммуналка",
        icon: Home,
        color: "bg-housing/10 text-housing border-housing/20 hover:bg-housing/20",
        description: "Квартплата, свет, вода",
        calculators: [
            { name: "Калькулятор ЖКХ", href: "/calculator/utilities" }
        ],
        href: "/category/housing",
    },
    {
        id: "auto",
        name: "Авто",
        icon: Car,
        color: "bg-auto/10 text-auto border-auto/20 hover:bg-auto/20",
        description: "Расход топлива, ОСАГО, налог",
        calculators: [
            { name: "Калькулятор ОСАГО", href: "/calculator/osago" },
            { name: "Калькулятор КАСКО", href: "/calculator/kasko" },
            { name: "Расход топлива", href: "/calculator/fuel" },
        ],
        href: "/category/auto",
    },
    {
        id: "family",
        name: "Семья",
        icon: Users,
        color: "bg-family/10 text-family border-family/20 hover:bg-family/20",
        description: "Алименты, маткапитал, пособия",
        calculators: [
            { name: "Маткапитал", href: "/calculator/maternity-capital" },
            { name: "Алименты", href: "/calculator/alimony" },
        ],
        href: "/category/family",
    },
    {
        id: "legal",
        name: "Юридические",
        icon: Scale,
        color: "bg-legal/10 text-legal border-legal/20 hover:bg-legal/20",
        description: "Госпошлины, судебные расходы",
        calculators: [
            { name: "Госпошлина в суд", href: "/calculator/court-fee" },
        ],
        href: "/category/legal",
    },
];
