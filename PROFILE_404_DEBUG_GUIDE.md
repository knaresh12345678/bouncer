# Profile 404 Error - Complete Debugging Guide

## 🔍 Problem Analysis

**Error**: `404 (Not Found)` when accessing `/api/user/profile`
**Location**: `UserProfile.tsx` line 129-130

## ✅ What We've Verified

1. **Backend endpoint EXISTS** ✅
   - Confirmed `/api/user/profile` is registered in FastAPI
   - Visible in OpenAPI spec at `http://localhost:8000/openapi.json`

2. **Axios baseURL configured** ✅
   - Set to `http://localhost:8000/api` in AuthContext.tsx

3. **Frontend calls `/user/profile`** ✅
   - Should combine with baseURL to make `http://localhost:8000/api/user/profile`

## 🐛 Debugging Steps

### Step 1: Check Browser Network Tab

1. Open your browser (Chrome/Edge/Firefox)
2. Press **F12** to open DevTools
3. Go to **Network** tab
4. Navigate to `/user/profile`
5. Look for the request to `profile`

**What to check:**
```
Request URL: http://localhost:8000/api/user/profile ✅ CORRECT
Request URL: http://localhost:8000/user/profile ❌ WRONG (missing /api)
Request URL: http://localhost:3000/api/user/profile ❌ WRONG (wrong port)
```

**Screenshot what you see:**
- Request URL
- Status Code (404, 401, 200, etc.)
- Request Headers (especially Authorization)
- Response body

### Step 2: Check Console Logs

In the browser console, you should see:
```
[PROFILE] Component mounted, fetching profile data...
[PROFILE] Fetching profile data from API...
[PROFILE] Token exists: true/false
```

**If you see:**
- `Token exists: false` → Token not in localStorage
- `Token exists: true` → Token is present, check if it's valid

### Step 3: Verify Token in localStorage

In browser console, run:
```javascript
localStorage.getItem('bouncer_access_token')
```

**Expected:** A long JWT string like `eyJhbGciOiJIUzI1N...`
**If null:** You need to login again

### Step 4: Test Endpoint with Network Tab

With DevTools Network tab open:
1. Login as a user
2. Navigate to `/user/profile`
3. Find the request to `/api/user/profile`
4. Right-click → **Copy as cURL**
5. Paste it here to analyze

### Step 5: Manual API Test

**Test with curl (Command Prompt):**

```bash
# First, login to get a token
curl -X POST http://localhost:8000/api/auth/login -F "username=YOUR_EMAIL" -F "password=YOUR_PASSWORD"

# Copy the access_token from response
# Then test profile endpoint:
curl -X GET http://localhost:8000/api/user/profile -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected responses:**
- **200 OK** → Endpoint works, frontend issue
- **401 Unauthorized** → Token invalid/expired
- **404 Not Found** → Endpoint not registered or wrong URL

## 🔧 Common Causes & Fixes

### Cause 1: Axios BaseURL Not Applied

**Symptom:** Request goes to `http://localhost:8000/user/profile` (missing `/api`)

**Fix:** Check if axios import is correct in UserProfile.tsx

```typescript
// ✅ CORRECT - Uses axios with baseURL
import axios from 'axios';

// Then later:
const response = await axios.get('/user/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**This will make request to:** `http://localhost:8000/api/user/profile`

---

### Cause 2: Multiple Axios Instances

**Symptom:** Some axios calls work, others don't

**Fix:** Ensure all components use the same axios instance

**Check:**
```typescript
// In UserProfile.tsx line 4
import axios from 'axios'; // ✅ Should be from 'axios', not a custom instance
```

---

### Cause 3: CORS Issues

**Symptom:** Network tab shows "CORS error" or "Preflight failed"

**Fix:** Backend CORS is already configured, but verify:

```python
# In simple_app.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # ✅ Must match frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

### Cause 4: Wrong Frontend Port

**Symptom:** Frontend running on different port than 3000

**Check:** Is Vite running on `http://localhost:3000`?
- Yes → OK
- No → Update backend CORS to match your port

---

### Cause 5: Backend Not Restarted

**Symptom:** Code changes not reflected

**Fix:** Restart backend server

**Kill old backend:**
```bash
# Find process on port 8000
netstat -ano | findstr :8000

# Kill it (replace PID with actual process ID)
taskkill /PID <PID> /F

# Start fresh
cd backend
python simple_app.py
```

---

### Cause 6: Cache Issues

**Symptom:** Old code still running

**Fix:** Hard refresh browser

1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"
4. Try again

---

## 🛠️ Complete Fix Implementation

### Option 1: Add Explicit Full URL (Temporary Debug)

**In UserProfile.tsx line 113**, temporarily change:

```typescript
// BEFORE (relying on baseURL)
const response = await axios.get('/user/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// AFTER (explicit full URL for debugging)
const response = await axios.get('http://localhost:8000/api/user/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

**If this works:** The issue is axios baseURL configuration
**If this fails:** The issue is backend or token

---

### Option 2: Create Custom Axios Instance

**Create new file:** `frontend/src/utils/axios.ts`

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for auth
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bouncer_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default apiClient;
```

**Then in UserProfile.tsx:**

```typescript
// Change import
import apiClient from '../utils/axios';

// Use it
const response = await apiClient.get('/user/profile');
```

---

## 📊 Expected vs Actual URL Check

Run this in browser console on the profile page:

```javascript
// Check axios defaults
console.log('Axios baseURL:', axios.defaults.baseURL);
console.log('Expected URL:', axios.defaults.baseURL + '/user/profile');

// This should print:
// Axios baseURL: http://localhost:8000/api
// Expected URL: http://localhost:8000/api/user/profile
```

---

## 🔬 Advanced Debugging

### Add Axios Request Logger

**In UserProfile.tsx, add before fetchProfileData:**

```typescript
useEffect(() => {
  // Log every axios request
  const requestInterceptor = axios.interceptors.request.use(
    (config) => {
      console.log('[AXIOS REQUEST]', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        fullURL: config.baseURL + config.url,
        headers: config.headers
      });
      return config;
    },
    (error) => {
      console.error('[AXIOS REQUEST ERROR]', error);
      return Promise.reject(error);
    }
  );

  return () => {
    axios.interceptors.request.eject(requestInterceptor);
  };
}, []);
```

**This will log every request with full details**

---

## 🧪 Testing Checklist

Use this to systematically test:

### Backend Tests

```bash
# Test 1: Backend is running
curl http://localhost:8000

# Expected: {"message":"Simple Login API","status":"running"}

# Test 2: Health check
curl http://localhost:8000/health

# Expected: {"status":"healthy"}

# Test 3: Profile endpoint exists
curl http://localhost:8000/docs

# Expected: HTML page with API docs

# Test 4: Get profile (need valid token)
curl -X GET http://localhost:8000/api/user/profile -H "Authorization: Bearer YOUR_TOKEN"

# Expected: 401 with invalid token, 200 with valid token
```

### Frontend Tests

```javascript
// In browser console on profile page:

// Test 1: Check axios config
console.log(axios.defaults);

// Test 2: Check token
console.log('Token:', localStorage.getItem('bouncer_access_token'));

// Test 3: Manual API call
axios.get('/user/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('bouncer_access_token')}`
  }
})
.then(res => console.log('Success:', res.data))
.catch(err => console.error('Error:', err.response?.status, err.response?.data));
```

---

## 💡 Quick Fixes

### Fix 1: Ensure Logged In

1. Logout completely
2. Clear localStorage: `localStorage.clear()`
3. Login again
4. Try profile page

### Fix 2: Restart Everything

```bash
# Kill all processes
# Ctrl+C in terminal running frontend
# Ctrl+C in terminal running backend

# Start Docker services
docker-compose up postgres redis -d

# Start backend
cd backend
python simple_app.py

# Start frontend (new terminal)
cd frontend
npm run dev
```

### Fix 3: Check Ports

```bash
# Check if 8000 is in use
netstat -ano | findstr :8000

# Check if 3000 is in use
netstat -ano | findstr :3000
```

---

## 📝 Report Template

When reporting the issue, provide:

```
1. **Request URL from Network tab:**
   [Paste full URL]

2. **Status Code:**
   [404/401/500/etc.]

3. **Console Logs:**
   [Paste [PROFILE] logs]

4. **Token exists:**
   [true/false]

5. **Axios baseURL:**
   [Paste from console.log(axios.defaults.baseURL)]

6. **Full error from console:**
   [Paste complete error]
```

---

## ✅ Solution Summary

**Most likely cause:** One of these:

1. **Axios baseURL not applied** → Use explicit full URL or custom axios instance
2. **Token invalid/expired** → Login again
3. **Backend not restarted** → Restart backend with updated code
4. **Port mismatch** → Verify frontend on 3000, backend on 8000

**Recommended fix:**

1. **Restart backend** to ensure new endpoints loaded
2. **Hard refresh browser** (Ctrl+Shift+R)
3. **Login again** to get fresh token
4. **Check Network tab** to see actual URL being called
5. **Add logging** to see axios configuration

---

## 🆘 If Still Not Working

1. Share screenshot of Network tab showing the failed request
2. Share console logs with all `[PROFILE]` messages
3. Share output of: `curl http://localhost:8000/api/user/profile -v`
4. Check if there are multiple backend processes running

---

**Last Updated:** November 8, 2025
**Status:** Diagnostic Guide
