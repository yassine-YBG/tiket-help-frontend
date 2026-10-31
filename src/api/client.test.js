import { describe, it, expect, vi } from 'vitest';
import { api, SESSION_EXPIRED_EVENT } from './client';
import { tokenStorage } from '@/lib/tokenStorage';

// Fake the network: respond with the given status, record the request
function fakeServer(status, data = {}) {
  const seen = [];
  api.defaults.adapter = async (config) => {
    seen.push(config);
    if (status >= 400) {
      const error = new Error(`HTTP ${status}`);
      error.config = config;
      error.response = { status, data, config };
      throw error;
    }
    return { status, data, headers: {}, config, statusText: 'OK' };
  };
  return seen;
}

describe('api client', () => {
  it('adds the saved token to every request', async () => {
    tokenStorage.set('abc123');
    const seen = fakeServer(200);
    await api.get('/tickets/my');
    expect(seen[0].headers.Authorization).toBe('Bearer abc123');
  });

  it('sends no Authorization header when logged out', async () => {
    const seen = fakeServer(200);
    await api.get('/auth/me');
    expect(seen[0].headers.Authorization).toBeUndefined();
  });

  it('401 on a logged-in request: clears the token and announces the session end', async () => {
    tokenStorage.set('old');
    fakeServer(401, { error: 'Password changed, please log in again' });
    const listener = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, listener);
    await expect(api.get('/tickets/my')).rejects.toThrow();
    window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
    expect(tokenStorage.get()).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].detail.message).toBe('Password changed, please log in again');
  });

  it('401 on login (wrong password) does NOT end a session', async () => {
    tokenStorage.set('keep-me');
    fakeServer(401, { error: 'Invalid email or password' });
    const listener = vi.fn();
    window.addEventListener(SESSION_EXPIRED_EVENT, listener);
    await expect(api.post('/auth/login', {})).rejects.toThrow();
    window.removeEventListener(SESSION_EXPIRED_EVENT, listener);
    expect(listener).not.toHaveBeenCalled();
    expect(tokenStorage.get()).toBe('keep-me');
  });
});
