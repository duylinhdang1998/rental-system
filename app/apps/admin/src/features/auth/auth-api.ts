import type { LoginInput, SessionResponse } from '@rental/contracts';

interface ApiErrorBody {
  message?: string;
}
const UNAUTHORIZED_STATUS = 401;
const RESTORE_ATTEMPTS = 10;
const RESTORE_DELAY_MILLISECONDS = 100;
const PENDING_LOGIN_KEY = 'rental-login-pending';

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

async function parseResponse(response: Response): Promise<SessionResponse> {
  const body = (await response.json()) as SessionResponse | ApiErrorBody;
  if (!response.ok) throw new Error('message' in body ? body.message : 'Đã có lỗi xảy ra');
  return body as SessionResponse;
}

export async function loginRequest(input: LoginInput): Promise<SessionResponse> {
  window.sessionStorage.setItem(PENDING_LOGIN_KEY, 'true');
  try {
    const response = await fetch('/api/auth/login', {
      body: JSON.stringify(input),
      headers: { 'content-type': 'application/json' },
      keepalive: true,
      method: 'POST',
    });
    return await parseResponse(response);
  } finally {
    window.sessionStorage.removeItem(PENDING_LOGIN_KEY);
  }
}

export async function sessionRequest(): Promise<SessionResponse | null> {
  const response = await fetch('/api/auth/session');
  return response.status === UNAUTHORIZED_STATUS ? null : parseResponse(response);
}

export async function restoreSessionRequest(): Promise<SessionResponse | null> {
  for (let attempt = 0; attempt < RESTORE_ATTEMPTS; attempt += 1) {
    const session = await sessionRequest();
    if (session || !window.sessionStorage.getItem(PENDING_LOGIN_KEY)) return session;
    await delay(RESTORE_DELAY_MILLISECONDS);
  }
  return null;
}
