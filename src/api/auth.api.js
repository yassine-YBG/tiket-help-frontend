import { api } from './client';

export const authApi = {
  // -> { token, user }
  login: (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data),
  // -> { message }
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  // -> { user }
  me: () => api.get('/auth/me').then((r) => r.data.user),
  // -> { message, token } (the new token replaces the old one)
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/me/password', { currentPassword, newPassword }).then((r) => r.data),
};
