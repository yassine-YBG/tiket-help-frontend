import { ComingSoon } from '@/components/feedback/ComingSoon';

export default function ActivityLogsPage() {
  return (
    <ComingSoon
      title="Activity logs"
      description="Every important action, newest first."
      endpoint="GET /activity-logs"
    />
  );
}
