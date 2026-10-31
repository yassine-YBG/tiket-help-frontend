// Where the login token is kept between page reloads.
// localStorage can be blocked (private mode, strict settings): never crash on it.
const KEY = 'tiket-help-token';

export const tokenStorage = {
  get() {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  },
  set(token) {
    try {
      localStorage.setItem(KEY, token);
    } catch {
      /* ignore: the user stays logged in until the page is closed */
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  },
};
