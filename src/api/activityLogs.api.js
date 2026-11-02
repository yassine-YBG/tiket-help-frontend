import { api } from './client';

export const activityLogsApi = {
  // params: { page, limit, user, targetModel, target, from, to } -> { logs, pagination }
  // admins never get the superadmin's actions (backend rule)
  list: (params) => api.get('/activity-logs', { params }).then((r) => r.data),
};
