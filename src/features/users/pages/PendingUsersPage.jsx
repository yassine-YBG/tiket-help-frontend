import { useState } from 'react';
import { toast } from 'sonner';
import { CheckIcon, UserCheckIcon, XIcon } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PageHeader } from '@/components/layout/PageHeader';
import { DataPanel } from '@/components/data/DataPanel';
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
    <TableRow className="max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-2 max-md:py-3.5">
      <TableCell className="max-md:block max-md:basis-full max-md:p-0">
        <div className="flex items-center gap-3">
          <Avatar first={user.username} last={user.lastname} seed={user.email} size="md" />
          <div className="min-w-0">
            <div className="truncate font-medium">{name}</div>
            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
          </div>
        </div>
      </TableCell>
      <TableCell className="max-md:block max-md:p-0">
        <RoleBadge role={user.role} />
      </TableCell>
      <TableCell className="text-[13px] text-muted-foreground tabular-nums max-md:block max-md:p-0 max-md:text-xs">
        {formatDate(user.createdAt)}
      </TableCell>
      <TableCell className="text-right max-md:ml-auto max-md:block max-md:basis-full max-md:p-0">
        {allowed ? (
          <div className="flex items-center justify-end gap-1.5 max-md:[&>button]:flex-1">
            <Button size="sm" variant="outline" className="text-destructive" onClick={() => setConfirmOpen(true)}>
              <XIcon />
              Reject
            </Button>
            <Button size="sm" onClick={onApprove} disabled={approve.isPending}>
              <CheckIcon />
              Activate
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
  if (isPending) content = <TableSkeleton rows={4} columns={4} />;
  else if (isError) content = <ErrorState error={error} onRetry={refetch} />;
  else if (users.length === 0) {
    content = <EmptyState icon={UserCheckIcon} title="No account is waiting" description="New registrations appear here." />;
  } else {
    content = (
      <Table className="max-md:block">
        <TableHeader className="max-md:hidden">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Registered</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="max-md:block">
          {users.map((user) => (
            <PendingRow key={user._id} user={user} />
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <>
      <PageHeader
        refreshable
        eyebrow="Administration"
        title="Pending accounts"
        description="New accounts waiting for activation. Customers cannot log in until you activate them."
      />
      <DataPanel className="pt-1">{content}</DataPanel>
    </>
  );
}
