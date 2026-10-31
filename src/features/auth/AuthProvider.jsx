import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authApi } from '@/api/auth.api';
import { SESSION_EXPIRED_EVENT } from '@/api/client';
import { tokenStorage } from '@/lib/tokenStorage';
import { AuthContext } from './authContext';

// Keeps track of who is logged in.
// On app start: if a token is saved, ask the backend "who am I?" (GET /auth/me).
export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState(() => (tokenStorage.get() ? 'loading' : 'guest'));

  const clearSession = useCallback(() => {
    tokenStorage.clear();
    setUser(null);
    setStatus('guest');
    queryClient.clear(); // never show the previous user's cached data
  }, [queryClient]);

  // App start: restore the session from the saved token
  useEffect(() => {
    if (!tokenStorage.get()) return;
    let cancelled = false;
    authApi
      .me()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setStatus('authenticated');
      })
      .catch(() => {
        if (!cancelled) clearSession();
      });
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  // The API refused our token (expired, account disabled, password changed elsewhere)
  useEffect(() => {
    const onExpired = (event) => {
      clearSession();
      toast.error(event.detail?.message || 'Your session has ended. Please log in again.');
    };
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired);
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    const { token } = await authApi.login(email, password);
    tokenStorage.set(token);
    const me = await authApi.me();
    setUser(me);
    setStatus('authenticated');
    return me;
  }, []);

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  // After a password change the backend gives a new token (old ones stop working)
  const updateToken = useCallback((token) => tokenStorage.set(token), []);

  const refreshUser = useCallback(async () => {
    const me = await authApi.me();
    setUser(me);
    return me;
  }, []);

  const value = useMemo(
    () => ({ user, status, login, logout, updateToken, refreshUser }),
    [user, status, login, logout, updateToken, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
