"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  MapPin,
  Send,
  User,
  Home,
  Calendar,
  Users,
  UserCircle,
  X,
} from "lucide-react";
import Link from "next/link";
import { NotificationPanel } from "@/components/NotificationPanel";
import { EmergencyAlertPopup } from "@/components/EmergencyAlertPopup";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useNotifications } from "@/hooks/useNotifications";
import { useAlertSound } from "@/hooks/useAlertSound";
import type { SaharaNotification } from "@/lib/supabase";

interface AvatarProps {
  name: string;
  image: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, image }) => (
  <div className="flex flex-col items-center gap-1">
    <div className="relative">
      <img
        src={image}
        alt={name}
        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover ring-2 ring-white shadow-md"
      />
      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
    </div>
    <span className="mt-0.5 text-xs font-medium text-gray-600 truncate max-w-[56px] text-center">
      {name}
    </span>
  </div>
);

export default function SaharaApp() {
  const avatars = [
    {
      name: "Roshan",
      image:
        "https://i.pinimg.com/564x/7a/87/f7/7a87f754fc4d20a85e19410ee598f321.jpg",
    },
    {
      name: "Shaan",
      image:
        "https://i.pinimg.com/564x/43/b4/01/43b401a63c6c71b4f94c4cbb4a3b83e2.jpg",
    },
    {
      name: "Sarthak",
      image:
        "https://i.pinimg.com/564x/5c/37/d9/5c37d977e014aa17fdfb7eff52b4a57e.jpg",
    },
    {
      name: "Ayushi",
      image:
        "https://i.pinimg.com/564x/6c/77/2d/6c772dcd658fc559b6c958270b812a1d.jpg",
    },
  ];

  // TODO: Replace with actual user data from authentication
  // Get user from URL parameter or localStorage for testing
  const [userId, setUserId] = React.useState<string>("");
  const [userName, setUserName] = React.useState<string>("");
  const [showUserSelector, setShowUserSelector] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      // Check URL parameter first
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get("user");

      if (userParam) {
        const newUserId = `user_${userParam}`;
        const newUserName = `User ${userParam}`;
        setUserId(newUserId);
        setUserName(newUserName);
        localStorage.setItem("sahara_user_id", newUserId);
        localStorage.setItem("sahara_user_name", newUserName);
      } else {
        // Check localStorage
        const savedUserId = localStorage.getItem("sahara_user_id");
        const savedUserName = localStorage.getItem("sahara_user_name");

        if (savedUserId && savedUserName) {
          setUserId(savedUserId);
          setUserName(savedUserName);
        } else {
          // Generate random user ID if none exists
          const randomId = Math.floor(Math.random() * 1000);
          const newUserId = `user_${randomId}`;
          const newUserName = `User ${randomId}`;
          setUserId(newUserId);
          setUserName(newUserName);
          localStorage.setItem("sahara_user_id", newUserId);
          localStorage.setItem("sahara_user_name", newUserName);
          setShowUserSelector(true); // Show selector on first visit
        }
      }
    }
  }, []);

  const switchUser = (userNumber: number) => {
    const newUserId = `user_${userNumber}`;
    const newUserName = `User ${userNumber}`;
    setUserId(newUserId);
    setUserName(newUserName);
    localStorage.setItem("sahara_user_id", newUserId);
    localStorage.setItem("sahara_user_name", newUserName);
    setShowUserSelector(false);
    window.location.reload(); // Reload to restart location tracking
  };

  const currentUser = {
    id: userId,
    name: userName,
    phone: "+919521688016",
  };

  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sosMessage, setSosMessage] = useState("");
  const [nearbyCount, setNearbyCount] = useState<number>(0);
  const [activeAlert, setActiveAlert] = useState<SaharaNotification | null>(
    null,
  );

  // Alert sound hook
  const { playAlertSound, stopAlertSound } = useAlertSound();

  // Callback when a new SOS notification arrives via real-time
  const handleNewNotification = useCallback(
    (notification: SaharaNotification) => {
      setActiveAlert(notification);
      playAlertSound();
    },
    [playAlertSound],
  );

  // Notifications hook — drives both the popup and NotificationPanel
  const {
    notifications,
    unreadCount,
    loading: notifLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications(currentUser.id || null, handleNewNotification);

  // Dismiss the emergency popup
  const dismissAlert = useCallback(() => {
    stopAlertSound();
    if (activeAlert?.id) {
      markAsRead(activeAlert.id);
    }
    setActiveAlert(null);
  }, [stopAlertSound, activeAlert, markAsRead]);

  // Track user location in real-time
  const { location, isTracking } = useLocationTracking(
    currentUser.id,
    currentUser.name,
    currentUser.phone,
    10000, // Update every 10 seconds
  );

  // Check for nearby users every 10 seconds
  useEffect(() => {
    if (!location) return;

    const checkNearbyUsers = async () => {
      try {
        // First, run cleanup to mark inactive users as offline
        await fetch("/api/location/cleanup", { method: "POST" });

        // Then check for nearby users
        const res = await fetch("/api/location/nearby", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
            radius: 200,
            exclude_user_id: currentUser.id,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setNearbyCount(data.count);
        }
      } catch (err) {
        console.error("Error checking nearby users:", err);
      }
    };

    checkNearbyUsers();
    const interval = setInterval(checkNearbyUsers, 10000);
    return () => clearInterval(interval);
  }, [location, currentUser.id]);

  const handleSOS = async () => {
    if (!location) {
      alert("Unable to get your location. Please enable location services.");
      return;
    }

    try {
      setIsSending(true);
      setSosMessage("Sending SOS to nearby users...");

      const res = await fetch("/api/sos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          name: currentUser.name,
          phone: currentUser.phone,
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 50, // 50 meters
          message: "Someone needs your help nearby!",
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSent(true);
        setSosMessage(`SOS sent to ${data.notified_count} nearby user(s)!`);
        setTimeout(() => {
          setIsSending(false);
          setIsSent(false);
          setSosMessage("");
        }, 5000);
      } else {
        throw new Error(data.error || "Failed to send SOS");
      }
    } catch (error) {
      console.error("SOS send error:", error);
      setSosMessage("Failed to send SOS. Please try again.");
      setIsSending(false);
      setIsSent(false);
      setTimeout(() => setSosMessage(""), 3000);
    }
  };

  return (
    /* Desktop: centres a phone-frame. Mobile: full screen */
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-blue-50 to-indigo-100 flex items-center justify-center p-0 sm:p-6 lg:p-10">
      <div className="relative flex flex-col w-full sm:max-w-[390px] h-screen sm:h-[820px] bg-white sm:rounded-[2.5rem] sm:shadow-2xl sm:overflow-hidden text-black">
        {/* Emergency Alert Popup — renders above everything */}
        {activeAlert && (
          <EmergencyAlertPopup
            notification={activeAlert}
            onDismiss={dismissAlert}
          />
        )}

        {/* ── Status Bar ── */}
        <div className="bg-white/95 backdrop-blur-sm px-5 pt-3 pb-1 flex justify-between items-center shrink-0">
          <span className="text-xs font-bold tracking-tight">9:41</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold">•••</span>
            <span className="text-xs font-bold">Wi‑Fi</span>
            <span className="text-xs font-bold">100%</span>
          </div>
        </div>

        {/* ── Header ── */}
        <header className="px-5 py-3 flex justify-between items-center shrink-0 bg-white/95 backdrop-blur-sm border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            {/* Brand icon */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  fill="white"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              Sahara
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              loading={notifLoading}
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
            />
            <Link href="/profile">
              <img
                src="https://i.pinimg.com/564x/07/55/38/075538bf5387809a568c5f496d06eb10.jpg"
                alt="User"
                className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-200 shadow hover:ring-indigo-400 transition-all"
              />
            </Link>
          </div>
        </header>

        {/* ── Main scrollable area ── */}
        <main className="flex-grow px-5 pt-4 pb-2 overflow-y-auto no-scrollbar">
          {/* Greeting row */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">
                Good morning 👋
              </p>
              <h2 className="text-2xl font-bold text-gray-900">
                Hi, {userName || "—"}!
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-[11px] text-gray-400 font-mono">{userId}</p>
                <button
                  onClick={() => setShowUserSelector(!showUserSelector)}
                  className="text-[11px] font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Switch User
                </button>
              </div>
            </div>
          </div>

          {/* User Selector Modal */}
          {showUserSelector && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center sm:justify-center p-4">
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-slide-up-panel">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    Select Test User
                  </h3>
                  <button
                    onClick={() => setShowUserSelector(false)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Choose a user for testing. Each user has their own location.
                </p>
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => switchUser(num)}
                      className={`p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                        userId === `user_${num}`
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-gray-100 bg-gray-50 hover:border-blue-300"
                      }`}
                    >
                      <div className="text-2xl mb-1">👤</div>
                      <div className="text-xs font-semibold text-gray-700">
                        User {num}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800">
                  <strong>Note:</strong> Open different browsers/incognito
                  windows and select different users to test the nearby
                  detection feature.
                </div>
              </div>
            </div>
          )}

          {/* Location status strip */}
          {isTracking && (
            <div className="mb-4 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-400" />
                  <span className="text-sm font-semibold text-gray-800">
                    Location Active
                  </span>
                </div>
                <div className="flex items-center gap-1.5 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-xl shadow-sm">
                  <Users className="w-3 h-3" />
                  <span>{nearbyCount} nearby</span>
                </div>
              </div>
              {location && (
                <p className="text-[11px] text-gray-400 mt-1.5 font-mono">
                  {location.latitude.toFixed(6)},{" "}
                  {location.longitude.toFixed(6)}
                </p>
              )}
            </div>
          )}

          {/* Location off warning */}
          {!isTracking && (
            <div className="mb-4 px-4 py-3 bg-orange-50 border border-orange-200 rounded-2xl">
              <p className="text-xs font-semibold text-orange-700">
                ⚠️ Location tracking disabled. Enable to use SOS.
              </p>
            </div>
          )}

          {/* Nearby contacts row */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-gray-800">
                Nearby Contacts
              </h3>
              <Link
                href="/maps"
                className="text-xs font-semibold text-blue-500 hover:text-blue-600 transition-colors"
              >
                See all →
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {avatars.map((avatar) => (
                <Avatar key={avatar.name} {...avatar} />
              ))}
            </div>
          </div>

          {/* Map shortcut */}
          <Link href="/maps">
            <div className="flex justify-end mb-6">
              <div className="flex flex-col items-center gap-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl px-4 py-3 shadow-md hover:shadow-lg active:scale-95 transition-all">
                <MapPin className="w-5 h-5" />
                <Send className="w-5 h-5" />
                <span className="text-[10px] font-bold">Map</span>
              </div>
            </div>
          </Link>

          {/* ── SOS button ── */}
          <div onClick={handleSOS} className="flex justify-center mb-4">
            <button
              disabled={isSending || !location}
              className={`relative w-44 h-44 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all duration-300 select-none
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  isSent
                    ? "bg-gradient-to-br from-green-400 to-emerald-600 scale-95"
                    : isSending
                      ? "bg-gradient-to-br from-red-400 to-orange-500 scale-95"
                      : "bg-gradient-to-br from-red-400 via-red-500 to-red-700 hover:scale-105 active:scale-95 sos-pulse"
                }`}
            >
              <span className="text-white text-5xl font-black tracking-tight drop-shadow-sm">
                {isSending ? (isSent ? "✓" : "…") : "SOS"}
              </span>
              <span className="text-white/80 text-[11px] font-semibold mt-1 uppercase tracking-widest">
                {isSending ? (isSent ? "Sent!" : "Sending") : "Tap to Alert"}
              </span>
            </button>
          </div>

          {/* Status Messages */}
          {sosMessage && (
            <div className="mb-4 mx-auto max-w-xs animate-fade-in-up">
              <p
                className={`text-center text-sm font-semibold px-4 py-2 rounded-2xl ${
                  isSent
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {sosMessage}
              </p>
            </div>
          )}

          {/* Stacked avatars + caption */}
          <div className="flex flex-col items-center gap-2 pb-2">
            <div className="flex items-center -space-x-1.5">
              <img
                src="https://i.pinimg.com/564x/6c/77/2d/6c772dcd658fc559b6c958270b812a1d.jpg"
                alt="Avatar 1"
                className="w-7 h-7 rounded-full border-2 border-white shadow object-cover"
              />
              <img
                src="https://i.pinimg.com/564x/5c/37/d9/5c37d977e014aa17fdfb7eff52b4a57e.jpg"
                alt="Avatar 2"
                className="w-7 h-7 rounded-full border-2 border-white shadow object-cover"
              />
              <img
                src="https://i.pinimg.com/564x/7a/87/f7/7a87f754fc4d20a85e19410ee598f321.jpg"
                alt="Avatar 3"
                className="w-7 h-7 rounded-full border-2 border-white shadow object-cover"
              />
              <div className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white shadow flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-600">
                  +{nearbyCount}
                </span>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 font-medium">
              SOS reaches everyone within{" "}
              <strong className="text-gray-700">50 m</strong>
            </p>
          </div>
        </main>

        {/* ── Navigation Bar ── */}
        <nav className="bg-white border-t border-gray-100 px-4 pt-2 pb-3 safe-pb shrink-0">
          <ul className="flex justify-between items-center max-w-sm mx-auto">
            <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl bg-blue-50">
              <Home className="w-5 h-5 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-600">Home</span>
            </li>
            <Link href="/maps">
              <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                <Calendar className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-semibold text-gray-400">
                  Visits
                </span>
              </li>
            </Link>
            <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
              <User className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-400">
                Contacts
              </span>
            </li>
            <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
              <Users className="w-5 h-5 text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-400">
                Friends
              </span>
            </li>
            <Link href={"/profile"}>
              <li className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors">
                <UserCircle className="w-5 h-5 text-gray-400" />
                <span className="text-[10px] font-semibold text-gray-400">
                  Profile
                </span>
              </li>
            </Link>
          </ul>
        </nav>
      </div>
    </div>
  );
}
