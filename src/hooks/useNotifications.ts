import { useEffect, useState } from 'react';
import { supabase, SaharaNotification } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

/**
 * Custom hook for managing real-time notifications
 * @param user_id User's unique identifier
 * @param onNewNotification Optional callback fired when a new SOS arrives in real-time
 */
export function useNotifications(
  user_id: string | null,
  onNewNotification?: (notification: SaharaNotification) => void
) {
  const [notifications, setNotifications] = useState<SaharaNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user_id) {
      setLoading(false);
      return;
    }

    let channel: RealtimeChannel | null = null;

    // Delete notifications older than 2 days from the database
    const cleanupOldNotifications = async () => {
      try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        await supabase
          .from('notifications')
          .delete()
          .eq('receiver_id', user_id)
          .lt('created_at', twoDaysAgo.toISOString());
      } catch (err) {
        console.error('Error cleaning up old notifications:', err);
      }
    };

    // Fetch initial notifications (only last 2 days)
    const fetchNotifications = async () => {
      try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('receiver_id', user_id)
          .gte('created_at', twoDaysAgo.toISOString())
          .order('created_at', { ascending: false });

        if (error) throw error;

        setNotifications(data || []);
        setUnreadCount((data || []).filter((n) => !n.is_read).length);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to fetch notifications');
        setLoading(false);
      }
    };

    cleanupOldNotifications();
    fetchNotifications();

    // Subscribe to real-time notifications
    channel = supabase
      .channel(`notifications:${user_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `receiver_id=eq.${user_id}`,
        },
        (payload) => {
          const newNotification = payload.new as SaharaNotification;
          setNotifications((prev) => [newNotification, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Fire callback so parent can show popup / play sound
          onNewNotification?.(newNotification);

          // Show browser notification if permitted (enhanced: won't auto-dismiss)
          if (typeof window !== 'undefined' && 'Notification' in window) {
            const BrowserNotification = window.Notification;
            if (BrowserNotification.permission === 'granted') {
              new BrowserNotification('🆘 Sahara Emergency Alert', {
                body: `${newNotification.sender_name} needs help nearby! ${newNotification.message}`,
                icon: '/icon.png',
                badge: '/badge.png',
                requireInteraction: true,
                tag: `sos-${newNotification.id}`,
              });
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `receiver_id=eq.${user_id}`,
        },
        (payload) => {
          const updatedNotification = payload.new as SaharaNotification;
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === updatedNotification.id ? updatedNotification : n
            )
          );
          if (updatedNotification.is_read) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    // Request notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const BrowserNotification = window.Notification;
      if (BrowserNotification.permission === 'default') {
        BrowserNotification.requestPermission();
      }
    }

    // Cleanup
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user_id, onNewNotification]);

  const markAsRead = async (notification_id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification_id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification_id ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      setError('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    if (!user_id) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('receiver_id', user_id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      setError('Failed to mark all notifications as read');
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
  };
}
