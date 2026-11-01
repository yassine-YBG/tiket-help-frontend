import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { PRIORITY_LABELS, TICKET_PRIORITIES } from '@/lib/constants';
import { formatDateTime } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import { StatusBadge } from './StatusBadge';
import { useUpdatePriority } from '../hooks/useTickets';
import { nameOf } from '../ticketUtils';

function Row({ label, children }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

// Right-hand panel of a ticket: status, priority (editable), category, dates, handler
export function TicketDetailsPanel({ ticket, canEditPriority, children }) {
  const updatePriority = useUpdatePriority(ticket._id);

  const onPriorityChange = (priority) =>
    updatePriority.mutate(priority, {
      onSuccess: () => toast.success(`Priority changed to ${PRIORITY_LABELS[priority]}`),
      onError: (error) => toast.error(getErrorMessage(error)),
    });

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-base">Details</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4">
          <Row label="Status">
            <StatusBadge status={ticket.status} />
          </Row>
          <Row label="Priority">
            {canEditPriority ? (
              <div className="flex items-center gap-2">
                <Select value={ticket.priority} onValueChange={onPriorityChange} disabled={updatePriority.isPending}>
                  <SelectTrigger size="sm" aria-label="Change priority" className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {updatePriority.isPending && <Spinner className="text-muted-foreground" />}
              </div>
            ) : (
              PRIORITY_LABELS[ticket.priority]
            )}
          </Row>
          <Row label="Category">{ticket.category}</Row>
          <Row label="Created by">{nameOf(ticket.createdBy)}</Row>
          <Row label="Created">{formatDateTime(ticket.createdAt)}</Row>
          <Row label="Assigned to">{ticket.handledBy ? nameOf(ticket.handledBy) : 'Not assigned yet'}</Row>
          {ticket.resolvedAt && <Row label="Resolved">{formatDateTime(ticket.resolvedAt)}</Row>}
        </dl>
        {children}
      </CardContent>
    </Card>
  );
}
