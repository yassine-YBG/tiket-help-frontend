import { useId, useState } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Trash2Icon, UserCheckIcon, UserRoundCogIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { useAuth } from '@/features/auth/useAuth';
import { getErrorMessage } from '@/lib/errors';
import { useAssignToMe, useDeleteTicket, useForgetTicket } from '../hooks/useTickets';
import { countAttachments, idOf, nameOf } from '../ticketUtils';

// Who handles the ticket, from the logged-in admin's point of view
function assignment(ticket, user) {
  if (!ticket.handledBy) return 'nobody';
  return idOf(ticket.handledBy) === user.id ? 'me' : 'other';
}

// "Assign to me" — or "Take over" (with confirmation) when another admin handles it
function AssignButton({ ticket }) {
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
      <Button onClick={() => run().catch(() => {})} disabled={assign.isPending} className="w-full">
        {assign.isPending ? <Spinner /> : <UserCheckIcon />}
        Assign to me
      </Button>
    );
  }

  const otherName = nameOf(ticket.handledBy);
  return (
    <>
      <Button variant="outline" onClick={() => setConfirmOpen(true)} className="w-full">
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

function DeleteButton({ ticket }) {
  const navigate = useNavigate();
  const remove = useDeleteTicket(ticket._id);
  const forgetTicket = useForgetTicket();
  const [open, setOpen] = useState(false);
  const [deleteFiles, setDeleteFiles] = useState(false);
  const checkboxId = useId();
  const files = countAttachments(ticket);

  const onOpenChange = (next) => {
    setOpen(next);
    if (!next) setDeleteFiles(false); // always start unchecked
  };

  const onConfirm = async () => {
    let result;
    try {
      result = await remove.mutateAsync({ deleteFiles: files > 0 && deleteFiles });
    } catch (error) {
      toast.error(getErrorMessage(error));
      throw error; // keeps the dialog open
    }
    const removed = result?.filesDeleted ? ` and ${result.filesDeleted} file(s)` : '';
    toast.success(`Ticket deleted${removed}`);
    // leave the page first, then forget the ticket (so it is not asked for again)
    await navigate('/admin/tickets', { replace: true });
    forgetTicket(ticket._id);
  };

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)} className="w-full text-destructive hover:text-destructive">
        <Trash2Icon />
        Delete ticket
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Delete this ticket?"
        description="It disappears for the user and for the support team. The conversation is kept in the database."
        confirmLabel="Delete"
        destructive
        onConfirm={onConfirm}
      >
        {files > 0 && (
          <label htmlFor={checkboxId} className="flex items-start gap-2 text-sm">
            <input
              id={checkboxId}
              type="checkbox"
              checked={deleteFiles}
              onChange={(e) => setDeleteFiles(e.target.checked)}
              className="mt-0.5 size-4 accent-destructive"
            />
            <span>
              Also delete the {files} attached file{files > 1 ? 's' : ''} from the server
              <span className="block text-muted-foreground">This cannot be undone.</span>
            </span>
          </label>
        )}
      </ConfirmDialog>
    </>
  );
}

// Support-team actions at the bottom of the details panel (admins only)
export function AdminTicketActions({ ticket }) {
  return (
    <div className="mt-4 grid gap-2">
      <Separator className="mb-2" />
      <AssignButton ticket={ticket} />
      <DeleteButton ticket={ticket} />
    </div>
  );
}
