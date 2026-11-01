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
