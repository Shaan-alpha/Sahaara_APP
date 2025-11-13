import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * GET /api/notifications?user_id=xxx
 * Get all notifications for a user
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const user_id = searchParams.get('user_id');
    const unread_only = searchParams.get('unread_only') === 'true';

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing required parameter: user_id' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('receiver_id', user_id)
      .order('created_at', { ascending: false });

    if (unread_only) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: notifications?.length || 0,
      notifications: notifications || [],
    });

  } catch (error) {
    console.error('Error in notifications query:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark notification(s) as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { notification_id, notification_ids, user_id } = body;

    // Mark single notification as read
    if (notification_id) {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification_id)
        .select();

      if (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json(
          { error: 'Failed to update notification' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
        data,
      });
    }

    // Mark multiple notifications as read
    if (notification_ids && Array.isArray(notification_ids)) {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .in('id', notification_ids)
        .select();

      if (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json(
          { error: 'Failed to update notifications' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `${data?.length} notification(s) marked as read`,
        data,
      });
    }

    // Mark all notifications for a user as read
    if (user_id) {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('receiver_id', user_id)
        .eq('is_read', false)
        .select();

      if (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json(
          { error: 'Failed to update notifications' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `All notifications marked as read`,
        count: data?.length || 0,
      });
    }

    return NextResponse.json(
      { error: 'Missing required parameter: notification_id, notification_ids, or user_id' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in notification update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
