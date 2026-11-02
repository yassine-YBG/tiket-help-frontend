import { useState } from 'react';
import { FileAudioIcon, FileIcon, FileImageIcon, FileTextIcon, FileVideoIcon } from 'lucide-react';
import { validateFiles } from '@/lib/files';

// Icon that matches the kind of file (by MIME type)
export function fileIconFor(type = '') {
  if (type.startsWith('image/')) return FileImageIcon;
  if (type.startsWith('video/')) return FileVideoIcon;
  if (type.startsWith('audio/')) return FileAudioIcon;
  if (type === 'application/pdf' || type.startsWith('text/') || type.includes('word')) return FileTextIcon;
  return FileIcon;
}

// Drop handlers for an area that accepts files (the reply composer).
// Same checks as the file picker (type, size, count).
export function useFileDrop({ files, onChange, disabled }) {
  const [dragging, setDragging] = useState(false);
  const [errors, setErrors] = useState([]);
  const handlers = {
    onDragOver: (event) => {
      if (disabled || !event.dataTransfer?.types?.includes('Files')) return;
      event.preventDefault();
      setDragging(true);
    },
    onDragLeave: (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false);
    },
    onDrop: (event) => {
      if (disabled || !event.dataTransfer?.files?.length) return;
      event.preventDefault();
      setDragging(false);
      const { valid, errors: problems } = validateFiles([...event.dataTransfer.files], files);
      setErrors(problems);
      if (valid.length) onChange([...files, ...valid]);
    },
  };
  return { dragging, errors, handlers };
}
