import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    gradient: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
}

export const FeatureCard = ({
    icon: Icon,
    title,
    description,
    gradient
}: FeatureCardProps) => {
    return (
        <div className={`feature-card feature-card-${gradient}`}>
            <div className="feature-icon mb-4">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-sm opacity-90">{description}</p>
        </div>
    );
};
