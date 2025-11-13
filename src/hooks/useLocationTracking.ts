import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Custom hook for tracking user location and updating Supabase
 * @param user_id User's unique identifier
 * @param name User's name
 * @param phone User's phone number
 * @param updateInterval How often to update location (in ms, default: 10000 = 10 seconds)
 */
export function useLocationTracking(
  user_id: string | null,
  name: string,
  phone: string,
  updateInterval: number = 10000
) {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Use ref to track latest location without causing re-renders
  const locationRef = useRef<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (!user_id || !name || !phone) {
      return;
    }

    let watchId: number | null = null;
    let updateIntervalId: NodeJS.Timeout | null = null;

    const updateLocation = async (latitude: number, longitude: number) => {
      try {
        const response = await fetch('/api/location/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id,
            name,
            phone,
            latitude,
            longitude,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update location');
        }
      } catch (err) {
        console.error('Error updating location:', err);
        setError('Failed to update location');
      }
    };

    const markOffline = async () => {
      try {
        await fetch('/api/location/offline', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id }),
        });
      } catch (err) {
        console.error('Error marking offline:', err);
      }
    };

    // Mark user offline when they close the browser/tab
    const handleBeforeUnload = () => {
      // Use sendBeacon for reliability when closing tab
      const data = JSON.stringify({ user_id });
      navigator.sendBeacon('/api/location/offline', data);
    };

    // Start tracking location
    if (navigator.geolocation) {
      setIsTracking(true);

      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          locationRef.current = { latitude, longitude };
          setLocation({ latitude, longitude });
          updateLocation(latitude, longitude);
        },
        (err) => {
          console.error('Error getting location:', err);
          setError(err.message);
          setIsTracking(false);
        }
      );

      // Watch position changes
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          locationRef.current = { latitude, longitude };
          setLocation({ latitude, longitude });
        },
        (err) => {
          console.error('Error watching location:', err);
          setError(err.message);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );

      // Update location at regular intervals using ref
      updateIntervalId = setInterval(() => {
        if (locationRef.current) {
          updateLocation(locationRef.current.latitude, locationRef.current.longitude);
        }
      }, updateInterval);

      // Add event listener for browser close/tab close
      window.addEventListener('beforeunload', handleBeforeUnload);
    } else {
      setError('Geolocation is not supported by this browser');
      setIsTracking(false);
    }

    // Cleanup
    return () => {
      // Mark user as offline when component unmounts
      markOffline();

      // Remove event listener
      window.removeEventListener('beforeunload', handleBeforeUnload);

      // Stop location tracking
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (updateIntervalId) {
        clearInterval(updateIntervalId);
      }
      setIsTracking(false);
    };
  }, [user_id, name, phone, updateInterval]); // Removed 'location' from dependencies

  return { location, error, isTracking };
}
