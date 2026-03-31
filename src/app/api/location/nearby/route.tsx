import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateDistance } from '@/lib/haversine';

/**
 * POST /api/location/nearby
 * Get all users within a specified radius
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const defaultRadius = Number(process.env.NEXT_PUBLIC_TRACKING_RADIUS) || 500;
    const { latitude, longitude, radius = defaultRadius, exclude_user_id } = body;

    // Validate required fields
    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: latitude, longitude' },
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

    // Get all online users
    let query = supabase
      .from('user_locations')
      .select('*')
      .eq('is_online', true);

    // Exclude the requesting user if specified
    if (exclude_user_id) {
      query = query.neq('user_id', exclude_user_id);
    }

    const { data: users, error } = await query;

    if (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      );
    }

    // Calculate distance for each user and filter by radius
    const nearbyUsers = users
      .map((user) => ({
        ...user,
        distance: calculateDistance(
          latitude,
          longitude,
          parseFloat(user.latitude as string),
          parseFloat(user.longitude as string)
        ),
      }))
      .filter((user) => user.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json({
      success: true,
      count: nearbyUsers.length,
      radius,
      users: nearbyUsers,
    });

  } catch (error) {
    console.error('Error in nearby users query:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
