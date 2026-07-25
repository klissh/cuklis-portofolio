import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { createSessionToken, timingSafeStringEqual } from '@/utils/adminAuth';

// Rate limit memory (per IP)
const rateLimitMap = new Map<string, { count: number, last: number }>();
const RATE_LIMIT = 5; // max 5 attempts
const RATE_WINDOW = 10 * 60 * 1000; // 10 menit

function isValidInput(str: any) {
  return typeof str === 'string' && str.length >= 3 && str.length <= 64;
}

function logLoginAttempt(username: string, ip: string, status: 'success' | 'fail') {
  // Di lingkungan production (Vercel/serverless) filesystem bersifat read-only
  // dan sementara (ephemeral), jadi logging ke file hanya dilakukan di luar
  // production untuk menghindari error yang tidak perlu.
  if (process.env.NODE_ENV === 'production') return;
  const logPath = path.join(process.cwd(), 'logins.log');
  const logLine = `${new Date().toISOString()} | user: ${username} | ip: ${ip} | status: ${status}\n`;
  try {
    fs.appendFileSync(logPath, logLine);
  } catch {
    // ignore logging error
  }
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  // Validasi input
  if (!isValidInput(username) || !isValidInput(password)) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  // Rate limiting per IP
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  const rl = rateLimitMap.get(ip) || { count: 0, last: 0 };
  if (now - rl.last > RATE_WINDOW) {
    rl.count = 0;
    rl.last = now;
  }
  rl.count++;
  rl.last = now;
  rateLimitMap.set(ip, rl);
  if (rl.count > RATE_LIMIT) {
    logLoginAttempt(username, ip, 'fail');
    return new NextResponse('Too many attempts', { status: 429 });
  }

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  const credentialsValid =
    !!ADMIN_USER &&
    !!ADMIN_PASS &&
    timingSafeStringEqual(username, ADMIN_USER) &&
    timingSafeStringEqual(password, ADMIN_PASS);

  if (credentialsValid) {
    const sessionToken = createSessionToken();
    const cookieStore = await cookies();
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 1 jam, selaras dengan masa berlaku token
    });
    logLoginAttempt(username, ip, 'success');
    return NextResponse.json({ success: true });
  } else {
    logLoginAttempt(username, ip, 'fail');
    return new NextResponse('Unauthorized', { status: 401 });
  }
}

// CATATAN SQL INJECTION PROTECTION:
// Jika menggunakan query SQL manual, SELALU gunakan parameterized query atau ORM (Supabase, Prisma, dsb).
// Jangan pernah interpolasi string secara langsung ke query SQL!
