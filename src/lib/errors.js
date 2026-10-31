// Turn any API / network error into a message we can show to the user.
// The backend always answers errors as { "error": "message" }.
export function getErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.code === 'ERR_NETWORK') return 'Cannot reach the server. Is the backend running?';
  return fallback;
}

export const getStatusCode = (error) => error?.response?.status;
