import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import {
  PRIORITY_DESCRIPTIONS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  TICKET_STATUSES,
  prioritiesFor,
} from '@/lib/constants';
import { useAuth } from '@/features/auth/useAuth';
import { formatDateTime } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import { StatusBadge } from './StatusBadge';
import { useUpdatePriority, useUpdateStatus } from '../hooks/useTickets';
import { nameOf } from '../ticketUtils';

function Row({ label, children }) {
  return (
    <div className="grid gap-1">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

// Status dropdown (support team only — the backend refuses it for normal users)
function StatusSelect({ ticket }) {
  const updateStatus = useUpdateStatus(ticket._id);
  const onChange = (status) =>
    updateStatus.mutate(status, {
      onSuccess: () => toast.success(`Status changed to ${STATUS_LABELS[status]}`),
      onError: (error) => toast.error(getErrorMessage(error)),
    });

  return (
    <div className="flex items-center gap-2">
      <Select value={ticket.status} onValueChange={onChange} disabled={updateStatus.isPending}>
        <SelectTrigger size="sm" aria-label="Change status" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {TICKET_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {updateStatus.isPending && <Spinner className="text-muted-foreground" />}
    </div>
  );
}

// Right-hand panel of a ticket: status, priority, category, dates, handler.
// canEditPriority: owner or admin. canManage: admin (status can be changed).
// children: extra content at the bottom (the admin actions).
export function TicketDetailsPanel({ ticket, canEditPriority, canManage = false, children }) {
  const { user } = useAuth();
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
            {canManage ? <StatusSelect ticket={ticket} /> : <StatusBadge status={ticket.status} />}
          </Row>
          <Row label="Priority">
            {canEditPriority ? (
              <div className="flex items-center gap-2">
                <Select value={ticket.priority} onValueChange={onPriorityChange} disabled={updatePriority.isPending}>
                  <SelectTrigger size="sm" aria-label="Change priority" className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {prioritiesFor(user, ticket.priority).map((p) => (
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
            {canEditPriority && (
              <p className="mt-1 text-xs text-muted-foreground">{PRIORITY_DESCRIPTIONS[ticket.priority]}</p>
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
