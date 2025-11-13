import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * POST /api/location/update
 * Updates or inserts user's current location
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, name, phone, latitude, longitude } = body;

    // Validate required fields
    if (!user_id || !name || !phone || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, name, phone, latitude, longitude' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Check if user location already exists
    const { data: existingLocation, error: fetchError } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', user_id)
      .single();

    let result;

    if (existingLocation) {
      // Update existing location
      const { data, error } = await supabase
        .from('user_locations')
        .update({
          name,
          phone,
          latitude,
          longitude,
          is_online: true,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', user_id)
        .select();

      if (error) {
        console.error('Error updating location:', error);
        return NextResponse.json(
          { error: 'Failed to update location' },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Insert new location
      const { data, error } = await supabase
        .from('user_locations')
        .insert({
          user_id,
          name,
          phone,
          latitude,
          longitude,
          is_online: true,
          last_updated: new Date().toISOString(),
        })
        .select();

      if (error) {
        console.error('Error inserting location:', error);
        return NextResponse.json(
          { error: 'Failed to insert location' },
          { status: 500 }
        );
      }
      result = data;
    }

    return NextResponse.json({
      success: true,
      message: 'Location updated successfully',
      data: result,
    });

  } catch (error) {
    console.error('Error in location update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
