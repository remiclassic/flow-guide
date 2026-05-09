/**
 * Session cookies: `secure` breaks plain http://localhost unless overridden.
 * Production and preview (HTTPS) use secure cookies by default.
 */
export function sessionCookieSecure(): boolean {
  if (process.env.COOKIE_SECURE === '1') return true;
  if (process.env.COOKIE_SECURE === '0') return false;
  return process.env.NODE_ENV === 'production';
}

export function sessionCookieBase(expires: Date) {
  return {
    httpOnly: true,
    secure: sessionCookieSecure(),
    sameSite: 'lax' as const,
    expires,
  };
}
