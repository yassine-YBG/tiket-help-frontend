import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, MAX_FILES } from './constants';
import { formatFileSize } from './format';

// What the file picker accepts (browser hint; the backend checks again)
export const ACCEPT_ATTRIBUTE = [
  ...ALLOWED_FILE_TYPES,
  '.jpg', '.jpeg', '.png', '.gif', '.pdf', '.doc', '.docx', '.txt', '.mp3', '.wav', '.mp4', '.mov',
].join(',');

// Check files BEFORE uploading, with the same rules as the backend,
// so the user gets an instant, clear message instead of a failed upload.
// Returns { valid: File[], errors: string[] }
export function validateFiles(newFiles, alreadySelected = []) {
  const valid = [];
  const errors = [];
  let count = alreadySelected.length;

  for (const file of newFiles) {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      errors.push(`"${file.name}": this file type is not allowed`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`"${file.name}" is too large (${formatFileSize(file.size)}, max ${formatFileSize(MAX_FILE_SIZE)})`);
      continue;
    }
    if (file.size === 0) {
      errors.push(`"${file.name}" is empty`);
      continue;
    }
    const duplicate = [...alreadySelected, ...valid].some(
      (f) => f.name === file.name && f.size === file.size
    );
    if (duplicate) continue;
    if (count >= MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} files`);
      break;
    }
    valid.push(file);
    count++;
  }
  return { valid, errors };
}
