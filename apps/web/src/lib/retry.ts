export interface RetryConfig {
  maxRetries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  jitterFactor?: number;
  retryableStatuses?: number[];
  onRetry?: (attempt: number, delayMs: number, error: unknown) => void;
  onExhausted?: (error: unknown) => void;
}

const DEFAULT_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  jitterFactor: 0.5,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

function calculateDelay(attempt: number, previousDelay: number, config: typeof DEFAULT_CONFIG): number {
  const { initialDelayMs, maxDelayMs, jitterFactor } = config;
  const exponentialDelay = initialDelayMs * Math.pow(2, attempt);
  const minDelay = initialDelayMs;
  const maxJitterDelay = Math.min(maxDelayMs, previousDelay * 3);
  const jitterRange = (maxJitterDelay - minDelay) * jitterFactor;
  const jitter = Math.random() * jitterRange;
  const delay = Math.min(maxDelayMs, Math.max(minDelay, exponentialDelay * (1 - jitterFactor) + jitter));
  return Math.round(delay);
}

function isRetryableError(error: unknown, retryableStatuses: number[]): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  const status =
    (error as { status?: number })?.status ||
    (error as { response?: { status?: number } })?.response?.status ||
    (error as { statusCode?: number })?.statusCode;
  if (status && retryableStatuses.includes(status)) {
    return true;
  }
  const message = String((error as { message?: string })?.message || error);
  const retryablePatterns = [/network/i, /timeout/i, /ECONNRESET/i, /ETIMEDOUT/i];
  return retryablePatterns.some((pattern) => pattern.test(message));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(fn: () => Promise<T>, config: RetryConfig = {}): Promise<T> {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const { maxRetries, retryableStatuses, onRetry, onExhausted } = fullConfig;
  let lastError: unknown;
  let previousDelay = fullConfig.initialDelayMs;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt >= maxRetries) {
        onExhausted?.(error);
        throw error;
      }
      if (!isRetryableError(error, retryableStatuses)) {
        throw error;
      }
      const delay = calculateDelay(attempt, previousDelay, fullConfig);
      previousDelay = delay;
      onRetry?.(attempt + 1, delay, error);
      await sleep(delay);
    }
  }
  throw lastError;
}

export function createRetryWrapper(defaultConfig: RetryConfig = {}) {
  return <T>(fn: () => Promise<T>, overrideConfig: RetryConfig = {}): Promise<T> => {
    return withRetry(fn, { ...defaultConfig, ...overrideConfig });
  };
}

export const apiRetry = createRetryWrapper({
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  jitterFactor: 0.5,
  onRetry: (attempt, delay, error) => {
    console.warn(
      `API request failed, retry ${attempt}/3 in ${delay}ms:`,
      (error as { message?: string })?.message || error,
    );
  },
  onExhausted: (error) => {
    console.error('API request failed after all retries:', (error as { message?: string })?.message || error);
  },
});
