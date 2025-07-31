import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fungsi untuk membuat bucket jika belum ada
async function createBucketIfNotExists(bucketName: string) {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  
  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['image/*', 'application/pdf'],
      fileSizeLimit: 10485760 // 10MB
    });
    if (error) {
      console.error(`Error creating bucket ${bucketName}:`, error);
    }
  }
}

// Fungsi upload file ke Supabase Storage dan dapatkan public URL
export async function uploadImage(file: File, bucket: string) {
  try {
    // Pastikan bucket ada
    await createBucketIfNotExists(bucket);
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage.from(bucket).upload(fileName, file);
    if (error) throw new Error(error.message);
    
    const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return publicUrl.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

// Fungsi untuk mendapatkan public URL dari file yang sudah ada
export function getPublicUrl(bucket: string, fileName: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return data.publicUrl;
}

// Fungsi untuk mendapatkan semua file dalam bucket
export async function listFiles(bucket: string) {
  const { data, error } = await supabase.storage.from(bucket).list();
  if (error) {
    console.error(`Error listing files in ${bucket}:`, error);
    return [];
  }
  return data || [];
}
