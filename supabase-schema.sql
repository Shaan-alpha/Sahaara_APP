-- Sahara App Supabase Database Schema
-- Run this in your Supabase SQL Editor to create the necessary tables

-- Table: user_locations
-- Stores real-time location data for all active users
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  is_online BOOLEAN DEFAULT true,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster location queries
CREATE INDEX idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX idx_user_locations_is_online ON user_locations(is_online);
CREATE INDEX idx_user_locations_coordinates ON user_locations(latitude, longitude);

-- Table: notifications
-- Stores SOS notifications sent to nearby users
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_phone VARCHAR(20) NOT NULL,
  receiver_id VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  distance DECIMAL(10, 2) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster notification queries
CREATE INDEX idx_notifications_receiver_id ON notifications(receiver_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_locations
-- Allow users to read all locations (needed for finding nearby users)
CREATE POLICY "Allow read access to all user locations"
  ON user_locations FOR SELECT
  USING (true);

-- Allow users to insert their own location
CREATE POLICY "Allow users to insert their own location"
  ON user_locations FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own location
CREATE POLICY "Allow users to update their own location"
  ON user_locations FOR UPDATE
  USING (true);

-- RLS Policies for notifications
-- Allow users to read their own notifications
CREATE POLICY "Allow users to read their own notifications"
  ON notifications FOR SELECT
  USING (true);

-- Allow users to insert notifications
CREATE POLICY "Allow users to insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

-- Allow users to update their own notifications (mark as read)
CREATE POLICY "Allow users to update their own notifications"
  ON notifications FOR UPDATE
  USING (true);

-- Enable Realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE user_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Function to clean up old location data (optional, run as a cron job)
CREATE OR REPLACE FUNCTION cleanup_old_locations()
RETURNS void AS $$
BEGIN
  -- Mark users as offline if they haven't updated location in 5 minutes
  UPDATE user_locations
  SET is_online = false
  WHERE last_updated < NOW() - INTERVAL '5 minutes'
  AND is_online = true;
END;
$$ LANGUAGE plpgsql;

-- Function to get nearby users within radius (in meters)
CREATE OR REPLACE FUNCTION get_nearby_users(
  center_lat DECIMAL,
  center_lon DECIMAL,
  radius_meters INTEGER DEFAULT 50
)
RETURNS TABLE (
  id UUID,
  user_id VARCHAR,
  name VARCHAR,
  phone VARCHAR,
  latitude DECIMAL,
  longitude DECIMAL,
  distance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ul.id,
    ul.user_id,
    ul.name,
    ul.phone,
    ul.latitude,
    ul.longitude,
    (
      6371000 * acos(
        cos(radians(center_lat)) * cos(radians(ul.latitude)) *
        cos(radians(ul.longitude) - radians(center_lon)) +
        sin(radians(center_lat)) * sin(radians(ul.latitude))
      )
    )::DECIMAL as distance
  FROM user_locations ul
  WHERE
    ul.is_online = true
    AND (
      6371000 * acos(
        cos(radians(center_lat)) * cos(radians(ul.latitude)) *
        cos(radians(ul.longitude) - radians(center_lon)) +
        sin(radians(center_lat)) * sin(radians(ul.latitude))
      )
    ) <= radius_meters
  ORDER BY distance;
END;
$$ LANGUAGE plpgsql;
