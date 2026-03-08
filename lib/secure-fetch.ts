/**
 * Secure fetch wrapper with timeout, error handling, and response validation
 */

export interface SecureFetchOptions extends RequestInit {
  /** Request timeout in milliseconds (default: 10000) */
  timeout?: number;
  /** Whether to validate the response is JSON (default: true) */
  expectJson?: boolean;
}

export class FetchTimeoutError extends Error {
  constructor(url: string, timeout: number) {
    super(`Request to ${url} timed out after ${timeout}ms`);
    this.name = 'FetchTimeoutError';
  }
}

export class FetchNetworkError extends Error {
  constructor(url: string, cause?: Error) {
    super(`Network error fetching ${url}: ${cause?.message || 'Unknown error'}`);
    this.name = 'FetchNetworkError';
    this.cause = cause;
  }
}

/**
 * Fetch with automatic timeout and error handling
 * Use this for all external API calls to prevent hanging requests
 */
export async function secureFetch(
  url: string,
  options: SecureFetchOptions = {}
): Promise<Response> {
  const { timeout = 10000, expectJson = true, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new FetchTimeoutError(url, timeout);
      }
      throw new FetchNetworkError(url, error);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetch JSON with timeout, validation, and type safety
 */
export async function secureFetchJson<T = unknown>(
  url: string,
  options: SecureFetchOptions = {}
): Promise<{ data: T; response: Response }> {
  const response = await secureFetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    throw new Error(`Expected JSON response but got ${contentType}`);
  }

  const data = await response.json() as T;
  return { data, response };
}

/**
 * Safe error message extraction for client responses
 * Never expose internal error details to clients
 */
export function getSafeErrorMessage(error: unknown): string {
  // In production, return generic messages
  if (process.env.NODE_ENV === 'production') {
    if (error instanceof FetchTimeoutError) {
      return 'The request timed out. Please try again.';
    }
    if (error instanceof FetchNetworkError) {
      return 'A network error occurred. Please check your connection.';
    }
    return 'An unexpected error occurred. Please try again.';
  }

  // In development, return the actual error message
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
