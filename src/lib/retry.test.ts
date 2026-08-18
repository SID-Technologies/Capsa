import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { withRetry } from './retry';

// Fake timers so the exponential-backoff sleeps resolve instantly.
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

// Attach the resolve/reject expectation to the promise BEFORE advancing timers,
// so the pending promise always has a handler (no unhandled-rejection warnings),
// then flush every backoff sleep with runAllTimersAsync.
async function settle<T>(promise: Promise<T>, assert: (p: Promise<T>) => Promise<unknown>) {
  const done = assert(promise);
  await vi.runAllTimersAsync();
  await done;
}

describe('withRetry', () => {
  it('returns the result on first success without retrying', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const onRetry = vi.fn();
    await settle(withRetry(fn, { onRetry }), (p) => expect(p).resolves.toBe('ok'));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('retries a retryable error then succeeds', async () => {
    const fn = vi.fn().mockRejectedValueOnce({ status: 503 }).mockResolvedValue('recovered');
    const onRetry = vi.fn();
    await settle(withRetry(fn, { onRetry }), (p) => expect(p).resolves.toBe('recovered'));
    expect(fn).toHaveBeenCalledTimes(2);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not retry a non-retryable status and rethrows immediately', async () => {
    const fn = vi.fn().mockRejectedValue({ status: 404 });
    const onRetry = vi.fn();
    await settle(withRetry(fn, { onRetry }), (p) => expect(p).rejects.toEqual({ status: 404 }));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(onRetry).not.toHaveBeenCalled();
  });

  it('exhausts retries and calls onExhausted with the last error', async () => {
    const err = { status: 500 };
    const fn = vi.fn().mockRejectedValue(err);
    const onExhausted = vi.fn();
    await settle(withRetry(fn, { maxRetries: 2, onExhausted }), (p) => expect(p).rejects.toBe(err));
    // 1 initial attempt + 2 retries.
    expect(fn).toHaveBeenCalledTimes(3);
    expect(onExhausted).toHaveBeenCalledWith(err);
  });

  it('treats fetch TypeErrors and network/timeout messages as retryable', async () => {
    const cases: unknown[] = [
      new TypeError('Failed to fetch'),
      new Error('network unreachable'),
      new Error('request timeout'),
      { response: { status: 502 } },
      { statusCode: 429 },
    ];
    for (const err of cases) {
      const fn = vi.fn().mockRejectedValueOnce(err).mockResolvedValue('ok');
      await settle(withRetry(fn), (p) => expect(p).resolves.toBe('ok'));
      expect(fn).toHaveBeenCalledTimes(2);
    }
  });

  it('treats an unknown error as non-retryable', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('bad input'));
    await settle(withRetry(fn), (p) => expect(p).rejects.toThrow('bad input'));
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
