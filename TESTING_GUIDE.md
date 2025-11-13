# Testing Guide - Multiple Users & SOS System

## 🧪 How to Test with Multiple Users

Since authentication isn't implemented yet, you can simulate multiple users using URL parameters.

---

## 📍 Step-by-Step Testing

### **Step 1: Open Multiple Browser Tabs/Windows**

Open **2 or more** browser tabs with different user IDs:

#### **Tab 1 (User 1):**
```
http://localhost:3001?user=1
```

#### **Tab 2 (User 2):**
```
http://localhost:3001?user=2
```

#### **Tab 3 (User 3)** *(optional)*:
```
http://localhost:3001?user=3
```

---

### **Step 2: Allow Location Permissions**

In **each tab**:
1. Browser will ask for location permission
2. Click **"Allow"**
3. You should see:
   - ✅ Green pulsing dot (Location Active)
   - ✅ User ID displayed (e.g., `user_1`, `user_2`)
   - ✅ Your coordinates displayed

---

### **Step 3: Simulate Same Location**

Since all tabs are on the same computer, they'll have the same real GPS location. But if you want to test with **different** locations:

#### **Option A: Use Browser DevTools (Fake GPS)**

1. Open DevTools (F12) in each tab
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type: **"Sensors"**
4. Select **"Show Sensors"**
5. In the Sensors panel:
   - Choose a location from dropdown OR
   - Enter custom lat/long coordinates

**Example locations to test:**
- **User 1:** `37.7749, -122.4194` (San Francisco)
- **User 2:** `37.7750, -122.4195` (15m away from User 1)
- **User 3:** `37.8749, -122.4194` (Way too far - won't be detected)

#### **Option B: Use Real GPS (Mobile Testing)**

1. Open each tab on **different phones**
2. Stand within 50 meters of each other
3. Allow location permissions

---

### **Step 4: Verify Nearby Detection**

Watch the **blue info box** on each user's screen:

```
┌─────────────────────────────────┐
│ ● Location Active    👥 2 nearby│
│ 37.774900, -122.419400          │
└─────────────────────────────────┘
```

✅ **Good:** Shows "1 nearby" or more
❌ **Problem:** Shows "0 nearby"

---

### **Step 5: Test SOS Alert**

In **Tab 1 (User 1)**:
1. Click the big red **SOS** button
2. Wait 2-3 seconds
3. You should see:
   - ✅ "Sending SOS to nearby users..."
   - ✅ "SOS sent to X nearby user(s)!"

In **Tab 2 (User 2)**:
1. Bell icon should show a red badge (e.g., `1`)
2. Click the bell icon
3. You should see the SOS notification:
   - 🆘 Emergency Alert
   - From: User 1
   - Distance: ~15m away
   - "View Location →" link

---

## 🔍 Troubleshooting

### Problem: "0 nearby" even with multiple tabs

**Causes:**
1. ❌ Both tabs using **same user ID**
2. ❌ Location not loaded yet
3. ❌ Tables don't exist in Supabase

**Solutions:**

#### ✅ Check Different User IDs:
Look at the screen - each tab should show a **different** user ID:
- Tab 1: `user_1`
- Tab 2: `user_2`

If they're the same, use the URL parameter: `?user=1`, `?user=2`

#### ✅ Check Supabase Database:
1. Go to https://supabase.com/dashboard
2. Open your project
3. Click **"Table Editor"**
4. Select `user_locations` table
5. You should see entries like:

| user_id | name   | latitude  | longitude   | is_online |
|---------|--------|-----------|-------------|-----------|
| user_1  | User 1 | 37.774900 | -122.419400 | true      |
| user_2  | User 2 | 37.775000 | -122.419500 | true      |

If the table is empty:
- Wait 10 seconds (location updates every 10s)
- Check browser console for errors
- Verify `.env.local` has correct Supabase credentials

#### ✅ Check Distance:
The Haversine formula calculates distance accurately. Users must be within **50 meters**.

Use this calculator to check: https://www.movable-type.co.uk/scripts/latlong.html

Example distances:
- `37.7749, -122.4194` to `37.7750, -122.4195` = **~15 meters** ✅
- `37.7749, -122.4194` to `37.7849, -122.4194` = **~1,111 meters** ❌

---

### Problem: Location not updating

**Check:**
1. Browser console for errors (F12)
2. Network tab - should see `/api/location/update` every 10 seconds
3. Green pulsing dot should be visible

**Fix:**
- Refresh the page
- Clear browser cache
- Allow location permissions again

---

### Problem: SOS not sending

**Check:**
1. SOS button should be **enabled** (not grayed out)
2. "Location Active" should be showing
3. Browser console for error messages

**Fix:**
1. Make sure location is loaded first
2. Check Supabase credentials in `.env.local`
3. Verify `/api/sos` endpoint is working:
   ```bash
   curl -X POST http://localhost:3001/api/sos \
     -H "Content-Type: application/json" \
     -d '{"user_id":"test","name":"Test","phone":"+1234567890","latitude":37.7749,"longitude":-122.4194}'
   ```

---

### Problem: Notifications not appearing

**Check:**
1. Bell icon for red badge number
2. Browser console for WebSocket connection
3. Supabase real-time is enabled

**Fix:**
1. Click the bell icon to open notification panel
2. Check `notifications` table in Supabase
3. Verify real-time is enabled:
   - Go to Supabase Dashboard
   - Database → Replication
   - Ensure `notifications` table has replication enabled

---

## 🧮 How the Distance Calculation Works

### Haversine Formula

The app uses the **Haversine formula** to calculate distance between two GPS points:

```typescript
distance = R × c

where:
  R = Earth's radius (6371 km or 6371000 m)
  c = 2 × atan2(√a, √(1−a))
  a = sin²(Δφ/2) + cos(φ1) × cos(φ2) × sin²(Δλ/2)
  φ = latitude in radians
  λ = longitude in radians
```

### Example Calculation:

**Point A:** 37.7749°N, 122.4194°W
**Point B:** 37.7750°N, 122.4195°W

**Result:** ~15 meters ✅ (within 50m range)

---

## 📊 Checking Database Directly

### View All Online Users:
```sql
SELECT user_id, name, latitude, longitude, is_online, last_updated
FROM user_locations
WHERE is_online = true
ORDER BY last_updated DESC;
```

### View All Notifications:
```sql
SELECT sender_name, receiver_id, distance, message, created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 10;
```

### Find Nearby Users (SQL):
```sql
SELECT * FROM get_nearby_users(37.7749, -122.4194, 50);
```

---

## ✅ Expected Behavior Checklist

### On Page Load:
- [ ] User ID shows in header (e.g., `user_1`)
- [ ] Location permission requested
- [ ] Blue info box appears after permission granted
- [ ] Green pulsing dot shows "Location Active"
- [ ] Coordinates displayed
- [ ] "X nearby" updates every 10 seconds

### Multiple Users:
- [ ] Each tab has different user ID
- [ ] All users show in `user_locations` table
- [ ] Nearby count increases when users are close
- [ ] Nearby count shows 0 when users are far (>50m)

### SOS Flow:
- [ ] SOS button enabled when location active
- [ ] Click SOS → shows "Sending..."
- [ ] Success message: "SOS sent to X user(s)"
- [ ] Other users receive notification instantly
- [ ] Bell icon shows unread count
- [ ] Notification has correct sender name and distance

---

## 🎯 Quick Test Scenarios

### Scenario 1: Same Location
1. Open 3 tabs: `?user=1`, `?user=2`, `?user=3`
2. All have same GPS location (same computer)
3. Each should show "2 nearby" (excluding self)
4. SOS from User 1 → Users 2 & 3 get notifications

### Scenario 2: Different Locations (DevTools)
1. Tab 1: User 1 at `37.7749, -122.4194`
2. Tab 2: User 2 at `37.7750, -122.4195` (15m away)
3. Tab 3: User 3 at `37.8749, -122.4194` (11km away)
4. Users 1 & 2 see each other (1 nearby each)
5. User 3 sees no one (0 nearby)
6. SOS from User 1 → Only User 2 gets notification

### Scenario 3: Real-World Test (Mobile)
1. Install on 2 phones
2. Stand next to each other (within 50m)
3. Both users show "1 nearby"
4. Walk apart (>50m)
5. Count drops to "0 nearby"
6. Test SOS when close together

---

## 📱 Mobile Testing Tips

### iOS Safari:
- Clear cache before testing
- Location permission per-site
- May need to refresh to get accurate GPS

### Android Chrome:
- Allow location in site settings
- High accuracy mode recommended
- Background location may affect updates

---

## 🆘 Still Having Issues?

1. **Check browser console** (F12) for errors
2. **Check terminal** where `npm run dev` is running
3. **Check Supabase logs** in dashboard
4. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```
5. **Clear browser cache** and reload
6. **Verify environment variables:**
   - `.env.local` exists
   - Contains valid Supabase credentials
   - `NEXT_PUBLIC_` prefix is correct

---

## 🎓 Understanding the System

### Location Tracking:
- Updates every 10 seconds
- Stores in `user_locations` table
- Marks users as `is_online: true`
- Marks offline after 5 minutes of inactivity

### Geofencing:
- Radius: 50 meters
- Uses Haversine formula for accuracy
- Accounts for Earth's curvature
- Precision: ±10 meters

### Real-time Notifications:
- WebSocket connection via Supabase
- Instant delivery (<1 second)
- Browser notifications if permitted
- Stores history in `notifications` table

---

## 📋 Test Data Examples

If you want to manually insert test data into Supabase:

```sql
-- Add test users
INSERT INTO user_locations (user_id, name, phone, latitude, longitude, is_online)
VALUES
  ('user_test_1', 'Test User 1', '+1234567890', 37.7749, -122.4194, true),
  ('user_test_2', 'Test User 2', '+1234567891', 37.7750, -122.4195, true),
  ('user_test_3', 'Test User 3', '+1234567892', 37.8749, -122.4194, true);

-- Send test SOS notification
INSERT INTO notifications (sender_id, sender_name, sender_phone, receiver_id, latitude, longitude, distance, message)
VALUES
  ('user_test_1', 'Test User 1', '+1234567890', 'user_test_2', 37.7749, -122.4194, 15, 'Test SOS alert');
```

---

**Happy Testing! 🎉**

If you see "X nearby" updating correctly, your geofencing is working!
