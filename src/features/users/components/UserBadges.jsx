import { ShieldCheckIcon, ShieldIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS } from '@/lib/constants';

export function RoleBadge({ role }) {
  if (role === 'superadmin') {
    return (
      <Badge variant="brand">
        <ShieldCheckIcon />
        {ROLE_LABELS[role]}
      </Badge>
    );
  }
  if (role === 'admin') {
    return (
      <Badge variant="secondary">
        <ShieldIcon />
        {ROLE_LABELS[role]}
      </Badge>
    );
  }
  return <Badge variant="outline">{ROLE_LABELS[role] ?? role}</Badge>;
}

export function AccountStatusBadge({ user }) {
  if (user.deleted) return <Badge variant="danger">Deleted</Badge>;
  if (!user.activated) return <Badge variant="warning">Inactive</Badge>;
  return (
    <Badge variant="success" className="gap-1.5 pl-1.5">
      <span aria-hidden className="size-1.5 rounded-full bg-success" />
      Active
    </Badge>
  );
}
