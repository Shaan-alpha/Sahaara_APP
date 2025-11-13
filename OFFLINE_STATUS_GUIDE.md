# Offline Status Handling Guide

## ✅ **Fixed: Users Now Go Offline Properly**

I've implemented **3 layers** of offline detection to ensure users are always marked correctly in the database.

---

## 🔄 **How It Works Now:**

### **Layer 1: Component Unmount (Immediate)**

When the component unmounts (user navigates away):
```typescript
// Cleanup function in useLocationTracking
return () => {
  markOffline(); // Calls /api/location/offline
  // ... other cleanup
};
```

**Triggers when:**
- ✅ User navigates to another page
- ✅ User switches to another user
- ✅ Component is destroyed

**Response time:** Instant

---

### **Layer 2: Browser Close Detection (Reliable)**

When the user closes the browser tab/window:
```typescript
// beforeunload event listener
window.addEventListener('beforeunload', handleBeforeUnload);

const handleBeforeUnload = () => {
  // Uses sendBeacon for reliability
  navigator.sendBeacon('/api/location/offline', JSON.stringify({ user_id }));
};
```

**Triggers when:**
- ✅ User closes the browser tab
- ✅ User closes the entire browser
- ✅ User refreshes the page
- ✅ Browser crashes (best effort)

**Why sendBeacon?**
- Normal fetch() may be cancelled when page unloads
- sendBeacon() is guaranteed to send even during page unload
- More reliable for tracking disconnections

**Response time:** Instant

---

### **Layer 3: Automatic Cleanup (Backup)**

Runs every 10 seconds to catch any missed disconnections:
```typescript
// Marks users as offline if no update in 5 minutes
const fiveMinutesAgo = new Date();
fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

supabase
  .from('user_locations')
  .update({ is_online: false })
  .lt('last_updated', fiveMinutesAgo)
```

**Triggers when:**
- ✅ User hasn't updated location in 5 minutes
- ✅ Client-side offline marking failed
- ✅ Network error prevented offline call
- ✅ Browser crashed without cleanup

**Response time:** Up to 5 minutes (backup only)

---

## 📊 **Database Status Flow:**

### **User Opens App:**
```
is_online: false → true
last_updated: updated
```

### **User Active (Every 10 seconds):**
```
is_online: true
last_updated: keeps updating
```

### **User Closes Browser (Immediate):**
```
is_online: true → false
last_updated: updated
```

### **Network Failure (5 minute backup):**
```
After 5 minutes with no update:
is_online: true → false
```

---

## 🧪 **Testing Offline Status:**

### **Test 1: Normal Close**

1. Open app in browser: http://localhost:3001?user=1
2. Allow location
3. Wait for "Location Active"
4. **Check Supabase:** `is_online = true`
5. **Close the browser tab**
6. **Check Supabase immediately:** `is_online = false` ✅

### **Test 2: Navigate Away**

1. Open app
2. Click "Switch User"
3. Select different user
4. **Check Supabase:** Old user is now `is_online = false` ✅

### **Test 3: Automatic Cleanup**

1. Open app
2. Manually set `last_updated` to 10 minutes ago in Supabase:
   ```sql
   UPDATE user_locations
   SET last_updated = NOW() - INTERVAL '10 minutes'
   WHERE user_id = 'user_1';
   ```
3. Wait 10 seconds (cleanup runs)
4. **Check Supabase:** `is_online = false` ✅

### **Test 4: Multiple Users**

1. Open Browser 1: User 1
2. Open Browser 2: User 2
3. Both show "1 nearby" ✅
4. **Close Browser 1**
5. Browser 2 updates to "0 nearby" within 10 seconds ✅

---

## 🔍 **Monitoring in Supabase:**

### **View All Users Status:**
```sql
SELECT
  user_id,
  name,
  is_online,
  last_updated,
  EXTRACT(EPOCH FROM (NOW() - last_updated)) as seconds_since_update
FROM user_locations
ORDER BY last_updated DESC;
```

### **View Only Online Users:**
```sql
SELECT user_id, name, last_updated
FROM user_locations
WHERE is_online = true
ORDER BY last_updated DESC;
```

### **Find Stale Users (should be offline):**
```sql
SELECT user_id, name, last_updated
FROM user_locations
WHERE is_online = true
  AND last_updated < NOW() - INTERVAL '5 minutes';
```

---

## 🛠️ **API Endpoints:**

### **1. Mark User Offline**
```bash
POST /api/location/offline
Body: { "user_id": "user_1" }
```

**Response:**
```json
{
  "success": true,
  "message": "User marked as offline"
}
```

### **2. Cleanup Inactive Users**
```bash
POST /api/location/cleanup
# or
GET /api/location/cleanup
```

**Response:**
```json
{
  "success": true,
  "message": "Marked 2 inactive user(s) as offline",
  "count": 2
}
```

### **3. Update Location (sets online)**
```bash
POST /api/location/update
Body: {
  "user_id": "user_1",
  "name": "User 1",
  "phone": "+1234567890",
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

**Response:**
```json
{
  "success": true,
  "message": "Location updated successfully",
  "data": [...]
}
```

---

## ⚙️ **Configuration:**

### **Adjust Cleanup Timeout:**

Currently set to 5 minutes. To change:

**File:** `/src/app/api/location/cleanup/route.tsx`

```typescript
// Change 5 to your desired minutes
fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
```

**Recommended values:**
- 1 minute: More aggressive, catches inactive users faster
- 5 minutes: Balanced (current)
- 10 minutes: More lenient, reduces false positives

### **Adjust Cleanup Frequency:**

Currently runs every 10 seconds. To change:

**File:** `/src/components/login/login.tsx`

```typescript
// Change 10000 to your desired milliseconds
const interval = setInterval(checkNearbyUsers, 10000);
```

---

## 🐛 **Troubleshooting:**

### **Problem: User still online after closing browser**

**Check 1: Did sendBeacon work?**
- Check browser console for errors
- Some browsers block sendBeacon on localhost
- Try in production environment

**Check 2: Is cleanup running?**
- Wait 5 minutes + 10 seconds
- Run manual cleanup: `curl localhost:3001/api/location/cleanup`
- Check response for count

**Check 3: Database connection**
- Verify Supabase credentials in `.env.local`
- Check Supabase dashboard for connection errors

### **Problem: Users go offline too quickly**

**Solution: Increase cleanup timeout**
```typescript
// In cleanup/route.tsx
// Change from 5 to 10 minutes
fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 10);
```

### **Problem: sendBeacon not working**

**Alternative: Use standard fetch**

In `/src/hooks/useLocationTracking.ts`:
```typescript
const handleBeforeUnload = async () => {
  await fetch('/api/location/offline', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id }),
    keepalive: true, // Keeps request alive during unload
  });
};
```

---

## ✅ **Expected Behavior Summary:**

### **Normal Operation:**
```
User opens app → is_online: true
User active → last_updated keeps refreshing every 10s
User closes app → is_online: false (immediately)
```

### **Network Failure:**
```
User opens app → is_online: true
Network drops → last_updated stops updating
After 5 min → is_online: false (automatic cleanup)
```

### **Nearby Count:**
```
User 1 online, User 2 online → "1 nearby" (each)
User 1 closes app → is_online: false
User 2 sees → "0 nearby" (within 10 seconds)
```

---

## 📱 **Mobile Considerations:**

### **iOS Safari:**
- `beforeunload` may not fire reliably
- Cleanup timeout catches these cases
- Consider using PWA with service workers for better detection

### **Android Chrome:**
- `beforeunload` works well
- `sendBeacon` fully supported
- No special handling needed

---

## 🚀 **Production Recommendations:**

### **1. Add Server-Side Cron Job:**

Instead of client-triggered cleanup, use a cron job:

```javascript
// Run every minute via Vercel Cron or similar
export async function GET() {
  await fetch('https://your-app.com/api/location/cleanup');
}
```

**Vercel:** Add to `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/location/cleanup",
    "schedule": "*/1 * * * *"
  }]
}
```

### **2. Add Heartbeat System:**

Send lightweight heartbeats more frequently:

```typescript
// Every 30 seconds, just update timestamp
setInterval(() => {
  fetch('/api/location/heartbeat', {
    method: 'POST',
    body: JSON.stringify({ user_id }),
  });
}, 30000);
```

### **3. Add Reconnection Logic:**

Handle network disconnections gracefully:

```typescript
window.addEventListener('online', () => {
  // Mark user as online again
  updateLocation(currentLocation.lat, currentLocation.lng);
});

window.addEventListener('offline', () => {
  // Mark user as offline
  markOffline();
});
```

---

## 📊 **Metrics to Monitor:**

### **Key Metrics:**
- Average time from disconnect to offline status
- Number of stale users cleaned up per hour
- Percentage of immediate vs delayed offline marking

### **SQL Queries:**

**Average offline delay:**
```sql
SELECT AVG(EXTRACT(EPOCH FROM (last_updated - created_at)))
FROM user_locations
WHERE is_online = false;
```

**Cleanup effectiveness:**
```sql
SELECT COUNT(*)
FROM user_locations
WHERE is_online = true
  AND last_updated < NOW() - INTERVAL '5 minutes';
```

---

## 🎉 **Success Criteria:**

✅ **User closes browser** → Offline within 1 second
✅ **User navigates away** → Offline immediately
✅ **Network drops** → Offline within 5 minutes
✅ **Nearby count** → Updates within 10 seconds
✅ **No false positives** → Active users stay online

---

**All three layers working together ensure reliable offline status tracking!**
