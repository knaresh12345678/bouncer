# Bouncer App Implementation Guide

## Overview

This guide provides a complete implementation of a Role-Based Access Control (RBAC) mobile and web application for bouncer services with three roles: Admin, Bouncer, and User.

## 🏗️ Architecture

### Backend (FastAPI + Python)
- **Authentication**: JWT-based with refresh tokens
- **Authorization**: Role-based permissions with middleware
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Real-time**: Socket.IO for live updates
- **Caching**: Redis for sessions and real-time data

### Frontend (React + Vite)
- **State Management**: React Context + React Query
- **Routing**: React Router with role-based protection
- **UI**: Tailwind CSS with responsive design
- **Real-time**: Socket.IO client integration

### Database (PostgreSQL)
- **RBAC Tables**: roles, permissions, role_permissions
- **User Management**: users, user_profiles
- **Bouncer System**: bouncer_profiles, bouncer_availability
- **Booking System**: bookings, booking_status_history
- **Communication**: conversations, messages, notifications

## 🚀 Quick Start

### 1. Start the Database
```bash
docker-compose up -d postgres redis
```

### 2. Set up Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Set up Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Access the Application
- API Documentation: http://localhost:8000/api/docs
- Frontend: http://localhost:3000

## 👥 Role-Based Access Control

### Admin Role
**Permissions:**
- Manage all users and bouncers
- View all bookings and reports
- System configuration

**Dashboard Features:**
- User management interface
- Bouncer verification system
- Booking oversight
- Revenue and analytics reports

### Bouncer Role
**Permissions:**
- Manage own profile and availability
- Accept/reject booking requests
- Update booking status
- View assigned bookings

**Dashboard Features:**
- Availability calendar
- Booking request notifications
- Earnings tracking
- Customer communication

### User Role
**Permissions:**
- Create and manage bookings
- View booking history
- Rate and review services
- Profile management

**Dashboard Features:**
- Bouncer search and booking
- Booking history
- Review system
- Payment tracking

## 🔐 Security Implementation

### JWT Authentication
```python
# Token creation with user permissions
token_data = {
    "sub": str(user.id),
    "email": user.email,
    "role": user.role.name,
    "permissions": user_permissions
}
access_token = create_access_token(token_data)
```

### RBAC Middleware
```python
# Permission checking in middleware
required_permission = self._get_required_permission(request.url.path, request.method)
if required_permission not in user_permissions:
    return JSONResponse(status_code=403, content={"detail": "Insufficient permissions"})
```

### Frontend Route Protection
```tsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>

<ProtectedRoute requiredPermission="create_booking">
  <BookingForm />
</ProtectedRoute>
```

## 📡 Real-time Features

### WebSocket Events

#### Booking Status Updates
```javascript
socket.on('booking_status_changed', (data) => {
  // Update UI with new booking status
  updateBookingStatus(data.booking_id, data.new_status);
});
```

#### New Booking Requests (for Bouncers)
```javascript
socket.on('new_booking_request', (data) => {
  // Show notification to bouncer
  showNotification('New Booking Request', data);
});
```

#### Real-time Messaging
```javascript
socket.on('new_message', (data) => {
  // Update conversation UI
  addMessageToConversation(data);
});
```

## 🗄️ Database Schema

### Core RBAC Tables
- `roles`: System roles (admin, bouncer, user)
- `permissions`: Granular permissions
- `role_permissions`: Role-permission mapping
- `users`: User accounts with role assignment

### Business Logic Tables
- `bouncer_profiles`: Bouncer-specific data
- `bookings`: Service bookings
- `reviews`: Rating and review system
- `notifications`: User notifications

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile

### Booking System
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List bookings
- `POST /api/bookings/{id}/accept` - Accept booking (bouncer)
- `PUT /api/bookings/{id}/status` - Update status

### Admin Operations
- `GET /api/admin/users` - List all users
- `GET /api/admin/reports` - System reports

## 🎨 Frontend Components

### Role-based Navigation
```tsx
const navigationItems = useMemo(() => {
  if (hasRole('admin')) return adminRoutes;
  if (hasRole('bouncer')) return bouncerRoutes;
  return userRoutes;
}, [hasRole]);
```

### Permission-based UI
```tsx
{hasPermission('manage_users') && (
  <UserManagementButton />
)}
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL=postgresql://bouncer_user:bouncer_pass@localhost:5432/bouncer_db

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Redis
REDIS_URL=redis://localhost:6379

# Frontend
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

## 📱 Mobile App (React Native)

The architecture is designed to support React Native with minimal changes:

1. **Shared API Layer**: Same backend serves web and mobile
2. **Responsive Design**: Components adapt to mobile screens
3. **Platform-specific Navigation**: Native navigation for mobile
4. **Push Notifications**: Real-time alerts on mobile devices

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Docker Deployment
```bash
docker-compose up -d
```

### Production Considerations
- Use environment-specific configurations
- Set up SSL/TLS certificates
- Configure load balancing
- Set up monitoring and logging
- Implement backup strategies

## 📊 Monitoring & Analytics

### Key Metrics
- User registration and retention
- Booking completion rates
- Bouncer utilization
- Revenue tracking
- System performance

### Real-time Dashboards
- Active bookings monitor
- User activity tracking
- System health metrics
- Financial analytics

## 🔒 Security Best Practices

1. **Input Validation**: All inputs validated on both client and server
2. **SQL Injection Prevention**: Using parameterized queries
3. **XSS Protection**: Content sanitization and CSP headers
4. **Rate Limiting**: API endpoint protection
5. **HTTPS Only**: Encrypted communication
6. **Token Management**: Secure storage and rotation

## 📝 Next Steps

1. **Implementation**: Follow the provided code structure
2. **Customization**: Adapt business logic to specific requirements
3. **Testing**: Comprehensive testing of all features
4. **Deployment**: Production deployment setup
5. **Monitoring**: Set up logging and analytics
6. **Scaling**: Performance optimization and scaling strategies

This implementation provides a solid foundation for a production-ready bouncer service application with robust RBAC, real-time features, and scalable architecture.