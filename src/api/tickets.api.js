import { api } from './client';

// Build multipart form data (tickets and replies can carry files)
function toFormData(fields, files = []) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') form.append(key, value);
  });
  files.forEach((file) => form.append('attachments', file));
  return form;
}

export const ticketsApi = {
  // params: { page, limit, status, priority, category, search, from, to, sort, handledBy, createdBy, archived }
  // -> { tickets, pagination, sort }
  listAll: (params) => api.get('/tickets', { params }).then((r) => r.data),
  listMine: (params) => api.get('/tickets/my', { params }).then((r) => r.data),

  get: (id) => api.get(`/tickets/${id}`).then((r) => r.data),

  // menu counters -> admins { needsReply, needsReplyMine } · users { newAnswers }
  summary: () => api.get('/tickets/summary').then((r) => r.data),
  // the owner opened the ticket (clears "New answer")
  markSeen: (id) => api.put(`/tickets/seen/${id}`).then((r) => r.data),

  // data: { subject, description, category, priority }, files: File[]
  create: (data, files) =>
    api.post('/tickets/create', toFormData(data, files)).then((r) => r.data),

  reply: (id, message, files) =>
    api.post(`/tickets/reply/${id}`, toFormData({ message }, files)).then((r) => r.data),

  updateStatus: (id, status) => api.put(`/tickets/status/${id}`, { status }).then((r) => r.data),
  updatePriority: (id, priority) => api.put(`/tickets/priority/${id}`, { priority }).then((r) => r.data),
  assignToMe: (id) => api.put(`/tickets/assign/${id}`).then((r) => r.data),

  // "closed by support": hidden from the admin lists, the owner still sees it.
  // Backend rule: resolved tickets only, by the admin handling it or a superadmin.
  archive: (id) => api.put(`/tickets/archive/${id}`).then((r) => r.data),
  unarchive: (id) => api.put(`/tickets/unarchive/${id}`).then((r) => r.data),

  // type: 'ticket' (file of the ticket) or 'message' (file of a reply) -> Blob
  downloadAttachment: (ticketId, type, attachmentId) =>
    api
      .get(`/tickets/${ticketId}/attachment/${type}/${attachmentId}/download`, { responseType: 'blob' })
      .then((r) => r.data),
};
