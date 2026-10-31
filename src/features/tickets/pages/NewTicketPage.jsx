import { ComingSoon } from '@/components/feedback/ComingSoon';

export default function NewTicketPage() {
  return (
    <ComingSoon
      title="New ticket"
      description="Describe your problem and attach files if needed."
      endpoint="POST /tickets/create"
    />
  );
}
