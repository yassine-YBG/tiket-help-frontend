import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/lib/format';
import { idOf, nameOf } from '../ticketUtils';
import { AttachmentList } from './AttachmentList';

const lastnameOf = (person) => (person && typeof person === 'object' ? person.lastname : '');

function Message({ person, date, isMine, isSupport, label, children }) {
  const name = nameOf(person);
  return (
    <article className="relative flex gap-3 sm:gap-4">
      <Avatar first={name} last={lastnameOf(person)} seed={idOf(person) ?? name} size="md" className="relative z-10 ring-4 ring-background" />
      <div className="min-w-0 flex-1">
        <header className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm font-semibold">{isMine ? 'You' : name}</p>
          {isSupport && (
            <Badge variant="brand" className="px-1.5 py-0 text-[11px]">
              Support
            </Badge>
          )}
          {label && <span className="text-xs text-muted-foreground">· {label}</span>}
          <time className="ml-auto text-xs text-muted-foreground tabular-nums">{formatDateTime(date)}</time>
        </header>
        <div
          className={cn(
            'rounded-xl rounded-tl-sm border px-4 py-3',
            isSupport ? 'border-primary/15 bg-brand-soft/50' : 'bg-card shadow-xs'
          )}
        >
          {children}
        </div>
      </div>
    </article>
  );
}

// The ticket's description followed by every reply, oldest first.
// Text is always rendered as plain text (React escapes it): user content can never inject HTML.
export function MessageThread({ ticket, currentUser }) {
  const creatorId = idOf(ticket.createdBy);

  return (
    <div className="relative grid gap-6">
      {/* the line linking the messages, behind the avatars */}
      <div aria-hidden className="absolute top-4 bottom-4 left-[17px] w-px bg-border" />

      <Message
        person={ticket.createdBy}
        date={ticket.createdAt}
        isMine={creatorId === currentUser.id}
        label="opened this ticket"
      >
        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{ticket.description}</p>
        {ticket.attachments?.length > 0 && (
          <div className="mt-3">
            <AttachmentList ticketId={ticket._id} attachments={ticket.attachments} type="ticket" />
          </div>
        )}
      </Message>

      {ticket.messages.map((message) => {
        const senderId = idOf(message.sender);
        return (
          <Message
            key={message._id}
            person={message.sender}
            date={message.sentAt}
            isMine={senderId === currentUser.id}
            isSupport={senderId !== creatorId}
          >
            {message.message && <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{message.message}</p>}
            {message.attachments?.length > 0 && (
              <div className={cn(message.message && 'mt-3')}>
                <AttachmentList ticketId={ticket._id} attachments={message.attachments} type="message" />
              </div>
            )}
          </Message>
        );
      })}
    </div>
  );
}
