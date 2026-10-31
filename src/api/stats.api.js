import { api } from './client';

export const statsApi = {
  // params: { from, to, interval: 'day' | 'week' | 'month' }
  get: (params) => api.get('/stats', { params }).then((r) => r.data),
};
