import { describe, it, expect } from 'vitest';
import { hasNewAnswer, needsReply } from './ticketUtils';

describe('ticket alerts', () => {
  it('needsReply: waiting for support, unless resolved or archived', () => {
    expect(needsReply({ awaitingSupport: true, status: 'en cours' })).toBe(true);
    expect(needsReply({ awaitingSupport: false, status: 'en cours' })).toBe(false);
    expect(needsReply({ awaitingSupport: true, status: 'résolu' })).toBe(false);
    expect(needsReply({ awaitingSupport: true, status: 'en cours', archived: true })).toBe(false);
    expect(needsReply({ status: 'en cours' })).toBe(false); // old ticket without the field
  });

  it('hasNewAnswer: support updated after the owner last looked', () => {
    expect(hasNewAnswer({ supportUpdatedAt: '2026-10-02', ownerSeenAt: null })).toBe(true);
    expect(hasNewAnswer({ supportUpdatedAt: '2026-10-02', ownerSeenAt: '2026-10-01' })).toBe(true);
    expect(hasNewAnswer({ supportUpdatedAt: '2026-10-01', ownerSeenAt: '2026-10-02' })).toBe(false);
    expect(hasNewAnswer({ supportUpdatedAt: null, ownerSeenAt: null })).toBe(false);
    expect(hasNewAnswer({})).toBe(false); // old ticket without the fields
  });
});
