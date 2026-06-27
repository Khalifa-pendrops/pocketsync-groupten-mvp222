import { ApiError } from '../api/errors';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh'];

let refreshPromise: Promise<void> | null = null;

async function refreshSession(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (!response.ok) {
          throw new ApiError(response.status, { error: 'Session expired' });
        }
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function parseBody(response: Response): Promise<Record<string, unknown>> {
  const text = await response.text();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: text };
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  hasRetried = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const body = await parseBody(response);

  if (
    response.status === 401 &&
    !hasRetried &&
    !AUTH_ENDPOINTS.some((path) => endpoint.startsWith(path))
  ) {
    try {
      await refreshSession();
      return request<T>(endpoint, options, true);
    } catch {
      throw new ApiError(response.status, body);
    }
  }

  if (!response.ok) {
    throw new ApiError(response.status, body);
  }

  return body as T;
}

export const apiClient = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};