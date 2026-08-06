import { NextRequest, NextResponse } from 'next/server';
import { adminCookie, validateAdminPassword } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  if (typeof password !== 'string' || !validateAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid credentials or ADMIN_PASSWORD is not configured.' }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  const cookie = adminCookie(password);
  response.cookies.set(cookie.name, cookie.value, cookie.options);
  return response;
}
