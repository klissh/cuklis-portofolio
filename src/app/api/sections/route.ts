import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/utils/supabaseClient';
import { verifySessionToken } from '@/utils/adminAuth';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching sections:', error);
      return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Pengecekan autentikasi admin
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    if (!verifySessionToken(session?.value)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { type, skills } = body;

    // Validasi input
    if (!type || !['develop', 'create'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('sections')
      .insert([{
        type,
        skills: skills || '[]'
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating section:', error);
      return NextResponse.json({ error: 'Failed to create section' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}