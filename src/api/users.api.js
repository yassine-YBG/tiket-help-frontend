import { api } from './client';

export const usersApi = {
  // params: { page, limit, search, role, activated, sort } -> { users, pagination, sort }
  list: (params) => api.get('/auth/users', { params }).then((r) => r.data),
  // -> plain array
  pending: () => api.get('/auth/users/pending').then((r) => r.data),

  setActivated: (id, activated) =>
    api.put(`/auth/users/${id}/activation`, { activated }).then((r) => r.data),
  setRole: (id, role) => api.put(`/auth/users/${id}/role`, { role }).then((r) => r.data),
  remove: (id) => api.delete(`/auth/users/${id}`).then((r) => r.data),
  restore: (id) => api.put(`/auth/users/${id}/restore`).then((r) => r.data),
};
