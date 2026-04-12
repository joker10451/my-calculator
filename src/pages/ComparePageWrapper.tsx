import { useParams } from 'react-router-dom';
import ComparePage from '@/pages/ComparePage';
import { COMPARISONS } from '@/data/comparisons';
import NotFound from '@/pages/NotFound';

export default function ComparePageWrapper() {
  const { slug } = useParams<{ slug: string }>();
  const config = COMPARISONS.find(c => c.slug === slug);

  if (!config) return <NotFound />;
  return <ComparePage config={config} />;
}
