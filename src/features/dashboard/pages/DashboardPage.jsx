import { ComingSoon } from '@/components/feedback/ComingSoon';

export default function DashboardPage() {
  return (
    <ComingSoon
      title="Dashboard"
      description="Overview of the support activity."
      endpoint="GET /stats"
    />
  );
}
