import { describe, it, expect } from 'vitest';
import { formatPeriod, statsParams } from './periods';

const today = new Date(2026, 10, 2); // 2 Nov 2026 (local)

describe('statsParams', () => {
  it('last 7 / 30 / 90 days, today included', () => {
    expect(statsParams({ period: '7d' }, today)).toEqual({ from: '2026-10-27', to: '2026-11-02', interval: 'day' });
    expect(statsParams({ period: '30d' }, today)).toEqual({ from: '2026-10-04', to: '2026-11-02', interval: 'day' });
    expect(statsParams({ period: '90d' }, today)).toMatchObject({ from: '2026-08-05', interval: 'week' });
  });
  it('all time: no dates, by month', () => {
    expect(statsParams({ period: 'all' }, today)).toEqual({ interval: 'month' });
  });
  it('custom dates and a chosen interval', () => {
    expect(statsParams({ period: 'custom', from: '2026-10-01', to: '2026-10-15', interval: 'week' }, today))
      .toEqual({ from: '2026-10-01', to: '2026-10-15', interval: 'week' });
  });
  it('defaults to the last 30 days', () => {
    expect(statsParams({}, today)).toMatchObject({ from: '2026-10-04', interval: 'day' });
  });
});

describe('formatPeriod', () => {
  it('day, week and month labels', () => {
    expect(formatPeriod('2026-10-30')).toBe('30 Oct');
    expect(formatPeriod('2026-W44')).toBe('W44');
    expect(formatPeriod('2026-10')).toBe('Oct 2026');
  });
});
