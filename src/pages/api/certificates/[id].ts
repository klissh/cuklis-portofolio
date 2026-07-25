// src/pages/api/certificates/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import { cleanupUnusedFiles } from '@/utils/storageCleanup';
import { verifySessionToken } from '@/utils/adminAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Update dan delete khusus admin. SEBELUMNYA tidak ada pengecekan auth
  // sama sekali di sini.
  if (req.method === 'PUT' || req.method === 'DELETE') {
    if (!verifySessionToken(req.cookies.admin_session)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  if (req.method === 'PUT') {
    const { title, image, link } = req.body;
    const { data, error } = await supabase
      .from('certificates')
      .update({ title, image, link })
      .eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'DELETE') {
    const { error } = await supabase.from('certificates').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });

    // Jalankan cleanup otomatis setelah delete
    try {
      await cleanupUnusedFiles();
      console.log('Storage cleanup completed after certificate deletion');
    } catch (cleanupError) {
      console.error('Error during storage cleanup:', cleanupError);
      // Tidak mengembalikan error karena delete sudah berhasil
    }

    return res.status(204).end();
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
