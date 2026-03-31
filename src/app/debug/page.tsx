'use client';

import { useEffect, useState } from 'react';
import { useLocationTracking } from '@/hooks/useLocationTracking';

export default function DebugPage() {
  const [userId, setUserId] = useState('debug_user_001');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev]);
  };

  const { location, error, isTracking } = useLocationTracking(
    userId,
    'Debug User',
    '+1234567890',
    10000
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const userParam = params.get('user');
      if (userParam) {
        setUserId(`debug_user_${userParam}`);
      }
    }
  }, []);

  useEffect(() => {
    if (location) {
      addLog(`Location updated: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`);
    }
  }, [location]);

  useEffect(() => {
    if (error) {
      addLog(`ERROR: ${error}`);
    }
  }, [error]);

  useEffect(() => {
    addLog(`Tracking status: ${isTracking ? 'ACTIVE' : 'INACTIVE'}`);
  }, [isTracking]);

  const manualLocationUpdate = async () => {
    if (!location) {
      addLog('ERROR: No location available');
      return;
    }

    try {
      addLog('Manually sending location update...');
      const response = await fetch('/api/location/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          name: 'Debug User',
          phone: '+1234567890',
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      const data = await response.json();
      addLog(`API Response: ${JSON.stringify(data)}`);

      if (!response.ok) {
        addLog(`ERROR: API returned status ${response.status}`);
      } else {
        addLog('SUCCESS: Location updated in Supabase');
      }
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`);
    }
  };

  const checkNearby = async () => {
    if (!location) {
      addLog('ERROR: No location available');
      return;
    }

    try {
      addLog('Checking for nearby users...');
      const response = await fetch('/api/location/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          radius: Number(process.env.NEXT_PUBLIC_TRACKING_RADIUS) || 500,
          exclude_user_id: userId,
        }),
      });

      const data = await response.json();
      addLog(`Nearby users: ${data.count}`);
      addLog(`API Response: ${JSON.stringify(data)}`);
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`);
    }
  };

  const checkSupabase = async () => {
    try {
      addLog('Checking Supabase connection...');
      const response = await fetch('/api/location/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: 37.7749,
          longitude: -122.4194,
          radius: 50000,
        }),
      });

      const data = await response.json();
      addLog(`Total users in database: ${data.count || 0}`);
      if (data.users) {
        data.users.forEach((user: any) => {
          addLog(`  - ${user.user_id}: ${user.name} (${user.distance.toFixed(0)}m away)`);
        });
      }
    } catch (err: any) {
      addLog(`ERROR: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">🐛 Debug Console</h1>
          <a
            href="/"
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            Back to Home
          </a>
        </div>

        {/* Status Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">User ID</div>
            <div className="text-xl font-bold text-blue-400">{userId}</div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Tracking Status</div>
            <div
              className={`text-xl font-bold ${
                isTracking ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isTracking ? '✓ Active' : '✗ Inactive'}
            </div>
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">Location</div>
            <div className="text-sm font-mono text-yellow-400">
              {location
                ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                : 'Waiting...'}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-900 border border-red-500 rounded-lg">
            <div className="font-bold text-red-200 mb-1">Error:</div>
            <div className="text-red-300">{error}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={manualLocationUpdate}
            disabled={!location}
            className="px-4 py-3 bg-blue-600 rounded hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
          >
            📤 Send Location
          </button>

          <button
            onClick={checkNearby}
            disabled={!location}
            className="px-4 py-3 bg-green-600 rounded hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition"
          >
            🔍 Check Nearby
          </button>

          <button
            onClick={checkSupabase}
            className="px-4 py-3 bg-purple-600 rounded hover:bg-purple-700 transition"
          >
            💾 Check Database
          </button>

          <button
            onClick={() => setLogs([])}
            className="px-4 py-3 bg-gray-700 rounded hover:bg-gray-600 transition"
          >
            🗑️ Clear Logs
          </button>

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-3 bg-yellow-600 rounded hover:bg-yellow-700 transition"
          >
            🔄 Reload Page
          </button>

          <button
            onClick={() => {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  addLog(
                    `GPS: ${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`
                  );
                  addLog(`Accuracy: ${pos.coords.accuracy.toFixed(0)}m`);
                },
                (err) => {
                  addLog(`GPS Error: ${err.message}`);
                }
              );
            }}
            className="px-4 py-3 bg-orange-600 rounded hover:bg-orange-700 transition"
          >
            📍 Test GPS
          </button>
        </div>

        {/* Environment Check */}
        <div className="mb-6 bg-gray-800 p-4 rounded-lg">
          <div className="font-bold mb-2">Environment Check:</div>
          <div className="space-y-1 text-sm font-mono">
            <div>
              <span className="text-gray-400">SUPABASE_URL:</span>{' '}
              <span
                className={
                  process.env.NEXT_PUBLIC_SUPABASE_URL
                    ? 'text-green-400'
                    : 'text-red-400'
                }
              >
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}
              </span>
            </div>
            <div>
              <span className="text-gray-400">SUPABASE_KEY:</span>{' '}
              <span
                className={
                  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                    ? 'text-green-400'
                    : 'text-red-400'
                }
              >
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                  ? '✓ Set'
                  : '✗ Missing'}
              </span>
            </div>
          </div>
        </div>

        {/* Logs Panel */}
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="font-bold mb-3 text-lg">📋 Activity Log</div>
          <div className="bg-black rounded p-3 h-96 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-gray-500 text-center py-8">
                No logs yet. Try the buttons above.
              </div>
            ) : (
              logs.map((log, i) => (
                <div
                  key={i}
                  className={`mb-1 ${
                    log.includes('ERROR')
                      ? 'text-red-400'
                      : log.includes('SUCCESS')
                      ? 'text-green-400'
                      : log.includes('API Response')
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-900 border border-blue-500 p-4 rounded-lg text-sm">
          <div className="font-bold mb-2">📖 Instructions:</div>
          <ol className="list-decimal list-inside space-y-1 text-blue-200">
            <li>Allow location permission when prompted</li>
            <li>Wait for location to load (check Status Panel)</li>
            <li>Click "📤 Send Location" to manually update Supabase</li>
            <li>Click "💾 Check Database" to see all users</li>
            <li>
              Open another tab with ?user=2 to test multiple users
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
