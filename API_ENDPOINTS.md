# Bouncer App API Endpoints

## Authentication Endpoints

### POST /api/auth/register
Register a new user
```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890"
}
```

### POST /api/auth/login
Login user (OAuth2 password flow)
```
username: user@example.com
password: password123
```

### POST /api/auth/refresh
Refresh access token
```json
{
  "refresh_token": "refresh_token_here"
}
```

### POST /api/auth/logout
Logout user

---

## User Management Endpoints

### GET /api/users/profile
Get current user profile

### PUT /api/users/profile
Update current user profile
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "bio": "Professional user",
  "location_address": "123 Main St, City, State"
}
```

### GET /api/users/bookings
Get current user's bookings

---

## Booking Endpoints

### GET /api/bookings
Get bookings (filtered by user role)
- Users: their own bookings
- Bouncers: assigned bookings
- Admins: all bookings

### POST /api/bookings
Create a new booking
```json
{
  "bouncer_id": "uuid",
  "event_name": "Private Party",
  "event_description": "Birthday celebration",
  "event_location_address": "123 Party St, City, State",
  "start_datetime": "2024-12-25T20:00:00Z",
  "end_datetime": "2024-12-26T02:00:00Z",
  "special_requirements": "Experience with crowd control"
}
```

### GET /api/bookings/{booking_id}
Get specific booking details

### PUT /api/bookings/{booking_id}
Update booking (cancel for users)
```json
{
  "status": "cancelled"
}
```

### POST /api/bookings/{booking_id}/accept
Accept booking (bouncers only)

### POST /api/bookings/{booking_id}/reject
Reject booking (bouncers only)
```json
{
  "reason": "Schedule conflict"
}
```

### PUT /api/bookings/{booking_id}/status
Update booking status (bouncers only)
```json
{
  "status": "in_progress"
}
```

### POST /api/bookings/{booking_id}/review
Create review for completed booking
```json
{
  "rating": 5,
  "comment": "Excellent service!",
  "is_public": true
}
```

---

## Bouncer Endpoints

### GET /api/bouncers
Get list of available bouncers (with filters)
```
?location=lat,lng&radius=10&available_date=2024-12-25
```

### GET /api/bouncers/profile
Get bouncer profile (bouncer role only)

### PUT /api/bouncers/profile
Update bouncer profile
```json
{
  "license_number": "LIC123456",
  "experience_years": 5,
  "height_cm": 180,
  "weight_kg": 80,
  "certifications": ["Security License", "First Aid"],
  "hourly_rate": 50.00,
  "bio": "Experienced security professional"
}
```

### GET /api/bouncers/availability
Get bouncer availability schedule

### POST /api/bouncers/availability
Add availability slot
```json
{
  "day_of_week": 5,
  "start_time": "18:00",
  "end_time": "02:00"
}
```

### PUT /api/bouncers/availability/{availability_id}
Update availability slot

### DELETE /api/bouncers/availability/{availability_id}
Remove availability slot

### GET /api/bouncers/bookings
Get assigned bookings (bouncer role only)

---

## Admin Endpoints

### GET /api/admin/users
Get all users (admin only)
```
?role=bouncer&status=active&page=1&limit=20
```

### POST /api/admin/users
Create user (admin only)

### GET /api/admin/users/{user_id}
Get specific user (admin only)

### PUT /api/admin/users/{user_id}
Update user (admin only)
```json
{
  "is_active": false,
  "role": "bouncer"
}
```

### DELETE /api/admin/users/{user_id}
Deactivate user (admin only)

### GET /api/admin/bouncers
Get all bouncers with details (admin only)

### POST /api/admin/bouncers
Create bouncer profile (admin only)

### PUT /api/admin/bouncers/{bouncer_id}/verify
Verify bouncer background check (admin only)
```json
{
  "background_check_status": "approved"
}
```

### GET /api/admin/bookings
Get all bookings with filters (admin only)
```
?status=pending&date_from=2024-12-01&date_to=2024-12-31
```

### GET /api/admin/reports
Get system reports (admin only)
```
?type=revenue&period=monthly&year=2024
```

### GET /api/admin/reports/dashboard
Get admin dashboard metrics

---

## Real-time WebSocket Events

### Connection
```javascript
const socket = io('/api/ws', {
  auth: {
    token: 'jwt_token_here'
  }
});
```

### Events

#### booking_status_changed
```json
{
  "booking_id": "uuid",
  "old_status": "pending",
  "new_status": "confirmed",
  "changed_by": "uuid",
  "timestamp": "2024-12-25T10:00:00Z"
}
```

#### new_booking_request (to bouncer)
```json
{
  "booking_id": "uuid",
  "user_name": "John Doe",
  "event_name": "Private Party",
  "start_datetime": "2024-12-25T20:00:00Z",
  "location": "123 Party St"
}
```

#### new_message
```json
{
  "conversation_id": "uuid",
  "sender_id": "uuid",
  "sender_name": "John Doe",
  "message": "Hello, I have a question about the booking.",
  "timestamp": "2024-12-25T10:00:00Z"
}
```

#### notification
```json
{
  "id": "uuid",
  "title": "Booking Confirmed",
  "message": "Your booking for Dec 25 has been confirmed.",
  "type": "booking",
  "timestamp": "2024-12-25T10:00:00Z"
}
```

---

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [/* items */],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

---

## Authentication

All endpoints except `/api/auth/*` require JWT Bearer token:
```
Authorization: Bearer <jwt_access_token>
```

## Rate Limiting

- Auth endpoints: 5 requests per minute
- General API: 100 requests per minute
- WebSocket: 50 events per minute

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error