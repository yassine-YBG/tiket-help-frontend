import { ComingSoon } from '@/components/feedback/ComingSoon';

export default function ProfilePage() {
  return (
    <ComingSoon
      title="Profile"
      description="Your account and password."
      endpoint="GET /auth/me"
    />
  );
}
