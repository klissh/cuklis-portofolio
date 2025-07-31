import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  try {
    console.log('Testing sections table...');
    
    // Test 1: Coba ambil semua data sections
    const { data: allSections, error: selectError } = await supabase
      .from('sections')
      .select('*');
    
    if (selectError) {
      console.error('Error selecting from sections:', selectError);
      return NextResponse.json({ 
        error: 'Failed to select from sections', 
        details: selectError,
        message: selectError.message,
        code: selectError.code,
        hint: selectError.hint
      }, { status: 500 });
    }
    
    console.log('All sections:', allSections);
    
    // Test 2: Coba ambil section dengan type 'develop'
    const { data: developSection, error: developError } = await supabase
      .from('sections')
      .select('*')
      .eq('type', 'develop')
      .single();
    
    if (developError && developError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error selecting develop section:', developError);
    }
    
    console.log('Develop section:', developSection);
    
    return NextResponse.json({
      success: true,
      allSections,
      developSection,
      totalSections: allSections?.length || 0
    });
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error 
    }, { status: 500 });
  }
}