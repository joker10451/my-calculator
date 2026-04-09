import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { SEO } from "@/components/SEO";
import NotFound from "@/pages/NotFound";

const AnalyticsDashboardPage = () => {
  const dashboardKey = import.meta.env.VITE_ANALYTICS_DASHBOARD_KEY;
  const providedKey = new URLSearchParams(window.location.search).get("key");
  const isAccessAllowed = Boolean(dashboardKey) && providedKey === dashboardKey;

  if (!isAccessAllowed) {
    return <NotFound />;
  }

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
