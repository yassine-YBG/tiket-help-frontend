import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDebouncedValue } from './useDebouncedValue';

afterEach(() => vi.useRealTimers());

describe('useDebouncedValue', () => {
  it('only updates after the delay without changes', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'ab' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'abc' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('a'); // still typing
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('abc'); // 300 ms after the last change
  });
});
