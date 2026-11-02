// Short public reference of a ticket, from its id: "64f1…a9c2e1" -> "#A9C2E1".
// Easy to read out on the phone or paste in an email.
export const ticketRef = (id) => (id ? `#${String(id).slice(-6).toUpperCase()}` : '');
