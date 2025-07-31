import { NextRequest, NextResponse } from 'next/server';
import { cleanupUnusedFiles, cleanupOldUnusedFiles } from '@/utils/storageCleanup';

// Fungsi untuk memvalidasi session admin
async function validateAdminSession(request: NextRequest) {
  try {
    const sessionRes = await fetch(`${request.nextUrl.origin}/api/admin-session`, {
      headers: {
        cookie: request.headers.get('cookie') || ''
      }
    });
    return sessionRes.ok;
  } catch (error) {
    console.error('Error validating admin session:', error);
    return false;
  }
}

// API untuk membersihkan file yang tidak digunakan (khusus admin dashboard)
export async function POST(request: NextRequest) {
  try {
    // Validasi session admin
    const isValidSession = await validateAdminSession(request);
    if (!isValidSession) {
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