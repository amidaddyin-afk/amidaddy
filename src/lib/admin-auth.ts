import 'server-only';

import { createHash } from 'node:crypto';
import { cookies } from 'next/headers';

const cookieName = 'amidaddy_admin';

function getPassword() {
  return process.env.ADMIN_PASSWORD;
}

function tokenFor(password: string) {
  return createHash('sha256').update(`amidaddy:${password}`).digest('hex');
}

export async function isAdmin() {
  const password = getPassword();
  if (!password) return false;
  return (await cookies()).get(cookieName)?.value === tokenFor(password);
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error('Unauthorized');
}

export function validateAdminPassword(password: string) {
  const expected = getPassword();
  return Boolean(expected && password === expected);
}

export function adminCookie(password: string) {
  return { name: cookieName, value: tokenFor(password), options: { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 12 } };
}
