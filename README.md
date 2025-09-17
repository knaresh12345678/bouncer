# Bouncer App - RBAC Mobile & Web Application

A role-based access control application for bouncer services with Admin, Bouncer, and User roles.

## Architecture

- **Backend**: FastAPI (Python)
- **Frontend**: React (Vite) + React Native
- **Database**: PostgreSQL (Docker)
- **Real-time**: WebSockets
- **Authentication**: JWT
- **Caching**: Redis

## Project Structure

```
bouncer/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── api/
│   │   ├── core/
│   │   ├── middleware/
│   │   └── utils/
│   ├── requirements.txt
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── context/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── mobile/
├── docker-compose.yml
└── README.md
```

## Roles & Permissions

### Admin
- Manage users, bouncers, bookings
- View reports and analytics
- System configuration

### Bouncer
- Accept/reject booking requests
- Update availability
- Track assigned tasks

### User
- Book bouncers
- View booking history
- Rate services

## Getting Started

1. Clone the repository
2. Run `docker-compose up -d` for PostgreSQL
3. Install backend dependencies: `cd backend && pip install -r requirements.txt`
4. Install frontend dependencies: `cd frontend && npm install`
5. Start development servers"# bouncer" 
