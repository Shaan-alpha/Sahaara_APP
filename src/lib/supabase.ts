import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration!');
  console.error('Please add these to your .env.local file:');
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.error('\nYour credentials are already in .env.local - make sure the file is in the root directory');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

// Database types for type safety
export type UserLocation = {
  id?: string;
  user_id: string;
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
  is_online: boolean;
  last_updated: string;
  created_at?: string;
};

// Renamed to avoid conflict with browser's Notification API
export type SaharaNotification = {
  id?: string;
  sender_id: string;
  sender_name: string;
  sender_phone: string;
  receiver_id: string;
  latitude: number;
  longitude: number;
  distance: number;
  message: string;
  is_read: boolean;
  created_at?: string;
};
