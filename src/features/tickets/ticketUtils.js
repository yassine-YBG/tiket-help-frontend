// Small helpers about tickets, shared by pages and components

// Date of the last activity: newest reply, or the creation date
export function lastActivity(ticket) {
  const times = (ticket.messages || []).map((m) => new Date(m.sentAt).getTime());
  return new Date(Math.max(new Date(ticket.createdAt).getTime(), ...times));
}

// The populated user (createdBy / handledBy / sender) can be an object or a bare id
export const idOf = (value) => (value && typeof value === 'object' ? value._id : value);

export const isOwner = (ticket, user) => !!user && idOf(ticket.createdBy) === user.id;

// Display name of a populated user
export const nameOf = (person) => (person && typeof person === 'object' ? person.username : 'Unknown user');

// Number of files on a ticket: its own attachments + the ones sent in replies
export const countAttachments = (ticket) =>
  (ticket.attachments?.length || 0) +
  (ticket.messages || []).reduce((n, m) => n + (m.attachments?.length || 0), 0);

// ---- Alerts: who must act next (fields set by the backend) ----

// Admin view: the owner wrote last and support has not answered yet
export const needsReply = (ticket) => !!ticket.awaitingSupport && ticket.status !== 'résolu' && !ticket.archived;

// Owner view: support replied or changed the status since the owner last opened the ticket
export const hasNewAnswer = (ticket) =>
  !!ticket.supportUpdatedAt &&
  (!ticket.ownerSeenAt || new Date(ticket.supportUpdatedAt) > new Date(ticket.ownerSeenAt));

// Who handles the ticket, from the logged-in user's point of view: 'nobody' | 'me' | 'other'.
// Support can reply / change the status only when it is 'me' (the backend enforces it).
export function assignment(ticket, user) {
  if (!ticket.handledBy) return 'nobody';
  return idOf(ticket.handledBy) === user?.id ? 'me' : 'other';
}
