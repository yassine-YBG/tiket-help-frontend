import { Link } from 'react-router';
import { ArchiveIcon, MessageSquareIcon, PaperclipIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/lib/format';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { countAttachments, hasNewAnswer, lastActivity, nameOf, needsReply } from '../ticketUtils';

// List of tickets. `adminView` adds the "Created by" column and names archived
// tickets "Archived" (the owner sees "Closed by support").
export function TicketTable({ tickets, adminView = false }) {
  const showCreator = adminView;
  const archivedLabel = adminView ? 'Archived' : 'Closed by support';
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%]">Subject</TableHead>
          {showCreator && <TableHead>Created by</TableHead>}
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead className="hidden lg:table-cell">Assigned to</TableHead>
          <TableHead className="hidden md:table-cell">Last activity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tickets.map((ticket) => {
          const attachments = countAttachments(ticket);
          return (
            <TableRow key={ticket._id}>
              <TableCell className="max-w-0 whitespace-normal">
                <Link
                  to={`/tickets/${ticket._id}`}
                  className="line-clamp-2 font-medium break-words hover:text-primary hover:underline md:line-clamp-1"
                  title={ticket.subject}
                >
                  {ticket.subject}
                </Link>
                <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                  {adminView && needsReply(ticket) && (
                    <Badge className="bg-destructive px-1.5 py-0 text-[11px] text-white">Needs reply</Badge>
                  )}
                  {!adminView && hasNewAnswer(ticket) && (
                    <Badge className="px-1.5 py-0 text-[11px]">New answer</Badge>
                  )}
                  {ticket.archived && (
                    <Badge variant="outline" className="gap-1 px-1.5 py-0 text-[11px]">
                      <ArchiveIcon className="size-3" />
                      {archivedLabel}
                    </Badge>
                  )}
                  <span className="truncate">{ticket.category}</span>
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
              </TableCell>
              {showCreator && <TableCell>{nameOf(ticket.createdBy)}</TableCell>}
              <TableCell>
                <StatusBadge status={ticket.status} />
              </TableCell>
              <TableCell>
                <PriorityBadge priority={ticket.priority} />
              </TableCell>
              <TableCell className="hidden text-muted-foreground lg:table-cell">
                {ticket.handledBy ? nameOf(ticket.handledBy) : 'Not assigned'}
              </TableCell>
              <TableCell className="hidden text-muted-foreground md:table-cell">
                {formatDate(lastActivity(ticket))}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
