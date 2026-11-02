import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
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
import { PriorityBadge } from './PriorityBadge';
import { useUpdatePriority, useUpdateStatus } from '../hooks/useTickets';
import { idOf, nameOf } from '../ticketUtils';

// One line of the panel: label on the left, value on the right
function Row({ label, children }) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-4 py-1.5">
      <dt className="shrink-0 text-[13px] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-[13px] font-medium">{children}</dd>
    </div>
  );
}

function Person({ person }) {
  const name = nameOf(person);
  return (
    <span className="inline-flex max-w-full items-center gap-2">
      <Avatar first={name} last={person?.lastname} seed={idOf(person) ?? name} size="xs" />
      <span className="truncate">{name}</span>
    </span>
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
    <div className="flex items-center justify-end gap-2">
      {updateStatus.isPending && <Spinner className="text-muted-foreground" />}
      <Select value={ticket.status} onValueChange={onChange} disabled={updateStatus.isPending}>
        <SelectTrigger size="sm" aria-label="Change status" className="w-36">
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="end">
          {TICKET_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
    <Card className="gap-0 py-0">
      <div className="border-b px-5 py-3.5">
        <h2 className="text-sm font-semibold">Details</h2>
      </div>
      <div className="px-5 py-2">
        <dl className="divide-y">
          <Row label="Status">
            {canManage ? <StatusSelect ticket={ticket} /> : <StatusBadge status={ticket.status} />}
          </Row>
          <Row label="Priority">
            {canEditPriority ? (
              <div className="flex items-center justify-end gap-2">
                {updatePriority.isPending && <Spinner className="text-muted-foreground" />}
                <Select value={ticket.priority} onValueChange={onPriorityChange} disabled={updatePriority.isPending}>
                  <SelectTrigger size="sm" aria-label="Change priority" className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {prioritiesFor(user, ticket.priority).map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <PriorityBadge priority={ticket.priority} />
            )}
          </Row>
          {canEditPriority && (
            <p className="py-2 text-xs text-muted-foreground">{PRIORITY_DESCRIPTIONS[ticket.priority]}</p>
          )}
          <Row label="Category">{ticket.category}</Row>
          <Row label="Created by">
            <Person person={ticket.createdBy} />
          </Row>
          <Row label="Created">
            <span className="tabular-nums">{formatDateTime(ticket.createdAt)}</span>
          </Row>
          <Row label="Assigned to">
            {ticket.handledBy ? (
              <Person person={ticket.handledBy} />
            ) : (
              <span className="font-normal text-muted-foreground">Not assigned yet</span>
            )}
          </Row>
          {ticket.resolvedAt && (
            <Row label="Resolved">
              <span className="tabular-nums">{formatDateTime(ticket.resolvedAt)}</span>
            </Row>
          )}
        </dl>
      </div>
      {children && <div className="border-t bg-muted/30 px-5 py-4">{children}</div>}
    </Card>
  );
}
