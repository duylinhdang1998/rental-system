import type { Request } from 'express';

const COOKIE_SEPARATOR = ';';

export function readCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return undefined;
  const encodedValue = cookieHeader
    .split(COOKIE_SEPARATOR)
    .map((item) => item.trim().split('='))
    .find(([cookieName]) => cookieName === name)?.[1];
  return encodedValue ? decodeURIComponent(encodedValue) : undefined;
}
