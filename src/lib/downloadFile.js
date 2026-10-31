// Save a Blob (e.g. a downloaded attachment) as a file in the browser.
// Downloads go through axios (a plain <a href> could not send the login token).

// File names come from other users: keep them harmless on every OS
// (no folders, no control/reserved characters, reasonable length).
export function safeFileName(name, fallback = 'download') {
  const cleaned = String(name ?? '')
    .split(/[\\/]/)
    .pop()
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f<>:"|?*]/g, '_')
    .replace(/^\.+/, '')
    .trim()
    .slice(0, 150);
  return cleaned || fallback;
}

export function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = safeFileName(fileName);
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
