'use client';

import React from 'react';
import { AlertTriangle, MapPin, X } from 'lucide-react';
import { SaharaNotification } from '@/lib/supabase';
import { formatDistance } from '@/lib/haversine';

interface EmergencyAlertPopupProps {
  notification: SaharaNotification;
  onDismiss: () => void;
}

export function EmergencyAlertPopup({
  notification,
  onDismiss,
}: EmergencyAlertPopupProps) {
  const mapUrl = `https://www.openstreetmap.org/?mlat=${notification.latitude}&mlon=${notification.longitude}&zoom=17`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-emergency-pulse">
      {/* Pulsing background overlay */}
      <div className="absolute inset-0 bg-red-600/90" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm w-full">
        {/* Dismiss X button */}
        <button
          onClick={onDismiss}
          className="absolute top-[-60px] right-0 p-2 text-white/70 hover:text-white"
        >
          <X size={28} />
        </button>

        {/* Pulsing concentric circles */}
        <div className="relative mb-8">
          <div className="absolute inset-0 w-32 h-32 -m-4 rounded-full bg-white/10 animate-ping" />
          <div className="absolute inset-0 w-28 h-28 -m-2 rounded-full bg-white/15 animate-pulse" />
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
            <AlertTriangle size={48} className="text-white" />
          </div>
        </div>

        {/* Alert text */}
        <h1 className="text-white text-3xl font-extrabold mb-2 tracking-wide">
          SOS ALERT
        </h1>

        <p className="text-white/90 text-lg font-semibold mb-1">
          {notification.sender_name}
        </p>

        <div className="flex items-center gap-1 text-white/80 text-sm mb-4">
          <MapPin size={14} />
          <span>{formatDistance(notification.distance)} away</span>
        </div>

        <p className="text-white/80 text-sm mb-8">
          {notification.message}
        </p>

        {/* Action buttons */}
        <div className="flex gap-3 w-full">
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-white text-red-600 font-bold py-3 px-4 rounded-xl text-center hover:bg-gray-100 transition"
          >
            View Location
          </a>
          <button
            onClick={onDismiss}
            className="flex-1 bg-white/20 text-white font-bold py-3 px-4 rounded-xl border border-white/30 hover:bg-white/30 transition"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
