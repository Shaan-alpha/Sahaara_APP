import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculateDistance } from '@/lib/haversine';

/**
 * POST /api/sos
 * Send SOS alert to all nearby users within specified radius
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const defaultRadius = Number(process.env.NEXT_PUBLIC_TRACKING_RADIUS) || 500;
    const {
      user_id,
      name,
      phone,
      latitude,
      longitude,
      radius = defaultRadius,
      message = 'Someone needs your help nearby!'
    } = body;

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

    // Get all online users except the sender
    const { data: users, error: fetchError } = await supabase
      .from('user_locations')
      .select('*')
      .eq('is_online', true)
      .neq('user_id', user_id);

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch nearby users' },
        { status: 500 }
      );
    }

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No online users found nearby',
        notified_count: 0,
        nearby_users: [],
      });
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

    if (nearbyUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: `No users found within ${radius}m radius`,
        notified_count: 0,
        nearby_users: [],
      });
    }

    // Create notifications for all nearby users
    const notifications = nearbyUsers.map((user) => ({
      sender_id: user_id,
      sender_name: name,
      sender_phone: phone,
      receiver_id: user.user_id,
      latitude,
      longitude,
      distance: user.distance,
      message: `🆘 ${message}\n\nFrom: ${name}\nDistance: ${Math.round(user.distance)}m away\n\nLocation: ${latitude}, ${longitude}`,
      is_read: false,
    }));

    // Insert all notifications
    const { data: insertedNotifications, error: insertError } = await supabase
      .from('notifications')
      .insert(notifications)
      .select();

    if (insertError) {
      console.error('Error inserting notifications:', insertError);
      return NextResponse.json(
        { error: 'Failed to send notifications' },
        { status: 500 }
      );
    }

    // Return success with details
    return NextResponse.json({
      success: true,
      message: `SOS alert sent to ${nearbyUsers.length} nearby user(s)`,
      notified_count: nearbyUsers.length,
      radius,
      nearby_users: nearbyUsers.map((user) => ({
        user_id: user.user_id,
        name: user.name,
        distance: Math.round(user.distance),
      })),
      notifications: insertedNotifications,
    });

  } catch (error) {
    console.error('Error in SOS alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
