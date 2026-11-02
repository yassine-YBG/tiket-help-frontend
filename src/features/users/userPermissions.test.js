import { describe, it, expect } from 'vitest';
import { canChangeRole, canManage } from './userPermissions';

const admin = { id: 'a1', role: 'admin' };
const boss = { id: 's1', role: 'superadmin' };
const user = (role, _id = 'x') => ({ _id, role });

describe('user permissions (same as the backend)', () => {
  it('an admin manages only "user" accounts', () => {
    expect(canManage(admin, user('user'))).toBe(true);
    expect(canManage(admin, user('admin'))).toBe(false);
    expect(canManage(admin, user('superadmin'))).toBe(false);
  });
  it('a superadmin manages everyone', () => {
    expect(canManage(boss, user('admin'))).toBe(true);
    expect(canManage(boss, user('superadmin'))).toBe(true);
  });
  it('nobody manages their own account', () => {
    expect(canManage(boss, user('superadmin', 's1'))).toBe(false);
    expect(canManage(admin, { _id: 'a1', role: 'admin' })).toBe(false);
  });
  it('only the superadmin changes roles, never their own', () => {
    expect(canChangeRole(admin, user('user'))).toBe(false);
    expect(canChangeRole(boss, user('admin'))).toBe(true);
    expect(canChangeRole(boss, user('superadmin', 's1'))).toBe(false);
  });
});
