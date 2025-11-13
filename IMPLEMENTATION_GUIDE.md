# Sahara App - Implementation Guide

## Overview

This guide covers the major updates to the Sahara app:
- ✅ Replaced Google Maps with **MapLibre GL JS** (100% free, no API limits)
- ✅ Replaced Twilio SMS with **Supabase real-time notifications** (in-app alerts)
- ✅ Implemented **Haversine distance calculation** for 50m geofencing
- ✅ Added real-time **location tracking** for all users
- ✅ Created **notification system** with browser notifications

---

## 🚀 Quick Start

### 1. Install Dependencies

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Set Up Supabase

1. Create a free account at [https://supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Project Settings** → **API**
4. Copy your `Project URL` and `anon/public` key

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Open the file `supabase-schema.sql` from this project
4. Copy all the SQL code and paste it into the Supabase SQL Editor
5. Click **Run** to execute the schema

This will create:
- `user_locations` table - stores real-time user positions
- `notifications` table - stores SOS alerts
- Database functions for finding nearby users
- Real-time subscriptions for instant notifications

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📋 What's New

### 1. MapLibre GL JS (Free Google Maps Alternative)

**Location:** `/src/app/maps/page.tsx`

**Features:**
- 100% free with OpenStreetMap tiles
- No API keys required
- No usage limits
- Includes 50m radius visualization for geofencing
- Modern, smooth map interactions

**Usage:**
```tsx
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
```

### 2. Supabase Real-time Notifications

**Location:** `/src/hooks/useNotifications.ts`

**Features:**
- Real-time notifications using WebSockets
- Browser push notifications
- Mark as read functionality
- Unread count tracking
- Distance-based alerts

**Usage in Components:**
```tsx
import { useNotifications } from '@/hooks/useNotifications';

const { notifications, unreadCount, markAsRead } = useNotifications(user_id);
```

### 3. Haversine Distance Calculation

**Location:** `/src/lib/haversine.ts`

**Features:**
- Calculate distance between two GPS coordinates
- Find users within specific radius (default: 50m)
- Format distances for display

**Usage:**
```tsx
import { calculateDistance, findUsersWithinRadius } from '@/lib/haversine';

const distance = calculateDistance(lat1, lon1, lat2, lon2); // Returns meters
const nearbyUsers = findUsersWithinRadius(lat, lon, users, 50); // 50m radius
```

### 4. Location Tracking Hook

**Location:** `/src/hooks/useLocationTracking.ts`

**Features:**
- Automatic location updates every 10 seconds
- Stores user position in Supabase
- Marks users as online/offline
- High accuracy GPS tracking

**Usage:**
```tsx
import { useLocationTracking } from '@/hooks/useLocationTracking';

const { location, isTracking } = useLocationTracking(
  user_id,
  name,
  phone,
  10000 // Update interval in ms
);
```

### 5. Updated SOS System

**Location:** `/src/components/login/login.tsx`

**How It Works:**
1. User presses SOS button
2. Gets current GPS location
3. Queries Supabase for all online users
4. Calculates distance using Haversine formula
5. Filters users within 50m radius
6. Creates notifications in database
7. Supabase real-time sends instant alerts to nearby users
8. Users receive browser notifications

**API Endpoint:** `/src/app/api/sos/route.tsx`

Request:
```json
{
  "user_id": "user123",
  "name": "John Doe",
  "phone": "+1234567890",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "radius": 50,
  "message": "Someone needs your help nearby!"
}
```

Response:
```json
{
  "success": true,
  "message": "SOS alert sent to 3 nearby user(s)",
  "notified_count": 3,
  "nearby_users": [
    { "user_id": "user456", "name": "Jane", "distance": 25 },
    { "user_id": "user789", "name": "Bob", "distance": 42 }
  ]
}
```

---

## 🗂️ New Files & Structure

```
src/
├── lib/
│   ├── supabase.ts          # Supabase client config
│   └── haversine.ts         # Distance calculation utilities
├── hooks/
│   ├── useLocationTracking.ts  # Real-time location tracking
│   └── useNotifications.ts     # Real-time notification handling
├── components/
│   └── NotificationPanel.tsx   # Notification UI component
├── app/
│   ├── api/
│   │   ├── sos/route.tsx          # New SOS endpoint
│   │   ├── location/
│   │   │   ├── update/route.tsx   # Update user location
│   │   │   └── nearby/route.tsx   # Get nearby users
│   │   └── notifications/route.tsx # Get/update notifications
│   └── maps/page.tsx          # Updated with MapLibre
supabase-schema.sql            # Database schema for Supabase
```

---

## 🔧 API Endpoints

### POST `/api/sos`
Send SOS alert to nearby users within radius.

### POST `/api/location/update`
Update user's current location in real-time.

### POST `/api/location/nearby`
Get all users within specified radius.

### GET `/api/notifications?user_id=xxx`
Get all notifications for a user.

### PATCH `/api/notifications`
Mark notification(s) as read.

---

## 📱 User Flow

### Sending SOS:
1. User opens app → location tracking starts automatically
2. User presses red SOS button
3. App finds all online users within 50m
4. Creates notifications for each nearby user
5. Shows success message: "SOS sent to X nearby user(s)"

### Receiving SOS:
1. User has app open (location tracking active)
2. Someone nearby triggers SOS
3. User receives real-time notification
4. Bell icon shows unread count
5. Click notification to see details and location
6. Can view sender's location on map

---

## 🔐 Security Notes

**IMPORTANT:**
1. The old Google Maps API key is hardcoded and should be removed
2. User authentication is currently hardcoded - implement proper auth
3. Add authentication middleware to protect API routes
4. Implement rate limiting on SOS endpoint to prevent abuse
5. Add phone number verification before allowing SOS

**Recommended Auth Solutions:**
- Supabase Auth (built-in, free)
- NextAuth.js
- Clerk

---

## 🧪 Testing

### Test the SOS Flow:

1. **Open Two Browser Windows:**
   - Window 1: User A (sender)
   - Window 2: User B (receiver)

2. **For Both Users:**
   - Allow location permissions
   - Update their user_id in the component (different IDs)

3. **Simulate Close Proximity:**
   - Use browser dev tools → Sensors → Location
   - Set both to same or nearby coordinates (within 50m)

4. **Test SOS:**
   - In Window 1, click SOS button
   - In Window 2, notification should appear instantly

### Manual Database Testing:

```sql
-- Check user locations
SELECT * FROM user_locations WHERE is_online = true;

-- Check notifications
SELECT * FROM notifications ORDER BY created_at DESC;

-- Test nearby users function
SELECT * FROM get_nearby_users(37.7749, -122.4194, 50);
```

---

## 🎨 Customization

### Change SOS Radius:

In `/src/components/login/login.tsx`:
```tsx
body: JSON.stringify({
  // ... other fields
  radius: 100, // Change from 50m to 100m
})
```

### Change Location Update Frequency:

```tsx
useLocationTracking(
  user_id,
  name,
  phone,
  5000 // Update every 5 seconds instead of 10
);
```

### Customize Notification Message:

In `/src/app/api/sos/route.tsx`:
```tsx
message: `🆘 ${message}\n\nCustom text here...`
```

---

## 📊 Database Schema

### user_locations
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | VARCHAR | User identifier |
| name | VARCHAR | User's name |
| phone | VARCHAR | Phone number |
| latitude | DECIMAL | GPS latitude |
| longitude | DECIMAL | GPS longitude |
| is_online | BOOLEAN | Online status |
| last_updated | TIMESTAMP | Last location update |

### notifications
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| sender_id | VARCHAR | SOS sender ID |
| sender_name | VARCHAR | Sender's name |
| receiver_id | VARCHAR | Notification recipient |
| latitude | DECIMAL | SOS location lat |
| longitude | DECIMAL | SOS location lon |
| distance | DECIMAL | Distance in meters |
| message | TEXT | Alert message |
| is_read | BOOLEAN | Read status |
| created_at | TIMESTAMP | Time sent |

---

## 🚨 Troubleshooting

### "Unable to get your location"
- Check browser location permissions
- Ensure HTTPS (required for geolocation)
- Check browser console for errors

### "No nearby users found"
- Verify users are marked as `is_online: true` in database
- Check if users are actually within 50m radius
- Verify location coordinates are being updated

### Notifications not appearing
- Check Supabase real-time is enabled for tables
- Verify browser notification permissions
- Check Network tab for WebSocket connection
- Ensure user_id matches in database

### MapLibre not loading
- Check browser console for errors
- Verify internet connection (needs to load OSM tiles)
- Check if component is properly mounted

---

## 📈 Next Steps

1. **Implement Authentication:**
   - Add Supabase Auth or NextAuth
   - Replace hardcoded user data
   - Protect API routes

2. **Add Emergency Contacts:**
   - Allow users to add trusted contacts
   - Notify them regardless of distance

3. **Enhance Map Features:**
   - Show nearby users on map
   - Add real-time location updates on map
   - Route to person in distress

4. **Improve Notifications:**
   - Add sound alerts
   - Vibration for mobile
   - Custom notification tones

5. **Analytics & History:**
   - SOS history for users
   - Response time tracking
   - Heat maps of danger zones

---

## 💡 Cost Comparison

### Old System (Twilio):
- **SMS Cost:** $0.0075 per message
- **100 SOS alerts/day:** ~$22.50/month
- **Limited to SMS only**

### New System (Supabase):
- **Free Tier:** 500MB database, 2GB bandwidth, 50MB file storage
- **Unlimited real-time connections**
- **In-app + Browser notifications:** $0
- **Cost for 100 SOS alerts/day:** $0

**Savings:** ~$270/year

---

## 🤝 Contributing

To add new features:
1. Create API route in `/src/app/api/`
2. Update database schema if needed
3. Create React hooks for data management
4. Add UI components
5. Test thoroughly

---

## 📞 Support

If you encounter issues:
1. Check Supabase logs in dashboard
2. Check browser console errors
3. Verify environment variables
4. Review this guide

---

## 🎉 You're All Set!

Your Sahara app now has:
- ✅ Free, unlimited maps
- ✅ Real-time in-app notifications
- ✅ 50m geofencing with Haversine
- ✅ Automatic location tracking
- ✅ Modern, scalable architecture

**No more costs for Google Maps or Twilio!**
