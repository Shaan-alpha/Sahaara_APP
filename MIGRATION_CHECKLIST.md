# Migration Checklist: Transitioning to New Sahara System

## ✅ Pre-Migration Checklist

- [ ] Backup your current codebase
- [ ] Review the `IMPLEMENTATION_GUIDE.md` file
- [ ] Create a Supabase account at https://supabase.com
- [ ] Create a new Supabase project

---

## 🔧 Setup Steps

### Step 1: Supabase Configuration
- [ ] Log in to your Supabase dashboard
- [ ] Navigate to Project Settings → API
- [ ] Copy your `Project URL`
- [ ] Copy your `anon/public` key
- [ ] Create `.env.local` file in project root
- [ ] Add both values to `.env.local`:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_url_here
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
  ```

### Step 2: Database Schema Setup
- [ ] Open Supabase dashboard
- [ ] Click **SQL Editor** in sidebar
- [ ] Open the `supabase-schema.sql` file from project
- [ ] Copy all SQL code
- [ ] Paste into Supabase SQL Editor
- [ ] Click **Run** to execute
- [ ] Verify tables created:
  - [ ] `user_locations` table exists
  - [ ] `notifications` table exists
- [ ] Check that Real-time is enabled for both tables:
  - [ ] Go to Database → Replication
  - [ ] Ensure both tables have replication enabled

### Step 3: Install Dependencies
- [ ] Run `npm install` (if not already done)
- [ ] Verify these packages are installed:
  - [ ] `@supabase/supabase-js`
  - [ ] `maplibre-gl`
  - [ ] `@types/maplibre-gl`

### Step 4: Environment Variables
- [ ] Copy `.env.example` to `.env.local`
- [ ] Fill in Supabase credentials
- [ ] Remove or comment out Twilio variables (no longer needed)
- [ ] Optionally keep MongoDB URI if using MongoDB for users

---

## 🗺️ Maps Migration

### Verify MapLibre Implementation
- [ ] Check `/src/app/maps/page.tsx` uses MapLibre (not Google Maps)
- [ ] Verify no Google Maps API key is exposed in code
- [ ] Test map loading at `/maps` route
- [ ] Verify user location marker appears
- [ ] Check 50m radius circle displays correctly

### Remove Google Maps References
- [ ] Remove Google Maps script from any HTML files
- [ ] Remove Google Maps API key from environment variables
- [ ] Delete any unused Google Maps configuration

---

## 📲 Notification System Migration

### Test Supabase Connection
- [ ] Run `npm run dev`
- [ ] Open browser console
- [ ] Check for Supabase connection errors
- [ ] Verify no "unauthorized" or "invalid API key" errors

### Enable Browser Notifications
- [ ] Visit your app in browser
- [ ] When prompted, click **Allow** for notifications
- [ ] Check notification permission in browser settings

### Test Real-time Subscriptions
- [ ] Open app in one browser tab
- [ ] Open Supabase dashboard → Database → notifications
- [ ] Manually insert a test notification:
  ```sql
  INSERT INTO notifications (sender_id, sender_name, sender_phone, receiver_id, latitude, longitude, distance, message)
  VALUES ('test_sender', 'Test User', '+1234567890', 'user_suhani_001', 37.7749, -122.4194, 25, 'Test alert');
  ```
- [ ] Check if notification appears in app instantly
- [ ] Verify unread count updates

---

## 🆘 SOS System Migration

### Update SOS Button
- [ ] Verify SOS button in `/src/components/login/login.tsx`
- [ ] Confirm it calls `/api/sos` (not `/api/otp`)
- [ ] Check user data is properly passed

### Test Location Tracking
- [ ] Allow location permissions in browser
- [ ] Open browser DevTools → Application → Storage
- [ ] Refresh the app
- [ ] Verify location tracking starts automatically
- [ ] Check Supabase dashboard:
  - [ ] Navigate to Database → user_locations
  - [ ] Verify your user appears with `is_online: true`
  - [ ] Check latitude/longitude are correct

### Test SOS Flow
- [ ] Open app in Browser Window 1
- [ ] Open app in Browser Window 2 (incognito mode)
- [ ] In each window:
  - [ ] Change the `user_id` in `/src/components/login/login.tsx` to different values (e.g., 'user_001', 'user_002')
  - [ ] Allow location permissions
- [ ] Simulate proximity:
  - [ ] Open DevTools in both windows
  - [ ] Go to **Console** → Three dots menu → **More tools** → **Sensors**
  - [ ] Set location to same coordinates (e.g., `37.7749, -122.4194`)
- [ ] In Window 1, click the SOS button
- [ ] Verify in Window 2:
  - [ ] Notification appears instantly
  - [ ] Unread count shows in bell icon
  - [ ] Can click to view details

---

## 🔍 Verification Tests

### API Endpoints
Test each endpoint using curl or Postman:

- [ ] **POST** `/api/location/update`
  ```bash
  curl -X POST http://localhost:3000/api/location/update \
    -H "Content-Type: application/json" \
    -d '{
      "user_id": "test_user",
      "name": "Test User",
      "phone": "+1234567890",
      "latitude": 37.7749,
      "longitude": -122.4194
    }'
  ```
  Expected: `{ "success": true, ... }`

- [ ] **POST** `/api/location/nearby`
  ```bash
  curl -X POST http://localhost:3000/api/location/nearby \
    -H "Content-Type: application/json" \
    -d '{
      "latitude": 37.7749,
      "longitude": -122.4194,
      "radius": 50
    }'
  ```
  Expected: List of nearby users

- [ ] **POST** `/api/sos`
  ```bash
  curl -X POST http://localhost:3000/api/sos \
    -H "Content-Type: application/json" \
    -d '{
      "user_id": "test_user",
      "name": "Test User",
      "phone": "+1234567890",
      "latitude": 37.7749,
      "longitude": -122.4194,
      "radius": 50
    }'
  ```
  Expected: `{ "success": true, "notified_count": N, ... }`

- [ ] **GET** `/api/notifications?user_id=test_user`
  ```bash
  curl http://localhost:3000/api/notifications?user_id=test_user
  ```
  Expected: List of notifications

### Haversine Distance Calculation
- [ ] Open browser console on any page
- [ ] Import and test:
  ```javascript
  import { calculateDistance } from '@/lib/haversine';

  // Test: Distance between two nearby points
  const distance = calculateDistance(37.7749, -122.4194, 37.7750, -122.4195);
  console.log(distance); // Should be ~15 meters
  ```

---

## 🚀 Production Deployment

### Before Deploying
- [ ] Remove all hardcoded user data
- [ ] Implement proper authentication (Supabase Auth recommended)
- [ ] Add API route protection middleware
- [ ] Set up rate limiting on SOS endpoint
- [ ] Configure CORS properly (remove `Access-Control-Allow-Origin: *`)
- [ ] Remove console.log statements from production code
- [ ] Set up environment variables in Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Deploy to Vercel
- [ ] Push code to GitHub
- [ ] Connect repository to Vercel
- [ ] Add environment variables in Vercel dashboard
- [ ] Deploy
- [ ] Test all features in production
- [ ] Verify HTTPS is enabled (required for geolocation)

### Post-Deployment Tests
- [ ] Test maps load correctly
- [ ] Test location permissions work
- [ ] Test SOS button functionality
- [ ] Test real-time notifications
- [ ] Test on mobile devices
- [ ] Test with multiple simultaneous users

---

## 🧹 Cleanup Old Code

### Remove Twilio Integration
- [ ] Delete or archive `/src/app/api/otp/route.tsx` (old Twilio endpoint)
- [ ] Remove Twilio environment variables from `.env`
- [ ] Uninstall Twilio package: `npm uninstall twilio` (optional)
- [ ] Update any references to old OTP system

### Remove Google Maps Code
- [ ] Search project for Google Maps API key
- [ ] Remove any remaining Google Maps scripts
- [ ] Clean up unused Google Maps types/imports

---

## 📊 Database Monitoring

### Set Up Monitoring
- [ ] In Supabase dashboard, go to Database → Backups
- [ ] Enable automatic backups
- [ ] Set up alerts for database size
- [ ] Monitor real-time connections

### Regular Maintenance
- [ ] Set up cron job to mark inactive users as offline:
  ```sql
  -- Run this every 5 minutes
  UPDATE user_locations
  SET is_online = false
  WHERE last_updated < NOW() - INTERVAL '5 minutes'
  AND is_online = true;
  ```
- [ ] Archive old notifications (optional):
  ```sql
  -- Run this weekly
  DELETE FROM notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
  ```

---

## 🎯 Feature Testing Checklist

### Core Features
- [ ] User can see map with their location
- [ ] User location updates automatically every 10 seconds
- [ ] SOS button sends alerts to nearby users (within 50m)
- [ ] Notifications appear in real-time
- [ ] Unread notification count is accurate
- [ ] Can mark notifications as read
- [ ] Location link in notification opens map correctly

### Edge Cases
- [ ] App handles no nearby users gracefully
- [ ] App handles location permission denied
- [ ] App handles network errors
- [ ] App handles Supabase connection failures
- [ ] Multiple SOS alerts don't cause issues
- [ ] Users at exactly 50m radius are handled correctly

### Performance
- [ ] Map loads within 2 seconds
- [ ] Notifications appear within 1 second of send
- [ ] Location updates don't cause lag
- [ ] App works smoothly with 10+ nearby users

---

## ✅ Final Checks

- [ ] All tests passing
- [ ] No console errors in browser
- [ ] No API errors in Network tab
- [ ] Real-time subscriptions connected (check WebSocket in Network tab)
- [ ] Environment variables properly set
- [ ] Documentation reviewed
- [ ] Team trained on new system
- [ ] Backup plan in place
- [ ] Monitoring set up
- [ ] Ready for production

---

## 🆘 Rollback Plan

If something goes wrong:

1. **Immediate Rollback:**
   - [ ] Revert to previous Git commit
   - [ ] Redeploy old version
   - [ ] Inform users of temporary issues

2. **Investigate Issues:**
   - [ ] Check Supabase logs
   - [ ] Check Vercel deployment logs
   - [ ] Check browser console errors
   - [ ] Review recent code changes

3. **Partial Rollback:**
   - [ ] Can keep MapLibre and revert only notifications
   - [ ] Can revert to Twilio temporarily while debugging

---

## 📞 Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **MapLibre Docs:** https://maplibre.org/maplibre-gl-js-docs/
- **Haversine Formula:** https://en.wikipedia.org/wiki/Haversine_formula
- **Geolocation API:** https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API
- **Implementation Guide:** See `IMPLEMENTATION_GUIDE.md` in project root

---

**Estimated Migration Time:** 2-4 hours (including testing)

**Recommended:** Complete migration in development environment first, then production.
