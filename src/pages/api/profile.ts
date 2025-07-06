import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Ambil profile pertama (diasumsikan hanya ada 1 row)
    const { data, error } = await supabase.from('profile').select('*').limit(1).single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === 'PUT') {
    // Update profile (diasumsikan id=1)
    const { name, photo_url, bio, titles } = req.body;
    const { error } = await supabase
      .from('profile')
      .update({ name, photo_url, bio, titles })
      .eq('id', 1);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'PUT']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 