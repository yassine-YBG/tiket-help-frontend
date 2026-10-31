import { ComingSoon } from '@/components/feedback/ComingSoon';

export default function AllTicketsPage() {
  return (
    <ComingSoon
      title="All tickets"
      description="Every ticket: filter, assign and resolve."
      endpoint="GET /tickets"
    />
  );
}
