import {
  ActivityIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  PlusIcon,
  TicketIcon,
  UserCheckIcon,
  UserCircleIcon,
  UsersIcon,
} from 'lucide-react';
import { ADMIN_ROLES, isAdmin } from '@/lib/constants';

// Sidebar menu. "roles" = who sees the item (no roles = everyone logged in).
// "end" = only active on this exact URL (so /tickets is not active on /tickets/new).
// "counter" = name of the number from GET /tickets/summary shown as a badge.
// "short" = label in the phone tab bar (few characters fit under an icon).
export const NAV_SECTIONS = [
  {
    title: 'Support',
    items: [
      { to: '/tickets', label: 'My tickets', short: 'Tickets', icon: TicketIcon, end: true, counter: 'newAnswers' },
      { to: '/tickets/new', label: 'New ticket', short: 'New', icon: PlusIcon },
      { to: '/profile', label: 'Profile', short: 'Profile', icon: UserCircleIcon },
    ],
  },
  {
    title: 'Administration',
    roles: ADMIN_ROLES,
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', short: 'Overview', icon: LayoutDashboardIcon },
      { to: '/admin/tickets', label: 'All tickets', short: 'Inbox', icon: ListChecksIcon, counter: 'needsReply' },
      { to: '/admin/users', label: 'Users', short: 'Users', icon: UsersIcon, end: true },
      { to: '/admin/users/pending', label: 'Pending accounts', short: 'Pending', icon: UserCheckIcon, counter: 'pendingUsers' },
      { to: '/admin/activity', label: 'Activity logs', short: 'Activity', icon: ActivityIcon },
    ],
  },
];

export const visibleSections = (user) =>
  NAV_SECTIONS.filter((section) => !section.roles || section.roles.includes(user?.role));

// Text read by screen readers for a counter badge
export const COUNTER_LABELS = {
  newAnswers: (n) => `${n} ticket${n > 1 ? 's' : ''} with a new answer`,
  needsReply: (n) => `${n} ticket${n > 1 ? 's' : ''} waiting for a support reply`,
  pendingUsers: (n) => `${n} account${n > 1 ? 's' : ''} waiting for activation`,
};

// Phone tab bar: the 4 destinations used most by each role (the rest is in "More")
const TABS_BY_ROLE = {
  user: ['/tickets', '/tickets/new', '/profile'],
  admin: ['/admin/dashboard', '/admin/tickets', '/admin/users', '/admin/users/pending'],
};

export function tabItems(user) {
  const all = visibleSections(user).flatMap((section) => section.items);
  const wanted = TABS_BY_ROLE[isAdmin(user) ? 'admin' : 'user'];
  return wanted.map((to) => all.find((item) => item.to === to)).filter(Boolean);
}

// Title of the current page for the phone top bar ("/tickets/abc" -> "Ticket")
export function pageTitle(pathname) {
  const all = NAV_SECTIONS.flatMap((section) => section.items);
  const exact = all.find((item) => item.to === pathname);
  if (exact) return exact.label;
  if (/^\/tickets\/[^/]+$/.test(pathname)) return 'Ticket';
  return 'Tiket Help';
}
