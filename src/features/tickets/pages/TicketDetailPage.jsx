import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { ArchiveIcon, ArrowLeftIcon, LockIcon, PlusIcon, SearchXIcon, UserCheckIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAuth } from '@/features/auth/useAuth';
import { getStatusCode } from '@/lib/errors';
import { isAdmin } from '@/lib/constants';
import { useMarkSeen, useTicket } from '../hooks/useTickets';
import { MessageThread } from '../components/MessageThread';
import { ReplyForm } from '../components/ReplyForm';
import { TicketDetailsPanel } from '../components/TicketDetailsPanel';
import { AdminTicketActions, AssignButton } from '../components/AdminTicketActions';
import { RefreshButton } from '@/components/layout/RefreshButton';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { assignment, hasNewAnswer, isOwner, nameOf } from '../ticketUtils';

// A resolved ticket is closed: nobody writes in it any more (the backend refuses it).
// The owner opens a follow-up ticket; support can reopen it with the status.
function ClosedTicketNote({ ticket, owner, admin }) {
  let text;
  if (owner) {
    text = ticket.archived
      ? 'Closed by support. If you still need help, open a new ticket.'
      : 'This ticket is resolved and closed. If the problem comes back, open a new ticket.';
  } else if (ticket.archived) {
    text = 'This ticket is archived: it is hidden from the All tickets list. Restore it or change its status to write in it.';
  } else {
    text = admin
      ? 'This ticket is resolved and closed. The admin handling it can set the status back to In progress to write in it.'
      : 'This ticket is resolved and closed.';
  }

  return (
    <div role="note" className="grid gap-3 rounded-md border bg-muted px-4 py-3 text-sm text-muted-foreground sm:flex sm:items-center sm:justify-between">
      <p className="flex items-start gap-2">
        {ticket.archived ? <ArchiveIcon className="mt-0.5 size-4 shrink-0" /> : <LockIcon className="mt-0.5 size-4 shrink-0" />}
        {text}
      </p>
      {owner && (
        <Button asChild size="sm" className="shrink-0">
          <Link to="/tickets/new" state={{ followUp: { id: ticket._id, subject: ticket.subject } }}>
            <PlusIcon />
            Open a new ticket
          </Link>
        </Button>
      )}
    </div>
  );
}

// Support must have the ticket assigned to them before writing in it (backend rule)
function AssignToReplyNote({ ticket, who }) {
  const text =
    who === 'nobody'
      ? 'Assign this ticket to yourself to reply to the user.'
      : `${nameOf(ticket.handledBy)} is handling this ticket. Take it over to reply.`;
  return (
    <div role="note" className="grid gap-3 rounded-md border bg-muted px-4 py-3 text-sm text-muted-foreground sm:flex sm:items-center sm:justify-between">
      <p className="flex items-start gap-2">
        <UserCheckIcon className="mt-0.5 size-4 shrink-0" />
        {text}
      </p>
      <AssignButton ticket={ticket} className="shrink-0" />
    </div>
  );
}

// The owner opened a ticket with a new answer from support: clear the alert once
function useMarkSeenWhenOwner(ticket, owner) {
  const { mutate } = useMarkSeen();
  const unseen = !!ticket && owner && hasNewAnswer(ticket);
  const ticketId = ticket?._id;
  useEffect(() => {
    if (unseen) mutate(ticketId);
  }, [unseen, ticketId, mutate]);
}

function BackLink({ to }) {
  return (
    <Button variant="ghost" size="sm" asChild className="-ml-2 mb-2">
      <Link to={to}>
        <ArrowLeftIcon />
        Back to tickets
      </Link>
    </Button>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: ticket, isPending, isError, error, refetch } = useTicket(id);
  const owner = !!ticket && isOwner(ticket, user);
  useMarkSeenWhenOwner(ticket, owner);
  const backTo = isAdmin(user) ? '/admin/tickets' : '/tickets';

  if (isPending) {
    return (
      <div className="grid gap-4" aria-busy="true">
        <Skeleton className="h-8 w-2/3" />
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (isError) {
    const status = getStatusCode(error);
    if (status === 404 || status === 400) {
      return (
        <EmptyState
          icon={SearchXIcon}
          title="Ticket not found"
          description="This ticket does not exist or was deleted."
          action={<Button asChild><Link to={backTo}>Back to tickets</Link></Button>}
        />
      );
    }
    if (status === 403) {
      return (
        <EmptyState
          icon={LockIcon}
          title="You don't have access to this ticket"
          description="You can only open your own tickets."
          action={<Button asChild><Link to={backTo}>Back to tickets</Link></Button>}
        />
      );
    }
    return <ErrorState error={error} onRetry={refetch} />;
  }

  const admin = isAdmin(user);
  const canEditPriority = owner || admin;
  const closed = ticket.status === 'résolu';
  // support writes / changes the status only on a ticket assigned to them
  const who = assignment(ticket, user);
  const handlesIt = admin && who === 'me';
  const canReply = owner || handlesIt;
  const assignAboveConversation = admin && !closed && !canReply;

  return (
    <>
      <BackLink to={backTo} />
      <div className="mb-6 grid gap-2">
        <div className="flex items-start justify-between gap-4">
          <h1 className="min-w-0 break-words text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
          <RefreshButton className="shrink-0" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <span className="text-sm text-muted-foreground">{ticket.category}</span>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_18rem]">
        <section className="grid min-w-0 gap-4" aria-label="Conversation">
          <MessageThread ticket={ticket} currentUser={user} />
          {closed ? (
            <ClosedTicketNote ticket={ticket} owner={owner} admin={admin} />
          ) : canReply ? (
            <ReplyForm ticketId={ticket._id} />
          ) : (
            admin && <AssignToReplyNote ticket={ticket} who={who} />
          )}
        </section>

        <aside className="lg:sticky lg:top-20" aria-label="Ticket details">
          <TicketDetailsPanel ticket={ticket} canEditPriority={canEditPriority} canManage={handlesIt}>
            {admin && <AdminTicketActions ticket={ticket} showAssign={!assignAboveConversation} />}
          </TicketDetailsPanel>
        </aside>
      </div>
    </>
  );
}
