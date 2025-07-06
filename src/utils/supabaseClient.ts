import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fungsi upload file ke Supabase Storage dan dapatkan public URL
export async function uploadImage(file: File, bucket: string) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage.from(bucket).upload(fileName, file);
  if (error) throw new Error(error.message);
  const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return publicUrl.publicUrl;
}
