import { useId, useRef, useState } from 'react';
import { PaperclipIcon, UploadCloudIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MAX_FILE_SIZE, MAX_FILES } from '@/lib/constants';
import { ACCEPT_ATTRIBUTE, validateFiles } from '@/lib/files';
import { formatFileSize } from '@/lib/format';
import { cn } from '@/lib/utils';
import { fileIconFor } from '../fileDrop';

const HELP = `Up to ${MAX_FILES} files, ${formatFileSize(MAX_FILE_SIZE)} each — images, PDF, Word, text, audio, video`;

// Choose up to 5 files (10 MB each). Files are checked immediately,
// with the same rules as the backend.
//   variant="dropzone"  large area (new ticket): click or drop files on it
//   variant="compact"   one button (reply composer); the composer itself accepts drops
export function FilePicker({ files, onChange, disabled = false, variant = 'compact', inputRef: externalRef }) {
  const inputId = useId();
  const ownRef = useRef(null);
  const inputRef = externalRef ?? ownRef;
  const [errors, setErrors] = useState([]);
  const [dragging, setDragging] = useState(false);
  const full = files.length >= MAX_FILES;

  const addFiles = (fileList) => {
    const { valid, errors: problems } = validateFiles([...fileList], files);
    setErrors(problems);
    if (valid.length) onChange([...files, ...valid]);
    if (inputRef.current) inputRef.current.value = ''; // allow choosing the same file again
  };

  const removeFile = (index) => {
    setErrors([]);
    onChange(files.filter((_, i) => i !== index));
  };

  const dropHandlers = {
    onDragOver: (event) => {
      if (disabled || full) return;
      event.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (event) => {
      event.preventDefault();
      setDragging(false);
      if (!disabled && !full && event.dataTransfer?.files?.length) addFiles(event.dataTransfer.files);
    },
  };

  const input = (
    <input
      ref={inputRef}
      id={inputId}
      type="file"
      multiple
      accept={ACCEPT_ATTRIBUTE}
      className="sr-only"
      aria-label="Attach files"
      disabled={disabled}
      onChange={(e) => addFiles(e.target.files)}
    />
  );

  return (
    <div className="grid gap-2">
      {variant === 'dropzone' ? (
        <label
          htmlFor={inputId}
          {...dropHandlers}
          className={cn(
            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-muted/30 px-4 py-7 text-center transition-colors duration-150 hover:border-primary/40 hover:bg-brand-soft/40',
            dragging && 'border-primary bg-brand-soft/60',
            (disabled || full) && 'pointer-events-none opacity-60'
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full border bg-card shadow-xs">
            <UploadCloudIcon className="size-[18px] text-muted-foreground" />
          </span>
          <span className="text-sm">
            <span className="font-medium text-primary">Choose files</span>
            <span className="text-muted-foreground max-sm:hidden"> or drag them here</span>
          </span>
          <span className="text-xs text-muted-foreground">{HELP}</span>
          {input}
        </label>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || full}
            title={HELP}
          >
            <PaperclipIcon />
            Attach files
          </Button>
          {input}
        </div>
      )}

      {files.length > 0 && (
        <ul className="grid gap-1.5 sm:grid-cols-2" aria-label="Selected files">
          {files.map((file, index) => {
            const Icon = fileIconFor(file.type);
            return (
              <li
                key={`${file.name}-${file.size}`}
                className="flex items-center gap-2.5 rounded-lg border bg-card py-1.5 pr-1 pl-2.5 text-sm shadow-xs"
              >
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{formatFileSize(file.size)}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                  aria-label={`Remove ${file.name}`}
                >
                  <XIcon />
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {errors.length > 0 && (
        <ul className="grid gap-0.5 text-xs font-medium text-destructive" role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
