import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/location/offline
 * Mark user as offline when they disconnect
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required field: user_id' },
        { status: 400 }
      );
    }

    // Update user status to offline
    const { data, error } = await supabase
      .from('user_locations')
      .update({
        is_online: false,
        last_updated: new Date().toISOString(),
      })
      .eq('user_id', user_id)
      .select();

    if (error) {
      console.error('Error marking user offline:', error);
      return NextResponse.json(
        { error: 'Failed to mark user offline' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User marked as offline',
      data,
    });

  } catch (error) {
    console.error('Error in offline endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
