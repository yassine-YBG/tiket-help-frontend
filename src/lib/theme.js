import { useEffect, useSyncExternalStore } from 'react';

// Light / dark / system theme, shared by every component that shows it
// (sidebar button, account menu, profile page). The choice is kept in
// localStorage (never crashes when storage is blocked); index.html applies it
// before the first paint.
const KEY = 'tiket-help-theme';
export const THEMES = ['light', 'dark', 'system'];

function readTheme() {
  try {
    const saved = localStorage.getItem(KEY);
    return THEMES.includes(saved) ? saved : 'system';
  } catch {
    return 'system';
  }
}

let current = typeof window === 'undefined' ? 'system' : readTheme();
const listeners = new Set();

const systemPrefersDark = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;

function applyTheme(theme) {
  const dark = theme === 'dark' || (theme === 'system' && systemPrefersDark());
  document.documentElement.classList.toggle('dark', dark);
}

export function setTheme(next) {
  if (!THEMES.includes(next)) return;
  try {
    localStorage.setItem(KEY, next);
  } catch {
    /* ignore: the choice lasts until the page is closed */
  }
  current = next;
  applyTheme(next);
  listeners.forEach((listener) => listener());
}

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, () => current, () => 'system');

  // follow the OS while "system" is selected
  useEffect(() => {
    if (theme !== 'system' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  }, [theme]);

  return { theme, setTheme };
}
