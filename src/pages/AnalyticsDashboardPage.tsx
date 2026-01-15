import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { SEO } from "@/components/SEO";

const AnalyticsDashboardPage = () => {
  return (
    <>
      <SEO
        title="Дашборд аналитики - Внутренняя статистика"
        description="Внутренний дашборд для отслеживания конверсий и эффективности партнерских виджетов"
        noindex={true}
      />
      <AnalyticsDashboard />
    </>
  );
};

export default AnalyticsDashboardPage;
