import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/features/auth/useAuth';
import { formatDate } from '@/lib/format';
import { canChangeRole, isSelf } from '../userPermissions';
import { AccountStatusBadge, RoleBadge } from './UserBadges';
import { RoleSelect, UserActions } from './UserActions';

// Table on tablet/desktop, stacked cards on phones (same markup, max-md: classes)
export function UsersTable({ users }) {
  const { user: me } = useAuth();
  return (
    <Table className="max-md:block">
      <TableHeader className="max-md:hidden">
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden lg:table-cell">Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="max-md:block">
        {users.map((user) => (
          <TableRow
            key={user._id}
            className={`max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-2 max-md:py-3.5 ${user.deleted ? 'opacity-70' : ''}`}
          >
            <TableCell className="max-md:block max-md:basis-full max-md:p-0">
              <div className="flex items-center gap-3">
                <Avatar first={user.username} last={user.lastname} seed={user.email} size="md" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 font-medium">
                    <span className="truncate">
                      {user.username} {user.lastname}
                    </span>
                    {isSelf(me, user) && <Badge variant="outline">You</Badge>}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                </div>
              </div>
            </TableCell>
            <TableCell className="max-md:block max-md:p-0">
              {canChangeRole(me, user) && !user.deleted ? <RoleSelect user={user} /> : <RoleBadge role={user.role} />}
            </TableCell>
            <TableCell className="max-md:block max-md:p-0">
              <AccountStatusBadge user={user} />
            </TableCell>
            <TableCell className="hidden text-[13px] text-muted-foreground tabular-nums lg:table-cell">
              {formatDate(user.createdAt)}
            </TableCell>
            <TableCell className="text-right max-md:ml-auto max-md:block max-md:p-0">
              <UserActions user={user} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
