import { useState } from 'react';
import { SendHorizontalIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { LIMITS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { cn } from '@/lib/utils';
import { useReplyToTicket } from '../hooks/useTickets';
import { FilePicker } from './FilePicker';
import { useFileDrop } from '../fileDrop';

// Write a reply (text and/or files). Files can also be dropped on the composer.
// Ctrl/⌘ + Enter sends.
export function ReplyForm({ ticketId }) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const reply = useReplyToTicket(ticketId);
  const drop = useFileDrop({ files, onChange: setFiles, disabled: reply.isPending });

  const canSend = (message.trim() || files.length > 0) && !reply.isPending;

  const send = () => {
    if (!canSend) return;
    reply.mutate(
      { message: message.trim(), files },
      {
        onSuccess: () => {
          setMessage('');
          setFiles([]);
          toast.success('Reply sent');
        },
        onError: (error) => toast.error(getErrorMessage(error)),
      }
    );
  };

  const onSubmit = (event) => {
    event.preventDefault();
    send();
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      send();
    }
  };

  const nearLimit = message.length > LIMITS.message * 0.9;

  return (
    <form
      onSubmit={onSubmit}
      {...drop.handlers}
      className={cn(
        'rounded-xl border bg-card shadow-xs transition-[border-color,box-shadow] duration-150 focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/15',
        drop.dragging && 'border-primary ring-[3px] ring-primary/20'
      )}
    >
      <label htmlFor="reply" className="sr-only">
        Your reply
      </label>
      <Textarea
        id="reply"
        rows={3}
        placeholder={drop.dragging ? 'Drop the files to attach them' : 'Write a reply…'}
        value={message}
        maxLength={LIMITS.message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={reply.isPending}
        className="min-h-24 resize-none border-0 bg-transparent px-4 pt-3.5 shadow-none focus-visible:ring-0 disabled:bg-transparent"
      />
      <div className="px-3">
        <FilePicker files={files} onChange={setFiles} disabled={reply.isPending} />
        {drop.errors.length > 0 && (
          <ul className="mt-1 grid gap-0.5 text-xs font-medium text-destructive" role="alert">
            {drop.errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-3 border-t px-3 py-2.5">
        <span className={cn('text-xs tabular-nums', nearLimit ? 'text-warning' : 'text-muted-foreground')}>
          {message.length}/{LIMITS.message}
          <span className="ml-2 hidden text-muted-foreground/70 lg:inline">Ctrl + Enter to send</span>
        </span>
        <Button type="submit" disabled={!canSend}>
          {reply.isPending ? <Spinner /> : <SendHorizontalIcon />}
          Send reply
        </Button>
      </div>
    </form>
  );
}
