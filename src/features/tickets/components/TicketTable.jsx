import { Link } from 'react-router';
import { ArchiveIcon, MessageSquareIcon, PaperclipIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { countAttachments, hasNewAnswer, lastActivity, nameOf, needsReply } from '../ticketUtils';
import { ticketRef } from '../ticketRef';

// The same markup is a table on tablet/desktop and a list of cards on phones
// (max-md: classes turn rows into blocks), so there is one source of truth.
// The whole row is clickable: the subject link stretches over it.
export function TicketTable({ tickets, adminView = false }) {
  const showCreator = adminView;
  const archivedLabel = adminView ? 'Archived' : 'Closed by support';
  return (
    <Table className="max-md:block">
      <TableHeader className="max-md:hidden">
        <TableRow>
          <TableHead className="w-[44%]">Subject</TableHead>
          {showCreator && <TableHead>Created by</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead className="hidden lg:table-cell">Assigned to</TableHead>
          <TableHead className="hidden text-right md:table-cell">Last activity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="max-md:block">
        {tickets.map((ticket) => {
          const attachments = countAttachments(ticket);
          const unread = !adminView && hasNewAnswer(ticket);
          const urgentReply = adminView && needsReply(ticket);
          return (
            <TableRow
              key={ticket._id}
              className={cn(
                'relative cursor-pointer max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-2 max-md:py-3.5',
                ticket.archived && 'text-muted-foreground'
              )}
            >
              <TableCell className="max-w-0 whitespace-normal max-md:block max-md:max-w-full max-md:basis-full max-md:p-0">
                <div className="flex items-start gap-2">
                  <span
                    aria-hidden
                    className={cn(
                      'mt-[7px] size-2 shrink-0 rounded-full',
                      unread ? 'bg-primary' : urgentReply ? 'bg-destructive' : 'bg-transparent max-md:hidden'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/tickets/${ticket._id}`}
                      className={cn(
                        'line-clamp-2 break-words outline-none after:absolute after:inset-0 after:content-[""] focus-visible:after:rounded-md focus-visible:after:ring-[3px] focus-visible:after:ring-ring/40 md:line-clamp-1',
                        unread || urgentReply ? 'font-semibold text-foreground' : 'font-medium'
                      )}
                      title={ticket.subject}
                    >
                      {ticket.subject}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {urgentReply && (
                        <Badge variant="danger" className="px-1.5 py-0 text-[11px]">Needs reply</Badge>
                      )}
                      {unread && <Badge variant="brand" className="px-1.5 py-0 text-[11px]">New answer</Badge>}
                      {ticket.archived && (
                        <Badge variant="outline" className="gap-1 px-1.5 py-0 text-[11px]">
                          <ArchiveIcon className="size-3" />
                          {archivedLabel}
                        </Badge>
                      )}
                      <span className="font-mono text-[11px] tracking-tight">{ticketRef(ticket._id)}</span>
                      <span className="truncate">{ticket.category}</span>
                      {showCreator && <span className="md:hidden">by {nameOf(ticket.createdBy)}</span>}
                      {ticket.messages?.length > 0 && (
                        <span className="flex items-center gap-1" title="Replies">
                          <MessageSquareIcon className="size-3" />
                          {ticket.messages.length}
                        </span>
                      )}
                      {attachments > 0 && (
                        <span className="flex items-center gap-1" title="Files">
                          <PaperclipIcon className="size-3" />
                          {attachments}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              {showCreator && (
                <TableCell className="text-[13px] max-md:hidden">{nameOf(ticket.createdBy)}</TableCell>
              )}
              <TableCell className="max-md:block max-md:p-0">
                <StatusBadge status={ticket.status} />
              </TableCell>
              <TableCell className="max-md:block max-md:p-0">
                <PriorityBadge priority={ticket.priority} />
              </TableCell>
              <TableCell className="hidden text-[13px] text-muted-foreground lg:table-cell">
                {ticket.handledBy ? nameOf(ticket.handledBy) : 'Not assigned'}
              </TableCell>
              <TableCell className="text-right text-[13px] text-muted-foreground tabular-nums max-md:ml-auto max-md:block max-md:p-0 max-md:text-xs">
                {formatDate(lastActivity(ticket))}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
