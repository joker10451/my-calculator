

interface Step {
    title: string;
    description?: string;
}

interface HowToUseSectionProps {
    steps: Step[];
    title?: string;
}

export const HowToUseSection = ({
    steps,
    title = "Как пользоваться калькулятором"
}: HowToUseSectionProps) => {
    return (
        <div className="calculator-section">
            <h2 className="section-title">{title}</h2>
            <div className="max-w-3xl mx-auto space-y-4">
                {steps.map((step, index) => (
                    <div key={index} className="flex gap-4 items-start">
                        <div className="step-number">
                            {index + 1}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                            {step.description && (
                                <p className="text-muted-foreground text-sm">{step.description}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
