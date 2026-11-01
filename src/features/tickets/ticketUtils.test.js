import { describe, it, expect } from 'vitest';
import { idOf, isOwner, lastActivity, nameOf } from './ticketUtils';

describe('ticketUtils', () => {
  it('lastActivity = newest reply, or creation date', () => {
    const t = { createdAt: '2026-10-01T10:00:00Z', messages: [{ sentAt: '2026-10-03T10:00:00Z' }, { sentAt: '2026-10-02T10:00:00Z' }] };
    expect(lastActivity(t).toISOString()).toBe('2026-10-03T10:00:00.000Z');
    expect(lastActivity({ createdAt: '2026-10-01T10:00:00Z', messages: [] }).toISOString()).toBe('2026-10-01T10:00:00.000Z');
  });
  it('idOf works with populated and bare ids', () => {
    expect(idOf({ _id: 'x' })).toBe('x');
    expect(idOf('y')).toBe('y');
  });
  it('isOwner / nameOf', () => {
    expect(isOwner({ createdBy: { _id: 'u1' } }, { id: 'u1' })).toBe(true);
    expect(isOwner({ createdBy: 'u2' }, { id: 'u1' })).toBe(false);
    expect(nameOf({ username: 'Nour' })).toBe('Nour');
    expect(nameOf(null)).toBe('Unknown user');
  });
});
