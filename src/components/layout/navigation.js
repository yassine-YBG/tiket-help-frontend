import {
  ActivityIcon,
  LayoutDashboardIcon,
  ListChecksIcon,
  PlusCircleIcon,
  TicketIcon,
  UserCheckIcon,
  UserCircleIcon,
  UsersIcon,
} from 'lucide-react';
import { ADMIN_ROLES } from '@/lib/constants';

// Sidebar menu. "roles" = who sees the item (no roles = everyone logged in).
// "end" = only active on this exact URL (so /tickets is not active on /tickets/new).
export const NAV_SECTIONS = [
  {
    title: 'Support',
    items: [
      { to: '/tickets', label: 'My tickets', icon: TicketIcon, end: true },
      { to: '/tickets/new', label: 'New ticket', icon: PlusCircleIcon },
      { to: '/profile', label: 'Profile', icon: UserCircleIcon },
    ],
  },
  {
    title: 'Administration',
    roles: ADMIN_ROLES,
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboardIcon },
      { to: '/admin/tickets', label: 'All tickets', icon: ListChecksIcon },
      { to: '/admin/users', label: 'Users', icon: UsersIcon, end: true },
      { to: '/admin/users/pending', label: 'Pending accounts', icon: UserCheckIcon },
      { to: '/admin/activity', label: 'Activity logs', icon: ActivityIcon },
    ],
  },
];

export const visibleSections = (user) =>
  NAV_SECTIONS.filter((section) => !section.roles || section.roles.includes(user?.role));
