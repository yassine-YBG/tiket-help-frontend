import { DownloadIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { formatFileSize } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import { useDownloadAttachment } from '../hooks/useTickets';
import { fileIconFor } from '../fileDrop';

// Files of a ticket (type="ticket") or of a reply (type="message"). Click = download.
export function AttachmentList({ ticketId, attachments, type }) {
  const download = useDownloadAttachment(ticketId);
  if (!attachments?.length) return null;

  const onDownload = (attachment) =>
    download.mutate(
      { type, attachment },
      { onError: (error) => toast.error(`Download failed: ${getErrorMessage(error)}`) }
    );

  return (
    <ul className="flex flex-wrap gap-2" aria-label="Attached files">
      {attachments.map((attachment) => {
        const busy = download.isPending && download.variables?.attachment._id === attachment._id;
        const Icon = fileIconFor(attachment.mimetype);
        return (
          <li key={attachment._id} className="max-w-full">
            <button
              type="button"
              className="pressable group flex max-w-72 items-center gap-2.5 rounded-lg border bg-card py-2 pr-2.5 pl-2 text-left shadow-xs hover:border-primary/30 hover:bg-accent/50 disabled:opacity-60"
              onClick={() => onDownload(attachment)}
              disabled={busy}
              title={`Download ${attachment.originalName}`}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                {busy ? <Spinner className="text-muted-foreground" /> : <Icon className="size-4 text-muted-foreground" />}
              </span>
              <span className="grid min-w-0 leading-tight">
                <span className="truncate text-[13px] font-medium">{attachment.originalName}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{formatFileSize(attachment.size)}</span>
              </span>
              <DownloadIcon className="ml-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
