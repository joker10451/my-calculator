// Utility script to generate feature sections for all calculators
// This helps maintain consistency across all calculator components

export const calculatorFeatures = {
    salary: {
        title: "О калькуляторе зарплаты",
        description: "Калькулятор зарплаты поможет вам рассчитать чистую зарплату на руки с учетом всех налогов и взносов. Инструмент учитывает НДФЛ, страховые взносы и вычеты.",
        features: [
            { icon: "Calculator", title: "Расчет зарплаты на руки", description: "Точный расчет с учетом всех налогов", gradient: "blue" },
            { icon: "Percent", title: "Учет НДФЛ и взносов", description: "Автоматический расчет налогов", gradient: "green" },
            { icon: "TrendingUp", title: "Налоговые вычеты", description: "Стандартные, имущественные, социальные", gradient: "purple" },
            { icon: "Calendar", title: "Расчет по месяцам", description: "Помесячная разбивка выплат", gradient: "orange" },
            { icon: "FileText", title: "Детальная разбивка", description: "Все начисления и удержания", gradient: "pink" },
            { icon: "BarChart3", title: "Сравнение вариантов", description: "Сопоставьте разные условия", gradient: "blue" }
        ],
        steps: [
            "Введите размер вашей зарплаты (до налогов)",
            "Укажите применимые налоговые вычеты",
            "Просмотрите расчет зарплаты на руки",
            "Сохраните или экспортируйте результаты"
        ]
    },
    bmi: {
        title: "О калькуляторе ИМТ",
        description: "Калькулятор индекса массы тела (ИМТ) поможет вам определить, соответствует ли ваш вес норме. Инструмент использует формулу ВОЗ и учитывает возраст и пол.",
        features: [
            { icon: "Activity", title: "Расчет ИМТ по формуле ВОЗ", description: "Точный расчет индекса массы тела", gradient: "blue" },
            { icon: "TrendingUp", title: "Оценка состояния", description: "Определение категории веса", gradient: "green" },
            { icon: "Target", title: "Целевой вес", description: "Рекомендации по достижению нормы", gradient: "purple" },
            { icon: "BarChart3", title: "Визуализация прогресса", description: "График изменения веса", gradient: "orange" },
            { icon: "Heart", title: "Рекомендации по здоровью", description: "Советы по питанию и активности", gradient: "pink" },
            { icon: "Calendar", title: "Отслеживание динамики", description: "История измерений", gradient: "blue" }
        ],
        steps: [
            "Введите ваш рост в сантиметрах",
            "Укажите текущий вес в килограммах",
            "Просмотрите результаты и рекомендации",
            "Сохраните данные для отслеживания прогресса"
        ]
    },
    deposit: {
        title: "О калькуляторе вкладов",
        description: "Калькулятор вкладов поможет вам рассчитать доходность банковского депозита с учетом капитализации процентов и регулярных пополнений.",
        features: [
            { icon: "Calculator", title: "Расчет с капитализацией", description: "Точный расчет сложных процентов", gradient: "blue" },
            { icon: "TrendingUp", title: "Регулярные пополнения", description: "Учет ежемесячных взносов", gradient: "green" },
            { icon: "Calendar", title: "Периоды капитализации", description: "Ежемесячно, ежеквартально, ежегодно", gradient: "purple" },
            { icon: "Scale", title: "Сравнение вкладов", description: "Сопоставьте предложения банков", gradient: "orange" },
            { icon: "Percent", title: "Эффективная ставка", description: "Реальная доходность вклада", gradient: "pink" },
            { icon: "BarChart3", title: "График начислений", description: "Визуализация роста капитала", gradient: "blue" }
        ],
        steps: [
            "Введите начальную сумму вклада",
            "Укажите процентную ставку банка",
            "Выберите срок и периодичность капитализации",
            "Просмотрите прогноз доходности"
        ]
    }
};
