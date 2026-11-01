import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { idOf, nameOf } from '../ticketUtils';
import { AttachmentList } from './AttachmentList';

function Bubble({ author, date, isMine, isCreator, children }) {
  return (
    <article className={cn('rounded-xl border p-4', isMine ? 'border-primary/30 bg-primary/5' : 'bg-card')}>
      <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-medium">
          {isMine ? 'You' : author}
          {!isCreator && <span className="ml-2 text-xs font-normal text-primary">Support</span>}
        </p>
        <time className="text-xs text-muted-foreground">{formatDateTime(date)}</time>
      </header>
      {children}
    </article>
  );
}

// The ticket's description followed by every reply, oldest first.
// Text is always rendered as plain text (React escapes it): user content can never inject HTML.
export function MessageThread({ ticket, currentUser }) {
  const creatorId = idOf(ticket.createdBy);

  return (
    <div className="grid gap-3">
      <Bubble
        author={nameOf(ticket.createdBy)}
        date={ticket.createdAt}
        isMine={creatorId === currentUser.id}
        isCreator
      >
        <p className="whitespace-pre-wrap break-words text-sm">{ticket.description}</p>
        {ticket.attachments?.length > 0 && (
          <div className="mt-3">
            <AttachmentList ticketId={ticket._id} attachments={ticket.attachments} type="ticket" />
          </div>
        )}
      </Bubble>

      {ticket.messages.map((message) => {
        const senderId = idOf(message.sender);
        return (
          <Bubble
            key={message._id}
            author={nameOf(message.sender)}
            date={message.sentAt}
            isMine={senderId === currentUser.id}
            isCreator={senderId === creatorId}
          >
            {message.message && <p className="whitespace-pre-wrap break-words text-sm">{message.message}</p>}
            {message.attachments?.length > 0 && (
              <div className={cn(message.message && 'mt-3')}>
                <AttachmentList ticketId={ticket._id} attachments={message.attachments} type="message" />
              </div>
            )}
          </Bubble>
        );
      })}
    </div>
  );
}
