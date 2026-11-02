import { useState } from 'react';
import { toast } from 'sonner';
import { CheckIcon, UserCheckIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/layout/PageHeader';
import { TableSkeleton } from '@/components/data/TableSkeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useAuth } from '@/features/auth/useAuth';
import { formatDate } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import { canManage } from '../userPermissions';
import { useDeleteUser, usePendingUsers, useSetActivated } from '../hooks/useUsers';
import { RoleBadge } from '../components/UserBadges';

function PendingRow({ user }) {
  const { user: me } = useAuth();
  const approve = useSetActivated();
  const reject = useDeleteUser();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const name = `${user.username} ${user.lastname ?? ''}`.trim();
  const allowed = canManage(me, user);

  const onApprove = () =>
    approve.mutateAsync({ id: user._id, activated: true }).then(
      () => toast.success(`${name} can now log in.`),
      (error) => toast.error(getErrorMessage(error))
    );

  const onReject = () =>
    reject.mutateAsync({ id: user._id }).then(
      () => toast.success(`${name}'s request was rejected.`),
      (error) => {
        toast.error(getErrorMessage(error));
        throw error; // keeps the dialog open
      }
    );

  return (
    <TableRow>
      <TableCell className="font-medium">
        {name}
        <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
      </TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">{user.email}</TableCell>
      <TableCell>
        <RoleBadge role={user.role} />
      </TableCell>
      <TableCell className="hidden text-muted-foreground lg:table-cell">{formatDate(user.createdAt)}</TableCell>
      <TableCell className="text-right">
        {allowed ? (
          <div className="flex flex-wrap items-center justify-end gap-1">
            <Button size="sm" onClick={onApprove} disabled={approve.isPending}>
              <CheckIcon />
              Activate
            </Button>
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmOpen(true)}>
              <XIcon />
              Reject
            </Button>
            <ConfirmDialog
              open={confirmOpen}
              onOpenChange={setConfirmOpen}
              title={`Reject ${name}?`}
              description="The account is deleted (it can be restored later from Users → Deleted)."
              confirmLabel="Reject"
              destructive
              onConfirm={onReject}
            />
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">Superadmin only</span>
        )}
      </TableCell>
    </TableRow>
  );
}

// New accounts waiting for activation (GET /auth/users/pending)
export default function PendingUsersPage() {
  const { data: users, isPending, isError, error, refetch } = usePendingUsers();

  let content;
  if (isPending) content = <TableSkeleton rows={4} columns={5} />;
  else if (isError) content = <ErrorState error={error} onRetry={refetch} />;
  else if (users.length === 0) {
    content = <EmptyState icon={UserCheckIcon} title="No account is waiting" description="New registrations appear here." />;
  } else {
    content = (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="hidden lg:table-cell">Registered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <PendingRow key={user._id} user={user} />
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <>
      <PageHeader refreshable title="Pending accounts" description="New accounts waiting for activation." />
      <Card className="py-4">
        <CardContent className="px-4">{content}</CardContent>
      </Card>
    </>
  );
}
