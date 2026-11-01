import { useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { ArchiveIcon, ArchiveRestoreIcon, UserCheckIcon, UserRoundCogIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useAuth } from '@/features/auth/useAuth';
import { ROLES } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { useArchiveTicket, useAssignToMe, useUnarchiveTicket } from '../hooks/useTickets';
import { assignment, nameOf } from '../ticketUtils';

// "Assign to me" — or "Take over" (with confirmation) when another admin handles it.
// Also used above the conversation, where support must assign before replying.
export function AssignButton({ ticket, className = 'w-full' }) {
  const { user } = useAuth();
  const assign = useAssignToMe(ticket._id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const who = assignment(ticket, user);

  if (who === 'me') {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <UserCheckIcon className="size-4" />
        You are handling this ticket
      </p>
    );
  }

  const run = () =>
    assign.mutateAsync().then(
      () => toast.success(who === 'other' ? 'You took over this ticket' : 'Ticket assigned to you'),
      (error) => {
        toast.error(getErrorMessage(error));
        throw error; // keeps the confirm dialog open
      }
    );

  if (who === 'nobody') {
    return (
      <Button onClick={() => run().catch(() => {})} disabled={assign.isPending} className={className}>
        {assign.isPending ? <Spinner /> : <UserCheckIcon />}
        Assign to me
      </Button>
    );
  }

  const otherName = nameOf(ticket.handledBy);
  return (
    <>
      <Button variant="outline" onClick={() => setConfirmOpen(true)} className={className}>
        <UserRoundCogIcon />
        Take over
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Take over this ticket?"
        description={`${otherName} is handling this ticket. If you take it over, it will be assigned to you instead.`}
        confirmLabel="Take over"
        onConfirm={run}
      />
    </>
  );
}

// Same rule as the backend: the admin handling the ticket, or any superadmin
function canArchive(ticket, user) {
  return user.role === ROLES.SUPERADMIN || assignment(ticket, user) === 'me';
}

// "Archive" = closed by support: the ticket leaves the admin lists, the owner keeps it
function ArchiveButton({ ticket }) {
  const navigate = useNavigate();
  const archive = useArchiveTicket(ticket._id);
  const [open, setOpen] = useState(false);

  if (ticket.status !== 'résolu') {
    return <p className="text-xs text-muted-foreground">Resolve the ticket to be able to archive it.</p>;
  }

  const onConfirm = async () => {
    try {
      await archive.mutateAsync();
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error; // keeps the dialog open
    }
    toast.success('Ticket archived');
    navigate('/admin/tickets');
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)} className="w-full">
        <ArchiveIcon />
        Archive ticket
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Archive this ticket?"
        description="It leaves the All tickets list. The user still sees it, marked “Closed by support”. If the user replies, it comes back automatically."
        confirmLabel="Archive"
        onConfirm={onConfirm}
      />
    </>
  );
}

function RestoreButton({ ticket }) {
  const restore = useUnarchiveTicket(ticket._id);
  const onClick = () =>
    // mutateAsync (not mutate + onSuccess): this button disappears as soon as the
    // ticket is restored, and mutate's callbacks are skipped once it is gone.
    restore.mutateAsync().then(
      () => toast.success('Ticket restored to the All tickets list'),
      (error) => toast.error(getErrorMessage(error))
    );

  return (
    <Button variant="outline" onClick={onClick} disabled={restore.isPending} className="w-full">
      {restore.isPending ? <Spinner /> : <ArchiveRestoreIcon />}
      Restore ticket
    </Button>
  );
}

// Support-team actions at the bottom of the details panel (admins only)
// showAssign=false when the page already shows "Assign to me" above the conversation
export function AdminTicketActions({ ticket, showAssign = true }) {
  const { user } = useAuth();
  const mayArchive = canArchive(ticket, user);

  return (
    <div className="mt-4 grid gap-2">
      <Separator className="mb-2" />
      {ticket.archived ? (
        <>
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArchiveIcon className="size-4" />
            Archived — hidden from the All tickets list
          </p>
          {mayArchive && <RestoreButton ticket={ticket} />}
        </>
      ) : (
        <>
          {showAssign && <AssignButton ticket={ticket} />}
          {mayArchive && <ArchiveButton ticket={ticket} />}
        </>
      )}
    </div>
  );
}
