import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/location/cleanup
 * Mark users as offline if they haven't updated location in 5 minutes
 * This runs automatically as a backup in case client-side offline marking fails
 */
export async function POST(request: NextRequest) {
  try {
    // Calculate 5 minutes ago
    const fiveMinutesAgo = new Date();
    fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

    // Mark users as offline if they haven't updated in 5 minutes
    const { data, error } = await supabase
      .from('user_locations')
      .update({ is_online: false })
      .eq('is_online', true)
      .lt('last_updated', fiveMinutesAgo.toISOString())
      .select();

    if (error) {
      console.error('Error in cleanup:', error);
      return NextResponse.json(
        { error: 'Cleanup failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Marked ${data?.length || 0} inactive user(s) as offline`,
      count: data?.length || 0,
    });

  } catch (error) {
    console.error('Error in cleanup endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/location/cleanup
 * Same as POST but for easy testing in browser
 */
export async function GET(request: NextRequest) {
  return POST(request);
}
