// Dashboard periods -> the backend's ?from=&to=&interval= (dates as YYYY-MM-DD, local day)

export const PERIOD_LABELS = {
  '7d': 'Last 7 days',
  '30d': 'Last 30 days',
  '90d': 'Last 90 days',
  all: 'All time',
  custom: 'Custom dates',
};
export const INTERVAL_LABELS = { day: 'By day', week: 'By week', month: 'By month' };

const DAYS = { '7d': 7, '30d': 30, '90d': 90 };
// a readable number of points per period
const DEFAULT_INTERVAL = { '7d': 'day', '30d': 'day', '90d': 'week', all: 'month', custom: 'day' };

const pad = (n) => String(n).padStart(2, '0');
export const toDateInput = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/**
 * @param {{ period?: string, from?: string, to?: string, interval?: string }} filters  values from the URL
 * @param {Date} today
 * @returns {{ from?: string, to?: string, interval: string }}  params for GET /stats
 */
export function statsParams({ period = '30d', from, to, interval } = {}, today = new Date()) {
  const params = { interval: interval || DEFAULT_INTERVAL[period] || 'day' };
  if (DAYS[period]) {
    const start = new Date(today);
    start.setDate(start.getDate() - (DAYS[period] - 1)); // today counts as day 1
    params.from = toDateInput(start);
    params.to = toDateInput(today);
  } else if (period === 'custom') {
    if (from) params.from = from;
    if (to) params.to = to;
  }
  return params;
}

// "2026-10-30" -> "30 Oct", "2026-W44" -> "W44", "2026-10" -> "Oct 2026"
export function formatPeriod(period) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) {
    return new Date(`${period}T00:00:00`).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }
  if (/^\d{4}-W\d{2}$/.test(period)) return period.slice(5);
  if (/^\d{4}-\d{2}$/.test(period)) {
    return new Date(`${period}-01T00:00:00`).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
  }
  return period;
}
