"use client"
import React, { useEffect, useState } from 'react';
import { MapPin, Send, User, Home, Calendar, Users, UserCircle, X } from 'lucide-react';
import Link from 'next/link';
import { NotificationPanel } from '@/components/NotificationPanel';
import { useLocationTracking } from '@/hooks/useLocationTracking';

interface AvatarProps {
  name: string;
  image: string;
}

const Avatar: React.FC<AvatarProps> = ({ name, image }) => (
  <div className="flex flex-col items-center">
    <img src={image} alt={name} className="w-16 h-16 rounded-full" />
    <span className="mt-1 text-xs">{name}</span>
  </div>
);

export default function SaharaApp() {
  const avatars = [
    { name: 'Roshan', image: 'https://i.pinimg.com/564x/7a/87/f7/7a87f754fc4d20a85e19410ee598f321.jpg' },
    { name: 'Shaan', image: 'https://i.pinimg.com/564x/43/b4/01/43b401a63c6c71b4f94c4cbb4a3b83e2.jpg' },
    { name: 'Sarthak', image: 'https://i.pinimg.com/564x/5c/37/d9/5c37d977e014aa17fdfb7eff52b4a57e.jpg' },
    { name: 'Ayushi', image: 'https://i.pinimg.com/564x/6c/77/2d/6c772dcd658fc559b6c958270b812a1d.jpg' },
  ];

  // TODO: Replace with actual user data from authentication
  // Get user from URL parameter or localStorage for testing
  const [userId, setUserId] = React.useState<string>('');
  const [userName, setUserName] = React.useState<string>('');
  const [showUserSelector, setShowUserSelector] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check URL parameter first
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get('user');

      if (userParam) {
        const newUserId = `user_${userParam}`;
        const newUserName = `User ${userParam}`;
        setUserId(newUserId);
        setUserName(newUserName);
        localStorage.setItem('sahara_user_id', newUserId);
        localStorage.setItem('sahara_user_name', newUserName);
      } else {
        // Check localStorage
        const savedUserId = localStorage.getItem('sahara_user_id');
        const savedUserName = localStorage.getItem('sahara_user_name');

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
          localStorage.setItem('sahara_user_id', newUserId);
          localStorage.setItem('sahara_user_name', newUserName);
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
    localStorage.setItem('sahara_user_id', newUserId);
    localStorage.setItem('sahara_user_name', newUserName);
    setShowUserSelector(false);
    window.location.reload(); // Reload to restart location tracking
  };

  const currentUser = {
    id: userId,
    name: userName,
    phone: '+919521688016'
  };

  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [sosMessage, setSosMessage] = useState('');
  const [nearbyCount, setNearbyCount] = useState<number>(0);

  // Track user location in real-time
  const { location, isTracking } = useLocationTracking(
    currentUser.id,
    currentUser.name,
    currentUser.phone,
    10000 // Update every 10 seconds
  );

  // Check for nearby users every 10 seconds
  useEffect(() => {
    if (!location) return;

    const checkNearbyUsers = async () => {
      try {
        // First, run cleanup to mark inactive users as offline
        await fetch('/api/location/cleanup', { method: 'POST' });

        // Then check for nearby users
        const res = await fetch('/api/location/nearby', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            latitude: location.latitude,
            longitude: location.longitude,
            radius: 50,
            exclude_user_id: currentUser.id,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setNearbyCount(data.count);
        }
      } catch (err) {
        console.error('Error checking nearby users:', err);
      }
    };

    checkNearbyUsers();
    const interval = setInterval(checkNearbyUsers, 10000);
    return () => clearInterval(interval);
  }, [location, currentUser.id]);

  const handleSOS = async () => {
    if (!location) {
      alert('Unable to get your location. Please enable location services.');
      return;
    }

    try {
      setIsSending(true);
      setSosMessage('Sending SOS to nearby users...');

      const res = await fetch('/api/sos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          name: currentUser.name,
          phone: currentUser.phone,
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 50, // 50 meters
          message: 'Someone needs your help nearby!',
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSent(true);
        setSosMessage(
          `SOS sent to ${data.notified_count} nearby user(s)!`
        );
        setTimeout(() => {
          setIsSending(false);
          setIsSent(false);
          setSosMessage('');
        }, 5000);
      } else {
        throw new Error(data.error || 'Failed to send SOS');
      }
    } catch (error) {
      console.error('SOS send error:', error);
      setSosMessage('Failed to send SOS. Please try again.');
      setIsSending(false);
      setIsSent(false);
      setTimeout(() => setSosMessage(''), 3000);
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      {/* Status Bar */}
      <div className="bg-white py-2 px-4 flex justify-between items-center">
        <span className="font-bold">9:41</span>
        <div className="flex space-x-1">
          <span className="font-bold">•••</span>
          <span className="font-bold">Wi-Fi</span>
          <span className="font-bold">100%</span>
        </div>
      </div>

      {/* Header */}
      <header className="px-4 py-2 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sahara</h1>
        <div className="flex items-center gap-2">
          <NotificationPanel user_id={currentUser.id} />
          <button className="rounded-full w-10 h-10 bg-gray-200 p-2">
            <span className="text-xl rounded-full">?</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <h2 className="text-2xl">Hi {userName}!</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">{userId}</p>
              <button
                onClick={() => setShowUserSelector(!showUserSelector)}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
              >
                Switch User
              </button>
            </div>
          </div>
          <Link href="/profile">
          <img src="https://i.pinimg.com/564x/07/55/38/075538bf5387809a568c5f496d06eb10.jpg" alt="User" className="w-8 h-8 rounded-full" />
          </Link>
        </div>

        {/* User Selector Modal */}
        {showUserSelector && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Select Test User</h3>
                <button
                  onClick={() => setShowUserSelector(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Choose a user for testing. Each user has their own location.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <button
                    key={num}
                    onClick={() => switchUser(num)}
                    className={`p-4 rounded-lg border-2 transition ${
                      userId === `user_${num}`
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">👤</div>
                    <div className="text-sm font-semibold">User {num}</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs">
                <strong>Note:</strong> Open different browsers/incognito windows and select different users to test the nearby detection feature.
              </div>
            </div>
          </div>
        )}

        {/* Nearby Users Indicator */}
        {isTracking && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">
                  Location Active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-bold text-blue-600">
                  {nearbyCount} nearby
                </span>
              </div>
            </div>
            {location && (
              <p className="text-xs text-gray-500 mt-1">
                {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-4 gap-4 mb-8">
          {avatars.map((avatar) => (
            <Avatar key={avatar.name} {...avatar} />
          ))}
        </div>
          <Link href="/maps">
        <div className="flex justify-end mb-8">
          <div className="flex flex-col items-center space-y-2 bg-gray-100 rounded-lg p-2">
            <MapPin className="w-6 h-6" />
            <Send className="w-6 h-6" />
          </div>
        </div>
        </Link>

        <div onClick={handleSOS} className="flex justify-center mb-4">
          <button
            disabled={isSending || !location}
            className="w-40 h-40 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
          >
            <span className="text-white text-4xl font-bold">
              {isSending ? (isSent ? "✓" : "...") : "SOS"}
            </span>
          </button>
        </div>

        {/* Status Messages */}
        {sosMessage && (
          <div className="mb-4 mx-auto max-w-xs">
            <p className={`text-center text-sm font-medium ${isSent ? 'text-green-600' : 'text-blue-600'}`}>
              {sosMessage}
            </p>
          </div>
        )}

        {/* Location Tracking Status */}
        {!isTracking && (
          <div className="mb-4 mx-auto max-w-xs">
            <p className="text-center text-xs text-orange-600">
              Location tracking disabled. Enable to use SOS.
            </p>
          </div>
        )}

        <div className="flex justify-center items-center space-x-1 mb-2">
          <img src="https://i.pinimg.com/564x/6c/77/2d/6c772dcd658fc559b6c958270b812a1d.jpg" alt="Avatar 1" className="w-6 h-6 rounded-full" />
          <img src="https://i.pinimg.com/564x/5c/37/d9/5c37d977e014aa17fdfb7eff52b4a57e.jpg" alt="Avatar 2" className="w-6 h-6 rounded-full" />
          <img src="https://i.pinimg.com/564x/7a/87/f7/7a87f754fc4d20a85e19410ee598f321.jpg" alt="Avatar 3" className="w-6 h-6 rounded-full" />
          <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-xs">UB</span>
          </div>
        </div>
        <p className="text-center text-sm text-gray-600">
          Your SOS will be sent to nearby people within 50m
        </p>
      </main>

      {/* Navigation Bar */}
      <nav className="bg-white border-t border-gray-200 px-4 py-2">
        <ul className="flex justify-between">
          <li className="flex flex-col items-center">
            <Home className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </li>
          <Link href="/maps">
          <li className="flex flex-col items-center">
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Visits</span>
          </li>
          </Link>
          <li className="flex flex-col items-center">
            <User className="w-6 h-6" />
            <span className="text-xs">Contacts</span>
          </li>
          <li className="flex flex-col items-center">
            <Users className="w-6 h-6" />
            <span className="text-xs">Friends</span>
          </li>
          <Link href={'/profile'}>
          <li className="flex flex-col items-center">
            <UserCircle className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </li>
          </Link>
        </ul>
      </nav>
    </div>
  );
}