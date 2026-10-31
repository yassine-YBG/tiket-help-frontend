import { api } from './client';

export const activityLogsApi = {
  // params: { page, limit, user, targetModel, target } -> { logs, pagination }
  list: (params) => api.get('/activity-logs', { params }).then((r) => r.data),
};
