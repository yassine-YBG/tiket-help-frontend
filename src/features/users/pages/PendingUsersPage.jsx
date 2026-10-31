import { ComingSoon } from '@/components/feedback/ComingSoon';

export default function PendingUsersPage() {
  return (
    <ComingSoon
      title="Pending accounts"
      description="New accounts waiting for activation."
      endpoint="GET /auth/users/pending"
    />
  );
}
