import { Link, useParams } from 'react-router';
import { ArrowLeftIcon, LockIcon, SearchXIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAuth } from '@/features/auth/useAuth';
import { getStatusCode } from '@/lib/errors';
import { isAdmin } from '@/lib/constants';
import { useTicket } from '../hooks/useTickets';
import { MessageThread } from '../components/MessageThread';
import { ReplyForm } from '../components/ReplyForm';
import { TicketDetailsPanel } from '../components/TicketDetailsPanel';
import { AdminTicketActions } from '../components/AdminTicketActions';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { isOwner } from '../ticketUtils';

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
  const canEditPriority = isOwner(ticket, user) || admin;

  return (
    <>
      <BackLink to={backTo} />
      <div className="mb-6 grid gap-2">
        <h1 className="break-words text-2xl font-semibold tracking-tight">{ticket.subject}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <span className="text-sm text-muted-foreground">{ticket.category}</span>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_18rem]">
        <section className="grid min-w-0 gap-4" aria-label="Conversation">
          <MessageThread ticket={ticket} currentUser={user} />
          {ticket.status === 'résolu' && (
            <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              This ticket is resolved. You can still reply if the problem comes back.
            </p>
          )}
          <ReplyForm ticketId={ticket._id} />
        </section>

        <aside className="lg:sticky lg:top-20" aria-label="Ticket details">
          <TicketDetailsPanel ticket={ticket} canEditPriority={canEditPriority} canManage={admin}>
            {admin && <AdminTicketActions ticket={ticket} />}
          </TicketDetailsPanel>
        </aside>
      </div>
    </>
  );
}
