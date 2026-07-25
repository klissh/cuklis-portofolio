import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/utils/supabaseClient';
import { verifySessionToken } from '@/utils/adminAuth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Pengecekan autentikasi admin
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    if (!verifySessionToken(session?.value)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { type, skills } = body;
    const resolvedParams = await params;
    const id = resolvedParams.id;

    // Validasi input
    if (!type || !['develop', 'create'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('sections')
      .update({
        type,
        skills: skills || '[]'
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating section:', error);
      return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Pengecekan autentikasi admin
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    if (!verifySessionToken(session?.value)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const resolvedParams = await params;
    const id = resolvedParams.id;

    const { error } = await supabase
      .from('sections')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting section:', error);
      return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}