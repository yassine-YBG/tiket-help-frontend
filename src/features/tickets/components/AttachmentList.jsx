import { DownloadIcon, FileIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { formatFileSize } from '@/lib/format';
import { getErrorMessage } from '@/lib/errors';
import { useDownloadAttachment } from '../hooks/useTickets';

// Files of a ticket (type="ticket") or of a reply (type="message")
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
        return (
          <li key={attachment._id}>
            <Button
              variant="outline"
              size="sm"
              className="h-auto max-w-72 py-1.5"
              onClick={() => onDownload(attachment)}
              disabled={busy}
              title={`Download ${attachment.originalName}`}
            >
              {busy ? <Spinner /> : <FileIcon />}
              <span className="truncate">{attachment.originalName}</span>
              <span className="text-xs font-normal text-muted-foreground">{formatFileSize(attachment.size)}</span>
              <DownloadIcon className="text-muted-foreground" />
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
