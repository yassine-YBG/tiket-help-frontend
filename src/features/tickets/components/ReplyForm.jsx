import { useState } from 'react';
import { SendIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Spinner } from '@/components/ui/spinner';
import { LIMITS } from '@/lib/constants';
import { getErrorMessage } from '@/lib/errors';
import { useReplyToTicket } from '../hooks/useTickets';
import { FilePicker } from './FilePicker';

// Write a reply (text and/or files)
export function ReplyForm({ ticketId }) {
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState([]);
  const reply = useReplyToTicket(ticketId);

  const canSend = (message.trim() || files.length > 0) && !reply.isPending;

  const onSubmit = (event) => {
    event.preventDefault();
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

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl border bg-card p-4">
      <label htmlFor="reply" className="text-sm font-medium">
        Your reply
      </label>
      <Textarea
        id="reply"
        rows={4}
        placeholder="Write a message…"
        value={message}
        maxLength={LIMITS.message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={reply.isPending}
        className="min-h-24"
      />
      <FilePicker files={files} onChange={setFiles} disabled={reply.isPending} />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {message.length}/{LIMITS.message}
        </span>
        <Button type="submit" disabled={!canSend}>
          {reply.isPending ? <Spinner /> : <SendIcon />}
          Send reply
        </Button>
      </div>
    </form>
  );
}
