import axios from 'axios';
import { tokenStorage } from '@/lib/tokenStorage';

// Name of the browser event fired when the session ends (token refused by the API).
// AuthContext listens to it and sends the user back to /login.
export const SESSION_EXPIRED_EVENT = 'tiket-help:session-expired';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 20000,
});

// Add the token to every request
api.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 401 on a logged-in request = token expired, account disabled or password changed
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthAttempt = error.config?.url?.startsWith('/auth/login') ||
      error.config?.url?.startsWith('/auth/register') ||
      error.config?.url?.startsWith('/auth/me/password');
    if (error.response?.status === 401 && !isAuthAttempt && tokenStorage.get()) {
      tokenStorage.clear();
      window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT, {
        detail: { message: error.response.data?.error },
      }));
    }
    return Promise.reject(error);
  }
);
