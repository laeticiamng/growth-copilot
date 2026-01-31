import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback } from '@/hooks/useDebounce';
import { useRetry, retryAsync } from '@/hooks/useRetry';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'initial' } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial'); // Still initial

    act(() => {
      vi.advanceTimersByTime(299);
    });
    expect(result.current).toBe('initial'); // Still initial

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated'); // Now updated
  });

  it('should reset timer on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } }
    );

    rerender({ value: 'b' });
    act(() => { vi.advanceTimersByTime(100); });
    
    rerender({ value: 'c' });
    act(() => { vi.advanceTimersByTime(100); });
    
    rerender({ value: 'd' });
    act(() => { vi.advanceTimersByTime(100); });

    expect(result.current).toBe('a'); // Still initial

    act(() => { vi.advanceTimersByTime(300); });
    expect(result.current).toBe('d'); // Final value
  });
});

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should debounce callback execution', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));
    const [debouncedFn] = result.current;

    debouncedFn('arg1');
    expect(callback).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(300); });
    expect(callback).toHaveBeenCalledWith('arg1');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should cancel pending callbacks', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(callback, 300));
    const [debouncedFn, cancel] = result.current;

    debouncedFn();
    cancel();
    
    act(() => { vi.advanceTimersByTime(300); });
    expect(callback).not.toHaveBeenCalled();
  });
});

describe('useRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should succeed on first try', async () => {
    const { result } = renderHook(() => useRetry<string>());
    const successFn = vi.fn().mockResolvedValue('success');

    let resultValue: string | null = null;
    await act(async () => {
      resultValue = await result.current.execute(successFn);
    });

    expect(resultValue).toBe('success');
    expect(result.current.data).toBe('success');
    expect(result.current.error).toBeNull();
    expect(successFn).toHaveBeenCalledTimes(1);
  });

  it('should retry on failure and eventually succeed', async () => {
    const { result } = renderHook(() => useRetry<string>());
    
    let attempts = 0;
    const eventualSuccess = vi.fn().mockImplementation(() => {
      attempts++;
      if (attempts < 3) {
        return Promise.reject(new Error('Temporary failure'));
      }
      return Promise.resolve('success');
    });

    await act(async () => {
      const promise = result.current.execute(eventualSuccess, {
        maxRetries: 5,
        delayMs: 100,
      });
      
      // Advance timers for retries
      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(200);
      
      await promise;
    });

    expect(result.current.data).toBe('success');
    expect(eventualSuccess).toHaveBeenCalledTimes(3);
  });

  it('should call onRetry callback', async () => {
    const { result } = renderHook(() => useRetry<string>());
    const onRetry = vi.fn();
    const failingFn = vi.fn().mockRejectedValue(new Error('Fail'));

    await act(async () => {
      const promise = result.current.execute(failingFn, {
        maxRetries: 2,
        delayMs: 100,
        onRetry,
      });
      
      await vi.advanceTimersByTimeAsync(100);
      await vi.advanceTimersByTimeAsync(200);
      
      await promise;
    });

    expect(onRetry).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    expect(onRetry).toHaveBeenCalledWith(2, expect.any(Error));
  });
});

describe('retryAsync utility', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should resolve on success', async () => {
    const successFn = vi.fn().mockResolvedValue('data');
    
    const resultPromise = retryAsync(successFn);
    const result = await resultPromise;
    
    expect(result).toBe('data');
  });

  it('should throw after max retries', async () => {
    const failingFn = vi.fn().mockRejectedValue(new Error('Always fails'));

    const promise = retryAsync(failingFn, { maxRetries: 2, delayMs: 100 });
    
    // Advance through retries
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(200);
    
    await expect(promise).rejects.toThrow('Always fails');
    expect(failingFn).toHaveBeenCalledTimes(3); // Initial + 2 retries
  });
});
