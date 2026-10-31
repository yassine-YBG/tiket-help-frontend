// Date / number helpers used across the app (English locale)
const dateFormatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

export const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : '—');
export const formatDateTime = (value) => (value ? dateTimeFormatter.format(new Date(value)) : '—');

// 1536 -> "1.5 KB"
export function formatFileSize(bytes) {
  if (bytes == null) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// 5.2 -> "5.2 h", 30 -> "1.3 d", null -> "—"
export function formatHours(hours) {
  if (hours == null) return '—';
  if (hours < 24) return `${hours} h`;
  return `${(hours / 24).toFixed(1)} d`;
}
