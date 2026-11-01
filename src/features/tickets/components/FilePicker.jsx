import { useId, useRef, useState } from 'react';
import { FileIcon, PaperclipIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MAX_FILE_SIZE, MAX_FILES } from '@/lib/constants';
import { ACCEPT_ATTRIBUTE, validateFiles } from '@/lib/files';
import { formatFileSize } from '@/lib/format';

// Choose up to 5 files (10 MB each). Files are checked immediately,
// with the same rules as the backend.
export function FilePicker({ files, onChange, disabled = false }) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [errors, setErrors] = useState([]);

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

  return (
    <div className="grid gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || files.length >= MAX_FILES}
        >
          <PaperclipIcon />
          Attach files
        </Button>
        <span className="text-xs text-muted-foreground">
          Up to {MAX_FILES} files, {formatFileSize(MAX_FILE_SIZE)} each — images, PDF, Word, text, audio, video
        </span>
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
      </div>

      {files.length > 0 && (
        <ul className="grid gap-1.5" aria-label="Selected files">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-1.5 text-sm"
            >
              <FileIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">{formatFileSize(file.size)}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => removeFile(index)}
                disabled={disabled}
                aria-label={`Remove ${file.name}`}
              >
                <XIcon />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {errors.length > 0 && (
        <ul className="grid gap-0.5 text-xs text-destructive" role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
