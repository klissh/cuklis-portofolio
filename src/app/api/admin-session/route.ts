import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '@/utils/adminAuth';

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get('admin_session');
  if (verifySessionToken(session?.value)) {
    return NextResponse.json({ authenticated: true });
  } else {
    return new NextResponse('Unauthorized', { status: 401 });
  }
}
