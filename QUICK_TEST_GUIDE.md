# Quick Test Guide - Multiple Users

## ✅ **New Feature: Built-in User Switcher**

Now you can easily test with multiple users **without** URL parameters!

---

## 🚀 **How to Test (3 Simple Steps):**

### **Step 1: Open the App in Different Browsers**

Open the app in **2 different browsers** (NOT just tabs):

- **Browser 1 (Chrome):** http://localhost:3001
- **Browser 2 (Firefox or Edge):** http://localhost:3001

> **Why different browsers?** Each browser has separate localStorage, so they'll be different users automatically.

---

### **Step 2: Select Different Users**

When you first open the app, you'll see your user ID below your name.

**Click "Switch User"** to see the user selector:

**In Browser 1 (Chrome):**
1. Click "Switch User"
2. Select **"User 1"**
3. Page will reload

**In Browser 2 (Firefox):**
1. Click "Switch User"
2. Select **"User 2"**
3. Page will reload

---

### **Step 3: Watch it Work!**

After both browsers reload:

✅ Each browser shows a **different user ID**:
- Browser 1: `user_1`
- Browser 2: `user_2`

✅ Allow **location permission** in both browsers

✅ Wait **10 seconds**

✅ The **blue info box** should update:
```
┌─────────────────────────────────┐
│ ● Location Active    👥 1 nearby│
│ 37.774900, -122.419400          │
└─────────────────────────────────┘
```

✅ Click **SOS** in Browser 1

✅ **Browser 2** gets a notification! 🎉

---

## 🎯 **What Happens Automatically:**

### **First Time:**
- App generates a **random user ID** (e.g., `user_437`)
- Saves it in browser's localStorage
- Shows user selector automatically

### **Next Time:**
- Loads your saved user ID from localStorage
- No need to select again
- Click "Switch User" anytime to change

### **Different Browsers:**
- Chrome has its own user
- Firefox has its own user
- Edge has its own user
- Incognito has its own user

---

## 📱 **Testing Scenarios:**

### **Scenario 1: Quick Test (Same Computer)**
1. Chrome → Select User 1
2. Firefox → Select User 2
3. Both have same GPS (same location)
4. Both should see "1 nearby"
5. SOS from User 1 → User 2 gets alert ✅

### **Scenario 2: Test with 3 Users**
1. Chrome → User 1
2. Firefox → User 2
3. Edge → User 3
4. All see "2 nearby"
5. SOS from any user → other 2 get alerts ✅

### **Scenario 3: Test with Mobile**
1. Phone Browser → User 1
2. Desktop Chrome → User 2
3. Stand close together (same location)
4. Should see "1 nearby"
5. Walk apart (>50m)
6. Count drops to "0 nearby" ✅

---

## 🔍 **Verify It's Working:**

### **Check User IDs are Different:**
Look at the top of the page in each browser:
```
Hi User 1!
user_1         [Switch User]
```

```
Hi User 2!
user_2         [Switch User]
```

### **Check Supabase Database:**
1. Go to https://supabase.com/dashboard
2. Table Editor → `user_locations`
3. You should see multiple users:

| user_id | name   | is_online |
|---------|--------|-----------|
| user_1  | User 1 | true      |
| user_2  | User 2 | true      |

### **Check Nearby Counter:**
After 10 seconds, the blue box should show:
- ✅ "1 nearby" (if 2 users)
- ✅ "2 nearby" (if 3 users)
- ✅ "0 nearby" (if alone or >50m away)

---

## 🐛 **Troubleshooting:**

### **Problem: Still seeing "0 nearby"**

**Check 1: Are users different?**
- Look at user ID in each browser
- Should be `user_1`, `user_2`, etc.
- If same, click "Switch User" and pick different numbers

**Check 2: Is location active?**
- Green pulsing dot should show
- "Location Active" text visible
- Coordinates displayed

**Check 3: Did you allow location?**
- Browser should have asked for permission
- Check browser address bar for location icon
- Click it and ensure "Allow" is selected

**Check 4: Wait 10 seconds**
- Location updates every 10 seconds
- Nearby check also runs every 10 seconds
- Give it time to sync

### **Problem: Can't switch users**

**Solution: Clear localStorage**
```javascript
// Open browser console (F12) and run:
localStorage.clear();
location.reload();
```

### **Problem: Multiple browsers show same user**

**This happens if you:**
- ❌ Open multiple **tabs** in same browser
- ✅ Need multiple **browsers** instead

**Fix:**
- Use Chrome + Firefox (different browsers)
- Or use Incognito/Private mode
- Each needs separate browser storage

---

## 💡 **Pro Tips:**

### **Quick User Switching:**
Instead of the UI, you can use URLs:
- http://localhost:3001?user=1
- http://localhost:3001?user=2
- http://localhost:3001?user=3

This overrides the saved user.

### **Reset Everything:**
Clear localStorage in browser console:
```javascript
localStorage.clear();
```

### **See All Database Users:**
Run in Supabase SQL Editor:
```sql
SELECT user_id, name, is_online, last_updated
FROM user_locations
ORDER BY last_updated DESC;
```

---

## ✅ **Expected Results:**

### **When It's Working:**
- ✅ Each browser shows different user ID
- ✅ Blue box shows "Location Active"
- ✅ Nearby counter updates every 10 seconds
- ✅ Shows "X nearby" (X = number of other users within 50m)
- ✅ SOS button sends alerts
- ✅ Other users receive notifications instantly

### **Success Indicators:**
```
Browser 1:
┌─────────────────────────────────┐
│ Hi User 1!                      │
│ user_1         [Switch User]    │
│                                 │
│ ● Location Active    👥 1 nearby│
└─────────────────────────────────┘
```

```
Browser 2:
┌─────────────────────────────────┐
│ Hi User 2!                      │
│ user_2         [Switch User]    │
│                                 │
│ ● Location Active    👥 1 nearby│
└─────────────────────────────────┘
```

---

## 🎉 **You're All Set!**

Now you can easily test the multi-user SOS system with the built-in user switcher!

**No more URL parameters needed!** Just:
1. Open different browsers
2. Click "Switch User"
3. Select different users
4. Test away! 🚀
