// Save a Blob (e.g. a downloaded attachment) as a file in the browser.
// Downloads go through axios (a plain <a href> could not send the login token).
export function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'download';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
