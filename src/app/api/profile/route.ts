import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

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
    const body = await request.json();
    const { name, bio, description, titles, cv_url } = body;

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
          cv_url: cv_url || ''
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
          cv_url: cv_url || ''
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