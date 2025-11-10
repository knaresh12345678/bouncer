# Testing Booking Data Display - Step by Step Guide

## Current Database Status

✅ **1 Pending Booking Found in Database:**
```
Event: kalyanam
Location: karur
Start: 2005-10-30 20:50:00
End: 2005-10-31 00:50:00
Rate: ₹59.98/hour
Total: ₹239.92
Status: pending
```

---

## Step 1: Open Bouncer Dashboard

1. Go to **http://localhost:3000**
2. Login as a **bouncer** account
3. Navigate to the **Dashboard** tab

---

## Step 2: Open Browser Console

### Chrome / Edge:
- Press **F12** OR
- Right-click → **Inspect** → **Console** tab

### Firefox:
- Press **F12** → **Console** tab

---

## Step 3: Check Console Logs

You should see detailed logs like this:

```
📋 Booking API Response: {success: true, bookings: Array(1), count: 1}

✅ Bookings received: 1

📊 First booking full data: {id: "99dabe8b-...", event_name: "kalyanam", ...}

  📝 Event Name: kalyanam
  📍 Location: karur
  📅 Start DateTime: 2005-10-30T20:50:00
  ⏰ End DateTime: 2005-10-31T00:50:00
  💰 Total Amount: 239.92
  💵 Hourly Rate: 59.98
  👤 User Info: {first_name: "...", last_name: "...", email: "...", phone: "..."}
```

---

## Step 4: Check UI Display

On the dashboard, you should see a booking card showing:

```
┌─────────────────────────────────────────────────┐
│ kalyanam                                        │
│                                                  │
│ ┌─ Client Information ─────────────────────┐   │
│ │ 👤 [Client Name]                          │   │
│ │ 📧 [Client Email]                         │   │
│ │ 📞 [Client Phone]                         │   │
│ └───────────────────────────────────────────┘   │
│                                                  │
│ 📅 Date & Time          📍 Location             │
│ Sun, Oct 30, 2005      karur                   │
│ 08:50 PM - 12:50 AM                            │
│ Duration: 4 hours                               │
│                                                  │
│ ID: 99dabe8b  [PENDING]  Posted: [Date]       │
│                                                  │
│                 ┌─ Payment ───────┐             │
│ [Accept Job]   │ ₹239.92         │  [Decline]  │
│                 │ ₹59.98/hour     │             │
│                 └─────────────────┘             │
└─────────────────────────────────────────────────┘
```

---

## Troubleshooting

### If Console Shows "⚠️ No bookings in response"

**Cause**: API not finding pending bookings

**Solution**:
```bash
# Check database directly
cd backend
python -c "import sqlite3; conn = sqlite3.connect('test_bouncer.db'); cursor = conn.cursor(); cursor.execute('SELECT id, event_name, status FROM bookings'); print(cursor.fetchall()); conn.close()"
```

### If Console Shows "❌ Error fetching booking requests"

**Cause**: API endpoint not reachable or authentication issue

**Check**:
1. Backend is running at http://localhost:8000
2. Token is present: `localStorage.getItem('bouncer_access_token')`
3. Check backend terminal for error logs

### If Console Shows Data But UI is Empty

**Cause**: Frontend rendering issue

**Check**:
1. Look for JavaScript errors in console (red text)
2. Check if `pendingRequests` is empty in React DevTools
3. Verify data structure matches expected format

### If Location/Date/Time Shows "Not specified"

**Cause**: Field names don't match or data is null

**In Console, Type**:
```javascript
// Check exact field names
console.log(Object.keys(response.data.bookings[0]))
```

---

## Creating a New Test Booking

If you want to create a fresh booking for testing:

### Step 1: Logout and Login as User
1. Logout from bouncer account
2. Login as regular user (NOT bouncer)

### Step 2: Create Booking
1. Go to booking page
2. Fill out form:
   ```
   Event Name: Test Security Event
   Location: MG Road, Bangalore, Karnataka
   Date: [Tomorrow's date]
   Time: 18:00
   Price: 500
   Description: Corporate security needed for evening event
   ```
3. Submit booking

### Step 3: View as Bouncer
1. Logout from user account
2. Login as bouncer
3. Go to Dashboard
4. **Refresh** the page (or click Refresh button)
5. New booking should appear

---

## Expected Backend Logs

When you load the bouncer dashboard, backend should show:

```
[BOOKING] Getting pending booking requests
[BOOKING] Found 1 pending booking requests
[BOOKING] Sample booking data: {'id': '99dabe8b-...', 'event_name': 'kalyanam', 'event_location': 'karur', ...}
INFO: GET /api/bookings/pending HTTP/1.1" 200 OK
```

---

## Field Name Reference

| Database Column | Backend JSON Key | Frontend Display |
|----------------|------------------|------------------|
| event_name | event_name | Event title |
| event_description | event_description | Description text |
| event_location_address | event_location | 📍 Location |
| start_datetime | start_datetime | 📅 Start date/time |
| end_datetime | end_datetime | ⏰ End time |
| hourly_rate | hourly_rate | ₹X/hour |
| total_amount | total_amount | ₹X (large) |
| special_requirements | special_requirements | ⚠️ Requirements |
| u.first_name | user_info.first_name | 👤 Name |
| u.email | user_info.email | 📧 Email |
| u.phone | user_info.phone | 📞 Phone |

---

## Quick Debug Commands

### Check Pending Bookings:
```bash
cd backend
python -c "import sqlite3; conn = sqlite3.connect('test_bouncer.db'); cursor = conn.cursor(); cursor.execute('SELECT id, event_name, event_location_address, start_datetime, status FROM bookings WHERE status=\"pending\"'); [print(row) for row in cursor.fetchall()]; conn.close()"
```

### Update Booking Status to Pending:
```bash
cd backend
python -c "import sqlite3; conn = sqlite3.connect('test_bouncer.db'); cursor = conn.cursor(); cursor.execute('UPDATE bookings SET status=\"pending\" WHERE id=\"53733f0d-ac5a-49b8-abf9-7047fedbf3a3\"'); conn.commit(); print('Updated'); conn.close()"
```

### Check All Users:
```bash
cd backend
python -c "import sqlite3; conn = sqlite3.connect('test_bouncer.db'); cursor = conn.cursor(); cursor.execute('SELECT id, email, first_name, last_name, user_type FROM users'); [print(row) for row in cursor.fetchall()]; conn.close()"
```

---

## What You Should See

### ✅ SUCCESS - All Data Showing:
- Event name visible
- Location showing correctly
- Date formatted properly
- Time range displayed
- Duration calculated
- Client information complete
- Payment details accurate

### ❌ ISSUE - Data Missing:
- Take screenshot of console logs
- Check browser console for errors
- Check backend terminal for errors
- Share console output for debugging

---

## Next Steps

After testing:
1. **If everything shows correctly** → System is working!
2. **If data is missing** → Share console logs (copy/paste the console output)
3. **If errors appear** → Share error messages
4. **If nothing appears** → Check if token is valid

---

**Testing Date**: November 4, 2025
**Backend**: http://localhost:8000
**Frontend**: http://localhost:3000
**Database**: test_bouncer.db
