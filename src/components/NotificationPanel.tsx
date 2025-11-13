'use client';

import React, { useState } from 'react';
import { Bell, X, MapPin, AlertCircle } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistance } from '@/lib/haversine';

interface NotificationPanelProps {
  user_id: string | null;
}

export function NotificationPanel({ user_id }: NotificationPanelProps) {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications(user_id);
  const [isOpen, setIsOpen] = useState(false);

  const handleNotificationClick = (notification_id: string) => {
    markAsRead(notification_id);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-3 bg-white rounded-full shadow-lg"
      >
        <Bell size={24} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:w-96 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Bell size={20} className="text-gray-700" />
                <h2 className="text-lg font-bold">Notifications</h2>
                {unreadCount > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mark all as read */}
            {unreadCount > 0 && (
              <div className="px-4 py-2 border-b">
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  Mark all as read
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                  <Bell size={48} className="mb-2 opacity-50" />
                  <p>No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id!)}
                      className={`p-4 cursor-pointer transition-colors ${
                        notification.is_read
                          ? 'bg-white hover:bg-gray-50'
                          : 'bg-red-50 hover:bg-red-100'
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                            <AlertCircle size={20} className="text-white" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-gray-900">
                              🆘 Emergency Alert
                            </h3>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTimestamp(notification.created_at!)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-700 mt-1">
                            <span className="font-medium">
                              {notification.sender_name}
                            </span>{' '}
                            needs help nearby
                          </p>

                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                            <MapPin size={12} />
                            <span>
                              {formatDistance(notification.distance)} away
                            </span>
                          </div>

                          {/* View Location Button */}
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${notification.latitude}&mlon=${notification.longitude}&zoom=17`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-xs text-blue-600 hover:text-blue-700 font-semibold"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Location →
                          </a>

                          {!notification.is_read && (
                            <div className="mt-2">
                              <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
