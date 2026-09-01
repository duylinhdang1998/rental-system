function csrfToken(): string | undefined {
  return document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith('rental_csrf='))
    ?.split('=')[1];
}

function errorMessage(error: unknown): string {
  if (typeof error !== 'object' || !error || !('message' in error)) return 'Đã có lỗi xảy ra';
  return typeof error.message === 'string' ? error.message : 'Đã có lỗi xảy ra';
}

export async function apiRequest(path: string, init: RequestInit = {}): Promise<unknown> {
  const token = init.method && init.method !== 'GET' ? csrfToken() : undefined;
  const response = await fetch(path, {
    ...init,
    credentials: 'same-origin',
    headers: {
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(token ? { 'x-csrf-token': token } : {}),
      ...init.headers,
    },
  });
  if (!response.ok) {
    const error: unknown = await response.json();
    throw new Error(errorMessage(error));
  }
  const payload: unknown = await response.json();
  return payload;
}
