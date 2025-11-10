# User Profile "User not found" Error - COMPLETE FIX

## 🎯 ROOT CAUSE IDENTIFIED AND FIXED

### The Problem:
```
Error: "User not found. Please ensure you're logged in with a valid account."
Backend Log: [ERROR] User not found in database for user_id: None
```

### The Root Cause:
**17 users in your database had NULL IDs!**

When these users logged in, the JWT token would contain `"sub": None` instead of a valid user ID, causing the profile endpoint to fail.

### Database Issue Found:
```sql
SELECT id, email FROM users WHERE id IS NULL;
-- Found 17 rows with NULL IDs!
```

### ✅ FIXED:
All 17 users now have valid UUIDs assigned:
- `naresh@gmail.com` → ID: `63148957-5014-4f89-bb2f-c0d707ecffb6`
- Plus 16 other users

---

## 📋 Step-by-Step Explanation

### 1. Why "User not found" Error Happens

```
Login Flow (BROKEN):
User logs in with naresh@gmail.com
    ↓
Backend queries database
    ↓
Finds user but ID is NULL
    ↓
Creates JWT token with sub: None
    ↓
Frontend stores token
    ↓
User tries to access profile
    ↓
Backend extracts user_id from token.sub
    ↓
user_id = None (NULL)
    ↓
Database lookup WHERE id = None fails
    ↓
Returns 404 "User not found" ❌
```

```
Login Flow (FIXED):
User logs in with naresh@gmail.com
    ↓
Backend queries database
    ↓
Finds user with valid UUID
    ↓
Creates JWT token with sub: "63148957-5014-4f89-bb2f-c0d707ecffb6"
    ↓
Frontend stores token
    ↓
User tries to access profile
    ↓
Backend extracts user_id from token.sub
    ↓
user_id = "63148957-5014-4f89-bb2f-c0d707ecffb6"
    ↓
Database lookup finds user
    ↓
Returns 200 with profile data ✅
```

---

### 2. How to Confirm User is Logged In Properly

#### A. Check Token in Browser Console:
```javascript
// Open Console (F12) and run:
const token = localStorage.getItem('bouncer_access_token');

if (!token) {
    console.error('❌ No token found - User is NOT logged in');
} else {
    console.log('✅ Token found');

    // Decode token
    const parts = token.split('.');
    const payload = JSON.parse(atob(parts[1]));

    console.log('User ID (sub):', payload.sub);
    console.log('Email:', payload.email);
    console.log('Role:', payload.role);
    console.log('Expires:', new Date(payload.exp * 1000));

    // Check if user_id is valid
    if (!payload.sub || payload.sub === 'None' || payload.sub === 'null') {
        console.error('❌ Token has INVALID user_id');
        console.log('⚠️  Action: Logout and login again');
    } else {
        console.log('✅ Token is valid');
    }
}
```

#### B. Check Authorization Header:
Open DevTools → Network → Filter by "user/profile":
```
Request Headers:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

✅ Should be present
✅ Should start with "Bearer "
✅ Token should be long (100+ characters)
```

---

### 3. Backend Route Implementation (FastAPI)

Your backend route at `backend/simple_app.py:2165`:

```python
@app.get("/api/user/profile")
async def get_user_profile(authorization: Optional[str] = Header(None)):
    """Get complete user profile"""
    try:
        # Step 1: Extract and verify token
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=401,
                detail="Missing or invalid authorization header"
            )

        token = authorization[7:]  # Remove "Bearer " prefix

        # Step 2: Decode JWT token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")

            if not user_id or not user_id.strip():
                raise HTTPException(
                    status_code=401,
                    detail="Invalid token: missing user ID"
                )

        except jwt.ExpiredSignatureError:
            raise HTTPException(
                status_code=401,
                detail="Token has expired. Please log in again."
            )
        except jwt.InvalidTokenError as e:
            raise HTTPException(
                status_code=401,
                detail=f"Invalid token: {str(e)}"
            )

        # Step 3: Get user from database
        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        cursor.execute("""
            SELECT u.id, u.email, u.first_name, u.last_name, u.phone,
                   u.avatar_url, u.is_active, u.is_verified, u.created_at,
                   u.last_login, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ?
        """, (user_id,))

        user_row = cursor.fetchone()

        if not user_row:
            conn.close()
            print(f"[ERROR] User not found for user_id: {user_id}")
            raise HTTPException(
                status_code=404,
                detail="User not found. Please ensure you're logged in with a valid account."
            )

        # Step 4: Get user profile (create if doesn't exist)
        cursor.execute("""
            SELECT bio, location_address, location_lat, location_lng,
                   emergency_contact_name, emergency_contact_phone
            FROM user_profiles
            WHERE user_id = ?
        """, (user_id,))

        profile_row = cursor.fetchone()

        # Auto-create profile if missing
        if not profile_row:
            cursor.execute("""
                INSERT INTO user_profiles
                (id, user_id, bio, location_address, emergency_contact_name, emergency_contact_phone)
                VALUES (?, ?, '', '', '', '')
            """, (str(uuid.uuid4()), user_id))
            conn.commit()
            profile_row = ('', '', None, None, '', '')

        # Step 5: Get booking stats
        cursor.execute("""
            SELECT
                COUNT(*) as total_bookings,
                SUM(CASE WHEN status = 'accepted' THEN 1 ELSE 0 END) as accepted,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
            FROM bookings
            WHERE user_id = ?
        """, (user_id,))

        stats_row = cursor.fetchone()
        conn.close()

        # Step 6: Return profile data
        return {
            "success": True,
            "user": {
                "id": user_row[0],
                "email": user_row[1],
                "firstName": user_row[2],
                "lastName": user_row[3],
                "phone": user_row[4] or "",
                "avatarUrl": user_row[5] or "",
                "isActive": bool(user_row[6]),
                "isVerified": bool(user_row[7]),
                "createdAt": user_row[8],
                "lastLogin": user_row[9],
                "role": user_row[10],
            },
            "profile": {
                "bio": profile_row[0] if profile_row else "",
                "locationAddress": profile_row[1] if profile_row else "",
                "locationLat": float(profile_row[2]) if profile_row and profile_row[2] else None,
                "locationLng": float(profile_row[3]) if profile_row and profile_row[3] else None,
                "emergencyContactName": profile_row[4] if profile_row else "",
                "emergencyContactPhone": profile_row[5] if profile_row else "",
            },
            "stats": {
                "totalBookings": stats_row[0] or 0,
                "acceptedBookings": stats_row[1] or 0,
                "pendingBookings": stats_row[2] or 0,
                "rejectedBookings": stats_row[3] or 0,
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Get profile error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch profile: {str(e)}"
        )
```

---

### 4. Verify User Exists in Database

```bash
# Check if user exists
cd backend
python -c "import sqlite3; conn=sqlite3.connect('test_bouncer.db'); cursor=conn.cursor(); cursor.execute('SELECT id, email, first_name FROM users WHERE email=?', ('naresh@gmail.com',)); user=cursor.fetchone(); print(f'User ID: {user[0]}' if user else 'User not found')"
```

**Expected Output**:
```
User ID: 63148957-5014-4f89-bb2f-c0d707ecffb6
```

**If NULL or not found**, run the fix script:
```bash
cd backend
python fix_null_user_ids.py
```

---

### 5. Frontend Implementation with Retry Feature

#### A. Custom Hook (`useRetryProfile.ts`):

Already created at `frontend/src/hooks/useRetryProfile.ts`

Features:
- ✅ Automatic retry with exponential backoff
- ✅ Configurable max retries (default: 3)
- ✅ Configurable retry delay (default: 1000ms)
- ✅ Error handling with callbacks
- ✅ Loading states
- ✅ Retry counter

#### B. Update UserProfile Component:

```typescript
// frontend/src/pages/UserProfile.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRetryProfile } from '../hooks/useRetryProfile';
import { Loader, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Use the retry hook
  const {
    loading,
    retryCount,
    profileData,
    error,
    fetchWithRetry,
    retry
  } = useRetryProfile({
    maxRetries: 3,
    retryDelay: 1000,
    onSuccess: (data) => {
      console.log('[PROFILE] Profile loaded successfully');
      toast.success('Profile loaded successfully');
    },
    onError: (err) => {
      console.error('[PROFILE] Failed to load profile:', err);
      toast.error('Failed to load profile. Please try again.');
    },
    onAuthError: () => {
      console.error('[PROFILE] Authentication error');
      toast.error('Session expired. Please login again.');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    }
  });

  // Fetch profile on component mount
  useEffect(() => {
    fetchWithRetry();
  }, [fetchWithRetry]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
          <div className="text-white text-xl">Loading profile...</div>
          {retryCount > 0 && (
            <div className="text-gray-400 text-sm mt-2">
              Retry attempt {retryCount}/3
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (error && !profileData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-4">
            <h3 className="text-xl font-bold text-red-400 mb-2">
              Failed to Load Profile
            </h3>
            <p className="text-gray-300">{error}</p>
          </div>

          <button
            onClick={() => retry()}
            disabled={loading}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center mx-auto space-x-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Retrying...' : 'Retry'}</span>
          </button>

          <button
            onClick={() => navigate('/user')}
            className="mt-4 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Rest of your profile component...
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Your profile UI here */}
    </div>
  );
};

export default UserProfile;
```

#### C. Simple Retry Button Component:

```typescript
// frontend/src/components/RetryButton.tsx
import React from 'react';
import { RefreshCw } from 'lucide-react';

interface RetryButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const RetryButton: React.FC<RetryButtonProps> = ({
  onClick,
  loading = false,
  disabled = false,
  className = ''
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        px-6 py-3 bg-indigo-600 hover:bg-indigo-700
        disabled:opacity-50 disabled:cursor-not-allowed
        rounded-lg transition-colors
        flex items-center justify-center space-x-2
        ${className}
      `}
    >
      <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
      <span>{loading ? 'Retrying...' : 'Retry'}</span>
    </button>
  );
};
```

---

## ✅ Complete Fix Checklist

- [x] **Fixed NULL user IDs** in database (17 users)
- [x] **Backend improvements**:
  - Better error logging
  - Auto-create user profiles
  - Fixed booking endpoint column names
- [x] **Created retry hook** for frontend
- [x] **Added retry UI** with loading states
- [x] **Created debug tools**:
  - `fix_null_user_ids.py` - Fix NULL IDs
  - `test_login_flow.py` - Test login
  - `debug_token.py` - Debug tokens

---

## 🧪 Testing Instructions

### 1. Logout and Clear Storage:
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
```

### 2. Login Again:
- Go to: http://localhost:3000/login
- Email: `naresh@gmail.com`
- Password: (your password)

### 3. Verify Token:
```javascript
// In browser console after login
const token = localStorage.getItem('bouncer_access_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('User ID:', payload.sub); // Should be a UUID, NOT null
```

### 4. Access Profile:
- Navigate to: http://localhost:3000/user/profile
- Should load without errors

### 5. Test Retry Feature:
- If profile fails to load, click "Retry" button
- Should automatically retry up to 3 times
- If still fails, shows clear error message

---

## 🎯 Key Takeaways

### Problem:
Users with NULL database IDs → Invalid JWT tokens → "User not found" error

### Solution:
1. ✅ Fixed all NULL IDs in database
2. ✅ Improved backend error handling
3. ✅ Added automatic retry logic
4. ✅ Better user feedback

### Prevention:
Make sure registration always creates users with proper UUIDs:
```python
# In registration endpoint
user_id = str(uuid.uuid4())  # Always generate UUID
cursor.execute("INSERT INTO users (id, email, ...) VALUES (?, ?, ...)", (user_id, email, ...))
```

---

## 📞 Need More Help?

If still having issues:

1. **Check backend logs**: Look for `[ERROR]` messages
2. **Check browser console**: Look for JavaScript errors
3. **Check Network tab**: Verify token is being sent
4. **Run debug script**:
   ```bash
   cd backend
   python debug_token.py
   ```

Your database is now fixed and ready to use! 🎉
