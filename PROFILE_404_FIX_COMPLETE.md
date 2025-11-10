# User Profile 404 Error - FIXED

## Summary of Issues Found and Fixed

### 🐛 **Issue 1: `/api/user/bookings` - 500 Internal Server Error**
**Error**: `no such column: b.event_date`

**Root Cause**: The SQL query was using wrong column names that don't exist in the `bookings` table.

**Database Schema** (Actual):
- `start_datetime` and `end_datetime` (NOT `event_date` and `event_time`)
- `total_amount` (NOT `budget`)
- No `booking_type` column

**Fix Applied** ✅:
```python
# OLD (WRONG):
SELECT b.event_date, b.event_time, b.budget, b.booking_type

# NEW (CORRECT):
SELECT DATE(b.start_datetime) as event_date,
       TIME(b.start_datetime) as event_time,
       b.total_amount as budget,
       CASE WHEN b.bouncer_id IS NOT NULL THEN 'individual' ELSE 'general' END as booking_type
```

**Location**: `backend/simple_app.py:2425-2470`

---

### 🐛 **Issue 2: `/api/user/profile` - 404 Not Found**
**Error**: `User not found in database for user_id: None`

**Root Cause**: The JWT token contains `user_id: None` (no valid user ID), which happens when:
1. User is not properly logged in
2. Token is expired or invalid
3. Token doesn't have proper `sub` field

**Fix Applied** ✅:
1. **Added better error logging** to show which `user_id` is being looked up
2. **Auto-create user profiles** if they don't exist (some users might not have profiles yet)
3. **Better error messages** to help debug the issue

**Location**: `backend/simple_app.py:2201-2228`

---

## ✅ What Was Fixed

### 1. **Bookings Endpoint Fixed** (`/api/user/bookings`)
- ✅ Updated SQL query to use correct column names
- ✅ Extract date and time from `start_datetime`
- ✅ Use `total_amount` instead of non-existent `budget` column
- ✅ Determine booking type based on whether `bouncer_id` exists

### 2. **Profile Endpoint Improved** (`/api/user/profile`)
- ✅ Added detailed error logging showing exact `user_id` causing issues
- ✅ Auto-create empty profile if user doesn't have one
- ✅ Better error messages to help users understand the problem

### 3. **Created Debug Tools**
- ✅ `backend/debug_token.py` - Tool to check if your token is valid
- ✅ `backend/test_endpoints.py` - Automated test script

---

## 🔍 Root Cause of Your 404 Error

From the backend logs:
```
[ERROR] User not found in database for user_id: None
INFO: GET /api/user/profile HTTP/1.1 404 Not Found
```

**The Problem**: Your token has `user_id: None`

**Why This Happens**:
1. **You're not properly logged in** - Token might be from a previous session
2. **Token is expired** - JWT tokens expire after 24 hours
3. **Token is invalid** - Corrupted or malformed token

---

## 🛠️ How to Fix - Step by Step

### **Step 1: Logout and Clear Storage**

Open browser console (F12) and run:
```javascript
// Clear all stored data
localStorage.clear();
sessionStorage.clear();

// Verify it's cleared
console.log(localStorage.getItem('bouncer_access_token')); // Should be null
```

### **Step 2: Login Again**

1. Go to: http://localhost:3000/login
2. Use one of these test accounts:

**User Account**:
- Email: `naresh@gmail.com`
- Password: (your password)

**Or create a new account** at http://localhost:3000/register

### **Step 3: Verify Token After Login**

Open browser console and run:
```javascript
// Check if token exists
const token = localStorage.getItem('bouncer_access_token');
console.log('Token exists:', !!token);
console.log('Token preview:', token?.substring(0, 50));

// Decode token to see contents
if (token) {
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));
    console.log('Token payload:', payload);
    console.log('User ID (sub):', payload.sub);
    console.log('Email:', payload.email);
    console.log('Expires:', new Date(payload.exp * 1000));
}
```

**You should see**:
- `User ID (sub): "some-uuid-here"` ✅ (NOT `null` or `undefined`)
- `Email: "your-email@example.com"` ✅
- `Expires: [future date]` ✅

### **Step 4: Test Profile Page**

1. Navigate to: http://localhost:3000/user/profile
2. Check browser console for errors
3. Check Network tab (F12 → Network) for API requests

**Expected Results**:
- ✅ `GET /api/user/profile` → **200 OK**
- ✅ `GET /api/user/bookings` → **200 OK**

---

## 🧪 Testing with Debug Script

### Option 1: Manual Testing

1. **Get your token** from localStorage (browser console):
   ```javascript
   localStorage.getItem('bouncer_access_token')
   ```

2. **Run debug script**:
   ```bash
   cd backend
   python debug_token.py
   ```

3. **Paste your token** when prompted

4. **Check output**:
   ```
   ✅ Token is VALID
   User ID from token: abc-123-xyz
   ✅ User EXISTS in database
   ```

---

## 📊 Verify Database

Check if your user exists:

```bash
cd backend
python -c "import sqlite3; conn = sqlite3.connect('test_bouncer.db'); cursor = conn.cursor(); cursor.execute('SELECT id, email, first_name FROM users'); [print(f'{r[0][:8]}... - {r[1]} - {r[2]}') for r in cursor.fetchall()]"
```

---

## 🎯 Common Issues & Solutions

### Issue: "Token is expired"
**Solution**: Logout and login again to get a fresh token

### Issue: "User not found in database"
**Solution**:
1. Check if the email you're using actually exists in the database
2. Try registering a new account
3. Ensure you're using the correct backend server (port 8000)

### Issue: "Invalid token"
**Solution**:
1. Clear localStorage: `localStorage.clear()`
2. Logout completely
3. Login again
4. Don't manually edit the token

### Issue: Still getting 404 after login
**Solution**:
1. Open browser console
2. Go to Network tab
3. Try accessing profile page
4. Look at the request to `/api/user/profile`
5. Check the `Authorization` header - it should have `Bearer <token>`
6. If token is missing or empty, the frontend isn't storing it properly

---

## 📝 Files Modified

1. **backend/simple_app.py**
   - Lines 2425-2470: Fixed `/api/user/bookings` query
   - Lines 2201-2228: Improved `/api/user/profile` error handling

2. **backend/debug_token.py** (NEW)
   - Tool to debug JWT tokens

3. **backend/test_endpoints.py** (NEW)
   - Automated endpoint testing

---

## 🚀 Quick Test Command

```bash
# In browser console after logging in:
fetch('http://localhost:8000/api/user/profile', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('bouncer_access_token')}`
    }
})
.then(r => r.json())
.then(data => console.log('Profile:', data))
.catch(err => console.error('Error:', err));
```

**Expected**: You should see your profile data printed in console

---

## ✅ Verification Checklist

- [ ] Backend is running on port 8000
- [ ] Frontend is running on port 3000
- [ ] Logged out and cleared localStorage
- [ ] Logged in with valid credentials
- [ ] Token exists in localStorage
- [ ] Token has valid `sub` field (user ID)
- [ ] Can access `/user/profile` page without 404
- [ ] Profile data loads correctly
- [ ] Bookings load without 500 error

---

## 🎓 Understanding the Fix

### Why the 404 Happened:

```
User tries to access profile
    ↓
Frontend sends request with token
    ↓
Backend extracts user_id from token.sub
    ↓
user_id is None (token invalid/expired)
    ↓
Database lookup for user_id=None fails
    ↓
Returns 404 "User not found"
```

### How It Works Now:

```
User logs in properly
    ↓
Backend creates token with valid user_id
    ↓
Token stored in localStorage
    ↓
Frontend sends request with valid token
    ↓
Backend extracts user_id successfully
    ↓
Database lookup finds user
    ↓
Returns 200 with profile data ✅
```

---

## 📞 Need More Help?

If still facing issues, check:
1. Backend logs for detailed error messages
2. Browser console for JavaScript errors
3. Network tab to see exact API request/response
4. Run `debug_token.py` to verify your token

**Backend is running**: http://localhost:8000
**Frontend is running**: http://localhost:3000
**API Docs**: http://localhost:8000/docs
