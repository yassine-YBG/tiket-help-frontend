import { ComingSoon } from '@/components/feedback/ComingSoon';

export default function MyTicketsPage() {
  return (
    <ComingSoon
      title="My tickets"
      description="Follow the tickets you have opened."
      endpoint="GET /tickets/my"
    />
  );
}
