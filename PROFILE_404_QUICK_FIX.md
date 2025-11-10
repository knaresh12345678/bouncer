# Profile 404 Error - QUICK FIX

## 🎯 ROOT CAUSE IDENTIFIED

The endpoint `/api/user/profile` **EXISTS** but returns **404 (User not found)**.

Looking at backend logs:
```
INFO: 127.0.0.1:59116 - "GET /api/user/profile HTTP/1.1" 404 Not Found
```

This means the endpoint is being hit, but the **user ID from the JWT token doesn't exist in the database**.

---

## ⚡ IMMEDIATE FIX

### Step 1: Clear All Auth Data and Re-login

```javascript
// Run this in browser console:
localStorage.clear();
sessionStorage.clear();
location.reload();
```

Then:
1. Login again
2. Try accessing `/user/profile`

---

### Step 2: If Still 404 - Check Database

The user might not exist in the `users` table.

```bash
cd backend
python -c "import sqlite3; conn = sqlite3.connect('test_bouncer.db'); cursor = conn.cursor(); cursor.execute('SELECT id, email, first_name, last_name FROM users'); users = cursor.fetchall(); print('Users in database:'); [print(f'ID: {u[0]}, Email: {u[1]}, Name: {u[2]} {u[3]}') for u in users]; conn.close()"
```

**If no users found or your user is missing:**
- Register again
- Or restore database

---

### Step 3: Check Token User ID Matches Database

```javascript
// In browser console after login:
const token = localStorage.getItem('bouncer_access_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token user ID:', payload.sub);
console.log('Token email:', payload.email);
```

Then check if that user ID exists in database.

---

## 🔧 PERMANENT FIX - Backend Error Logging

Add better logging to see exact error:

**In `simple_app.py` around line 2165**, add this at the start of `get_user_profile`:

```python
@app.get("/api/user/profile")
async def get_user_profile(authorization: Optional[str] = Header(None)):
    """Get complete user profile including personal info, stats, and bookings"""
    print(f"[PROFILE API] === GET PROFILE REQUEST ===")
    print(f"[PROFILE API] Authorization header present: {bool(authorization)}")
    try:
        # Extract and verify token
        if not authorization or not authorization.startswith("Bearer "):
            print(f"[PROFILE API] ERROR: Missing or invalid auth header")
            raise HTTPException(status_code=401, detail="Missing or invalid authorization header")

        token = authorization[7:]

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("sub")
            print(f"[PROFILE API] Decoded token - User ID: {user_id}")

            if not user_id or not user_id.strip():
                print(f"[PROFILE API] ERROR: User ID missing from token")
                raise HTTPException(status_code=401, detail="Invalid token: missing user ID")

        except jwt.ExpiredSignatureError:
            print(f"[PROFILE API] ERROR: Token expired")
            raise HTTPException(status_code=401, detail="Token has expired. Please log in again.")
        except jwt.InvalidTokenError as e:
            print(f"[PROFILE API] ERROR: Invalid token - {str(e)}")
            raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

        conn = sqlite3.connect("test_bouncer.db")
        cursor = conn.cursor()

        # Get user basic info
        print(f"[PROFILE API] Querying database for user_id: {user_id}")
        cursor.execute("""
            SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.avatar_url,
                   u.is_active, u.is_verified, u.created_at, u.last_login, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.id = ?
        """, (user_id,))

        user_row = cursor.fetchone()

        if not user_row:
            conn.close()
            print(f"[PROFILE API] ERROR: User not found in database for ID: {user_id}")
            raise HTTPException(status_code=404, detail=f"User not found for ID: {user_id}")

        print(f"[PROFILE API] User found: {user_row[1]}")  # Email

        # ... rest of code
```

---

## 🐛 DEBUGGING THE ISSUE

### Check 1: Is the backend seeing the request?

After adding logging above, restart backend and check logs. You should see:
```
[PROFILE API] === GET PROFILE REQUEST ===
[PROFILE API] Authorization header present: True
[PROFILE API] Decoded token - User ID: some-user-id
[PROFILE API] Querying database for user_id: some-user-id
[PROFILE API] ERROR: User not found in database for ID: some-user-id
```

### Check 2: Verify user exists

```bash
cd backend
python check_users.py
```

Create `check_users.py`:
```python
import sqlite3

conn = sqlite3.connect("test_bouncer.db")
cursor = conn.cursor()

# Get all users
cursor.execute("SELECT id, email, first_name, last_name, role_id FROM users")
users = cursor.fetchall()

print("=" * 60)
print("USERS IN DATABASE:")
print("=" * 60)
for user in users:
    print(f"ID: {user[0]}")
    print(f"Email: {user[1]}")
    print(f"Name: {user[2]} {user[3]}")
    print(f"Role ID: {user[4]}")
    print("-" * 60)

print(f"\nTotal users: {len(users)}")
conn.close()
```

Run: `python check_users.py`

---

## ✅ SOLUTION SUMMARY

**The 404 error means:**
1. ✅ Endpoint exists and is registered
2. ✅ Request reaches the endpoint
3. ❌ User ID from token doesn't exist in database

**Quick Fix:**
1. Clear browser storage
2. Login again with a fresh account
3. Try profile page

**If that doesn't work:**
1. Add logging to backend (code above)
2. Check which user ID the token has
3. Verify that user exists in database
4. If not, register a new user

**Database Issue Fix:**
```bash
# Backup current database
copy test_bouncer.db test_bouncer.db.backup

# Or recreate database schema
python setup_database.py  # If you have this file
```

---

## 📞 **NEXT STEPS FOR YOU**

1. **Try this first:**
   ```javascript
   // Browser console:
   localStorage.clear();
   location.href = '/login';
   // Then login and try profile page
   ```

2. **If still 404:**
   - Share output of: `python check_users.py`
   - Share what user ID is in your token
   - I'll help match them up

3. **For permanent fix:**
   - Add the logging code I provided
   - Restart backend
   - Try profile page
   - Share the console output from backend

---

**Most Common Cause:** Old JWT token referencing deleted/non-existent user. **Fix:** Fresh login.

