import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NewUser } from '@/lib/db/schema';

const onVercel = Boolean(process.env.VERCEL);
const isProduction = process.env.NODE_ENV === 'production';

/** Trimmed secret, or empty string when unset / whitespace-only (not nullish). */
const authSecretEnv = process.env.AUTH_SECRET?.trim() ?? '';

if ((onVercel || isProduction) && !authSecretEnv) {
  throw new Error(
    'AUTH_SECRET is required in production. Generate a strong secret (e.g. openssl rand -base64 32) and set it in your environment (Vercel: Project → Settings → Environment Variables; local: `.env`). Empty or whitespace-only values are not allowed.'
  );
}

/**
 * Local development only: empty env must not produce a zero-length HS256 key (`jose` throws).
 * Use `||` here — `??` would keep `""` when AUTH_SECRET is set but empty.
 */
const LOCAL_DEV_FALLBACK =
  'local-dev-auth-secret-at-least-32-characters-long';

const authSecret = authSecretEnv || LOCAL_DEV_FALLBACK;

const key = new TextEncoder().encode(authSecret);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

type SessionData = {
  user: { id: number };
  expires: string;
};

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 day from now')
    .sign(key);
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as SessionData;
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  return await verifyToken(session);
}

export async function setSession(user: NewUser) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session: SessionData = {
    user: { id: user.id! },
    expires: expiresInOneDay.toISOString(),
  };
  const encryptedSession = await signToken(session);
  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
}
