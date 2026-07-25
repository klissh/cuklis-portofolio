import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { supabase } from '@/utils/supabaseClient';
import { verifySessionToken } from '@/utils/adminAuth';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('profile')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Pengecekan autentikasi admin.
    // SEBELUMNYA endpoint ini tidak punya proteksi apa pun, artinya siapa
    // saja di internet bisa menimpa nama, bio, CV, dan foto profil.
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    if (!verifySessionToken(session?.value)) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await request.json();
    const { name, bio, description, titles, cv_url, photo_url } = body;

    // Cek apakah profile sudah ada
    const { data: existingProfile } = await supabase
      .from('profile')
      .select('id')
      .single();

    let result;
    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profile')
        .update({
          name: name || '',
          bio: bio || '',
          description: description || '',
          titles: titles || '[]',
          cv_url: cv_url || '',
          photo_url: photo_url || ''
        })
        .eq('id', existingProfile.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }
      result = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('profile')
        .insert([{
          name: name || '',
          bio: bio || '',
          description: description || '',
          titles: titles || '[]',
          cv_url: cv_url || '',
          photo_url: photo_url || ''
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }
      result = data;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}