import { ComingSoon } from '@/components/feedback/ComingSoon';

export default function UsersPage() {
  return (
    <ComingSoon
      title="Users"
      description="Manage accounts, roles and access."
      endpoint="GET /auth/users"
    />
  );
}
