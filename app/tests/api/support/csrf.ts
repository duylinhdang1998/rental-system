interface CsrfResponse {
  headers: { 'set-cookie'?: string[] };
}

export function csrfFrom(response: CsrfResponse): string {
  const value = response.headers['set-cookie']
    ?.find((cookie: string) => cookie.startsWith('rental_csrf='))
    ?.split(';')[0]
    ?.split('=')[1];
  if (!value) throw new Error('Expected CSRF cookie');
  return value;
}
