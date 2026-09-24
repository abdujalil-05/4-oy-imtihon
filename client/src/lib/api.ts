import type { ApiError, ApiSuccess } from './types';

const BASE = '/api/v1';

export class HttpError extends Error {
  readonly statusCode: number;
  readonly code: string;

  constructor(payload: ApiError) {
    super(payload.message);
    this.name = 'HttpError';
    this.statusCode = payload.statusCode;
    this.code = payload.code;
  }
}

type Body = Record<string, unknown> | FormData | undefined;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: Body;
  skipRefresh?: boolean;
}

let refreshing: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  refreshing ??= fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then((res) => res.ok)
    .catch(() => false)
    .finally(() => {
      setTimeout(() => {
        refreshing = null;
      }, 0);
    });
  return refreshing;
}

async function parse(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function send(path: string, options: RequestOptions): Promise<Response> {
  const { method = 'GET', body } = options;
  const isForm = body instanceof FormData;

  return fetch(`${BASE}${path}`, {
    method,
    credentials: 'include',
    headers: isForm || !body ? undefined : { 'Content-Type': 'application/json' },
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let res = await send(path, options);

  if (res.status === 401 && !options.skipRefresh) {
    const renewed = await refreshSession();
    if (renewed) {
      res = await send(path, options);
    }
  }

  const payload = await parse(res);

  if (!res.ok) {
    const error = payload as Partial<ApiError> | null;
    throw new HttpError({
      statusCode: error?.statusCode ?? res.status,
      code: error?.code ?? 'REQUEST_FAILED',
      message: error?.message ?? 'Serverga ulanishda muammo yuz berdi',
      path,
      timestamp: new Date().toISOString(),
    });
  }

  return (payload as ApiSuccess<T>)?.data as T;
}

export const api = {
  get: <T,>(path: string) => request<T>(path),
  post: <T,>(path: string, body?: Body) => request<T>(path, { method: 'POST', body }),
  patch: <T,>(path: string, body?: Body) => request<T>(path, { method: 'PATCH', body }),
  remove: <T,>(path: string) => request<T>(path, { method: 'DELETE' }),
};
