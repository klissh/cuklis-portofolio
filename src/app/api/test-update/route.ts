import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function GET() {
  try {
    console.log('Testing manual section update...');
    
    // Test 1: Cari section dengan type 'develop'
    const { data: existingSections, error: selectError } = await supabase
      .from('sections')
      .select('*')
      .eq('type', 'develop');
    
    if (selectError) {
      console.error('Error selecting sections:', selectError);
      return NextResponse.json({ 
        error: 'Failed to select sections', 
        details: selectError 
      }, { status: 500 });
    }
    
    console.log('Existing develop sections:', existingSections);
    
    if (existingSections && existingSections.length > 0) {
      const sectionId = existingSections[0].id;
      
      // Test 2: Coba update section
      const { data: updateResult, error: updateError } = await supabase
        .from('sections')
        .update({
          description: 'Test description update - ' + new Date().toISOString()
        })
        .eq('id', sectionId)
        .select();
      
      if (updateError) {
        console.error('Error updating section:', updateError);
        return NextResponse.json({ 
          error: 'Failed to update section', 
          details: updateError,
          message: updateError.message,
          code: updateError.code
        }, { status: 500 });
      }
      
      console.log('Update result:', updateResult);
      
      return NextResponse.json({
        success: true,
        message: 'Section updated successfully',
        sectionId,
        updateResult
      });
    } else {
      // Test 3: Buat section baru jika tidak ada
      const { data: createResult, error: createError } = await supabase
        .from('sections')
        .insert({
          type: 'develop',
          description: 'Test description - ' + new Date().toISOString(),
          skills: '[]'
        })
        .select();
      
      if (createError) {
        console.error('Error creating section:', createError);
        return NextResponse.json({ 
          error: 'Failed to create section', 
          details: createError 
        }, { status: 500 });
      }
      
      console.log('Create result:', createResult);
      
      return NextResponse.json({
        success: true,
        message: 'Section created successfully',
        createResult
      });
    }
    
  } catch (error) {
    console.error('Manual test error:', error);
    return NextResponse.json({ 
      error: 'Manual test failed', 
      details: error 
    }, { status: 500 });
  }
}