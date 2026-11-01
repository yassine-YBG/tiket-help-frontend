import { describe, it, expect } from 'vitest';
import { validateFiles } from './files';

const file = (name, type, size = 100) => new File([new Uint8Array(size)], name, { type });

describe('validateFiles', () => {
  it('accepts allowed types', () => {
    const { valid, errors } = validateFiles([file('a.png', 'image/png'), file('b.pdf', 'application/pdf')]);
    expect(valid.map((f) => f.name)).toEqual(['a.png', 'b.pdf']);
    expect(errors).toEqual([]);
  });

  it('refuses other types (e.g. html, exe)', () => {
    const { valid, errors } = validateFiles([file('x.html', 'text/html'), file('y.exe', 'application/x-msdownload')]);
    expect(valid).toEqual([]);
    expect(errors).toHaveLength(2);
    expect(errors[0]).toMatch(/not allowed/);
  });

  it('refuses files over 10 MB and empty files', () => {
    const { valid, errors } = validateFiles([file('big.pdf', 'application/pdf', 10 * 1024 * 1024 + 1), file('empty.txt', 'text/plain', 0)]);
    expect(valid).toEqual([]);
    expect(errors[0]).toMatch(/too large/);
    expect(errors[1]).toMatch(/empty/);
  });

  it('keeps the total at 5 files', () => {
    const already = [1, 2, 3, 4].map((i) => file(`${i}.png`, 'image/png'));
    const { valid, errors } = validateFiles([file('5.png', 'image/png'), file('6.png', 'image/png')], already);
    expect(valid.map((f) => f.name)).toEqual(['5.png']);
    expect(errors).toEqual(['Maximum 5 files']);
  });

  it('ignores the same file chosen twice', () => {
    const a = file('a.png', 'image/png');
    const { valid } = validateFiles([file('a.png', 'image/png')], [a]);
    expect(valid).toEqual([]);
  });
});
