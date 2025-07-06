import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const session = cookies().get('admin_session');
  if (session && session.value) {
    return NextResponse.json({ authenticated: true });
  } else {
    return new NextResponse('Unauthorized', { status: 401 });
  }
} 