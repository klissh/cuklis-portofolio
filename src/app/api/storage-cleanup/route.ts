import { NextRequest, NextResponse } from 'next/server';
import { cleanupUnusedFiles, cleanupOldUnusedFiles } from '@/utils/storageCleanup';

// Fungsi untuk memvalidasi API key
function validateApiKey(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = process.env.STORAGE_CLEANUP_API_KEY;
  
  if (!validApiKey) {
    console.error('STORAGE_CLEANUP_API_KEY is not set in environment variables');
    return false;
  }
  
  return apiKey === validApiKey;
}

// API untuk membersihkan file yang tidak digunakan
export async function POST(request: NextRequest) {
  try {
    // Validasi API key untuk keamanan
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid API key' },
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
    console.error('Error in storage cleanup API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}

// API untuk membersihkan file yang tidak digunakan (GET method untuk cron jobs)
export async function GET(request: NextRequest) {
  try {
    // Validasi API key untuk keamanan
    if (!validateApiKey(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid API key' },
        { status: 401 }
      );
    }

    // Default: hapus semua file yang tidak digunakan
    const result = await cleanupUnusedFiles();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in storage cleanup API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: (error as Error).message },
      { status: 500 }
    );
  }
}