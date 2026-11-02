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
import { formatDateTime } from '@/lib/format';
import { useMarkSeen, useTicket } from '../hooks/useTickets';
import { MessageThread } from '../components/MessageThread';
import { ReplyForm } from '../components/ReplyForm';
import { TicketDetailsPanel } from '../components/TicketDetailsPanel';
import { AdminTicketActions, AssignButton } from '../components/AdminTicketActions';
import { RefreshButton } from '@/components/layout/RefreshButton';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { assignment, canTakeOver, hasNewAnswer, isOwner, nameOf } from '../ticketUtils';
import { ticketRef } from '../ticketRef';

// Grey box under the conversation that explains why nobody can write here
function Note({ icon: Icon, children, action }) {
  return (
    <div
      role="note"
      className="grid gap-3 rounded-xl border border-dashed bg-muted/40 px-4 py-3.5 text-sm text-muted-foreground sm:flex sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-2.5">
        <Icon className="mt-0.5 size-4 shrink-0" />
        {children}
      </p>
      {action}
    </div>
  );
}

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
    <Note
      icon={ticket.archived ? ArchiveIcon : LockIcon}
      action={
        owner && (
          <Button asChild size="sm" className="shrink-0">
            <Link to="/tickets/new" state={{ followUp: { id: ticket._id, subject: ticket.subject } }}>
              <PlusIcon />
              Open a new ticket
            </Link>
          </Button>
        )
      }
    >
      {text}
    </Note>
  );
}

// Support must have the ticket assigned to them before writing in it (backend rule)
function AssignToReplyNote({ ticket, who, user }) {
  let text;
  if (who === 'nobody') text = 'Assign this ticket to yourself to reply to the user.';
  else if (!canTakeOver(ticket, user)) text = `${nameOf(ticket.handledBy)} (superadmin) is handling this ticket.`;
  else text = `${nameOf(ticket.handledBy)} is handling this ticket. Take it over to reply.`;
  return (
    <Note icon={UserCheckIcon} action={canTakeOver(ticket, user) && <AssignButton ticket={ticket} className="shrink-0" />}>
      {text}
    </Note>
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
    <Button variant="ghost" size="sm" asChild className="-ml-2.5 mb-3 text-muted-foreground">
      <Link to={to}>
        <ArrowLeftIcon />
        Back to tickets
      </Link>
    </Button>
  );
}

function TicketSkeleton() {
  return (
    <div className="grid gap-6" aria-busy="true">
      <div className="grid gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-5 w-48" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="size-9 shrink-0 rounded-full" />
              <Skeleton className="h-28 flex-1 rounded-xl" />
            </div>
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    </div>
  );
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: ticket, isPending, isError, error, refetch } = useTicket(id);
  const owner = !!ticket && isOwner(ticket, user);
  useMarkSeenWhenOwner(ticket, owner);
  const backTo = isAdmin(user) ? '/admin/tickets' : '/tickets';

  if (isPending) return <TicketSkeleton />;

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
  const closed = ticket.status === 'résolu';
  // support writes / changes the status or the priority only on a ticket assigned to them
  const who = assignment(ticket, user);
  const handlesIt = admin && who === 'me';
  const canEditPriority = owner || handlesIt;
  const canReply = owner || handlesIt;
  const assignAboveConversation = admin && !closed && !canReply;
  const replies = ticket.messages.length;

  return (
    <>
      <BackLink to={backTo} />
      <header className="mb-8 flex items-start justify-between gap-4 border-b pb-6">
        <div className="grid min-w-0 gap-2">
          <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
            <span className="font-mono font-medium tracking-tight">{ticketRef(ticket._id)}</span>
            <span aria-hidden>·</span>
            <span>{ticket.category}</span>
          </p>
          <div className="min-w-0">
            <h1 className="text-[22px] leading-tight font-semibold tracking-tight break-words sm:text-2xl">
              {ticket.subject}
            </h1>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <span className="text-[13px] text-muted-foreground">
              Opened by {owner ? 'you' : nameOf(ticket.createdBy)} on {formatDateTime(ticket.createdAt)}
              {replies > 0 && ` · ${replies} ${replies === 1 ? 'reply' : 'replies'}`}
            </span>
          </div>
        </div>
        <RefreshButton className="shrink-0" />
      </header>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="grid min-w-0 gap-6" aria-label="Conversation">
          <MessageThread ticket={ticket} currentUser={user} />
          {closed ? (
            <ClosedTicketNote ticket={ticket} owner={owner} admin={admin} />
          ) : canReply ? (
            <ReplyForm ticketId={ticket._id} />
          ) : (
            admin && <AssignToReplyNote ticket={ticket} who={who} user={user} />
          )}
        </section>

        <aside className="lg:sticky lg:top-6" aria-label="Ticket details">
          <TicketDetailsPanel ticket={ticket} canEditPriority={canEditPriority} canManage={handlesIt}>
            {admin && <AdminTicketActions ticket={ticket} showAssign={!assignAboveConversation} />}
          </TicketDetailsPanel>
        </aside>
      </div>
    </>
  );
}
