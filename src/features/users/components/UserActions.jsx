import { useState } from 'react';
import { toast } from 'sonner';
import { ArchiveRestoreIcon, PowerIcon, PowerOffIcon, Trash2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useAuth } from '@/features/auth/useAuth';
import { ROLE_LABELS, ROLES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { canManage, isSupportRole } from '../userPermissions';
import { useDeleteUser, useRestoreUser, useSetActivated, useSetRole } from '../hooks/useUsers';

const fullName = (u) => `${u.username} ${u.lastname ?? ''}`.trim();
const released = (result) =>
  result?.ticketsReleased ? ` ${result.ticketsReleased} open ticket(s) went back to the team.` : '';

// Run a mutation, show a toast, and rethrow so a ConfirmDialog stays open on error
const run = (promise, success) =>
  promise.then(
    (result) => toast.success(`${success}${released(result)}`),
    (error) => {
      toast.error(getErrorMessage(error));
      throw error;
    }
  );

// Extra sentence when the account belongs to the support team
const ticketsNote = (user) =>
  isSupportRole(user.role) ? ' Their open tickets go back to the team so another admin can take them.' : '';

function ActivationButton({ user }) {
  const setActivated = useSetActivated();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const name = fullName(user);

  if (!user.activated) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={setActivated.isPending}
        onClick={() => run(setActivated.mutateAsync({ id: user._id, activated: true }), `${name} activated.`).catch(() => {})}
      >
        <PowerIcon />
        Activate
      </Button>
    );
  }
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setConfirmOpen(true)}>
        <PowerOffIcon />
        Deactivate
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Deactivate ${name}?`}
        description={`They are logged out and cannot log in until an admin activates the account again.${ticketsNote(user)}`}
        confirmLabel="Deactivate"
        onConfirm={() => run(setActivated.mutateAsync({ id: user._id, activated: false }), `${name} deactivated.`)}
      />
    </>
  );
}

function DeleteButton({ user }) {
  const remove = useDeleteUser();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const name = fullName(user);
  return (
    <>
      <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => setConfirmOpen(true)}>
        <Trash2Icon />
        Delete
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete ${name}?`}
        description={`The account is blocked and hidden from the list. Their tickets are kept, and you can restore the account later from the "Deleted" filter.${ticketsNote(user)}`}
        confirmLabel="Delete"
        destructive
        onConfirm={() => run(remove.mutateAsync({ id: user._id }), `${name} deleted.`)}
      />
    </>
  );
}

function RestoreButton({ user }) {
  const restore = useRestoreUser();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={restore.isPending}
      onClick={() => run(restore.mutateAsync({ id: user._id }), `${fullName(user)} restored.`).catch(() => {})}
    >
      <ArchiveRestoreIcon />
      Restore
    </Button>
  );
}

// Superadmin only. Demoting a support account asks first (their open tickets are released).
export function RoleSelect({ user }) {
  const setRole = useSetRole();
  const [pendingRole, setPendingRole] = useState(null);
  const name = fullName(user);

  const change = (role) =>
    run(setRole.mutateAsync({ id: user._id, role }), `${name} is now ${ROLE_LABELS[role]}.`);

  const onValueChange = (role) => {
    if (role === user.role) return;
    if (role === ROLES.USER && isSupportRole(user.role)) setPendingRole(role);
    else change(role).catch(() => {});
  };

  return (
    <>
      <Select value={user.role} onValueChange={onValueChange} disabled={setRole.isPending}>
        <SelectTrigger size="sm" aria-label={`Role of ${name}`} className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(ROLES).map((role) => (
            <SelectItem key={role} value={role}>
              {ROLE_LABELS[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <ConfirmDialog
        open={!!pendingRole}
        onOpenChange={(open) => !open && setPendingRole(null)}
        title={`Make ${name} a normal user?`}
        description={`They lose access to the administration pages.${ticketsNote(user)}`}
        confirmLabel="Change role"
        onConfirm={() => change(pendingRole)}
      />
    </>
  );
}

// Buttons for one row. Only what the backend would accept is shown.
export function UserActions({ user }) {
  const { user: me } = useAuth();
  if (!canManage(me, user)) return <span className="text-xs text-muted-foreground">—</span>;
  if (user.deleted) return <RestoreButton user={user} />;
  return (
    <div className="flex flex-wrap items-center justify-end gap-1">
      <ActivationButton user={user} />
      <DeleteButton user={user} />
    </div>
  );
}

