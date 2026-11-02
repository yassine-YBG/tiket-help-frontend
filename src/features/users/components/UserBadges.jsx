import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS } from '@/lib/constants';

export function RoleBadge({ role }) {
  const variant = role === 'superadmin' ? 'default' : role === 'admin' ? 'secondary' : 'outline';
  return <Badge variant={variant}>{ROLE_LABELS[role] ?? role}</Badge>;
}

export function AccountStatusBadge({ user }) {
  if (user.deleted) return <Badge variant="destructive">Deleted</Badge>;
  if (!user.activated) return <Badge variant="outline">Inactive</Badge>;
  return <Badge variant="secondary">Active</Badge>;
}
