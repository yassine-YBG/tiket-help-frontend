// Same rules as the backend (auth.controller.js -> checkCanManage). The backend
// enforces them; the app only hides buttons that would be refused anyway.
import { ROLES } from '@/lib/constants';

export const isSelf = (requester, target) => !!requester && requester.id === target._id;

// activate / deactivate / delete / restore:
// nobody acts on their own account; an admin only on "user" accounts; a superadmin on anyone else
export function canManage(requester, target) {
  if (!requester || isSelf(requester, target)) return false;
  if (requester.role === ROLES.SUPERADMIN) return true;
  return requester.role === ROLES.ADMIN && target.role === ROLES.USER;
}

// changing a role: superadmin only, never their own
export const canChangeRole = (requester, target) =>
  requester?.role === ROLES.SUPERADMIN && !isSelf(requester, target);

export const isSupportRole = (role) => role === ROLES.ADMIN || role === ROLES.SUPERADMIN;
