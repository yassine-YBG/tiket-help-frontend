import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './errors';
import { formatFileSize, formatHours } from './format';
import { safeFileName } from './downloadFile';
import { isAdmin } from './constants';

describe('getErrorMessage', () => {
  it('uses the backend message', () => {
    expect(getErrorMessage({ response: { data: { error: 'Ticket not found' } } })).toBe('Ticket not found');
  });
  it('explains network errors', () => {
    expect(getErrorMessage({ code: 'ERR_NETWORK' })).toMatch(/Cannot reach the server/);
  });
  it('falls back to a generic message', () => {
    expect(getErrorMessage(new Error('x'))).toMatch(/Something went wrong/);
  });
});

describe('format', () => {
  it('file sizes', () => {
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1536)).toBe('1.5 KB');
    expect(formatFileSize(10 * 1024 * 1024)).toBe('10.0 MB');
  });
  it('hours', () => {
    expect(formatHours(null)).toBe('—');
    expect(formatHours(5.2)).toBe('5.2 h');
    expect(formatHours(36)).toBe('1.5 d');
  });
});

describe('safeFileName', () => {
  it('keeps normal names', () => {
    expect(safeFileName('Rapport final (1).pdf')).toBe('Rapport final (1).pdf');
  });
  it('removes folders and dangerous characters', () => {
    expect(safeFileName('../../etc/passwd')).toBe('passwd');
    expect(safeFileName('C:\\Windows\\evil.exe')).toBe('evil.exe');
    expect(safeFileName('a<b>:c"d|e?f*.txt')).toBe('a_b__c_d_e_f_.txt');
    expect(safeFileName('.hidden')).toBe('hidden');
  });
  it('falls back when empty', () => {
    expect(safeFileName('')).toBe('download');
    expect(safeFileName(undefined)).toBe('download');
  });
});

describe('isAdmin', () => {
  it('admins and superadmins only', () => {
    expect(isAdmin({ role: 'admin' })).toBe(true);
    expect(isAdmin({ role: 'superadmin' })).toBe(true);
    expect(isAdmin({ role: 'user' })).toBe(false);
    expect(isAdmin(null)).toBe(false);
  });
});
