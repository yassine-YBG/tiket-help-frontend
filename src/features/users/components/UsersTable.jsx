import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/features/auth/useAuth';
import { formatDate } from '@/lib/format';
import { canChangeRole, isSelf } from '../userPermissions';
import { AccountStatusBadge, RoleBadge } from './UserBadges';
import { RoleSelect, UserActions } from './UserActions';

export function UsersTable({ users }) {
  const { user: me } = useAuth();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead className="hidden md:table-cell">Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden lg:table-cell">Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user._id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {user.username} {user.lastname}
                {isSelf(me, user) && <Badge variant="outline">You</Badge>}
              </div>
              <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
            </TableCell>
            <TableCell className="hidden text-muted-foreground md:table-cell">{user.email}</TableCell>
            <TableCell>
              {canChangeRole(me, user) && !user.deleted ? <RoleSelect user={user} /> : <RoleBadge role={user.role} />}
            </TableCell>
            <TableCell>
              <AccountStatusBadge user={user} />
            </TableCell>
            <TableCell className="hidden text-muted-foreground lg:table-cell">{formatDate(user.createdAt)}</TableCell>
            <TableCell className="text-right">
              <UserActions user={user} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
