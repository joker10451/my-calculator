import CalculatorLayout from "@/components/CalculatorLayout";

const LegalPage = ({ type }: { type: 'privacy' | 'terms' }) => {
    const isPrivacy = type === 'privacy';
    return (
        <CalculatorLayout
            title={isPrivacy ? "Политика конфиденциальности" : "Пользовательское соглашение"}
            description="Юридическая информация для пользователей сервиса Считай.RU"
        >
            <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
                <section>
                    <h3 className="text-xl font-bold mb-4">1. Общие положения</h3>
                    <p className="text-muted-foreground">
                        Пользуясь сайтом Считай.RU, вы соглашаетесь с данными условиями. Сервис предоставляется "как есть" в информационных целях.
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-4">2. Использование данных</h3>
                    <p className="text-muted-foreground">
                        {isPrivacy
                            ? "Мы не собираем персональные данные (ФИО, телефоны). Результаты расчетов сохраняются только в локальной памяти вашего браузера (LocalStorage)."
                            : "Все расчеты носят рекомендательный характер. Для окончательного принятия решений рекомендуем обращаться к профессиональным консультантам."}
                    </p>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-4">3. Ответственность</h3>
                    <p className="text-muted-foreground">
                        Администрация сервиса не несет ответственности за возможные убытки, возникшие вследствие использования результатов наших калькуляторов.
                    </p>
                </section>

                <p className="pt-8 border-t text-sm text-muted-foreground">
                    Дата последнего обновления: 12 января 2026 г.
                </p>
            </div>
        </CalculatorLayout>
    );
};

export default LegalPage;
