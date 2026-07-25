import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { cleanupUnusedFiles, cleanupOldUnusedFiles } from '@/utils/storageCleanup';
import { verifySessionToken } from '@/utils/adminAuth';

// API untuk membersihkan file yang tidak digunakan (khusus admin dashboard)
export async function POST(request: NextRequest) {
  try {
    // Validasi session admin langsung dari cookie (sebelumnya melakukan
    // self-fetch ke /api/admin-session yang tidak perlu dan lebih rapuh)
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session');
    if (!verifySessionToken(session?.value)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { mode = 'unused', daysOld = 30 } = body;

    let result;

    if (mode === 'old') {
      // Hapus file lama yang tidak digunakan (lebih dari X hari)
      result = await cleanupOldUnusedFiles(daysOld);
    } else {
      // Hapus semua file yang tidak digunakan
      result = await cleanupUnusedFiles();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in admin storage cleanup API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}
