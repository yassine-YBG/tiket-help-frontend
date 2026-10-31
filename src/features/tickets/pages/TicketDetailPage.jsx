import { ComingSoon } from '@/components/feedback/ComingSoon';

export default function TicketDetailPage() {
  return (
    <ComingSoon
      title="Ticket"
      description="Conversation, files and status of this ticket."
      endpoint="GET /tickets/:id"
    />
  );
}
