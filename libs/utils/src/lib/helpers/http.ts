export type HTTP_METHODS = typeof HTTP_METHODS[keyof typeof HTTP_METHODS];
export const HTTP_METHODS = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export type RequestHeaders = Headers | Record<string, string>;

export interface HttpRequest<T> {
  body?: T;
  headers?: RequestHeaders;
  path?: string;
  query?: Record<string, any>;
  dontAddAccessToken?: boolean;
  url?: string;

  cache?: boolean;
  cacheKey?: string;
  cacheKeysToInvalidate?: string[];
  json?: boolean;
  shouldIncludeClientRequestId?: boolean;
  batch?: boolean;
}

export interface HttpResponse<T> {
  body?: T;
  headers: Headers;
  ok: boolean;
  status: number;
  url: string;
}
