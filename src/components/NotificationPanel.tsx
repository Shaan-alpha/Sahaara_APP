"use client";

import React, { useState } from "react";
import { Bell, X, MapPin, AlertCircle } from "lucide-react";
import { SaharaNotification } from "@/lib/supabase";
import { formatDistance } from "@/lib/haversine";

interface NotificationPanelProps {
  notifications: SaharaNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

export function NotificationPanel({
  notifications,
  unreadCount,
  loading,
  markAsRead,
  markAllAsRead,
}: NotificationPanelProps) {
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

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
      {/* Notification Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} className="text-gray-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border border-white shadow">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center sm:justify-center">
          <div className="bg-white rounded-t-[2rem] sm:rounded-3xl w-full sm:w-96 max-h-[80vh] flex flex-col shadow-2xl animate-slide-up-panel">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
                  <Bell size={17} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Notifications
                  </h2>
                  {unreadCount > 0 && (
                    <p className="text-xs text-gray-400">
                      {unreadCount} unread
                    </p>
                  )}
                </div>
                {unreadCount > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-full transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Mark all as read */}
            {unreadCount > 0 && (
              <div className="px-5 py-2.5 bg-blue-50/50 border-b border-gray-100">
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  ✓ Mark all as read
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                  <p className="text-xs text-gray-400 font-medium">
                    Loading alerts…
                  </p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center px-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-3">
                    <Bell size={28} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">
                    All clear!
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    No notifications yet. Stay safe.
                  </p>
                </div>
              ) : (
                <div className="p-3 space-y-2">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification.id!)}
                      className={`p-4 rounded-2xl cursor-pointer transition-all active:scale-[0.98] ${
                        notification.is_read
                          ? "bg-gray-50 hover:bg-gray-100"
                          : "bg-red-50 border border-red-100 hover:bg-red-100/60"
                      }`}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                              notification.is_read
                                ? "bg-gray-200"
                                : "bg-red-500"
                            }`}
                          >
                            <AlertCircle
                              size={18}
                              className={
                                notification.is_read
                                  ? "text-gray-500"
                                  : "text-white"
                              }
                            />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-gray-900 truncate">
                              🆘 SOS Emergency Alert
                            </h3>
                            <span className="text-[10px] text-gray-400 font-medium flex-shrink-0">
                              {formatTimestamp(notification.created_at!)}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-semibold text-gray-800">
                              {notification.sender_name}
                            </span>{" "}
                            needs help nearby
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                              <MapPin size={11} className="text-blue-500" />
                              <span>
                                {formatDistance(notification.distance)} away
                              </span>
                            </div>
                            {/* View Location Button */}
                            <a
                              href={`https://www.openstreetmap.org/?mlat=${notification.latitude}&mlon=${notification.longitude}&zoom=17`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View →
                            </a>
                          </div>

                          {!notification.is_read && (
                            <div className="mt-2 flex items-center gap-1">
                              <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                              <span className="text-[10px] text-red-500 font-semibold">
                                New
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom padding for safe area */}
            <div className="h-3 safe-pb" />
          </div>
        </div>
      )}
    </>
  );
}
