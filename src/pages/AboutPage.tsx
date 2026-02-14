import CalculatorLayout from "@/components/CalculatorLayout";

const AboutPage = () => {
    return (
        <CalculatorLayout
            title="О сервисе Считай.RU"
            description="Универсальный помощник для финансовых, налоговых и бытовых расчетов."
        >
            <div className="max-w-3xl mx-auto prose prose-slate dark:prose-invert">
                <p className="text-lg leading-relaxed">
                    <strong>Считай.RU</strong> — это современная платформа бесплатных онлайн-калькуляторов,
                    созданная специально для жителей России и СНГ. Мы верим, что сложные финансовые
                    законы и формулы должны быть доступны каждому в один клик.
                </p>

                <h3 className="text-2xl font-bold mt-8 mb-4">Наша миссия</h3>
                <p>
                    Помогать людям принимать взвешенные финансовые решения. Будь то ипотека на 30 лет,
                    расчет налогов или проверка индекса массы тела — наши алгоритмы работают на основе
                    актуальных данных и законодательства 2026 года.
                </p>

                <h3 className="text-2xl font-bold mt-8 mb-4">Почему нам доверяют</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Точность:</strong> Все формулы проходят двойную проверку на соответствие НК РФ и ГК РФ.</li>
                    <li><strong>Конфиденциальность:</strong> Мы не храним ваши личные данные. Все расчеты происходят на стороне вашего браузера.</li>
                    <li><strong>Скорость:</strong> Никакой регистрации. Результат за 10 секунд.</li>
                </ul>

                <p className="mt-12 text-muted-foreground italic">
                    С уважением, команда разработчиков Считай.RU
                </p>
            </div>
        </CalculatorLayout>
    );
};

export default AboutPage;
